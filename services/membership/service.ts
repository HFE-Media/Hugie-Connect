import "server-only";

import { randomBytes } from "node:crypto";

import { AppError } from "@/lib/errors";
import {
  approveMembershipApplicationSchema,
  createMembershipApplicationSchema,
  listMembershipApplicationsSchema,
  updateMembershipApplicationReviewSchema,
  type ApproveMembershipApplicationValues,
  type CreateMembershipApplicationValues,
  type ListMembershipApplicationsValues,
  type UpdateMembershipApplicationReviewValues,
} from "@/features/membership/schemas";
import {
  createMembershipRepository,
  mapApprovedMembershipApplicationResult,
  type MembershipRepositoryClient,
} from "@/services/membership/repository";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import type {
  LinkOwnMembershipResult,
  MembershipCard,
  MembershipCardDisplay,
  MembershipVerificationResult,
  MemberMembershipSummary,
  MemberStatus,
  MembershipPeriod,
  MembershipUser,
} from "@/types/membership";

function createMembershipCardToken() {
  return randomBytes(32).toString("hex");
}

function resolveCurrentMembershipPeriod(periods: MembershipPeriod[]) {
  return (
    periods.find((period) => period.status === "active") ??
    periods.find((period) => period.status === "pending") ??
    periods[0] ??
    null
  );
}

function resolveCurrentMembershipCard(cards: MembershipCard[]) {
  return (
    cards.find((card) => card.card_status === "active") ??
    cards.find((card) => card.card_status === "expired") ??
    cards.find((card) => card.card_status === "revoked") ??
    cards[0] ??
    null
  );
}

function mapMembershipCardDisplay(
  card: MembershipCard | null,
): MembershipCardDisplay | null {
  if (!card) {
    return null;
  }

  return {
    status: card.card_status,
    qrValue:
      card.card_status === "active" ? `membership:${card.qr_token}` : null,
    issuedAt: card.issued_at,
  };
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function normaliseNullableString(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function parseMembershipQrPayload(payload: string) {
  const trimmed = payload.trim();
  const prefix = "membership:";

  if (!trimmed.startsWith(prefix)) {
    return null;
  }

  const token = trimmed.slice(prefix.length).trim();

  if (!token || token.length > 256 || /\s/.test(token)) {
    return null;
  }

  return token;
}

function hasActivePeriod(periods: MembershipPeriod[], now: Date) {
  return periods.some((period) => {
    const startsAt = new Date(period.starts_at);
    const endsAt = new Date(period.ends_at);

    return period.status === "active" && startsAt <= now && endsAt > now;
  });
}

function isExpired(value: string | null, now: Date) {
  return value ? new Date(value) <= now : false;
}

function getVerificationMemberName(params: {
  applicationFirstName?: string | null;
  applicationLastName?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
}) {
  const applicationName = [
    params.applicationFirstName,
    params.applicationLastName,
  ]
    .filter(Boolean)
    .join(" ");

  if (applicationName) {
    return applicationName;
  }

  const userName = [params.userFirstName, params.userLastName]
    .filter(Boolean)
    .join(" ");

  return userName || "Member";
}

function createVerificationResult(input: {
  tone: MembershipVerificationResult["tone"];
  title: string;
  message: string;
  memberName?: string;
  membershipTypeName?: string;
  memberNumber?: string;
  memberStatus?: MemberStatus;
  expiresAt?: string | null;
  organisationName?: string;
}): MembershipVerificationResult {
  return input;
}

export function createMembershipService(client: MembershipRepositoryClient) {
  const repository = createMembershipRepository(client);

  return {
    async listActiveOrganisations() {
      const { data, error } = await repository.listActiveOrganisations();

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisations could not be loaded.",
          500,
          error,
        );
      }

      return data;
    },

    async getDefaultPublicOrganisation() {
      const organisations = await this.listActiveOrganisations();

      return organisations[0] ?? null;
    },

    async listMembershipTypes(organisationId: string) {
      const { data, error } =
        await repository.listMembershipTypes(organisationId);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership types could not be loaded.",
          500,
          error,
        );
      }

      return data;
    },

    async ensureAppUserProfile(input: {
      authUserId: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    }): Promise<MembershipUser> {
      const email = normaliseEmail(input.email);

      if (!email) {
        throw new AppError(
          "BAD_REQUEST",
          "A signed-in email address is required.",
          400,
        );
      }

      const { data: existingUser, error: existingUserError } =
        await repository.getUserByAuthUserId(input.authUserId);

      if (existingUserError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "User profile could not be loaded.",
          500,
          existingUserError,
        );
      }

      if (existingUser?.organisation_id) {
        return existingUser;
      }

      const { data: activeOrganisations, error: organisationsError } =
        await repository.listActiveOrganisations();

      if (organisationsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisation could not be loaded.",
          500,
          organisationsError,
        );
      }

      const organisation = activeOrganisations[0];

      if (!organisation) {
        throw new AppError(
          "CONFLICT",
          "No active organisation is available for profile setup.",
          409,
        );
      }

      if (existingUser) {
        const { data: updatedUser, error: updateError } =
          await repository.updateUserOrganisation({
            userId: existingUser.id,
            organisationId: organisation.id,
          });

        if (updateError) {
          throw new AppError(
            "CONFLICT",
            "User profile could not be assigned to an organisation.",
            409,
            updateError,
          );
        }

        return updatedUser;
      }

      const { data: emailUsers, error: emailUsersError } =
        await repository.listUsersByEmail(email);

      if (emailUsersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "User profile email could not be checked.",
          500,
          emailUsersError,
        );
      }

      if (
        emailUsers.some((user) => user.auth_user_id !== input.authUserId)
      ) {
        throw new AppError(
          "CONFLICT",
          "A user profile already exists for this email address.",
          409,
        );
      }

      // V1 is single-organisation. Future multi-organisation support should
      // choose the organisation from invitation, membership application, or an
      // explicit user selection rather than the first active organisation.
      const { data: createdUser, error: createError } =
        await repository.createUser({
          authUserId: input.authUserId,
          organisationId: organisation.id,
          firstName: normaliseNullableString(input.firstName),
          lastName: normaliseNullableString(input.lastName),
          email,
        });

      if (createError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "User profile could not be created.",
          500,
          createError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: organisation.id,
        userId: createdUser.id,
        action: "user_profile_synced",
        entityType: "user",
        entityId: createdUser.id,
        newValues: {
          auth_user_id: input.authUserId,
          email,
          organisation_id: organisation.id,
          source: "authenticated_profile_sync",
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "User profile sync audit log could not be created.",
          500,
          auditError,
        );
      }

      return createdUser;
    },

    async getOwnMembershipSummary(
      authUserId: string,
    ): Promise<MemberMembershipSummary | null> {
      const { data: appUser, error: appUserError } =
        await repository.getUserByAuthUserId(authUserId);

      if (appUserError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "User profile could not be loaded.",
          500,
          appUserError,
        );
      }

      if (!appUser?.organisation_id) {
        return null;
      }

      const { data: organisation, error: organisationError } =
        await repository.getActiveOrganisationById(appUser.organisation_id);

      if (organisationError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisation could not be loaded.",
          500,
          organisationError,
        );
      }

      if (!organisation) {
        return null;
      }

      const { data: members, error: membersError } =
        await repository.listOwnVisibleMembers({
          userId: appUser.id,
          organisationId: appUser.organisation_id,
        });

      if (membersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership details could not be loaded.",
          500,
          membersError,
        );
      }

      const member = members[0];

      if (!member) {
        return null;
      }

      const { data: membershipType, error: membershipTypeError } =
        await repository.getMembershipTypeById({
          id: member.membership_type_id,
          organisationId: member.organisation_id,
        });

      if (membershipTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be loaded.",
          500,
          membershipTypeError,
        );
      }

      if (!membershipType) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type is missing for this member.",
          500,
        );
      }

      const { data: periods, error: periodsError } =
        await repository.listMembershipPeriodsByMemberId({
          memberId: member.id,
          organisationId: member.organisation_id,
        });

      if (periodsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership period could not be loaded.",
          500,
          periodsError,
        );
      }

      const { data: cards, error: cardsError } =
        await repository.listMembershipCardsByMemberId({
          memberId: member.id,
          organisationId: member.organisation_id,
        });

      if (cardsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership card could not be loaded.",
          500,
          cardsError,
        );
      }

      return {
        member,
        memberUser: appUser,
        organisation,
        membershipType,
        currentPeriod: resolveCurrentMembershipPeriod(periods),
        membershipCard: mapMembershipCardDisplay(
          resolveCurrentMembershipCard(cards),
        ),
      };
    },

    async linkOwnMembershipByEmail(params: {
      authUserId: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    }): Promise<LinkOwnMembershipResult> {
      const email = normaliseEmail(params.email);

      if (!email) {
        throw new AppError(
          "BAD_REQUEST",
          "A signed-in email address is required to link membership.",
          400,
        );
      }

      const appUser = await this.ensureAppUserProfile({
        authUserId: params.authUserId,
        email,
        firstName: params.firstName,
        lastName: params.lastName,
      });
      const organisationId = appUser.organisation_id;

      if (!organisationId) {
        return { status: "no_match" };
      }

      const ownMembership = await this.getOwnMembershipSummary(
        params.authUserId,
      );

      if (ownMembership) {
        return {
          status: "already_linked",
          memberId: ownMembership.member.id,
        };
      }

      const { data: applications, error: applicationsError } =
        await repository.listApprovedApplicationsByEmail({
          email,
          organisationId,
        });

      if (applicationsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership applications could not be checked.",
          500,
          applicationsError,
        );
      }

      if (applications.length === 0) {
        return { status: "no_match" };
      }

      const { data: members, error: membersError } =
        await repository.listUnlinkedMembersByApplicationIds({
          applicationIds: applications.map((application) => application.id),
          organisationId,
        });

      if (membersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership records could not be checked.",
          500,
          membersError,
        );
      }

      if (members.length === 0) {
        return { status: "no_match" };
      }

      if (members.length > 1) {
        return { status: "multiple_matches" };
      }

      const member = members[0];
      const { data: linkedMember, error: linkError } =
        await repository.linkMemberToUser({
          memberId: member.id,
          userId: appUser.id,
          organisationId,
        });

      if (linkError) {
        throw new AppError(
          "CONFLICT",
          "This membership could not be linked. It may already be linked.",
          409,
          linkError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId,
        userId: appUser.id,
        action: "membership_account_linked",
        entityType: "member",
        entityId: linkedMember.id,
        oldValues: {
          user_id: null,
          matched_email: email,
        },
        newValues: {
          user_id: appUser.id,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership link audit log could not be created.",
          500,
          auditError,
        );
      }

      return { status: "linked", memberId: linkedMember.id };
    },

    async verifyMembershipQrPayload(input: {
      payload: string;
      verifierAuthUserId: string;
      canVerifyAllOrganisations: boolean;
    }): Promise<MembershipVerificationResult> {
      const qrToken = parseMembershipQrPayload(input.payload);

      if (!qrToken) {
        return createVerificationResult({
          tone: "invalid",
          title: "Invalid QR",
          message: "This is not a recognised membership QR code.",
        });
      }

      const { data: verifier, error: verifierError } =
        await repository.getUserByAuthUserId(input.verifierAuthUserId);

      if (verifierError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Verifier profile could not be loaded.",
          500,
          verifierError,
        );
      }

      if (!input.canVerifyAllOrganisations && !verifier?.organisation_id) {
        return createVerificationResult({
          tone: "invalid",
          title: "Verifier not assigned",
          message: "This account is not assigned to an organisation.",
        });
      }

      const { data: card, error: cardError } =
        await repository.getMembershipCardByQrToken(qrToken);

      if (cardError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership card could not be checked.",
          500,
          cardError,
        );
      }

      if (!card) {
        return createVerificationResult({
          tone: "invalid",
          title: "Unknown membership QR",
          message: "No membership card matched this QR code.",
        });
      }

      if (
        !input.canVerifyAllOrganisations &&
        verifier?.organisation_id !== card.organisation_id
      ) {
        return createVerificationResult({
          tone: "invalid",
          title: "Unknown membership QR",
          message: "No membership card matched this QR code.",
        });
      }

      const { data: member, error: memberError } =
        await repository.getMemberById({
          id: card.member_id,
          organisationId: card.organisation_id,
        });

      if (memberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be checked.",
          500,
          memberError,
        );
      }

      if (!member) {
        return createVerificationResult({
          tone: "invalid",
          title: "Member missing",
          message: "This QR code is not linked to a valid member record.",
        });
      }

      const { data: organisation, error: organisationError } =
        await repository.getActiveOrganisationById(card.organisation_id);

      if (organisationError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisation could not be checked.",
          500,
          organisationError,
        );
      }

      if (!organisation) {
        return createVerificationResult({
          tone: "invalid",
          title: "Organisation inactive",
          message: "The organisation for this membership is not active.",
        });
      }

      const { data: membershipType, error: membershipTypeError } =
        await repository.getMembershipTypeById({
          id: member.membership_type_id,
          organisationId: member.organisation_id,
        });

      if (membershipTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be checked.",
          500,
          membershipTypeError,
        );
      }

      if (!membershipType) {
        return createVerificationResult({
          tone: "invalid",
          title: "Membership type missing",
          message: "This membership record is incomplete.",
        });
      }

      const { data: periods, error: periodsError } =
        await repository.listMembershipPeriodsByMemberId({
          memberId: member.id,
          organisationId: member.organisation_id,
        });

      if (periodsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership period could not be checked.",
          500,
          periodsError,
        );
      }

      const { data: user, error: userError } = member.user_id
        ? await repository.getUserById({
            id: member.user_id,
            organisationId: member.organisation_id,
          })
        : { data: null, error: null };

      if (userError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member user could not be checked.",
          500,
          userError,
        );
      }

      const { data: application, error: applicationError } =
        member.membership_application_id
          ? await repository.getMembershipApplicationById({
              id: member.membership_application_id,
              organisationId: member.organisation_id,
            })
          : { data: null, error: null };

      if (applicationError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be checked.",
          500,
          applicationError,
        );
      }

      const memberName = getVerificationMemberName({
        applicationFirstName: application?.first_name,
        applicationLastName: application?.last_name,
        userFirstName: user?.first_name,
        userLastName: user?.last_name,
      });
      const commonResult = {
        memberName,
        membershipTypeName: membershipType.name,
        memberNumber: member.member_number,
        memberStatus: member.status,
        expiresAt: member.expires_at,
        organisationName: organisation.name,
      };
      const now = new Date();

      if (card.card_status !== "active") {
        return createVerificationResult({
          tone: "warning",
          title: "Card not active",
          message: "This membership card is not active.",
          ...commonResult,
        });
      }

      if (member.status !== "active") {
        return createVerificationResult({
          tone: "warning",
          title: "Member not active",
          message: "This member is not currently active.",
          ...commonResult,
        });
      }

      if (isExpired(member.expires_at, now)) {
        return createVerificationResult({
          tone: "warning",
          title: "Membership expired",
          message: "This membership has passed its expiry date.",
          ...commonResult,
        });
      }

      if (!hasActivePeriod(periods, now)) {
        return createVerificationResult({
          tone: "warning",
          title: "No active period",
          message: "This membership does not have an active current period.",
          ...commonResult,
        });
      }

      return createVerificationResult({
        tone: "valid",
        title: "Valid membership",
        message: "This membership QR is active and valid.",
        ...commonResult,
      });
    },

    async createMembershipApplication(
      input: CreateMembershipApplicationValues,
    ) {
      const values = createMembershipApplicationSchema.parse(input);
      const { data: organisation, error: organisationError } =
        await repository.getActiveOrganisationById(values.organisationId);

      if (organisationError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisation could not be checked.",
          500,
          organisationError,
        );
      }

      if (!organisation) {
        throw new AppError(
          "BAD_REQUEST",
          "Applications are not available for this organisation.",
          400,
        );
      }

      const { data: membershipType, error: membershipTypeError } =
        await repository.getMembershipTypeById({
          id: values.membershipTypeId,
          organisationId: values.organisationId,
        });

      if (membershipTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be checked.",
          500,
          membershipTypeError,
        );
      }

      if (!membershipType || membershipType.status !== "active") {
        throw new AppError(
          "BAD_REQUEST",
          "Selected membership type is not available.",
          400,
        );
      }

      const { data, error } =
        await repository.createMembershipApplication(values);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be created.",
          500,
          error,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: null,
        action: "membership_application_created",
        entityType: "membership_application",
        entityId: data.id,
        newValues: {
          status: data.status,
          membership_type_id: data.membership_type_id,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application audit log could not be created.",
          500,
          auditError,
        );
      }

      return data;
    },

    async listMembershipApplications(
      input: ListMembershipApplicationsValues,
    ) {
      const values = listMembershipApplicationsSchema.parse(input);
      const { data, error } =
        await repository.listMembershipApplications(values);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership applications could not be loaded.",
          500,
          error,
        );
      }

      return data;
    },

    async updateMembershipApplicationReview(
      input: UpdateMembershipApplicationReviewValues,
    ) {
      const values = updateMembershipApplicationReviewSchema.parse(input);
      const { data: existingApplication, error: existingError } =
        await repository.getMembershipApplicationById({
          id: values.applicationId,
          organisationId: values.organisationId,
        });

      if (existingError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be loaded.",
          500,
          existingError,
        );
      }

      if (!existingApplication) {
        throw new AppError(
          "NOT_FOUND",
          "Membership application was not found.",
          404,
        );
      }

      if (existingApplication.status !== "pending") {
        throw new AppError(
          "CONFLICT",
          "Only pending membership applications can be reviewed.",
          409,
        );
      }

      const { data, error } =
        await repository.updateMembershipApplicationReview(values);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application review could not be saved.",
          500,
          error,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: `membership_application_${values.status}`,
        entityType: "membership_application",
        entityId: values.applicationId,
        oldValues: {
          status: existingApplication.status,
          rejection_reason: existingApplication.rejection_reason,
        },
        newValues: {
          status: data.status,
          rejection_reason: data.rejection_reason,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application review audit log could not be created.",
          500,
          auditError,
        );
      }

      return data;
    },

    async approveMembershipApplication(
      input: ApproveMembershipApplicationValues,
    ) {
      const values = approveMembershipApplicationSchema.parse(input);
      const { data: existingApplication, error: existingError } =
        await repository.getMembershipApplicationById({
          id: values.applicationId,
          organisationId: values.organisationId,
        });

      if (existingError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be loaded.",
          500,
          existingError,
        );
      }

      if (!existingApplication) {
        throw new AppError(
          "NOT_FOUND",
          "Membership application was not found.",
          404,
        );
      }

      if (
        existingApplication.status !== "pending" &&
        existingApplication.status !== "approved"
      ) {
        throw new AppError(
          "CONFLICT",
          "Only pending or approved membership applications can be approved.",
          409,
        );
      }

      const { data, error } = await repository.approveMembershipApplication({
        ...values,
        qrToken: createMembershipCardToken(),
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be approved.",
          500,
          error,
        );
      }

      const result = mapApprovedMembershipApplicationResult(data);

      if (!result) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership approval did not return created records.",
          500,
        );
      }

      return result;
    },
  };
}

export function createMembershipAdminService() {
  return createMembershipService(createSupabaseAdminClient());
}
