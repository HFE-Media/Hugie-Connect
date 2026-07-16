import "server-only";

import { randomBytes } from "node:crypto";

import { AppError } from "@/lib/errors";
import {
  approveMembershipApplicationSchema,
  createMembershipApplicationSchema,
  listAdminMembershipApplicationsSchema,
  listAdminMembersSchema,
  listAdminRenewalsSchema,
  listMembershipApplicationsSchema,
  reissueMembershipCardSchema,
  revokeMembershipCardSchema,
  renewMemberSchema,
  updateMemberStatusSchema,
  updateMembershipApplicationReviewSchema,
  type ApproveMembershipApplicationValues,
  type CreateMembershipApplicationValues,
  type ListAdminMembershipApplicationsValues,
  type ListAdminMembersValues,
  type ListAdminRenewalsValues,
  type ListMembershipApplicationsValues,
  type ReissueMembershipCardValues,
  type RevokeMembershipCardValues,
  type RenewMemberValues,
  type UpdateMemberStatusValues,
  type UpdateMembershipApplicationReviewValues,
} from "@/features/membership/schemas";
import {
  createMembershipRepository,
  mapApprovedMembershipApplicationResult,
  type MembershipRepositoryClient,
} from "@/services/membership/repository";
import { createSupabaseAdminClient } from "@/services/supabase/admin";
import type { Database } from "@/types/database";
import type {
  MembershipApplication,
  MembershipApplicationAdminDetail,
  MembershipApplicationAdminSummary,
  MembershipApplicationsAdminPage,
  Member,
  MemberAdminDetail,
  MemberAdminStatusFilter,
  MemberAdminSummary,
  MemberRenewalDetail,
  MemberRenewalsAdminPage,
  MemberRenewalSummary,
  MemberMembershipSummary,
  MembersAdminPage,
  LinkOwnMembershipResult,
  MembershipAuditLog,
  MembershipCard,
  MembershipCardDisplay,
  MembershipPeriod,
  MembershipType,
  MembershipVerificationResult,
} from "@/types/membership";

function createMembershipCardToken() {
  return randomBytes(32).toString("hex");
}

type MembershipUser = Database["public"]["Tables"]["users"]["Row"];
type MembershipOrganisationUser = MembershipUser & { organisation_id: string };

function formatReviewerName(user: MembershipUser | undefined) {
  if (!user) {
    return null;
  }

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return name || user.email;
}

function enrichApplicationSummary(
  application: MembershipApplication,
  membershipType: MembershipType | undefined,
  reviewer: MembershipUser | undefined,
): MembershipApplicationAdminSummary {
  return {
    ...application,
    membershipTypeName: membershipType?.name ?? "Unknown membership type",
    membershipTypeCode: membershipType?.code ?? "unknown",
    reviewedByName: formatReviewerName(reviewer),
    reviewedByEmail: reviewer?.email ?? null,
  };
}

function getCurrentPeriod(periods: MembershipPeriod[]) {
  const now = new Date();

  return (
    periods.find((period) => {
      const startsAt = new Date(period.starts_at);
      const endsAt = new Date(period.ends_at);

      return period.status === "active" && startsAt <= now && endsAt > now;
    }) ??
    periods[0] ??
    null
  );
}

function getCurrentCard(cards: MembershipCard[]) {
  return (
    cards.find((card) => card.card_status === "active") ??
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
    qrValue: card.card_status === "active" ? `membership:${card.qr_token}` : null,
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
  memberStatus?: MembershipVerificationResult["memberStatus"];
  expiresAt?: string | null;
  organisationName?: string;
}): MembershipVerificationResult {
  return input;
}

function isMemberExpired(member: Member) {
  return member.expires_at ? new Date(member.expires_at) <= new Date() : false;
}

function getDerivedMemberStatus(member: Member): MemberAdminStatusFilter {
  if (member.status === "cancelled") {
    return "inactive";
  }

  if (member.status === "expired" || isMemberExpired(member)) {
    return "expired";
  }

  return member.status;
}

function getMemberName(params: {
  application?: MembershipApplication | null;
  user?: MembershipUser | null;
}) {
  const applicationName = [
    params.application?.first_name,
    params.application?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  if (applicationName) {
    return applicationName;
  }

  const userName = [params.user?.first_name, params.user?.last_name]
    .filter(Boolean)
    .join(" ");

  return userName || "Member";
}

function redactMembershipCard(card: MembershipCard) {
  const { qr_token: _qrToken, ...safeCard } = card;

  return safeCard;
}

function enrichMemberSummary(params: {
  member: Member;
  membershipType?: MembershipType;
  application?: MembershipApplication | null;
  user?: MembershipUser | null;
  periods: MembershipPeriod[];
  cards: MembershipCard[];
}): MemberAdminSummary {
  const currentPeriod = getCurrentPeriod(params.periods);
  const currentCard = getCurrentCard(params.cards);

  return {
    ...params.member,
    memberName: getMemberName({
      application: params.application,
      user: params.user,
    }),
    memberEmail: params.application?.email ?? params.user?.email ?? null,
    memberMobile: params.application?.mobile ?? params.user?.mobile ?? null,
    membershipTypeName: params.membershipType?.name ?? "Unknown membership type",
    membershipTypeCode: params.membershipType?.code ?? "unknown",
    linkedAccountEmail: params.user?.email ?? null,
    currentCardStatus: currentCard?.card_status ?? null,
    currentPeriodStatus: currentPeriod?.status ?? null,
    currentPeriodStartsAt: currentPeriod?.starts_at ?? null,
    currentPeriodEndsAt: currentPeriod?.ends_at ?? null,
    derivedStatus: getDerivedMemberStatus(params.member),
  };
}

function getRenewalStatus(
  member: Member,
  expiringSoonDays = 30,
): "active" | "expiring_soon" | "expired" | "renewed_recently" {
  const now = new Date();

  if (member.status === "expired" || isMemberExpired(member)) {
    return "expired";
  }

  if (member.status === "active" && member.expires_at) {
    const soon = new Date(now);
    soon.setDate(soon.getDate() + expiringSoonDays);

    if (new Date(member.expires_at) <= soon) {
      return "expiring_soon";
    }
  }

  return "active";
}

function enrichRenewalSummary(
  summary: MemberAdminSummary,
  expiringSoonDays: number,
): MemberRenewalSummary {
  return {
    ...summary,
    renewalStatus: getRenewalStatus(summary, expiringSoonDays),
  };
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

    async ensureAppUserProfile(input: {
      authUserId: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    }): Promise<MembershipOrganisationUser> {
      const email = normaliseEmail(input.email);
      const { data: existingByAuthId, error: authLookupError } =
        await repository.getUserByAuthUserId(input.authUserId);

      if (authLookupError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account profile could not be loaded.",
          500,
          authLookupError,
        );
      }

      if (existingByAuthId?.organisation_id) {
        return {
          ...existingByAuthId,
          organisation_id: existingByAuthId.organisation_id,
        };
      }

      const organisations = await this.listActiveOrganisations();
      const organisationId =
        existingByAuthId?.organisation_id ?? organisations[0]?.id;

      if (!organisationId) {
        throw new AppError(
          "FORBIDDEN",
          "No active organisation is available for this account.",
          403,
        );
      }

      if (existingByAuthId) {
        const { data: updatedUser, error: updateError } =
          await repository.updateUserOrganisation({
            userId: existingByAuthId.id,
            organisationId,
          });

        if (updateError) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Account profile could not be assigned to an organisation.",
            500,
            updateError,
          );
        }

        return { ...updatedUser, organisation_id: organisationId };
      }

      const { data: usersByEmail, error: emailLookupError } =
        await repository.listUsersByEmail(email);

      if (emailLookupError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account profile could not be matched.",
          500,
          emailLookupError,
        );
      }

      const safeEmailMatches = (usersByEmail ?? []).filter(
        (user) =>
          user.email === email &&
          (!user.auth_user_id || user.auth_user_id === input.authUserId),
      );

      if (safeEmailMatches.length === 1) {
        const matchedUser = safeEmailMatches[0];

        if (matchedUser.organisation_id) {
          return {
            ...matchedUser,
            organisation_id: matchedUser.organisation_id,
          };
        }

        const { data: updatedUser, error: updateError } =
          await repository.updateUserOrganisation({
            userId: matchedUser.id,
            organisationId,
          });

        if (updateError) {
          throw new AppError(
            "INTERNAL_ERROR",
            "Account profile could not be assigned to an organisation.",
            500,
            updateError,
          );
        }

        return { ...updatedUser, organisation_id: organisationId };
      }

      if (safeEmailMatches.length > 1) {
        throw new AppError(
          "CONFLICT",
          "Multiple account profiles match this email. Please contact the organisation.",
          409,
        );
      }

      const { data: createdUser, error: createError } =
        await repository.createUser({
          authUserId: input.authUserId,
          organisationId,
          firstName: normaliseNullableString(input.firstName),
          lastName: normaliseNullableString(input.lastName),
          email,
        });

      if (createError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account profile could not be created.",
          500,
          createError,
        );
      }

      return { ...createdUser, organisation_id: organisationId };
    },

    async getOwnMembershipSummary(
      authUserId: string,
    ): Promise<MemberMembershipSummary | null> {
      const { data: appUser, error: userError } =
        await repository.getUserByAuthUserId(authUserId);

      if (userError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account profile could not be loaded.",
          500,
          userError,
        );
      }

      if (!appUser?.organisation_id) {
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
          "Membership could not be loaded.",
          500,
          membersError,
        );
      }

      const member = members?.[0];

      if (!member) {
        return null;
      }

      const [
        organisationResult,
        membershipTypeResult,
        periodsResult,
        cardsResult,
      ] = await Promise.all([
        repository.getActiveOrganisationById(member.organisation_id),
        repository.getMembershipTypeById({
          id: member.membership_type_id,
          organisationId: member.organisation_id,
        }),
        repository.listMembershipPeriodsByMemberIds({
          organisationId: member.organisation_id,
          memberIds: [member.id],
        }),
        repository.listMembershipCardsByMemberIds({
          organisationId: member.organisation_id,
          memberIds: [member.id],
        }),
      ]);

      if (organisationResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Organisation could not be loaded.",
          500,
          organisationResult.error,
        );
      }

      if (membershipTypeResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be loaded.",
          500,
          membershipTypeResult.error,
        );
      }

      if (periodsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership period could not be loaded.",
          500,
          periodsResult.error,
        );
      }

      if (cardsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership card could not be loaded.",
          500,
          cardsResult.error,
        );
      }

      if (!organisationResult.data || !membershipTypeResult.data) {
        return null;
      }

      return {
        member,
        memberUser: appUser,
        organisation: organisationResult.data,
        membershipType: membershipTypeResult.data,
        currentPeriod: getCurrentPeriod(periodsResult.data ?? []),
        membershipCard: mapMembershipCardDisplay(
          getCurrentCard(cardsResult.data ?? []),
        ),
      };
    },

    async linkOwnMembershipByEmail(input: {
      authUserId: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    }): Promise<LinkOwnMembershipResult> {
      const appUser = await this.ensureAppUserProfile(input);
      const existingSummary = await this.getOwnMembershipSummary(
        input.authUserId,
      );

      if (existingSummary) {
        return {
          status: "already_linked",
          memberId: existingSummary.member.id,
        };
      }

      const { data: applications, error: applicationsError } =
        await repository.listApprovedApplicationsByEmail({
          email: normaliseEmail(input.email),
          organisationId: appUser.organisation_id,
        });

      if (applicationsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Approved memberships could not be searched.",
          500,
          applicationsError,
        );
      }

      if (!applications?.length) {
        return { status: "no_match" };
      }

      const { data: members, error: membersError } =
        await repository.listUnlinkedMembersByApplicationIds({
          applicationIds: applications.map((application) => application.id),
          organisationId: appUser.organisation_id,
        });

      if (membersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Memberships could not be searched.",
          500,
          membersError,
        );
      }

      if (!members?.length) {
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
          organisationId: appUser.organisation_id,
        });

      if (linkError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership could not be linked.",
          500,
          linkError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: appUser.organisation_id,
        userId: appUser.id,
        action: "member_account_linked",
        entityType: "member",
        entityId: linkedMember.id,
        oldValues: { user_id: null },
        newValues: {
          user_id: appUser.id,
          linked_by: appUser.id,
          linked_at: new Date().toISOString(),
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

      const [
        periodsResult,
        usersResult,
        applicationResult,
      ] = await Promise.all([
        repository.listMembershipPeriodsByMemberIds({
          memberIds: [member.id],
          organisationId: member.organisation_id,
        }),
        member.user_id
          ? repository.listUsersByIds({
              ids: [member.user_id],
              organisationId: member.organisation_id,
            })
          : Promise.resolve({ data: [], error: null }),
        member.membership_application_id
          ? repository.getMembershipApplicationById({
              id: member.membership_application_id,
              organisationId: member.organisation_id,
            })
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (periodsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership period could not be checked.",
          500,
          periodsResult.error,
        );
      }

      if (usersResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member user could not be checked.",
          500,
          usersResult.error,
        );
      }

      if (applicationResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be checked.",
          500,
          applicationResult.error,
        );
      }

      const user = usersResult.data?.[0] ?? null;
      const application = applicationResult.data;
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

      if (!hasActivePeriod(periodsResult.data ?? [], now)) {
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

    async getAppUserByAuthUserId(
      authUserId: string,
    ): Promise<MembershipOrganisationUser> {
      const { data, error } = await repository.getUserByAuthUserId(authUserId);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Administrator profile could not be loaded.",
          500,
          error,
        );
      }

      if (!data?.organisation_id) {
        throw new AppError(
          "FORBIDDEN",
          "Your account is not assigned to an organisation.",
          403,
        );
      }

      return { ...data, organisation_id: data.organisation_id };
    },

    async listMembershipApplicationsForAdmin(
      input: ListAdminMembershipApplicationsValues,
    ): Promise<MembershipApplicationsAdminPage> {
      const values = listAdminMembershipApplicationsSchema.parse(input);
      const { data, error, count } =
        await repository.listMembershipApplicationsForAdmin(values);

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership applications could not be loaded.",
          500,
          error,
        );
      }

      const applications = data ?? [];
      const membershipTypeIds = Array.from(
        new Set(
          applications.map((application) => application.membership_type_id),
        ),
      );
      const reviewerIds = Array.from(
        new Set(
          applications
            .map((application) => application.reviewed_by)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const { data: membershipTypes, error: membershipTypesError } =
        await repository.listMembershipTypesByIds({
          organisationId: values.organisationId,
          ids: membershipTypeIds,
        });

      if (membershipTypesError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership types could not be loaded.",
          500,
          membershipTypesError,
        );
      }

      const { data: reviewers, error: reviewersError } =
        await repository.listUsersByIds({
          organisationId: values.organisationId,
          ids: reviewerIds,
        });

      if (reviewersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Reviewers could not be loaded.",
          500,
          reviewersError,
        );
      }

      const membershipTypeById = new Map(
        (membershipTypes ?? []).map((membershipType) => [
          membershipType.id,
          membershipType,
        ]),
      );
      const reviewerById = new Map(
        (reviewers ?? []).map((reviewer) => [reviewer.id, reviewer]),
      );
      const totalCount = count ?? 0;

      return {
        applications: applications.map((application) =>
          enrichApplicationSummary(
            application,
            membershipTypeById.get(application.membership_type_id),
            application.reviewed_by
              ? reviewerById.get(application.reviewed_by)
              : undefined,
          ),
        ),
        totalCount,
        page: values.page,
        pageSize: values.pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / values.pageSize)),
      };
    },

    async getMembershipApplicationForAdmin(params: {
      id: string;
      organisationId: string;
    }): Promise<MembershipApplicationAdminDetail> {
      const { data: application, error: applicationError } =
        await repository.getMembershipApplicationById(params);

      if (applicationError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be loaded.",
          500,
          applicationError,
        );
      }

      if (!application) {
        throw new AppError(
          "NOT_FOUND",
          "Membership application was not found.",
          404,
        );
      }

      const { data: membershipType, error: membershipTypeError } =
        await repository.getMembershipTypeById({
          id: application.membership_type_id,
          organisationId: application.organisation_id,
        });

      if (membershipTypeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be loaded.",
          500,
          membershipTypeError,
        );
      }

      const { data: reviewers, error: reviewersError } = application.reviewed_by
        ? await repository.listUsersByIds({
            organisationId: application.organisation_id,
            ids: [application.reviewed_by],
          })
        : { data: [], error: null };

      if (reviewersError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Reviewer could not be loaded.",
          500,
          reviewersError,
        );
      }

      return {
        ...enrichApplicationSummary(
          application,
          membershipType ?? undefined,
          reviewers?.[0],
        ),
        membershipTypeDescription: membershipType?.description ?? null,
      };
    },

    async listMembersForAdmin(
      input: ListAdminMembersValues,
    ): Promise<MembersAdminPage> {
      const values = listAdminMembersSchema.parse(input);
      const search = values.search?.trim();
      const [matchingApplicationsResult, matchingUsersResult] = search
        ? await Promise.all([
            repository.listMembershipApplicationsBySearch({
              organisationId: values.organisationId,
              search,
            }),
            repository.listUsersBySearch({
              organisationId: values.organisationId,
              search,
            }),
          ])
        : [
            { data: [], error: null },
            { data: [], error: null },
          ];

      if (matchingApplicationsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Application search could not be completed.",
          500,
          matchingApplicationsResult.error,
        );
      }

      if (matchingUsersResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account search could not be completed.",
          500,
          matchingUsersResult.error,
        );
      }

      const { data, error, count } = await repository.listMembersForAdmin({
        ...values,
        applicationIds: (matchingApplicationsResult.data ?? []).map(
          (application) => application.id,
        ),
        userIds: (matchingUsersResult.data ?? []).map((user) => user.id),
      });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Members could not be loaded.",
          500,
          error,
        );
      }

      const members = data ?? [];
      const memberIds = members.map((member) => member.id);
      const membershipTypeIds = Array.from(
        new Set(members.map((member) => member.membership_type_id)),
      );
      const applicationIds = Array.from(
        new Set(
          members
            .map((member) => member.membership_application_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const userIds = Array.from(
        new Set(
          members
            .map((member) => member.user_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );

      const [
        membershipTypesResult,
        applicationsResult,
        usersResult,
        periodsResult,
        cardsResult,
      ] = await Promise.all([
        repository.listMembershipTypesByIds({
          organisationId: values.organisationId,
          ids: membershipTypeIds,
        }),
        repository.listMembershipApplicationsByIds({
          organisationId: values.organisationId,
          ids: applicationIds,
        }),
        repository.listUsersByIds({
          organisationId: values.organisationId,
          ids: userIds,
        }),
        repository.listMembershipPeriodsByMemberIds({
          organisationId: values.organisationId,
          memberIds,
        }),
        repository.listMembershipCardsByMemberIds({
          organisationId: values.organisationId,
          memberIds,
        }),
      ]);

      if (membershipTypesResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership types could not be loaded.",
          500,
          membershipTypesResult.error,
        );
      }

      if (applicationsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Applications could not be loaded.",
          500,
          applicationsResult.error,
        );
      }

      if (usersResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Linked accounts could not be loaded.",
          500,
          usersResult.error,
        );
      }

      if (periodsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership periods could not be loaded.",
          500,
          periodsResult.error,
        );
      }

      if (cardsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership cards could not be loaded.",
          500,
          cardsResult.error,
        );
      }

      const membershipTypeById = new Map(
        (membershipTypesResult.data ?? []).map((membershipType) => [
          membershipType.id,
          membershipType,
        ]),
      );
      const applicationById = new Map(
        (applicationsResult.data ?? []).map((application) => [
          application.id,
          application,
        ]),
      );
      const userById = new Map(
        (usersResult.data ?? []).map((user) => [user.id, user]),
      );
      const periodsByMemberId = new Map<string, MembershipPeriod[]>();
      const cardsByMemberId = new Map<string, MembershipCard[]>();

      (periodsResult.data ?? []).forEach((period) => {
        periodsByMemberId.set(period.member_id, [
          ...(periodsByMemberId.get(period.member_id) ?? []),
          period,
        ]);
      });

      (cardsResult.data ?? []).forEach((card) => {
        cardsByMemberId.set(card.member_id, [
          ...(cardsByMemberId.get(card.member_id) ?? []),
          card,
        ]);
      });

      const totalCount = count ?? 0;

      return {
        members: members.map((member) =>
          enrichMemberSummary({
            member,
            membershipType: membershipTypeById.get(member.membership_type_id),
            application: member.membership_application_id
              ? applicationById.get(member.membership_application_id)
              : null,
            user: member.user_id ? userById.get(member.user_id) : null,
            periods: periodsByMemberId.get(member.id) ?? [],
            cards: cardsByMemberId.get(member.id) ?? [],
          }),
        ),
        totalCount,
        page: values.page,
        pageSize: values.pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / values.pageSize)),
      };
    },

    async listRenewalsForAdmin(
      input: ListAdminRenewalsValues,
    ): Promise<MemberRenewalsAdminPage> {
      const values = listAdminRenewalsSchema.parse(input);
      const search = values.search?.trim();
      const renewedSince = new Date();
      renewedSince.setDate(renewedSince.getDate() - 30);
      const [
        matchingApplicationsResult,
        matchingUsersResult,
        renewedMemberIdsResult,
      ] = await Promise.all([
        search
          ? repository.listMembershipApplicationsBySearch({
              organisationId: values.organisationId,
              search,
            })
          : Promise.resolve({ data: [], error: null }),
        search
          ? repository.listUsersBySearch({
              organisationId: values.organisationId,
              search,
            })
          : Promise.resolve({ data: [], error: null }),
        values.filter === "renewed_recently"
          ? repository.listRenewedRecentlyMemberIds({
              organisationId: values.organisationId,
              since: renewedSince.toISOString(),
            })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (matchingApplicationsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Application search could not be completed.",
          500,
          matchingApplicationsResult.error,
        );
      }

      if (matchingUsersResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Account search could not be completed.",
          500,
          matchingUsersResult.error,
        );
      }

      if (renewedMemberIdsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Renewed members could not be loaded.",
          500,
          renewedMemberIdsResult.error,
        );
      }

      const renewedMemberIds = Array.from(
        new Set(
          (renewedMemberIdsResult.data ?? [])
            .map((log) => log.entity_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const { data, error, count } =
        await repository.listMembersForRenewalAdmin({
          ...values,
          applicationIds: (matchingApplicationsResult.data ?? []).map(
            (application) => application.id,
          ),
          userIds: (matchingUsersResult.data ?? []).map((user) => user.id),
          renewedMemberIds,
        });

      if (error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Renewals could not be loaded.",
          500,
          error,
        );
      }

      const members = data ?? [];
      const memberIds = members.map((member) => member.id);
      const membershipTypeIds = Array.from(
        new Set(members.map((member) => member.membership_type_id)),
      );
      const applicationIds = Array.from(
        new Set(
          members
            .map((member) => member.membership_application_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const userIds = Array.from(
        new Set(
          members
            .map((member) => member.user_id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const [
        membershipTypesResult,
        applicationsResult,
        usersResult,
        periodsResult,
        cardsResult,
      ] = await Promise.all([
        repository.listMembershipTypesByIds({
          organisationId: values.organisationId,
          ids: membershipTypeIds,
        }),
        repository.listMembershipApplicationsByIds({
          organisationId: values.organisationId,
          ids: applicationIds,
        }),
        repository.listUsersByIds({
          organisationId: values.organisationId,
          ids: userIds,
        }),
        repository.listMembershipPeriodsByMemberIds({
          organisationId: values.organisationId,
          memberIds,
        }),
        repository.listMembershipCardsByMemberIds({
          organisationId: values.organisationId,
          memberIds,
        }),
      ]);

      if (membershipTypesResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership types could not be loaded.",
          500,
          membershipTypesResult.error,
        );
      }

      if (applicationsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Applications could not be loaded.",
          500,
          applicationsResult.error,
        );
      }

      if (usersResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Linked accounts could not be loaded.",
          500,
          usersResult.error,
        );
      }

      if (periodsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership periods could not be loaded.",
          500,
          periodsResult.error,
        );
      }

      if (cardsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership cards could not be loaded.",
          500,
          cardsResult.error,
        );
      }

      const membershipTypeById = new Map(
        (membershipTypesResult.data ?? []).map((membershipType) => [
          membershipType.id,
          membershipType,
        ]),
      );
      const applicationById = new Map(
        (applicationsResult.data ?? []).map((application) => [
          application.id,
          application,
        ]),
      );
      const userById = new Map(
        (usersResult.data ?? []).map((user) => [user.id, user]),
      );
      const periodsByMemberId = new Map<string, MembershipPeriod[]>();
      const cardsByMemberId = new Map<string, MembershipCard[]>();
      const renewedMemberIdSet = new Set(renewedMemberIds);

      (periodsResult.data ?? []).forEach((period) => {
        periodsByMemberId.set(period.member_id, [
          ...(periodsByMemberId.get(period.member_id) ?? []),
          period,
        ]);
      });

      (cardsResult.data ?? []).forEach((card) => {
        cardsByMemberId.set(card.member_id, [
          ...(cardsByMemberId.get(card.member_id) ?? []),
          card,
        ]);
      });

      const totalCount = count ?? 0;

      return {
        members: members.map((member) => {
          const summary = enrichMemberSummary({
            member,
            membershipType: membershipTypeById.get(member.membership_type_id),
            application: member.membership_application_id
              ? applicationById.get(member.membership_application_id)
              : null,
            user: member.user_id ? userById.get(member.user_id) : null,
            periods: periodsByMemberId.get(member.id) ?? [],
            cards: cardsByMemberId.get(member.id) ?? [],
          });

          return renewedMemberIdSet.has(member.id)
            ? { ...summary, renewalStatus: "renewed_recently" }
            : enrichRenewalSummary(summary, values.expiringSoonDays);
        }),
        totalCount,
        page: values.page,
        pageSize: values.pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / values.pageSize)),
        expiringSoonDays: values.expiringSoonDays,
      };
    },

    async getMemberForAdmin(params: {
      id: string;
      organisationId: string;
    }): Promise<MemberAdminDetail> {
      const { data: member, error: memberError } =
        await repository.getMemberById(params);

      if (memberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be loaded.",
          500,
          memberError,
        );
      }

      if (!member) {
        throw new AppError("NOT_FOUND", "Member was not found.", 404);
      }

      const [
        membershipTypeResult,
        applicationResult,
        userResult,
        periodsResult,
        cardsResult,
        auditLogsResult,
      ] = await Promise.all([
        repository.getMembershipTypeById({
          id: member.membership_type_id,
          organisationId: member.organisation_id,
        }),
        member.membership_application_id
          ? repository.getMembershipApplicationById({
              id: member.membership_application_id,
              organisationId: member.organisation_id,
            })
          : { data: null, error: null },
        member.user_id
          ? repository.listUsersByIds({
              organisationId: member.organisation_id,
              ids: [member.user_id],
            })
          : { data: [], error: null },
        repository.listMembershipPeriodsByMemberIds({
          organisationId: member.organisation_id,
          memberIds: [member.id],
        }),
        repository.listMembershipCardsByMemberIds({
          organisationId: member.organisation_id,
          memberIds: [member.id],
        }),
        repository.listAuditLogsForMember({
          organisationId: member.organisation_id,
          memberId: member.id,
        }),
      ]);

      if (membershipTypeResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership type could not be loaded.",
          500,
          membershipTypeResult.error,
        );
      }

      if (applicationResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership application could not be loaded.",
          500,
          applicationResult.error,
        );
      }

      if (userResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Linked account could not be loaded.",
          500,
          userResult.error,
        );
      }

      if (periodsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership periods could not be loaded.",
          500,
          periodsResult.error,
        );
      }

      if (cardsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership cards could not be loaded.",
          500,
          cardsResult.error,
        );
      }

      if (auditLogsResult.error) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Audit timeline could not be loaded.",
          500,
          auditLogsResult.error,
        );
      }

      const user = userResult.data?.[0] ?? null;
      const periods = periodsResult.data ?? [];
      const cards = cardsResult.data ?? [];

      return {
        ...enrichMemberSummary({
          member,
          membershipType: membershipTypeResult.data ?? undefined,
          application: applicationResult.data,
          user,
          periods,
          cards,
        }),
        application: applicationResult.data,
        linkedAccountFirstName: user?.first_name ?? null,
        linkedAccountLastName: user?.last_name ?? null,
        linkedAccountStatus: user?.status ?? null,
        membershipPeriods: periods,
        membershipCards: cards.map(redactMembershipCard),
        auditLogs: auditLogsResult.data ?? [],
      };
    },

    async getRenewalForAdmin(params: {
      id: string;
      organisationId: string;
    }): Promise<MemberRenewalDetail> {
      const member = await this.getMemberForAdmin(params);

      return {
        ...member,
        renewalStatus: getRenewalStatus(member),
      };
    },

    async renewMember(input: RenewMemberValues) {
      const values = renewMemberSchema.parse(input);
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
          "FORBIDDEN",
          "Renewals are not available for this organisation.",
          403,
        );
      }

      const { data: existingMember, error: existingMemberError } =
        await repository.getMemberById({
          id: values.memberId,
          organisationId: values.organisationId,
        });

      if (existingMemberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be loaded.",
          500,
          existingMemberError,
        );
      }

      if (!existingMember) {
        throw new AppError("NOT_FOUND", "Member was not found.", 404);
      }

      if (existingMember.status === "cancelled") {
        throw new AppError(
          "CONFLICT",
          "Cancelled members cannot be renewed.",
          409,
        );
      }

      if (existingMember.status === "pending") {
        throw new AppError(
          "CONFLICT",
          "Pending members must be approved before renewal.",
          409,
        );
      }

      const { data: overlappingPeriods, error: overlapError } =
        await repository.listOverlappingActiveMembershipPeriods({
          organisationId: values.organisationId,
          memberId: values.memberId,
          startsAt: values.periodStartsAt.toISOString(),
          endsAt: values.periodEndsAt.toISOString(),
        });

      if (overlapError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership periods could not be checked.",
          500,
          overlapError,
        );
      }

      if ((overlappingPeriods ?? []).length > 0) {
        throw new AppError(
          "CONFLICT",
          "Renewal dates overlap an existing active membership period.",
          409,
        );
      }

      const { data: membershipPeriod, error: periodError } =
        await repository.createMembershipPeriod({
          organisationId: values.organisationId,
          memberId: values.memberId,
          startsAt: values.periodStartsAt.toISOString(),
          endsAt: values.periodEndsAt.toISOString(),
          source: "admin_renewal",
        });

      if (periodError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Renewal period could not be created.",
          500,
          periodError,
        );
      }

      const nextStatus =
        existingMember.status === "suspended" ? "suspended" : "active";
      const { data: updatedMember, error: updateError } =
        await repository.updateMemberRenewal({
          ...values,
          status: nextStatus,
        });

      if (updateError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member renewal could not be saved.",
          500,
          updateError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "member_renewed",
        entityType: "member",
        entityId: values.memberId,
        oldValues: {
          status: existingMember.status,
          expires_at: existingMember.expires_at,
        },
        newValues: {
          status: updatedMember.status,
          previous_expiry: existingMember.expires_at,
          new_expiry: updatedMember.expires_at,
          membership_period_id: membershipPeriod.id,
          renewed_by: values.reviewedByUserId,
          renewed_at: new Date().toISOString(),
          notes: values.notes ?? null,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Renewal audit log could not be created.",
          500,
          auditError,
        );
      }

      return {
        member: updatedMember,
        membershipPeriod,
      };
    },

    async revokeMembershipCard(input: RevokeMembershipCardValues) {
      const values = revokeMembershipCardSchema.parse(input);
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
          "FORBIDDEN",
          "Card management is not available for this organisation.",
          403,
        );
      }

      const { data: member, error: memberError } =
        await repository.getMemberById({
          id: values.memberId,
          organisationId: values.organisationId,
        });

      if (memberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be loaded.",
          500,
          memberError,
        );
      }

      if (!member) {
        throw new AppError("NOT_FOUND", "Member was not found.", 404);
      }

      const { data: activeCards, error: activeCardsError } =
        await repository.getActiveMembershipCardForMember({
          organisationId: values.organisationId,
          memberId: values.memberId,
        });

      if (activeCardsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Active membership card could not be loaded.",
          500,
          activeCardsError,
        );
      }

      if (!activeCards?.length) {
        throw new AppError(
          "CONFLICT",
          "No active membership card exists to revoke.",
          409,
        );
      }

      if (activeCards.length > 1) {
        throw new AppError(
          "CONFLICT",
          "More than one active card exists. Resolve card history before revoking.",
          409,
        );
      }

      const activeCard = activeCards[0];
      const revokedAt = new Date().toISOString();
      const { data: revokedCard, error: revokeError } =
        await repository.revokeActiveMembershipCard({
          ...values,
          cardId: activeCard.id,
          revokedAt,
        });

      if (revokeError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership card could not be revoked.",
          500,
          revokeError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "membership_card_revoked",
        entityType: "member",
        entityId: values.memberId,
        oldValues: {
          card_id: activeCard.id,
          card_status: activeCard.card_status,
        },
        newValues: {
          member_id: values.memberId,
          old_card_id: activeCard.id,
          card_id: revokedCard.id,
          card_status: revokedCard.card_status,
          revoked_by: values.reviewedByUserId,
          revoked_at: revokedCard.revoked_at,
          reason: values.reason,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Card revocation audit log could not be created.",
          500,
          auditError,
        );
      }

      return redactMembershipCard(revokedCard);
    },

    async reissueMembershipCard(input: ReissueMembershipCardValues) {
      const values = reissueMembershipCardSchema.parse(input);
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
          "FORBIDDEN",
          "Card management is not available for this organisation.",
          403,
        );
      }

      const { data: member, error: memberError } =
        await repository.getMemberById({
          id: values.memberId,
          organisationId: values.organisationId,
        });

      if (memberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be loaded.",
          500,
          memberError,
        );
      }

      if (!member) {
        throw new AppError("NOT_FOUND", "Member was not found.", 404);
      }

      const { data: activeCards, error: activeCardsError } =
        await repository.getActiveMembershipCardForMember({
          organisationId: values.organisationId,
          memberId: values.memberId,
        });

      if (activeCardsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Active membership card could not be checked.",
          500,
          activeCardsError,
        );
      }

      if (activeCards?.length) {
        throw new AppError(
          "CONFLICT",
          "An active membership card already exists. Revoke it before issuing a replacement.",
          409,
        );
      }

      const { data: cards, error: cardsError } =
        await repository.listMembershipCardsByMemberIds({
          organisationId: values.organisationId,
          memberIds: [values.memberId],
        });

      if (cardsError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Membership card history could not be loaded.",
          500,
          cardsError,
        );
      }

      const previousCard = cards?.[0] ?? null;

      if (!previousCard) {
        throw new AppError(
          "CONFLICT",
          "No previous membership card exists to replace.",
          409,
        );
      }

      if (previousCard.card_status !== "revoked") {
        throw new AppError(
          "CONFLICT",
          "The latest membership card must be revoked before a replacement can be issued.",
          409,
        );
      }

      const { data: replacementCard, error: createError } =
        await repository.createReplacementMembershipCard({
          ...values,
          qrToken: createMembershipCardToken(),
        });

      if (createError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Replacement membership card could not be issued.",
          500,
          createError,
        );
      }

      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action: "membership_card_reissued",
        entityType: "member",
        entityId: values.memberId,
        oldValues: {
          member_id: values.memberId,
          old_card_id: previousCard.id,
          old_card_status: previousCard.card_status,
        },
        newValues: {
          member_id: values.memberId,
          old_card_id: previousCard.id,
          new_card_id: replacementCard.id,
          card_status: replacementCard.card_status,
          reissued_by: values.reviewedByUserId,
          reissued_at: replacementCard.issued_at,
          reason: values.reason,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Card reissue audit log could not be created.",
          500,
          auditError,
        );
      }

      return redactMembershipCard(replacementCard);
    },

    async updateMemberStatus(input: UpdateMemberStatusValues) {
      const values = updateMemberStatusSchema.parse(input);
      const { data: existingMember, error: existingMemberError } =
        await repository.getMemberById({
          id: values.memberId,
          organisationId: values.organisationId,
        });

      if (existingMemberError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member could not be loaded.",
          500,
          existingMemberError,
        );
      }

      if (!existingMember) {
        throw new AppError("NOT_FOUND", "Member was not found.", 404);
      }

      if (existingMember.status === "cancelled") {
        throw new AppError(
          "CONFLICT",
          "Cancelled members cannot be reactivated in this workflow.",
          409,
        );
      }

      if (existingMember.status === values.status) {
        return existingMember;
      }

      if (
        values.status === "suspended" &&
        !["active", "pending"].includes(existingMember.status)
      ) {
        throw new AppError(
          "CONFLICT",
          "Only active or pending members can be suspended.",
          409,
        );
      }

      if (
        values.status === "active" &&
        !["suspended", "expired"].includes(existingMember.status)
      ) {
        throw new AppError(
          "CONFLICT",
          "Only suspended or expired members can be reactivated.",
          409,
        );
      }

      const { data: updatedMember, error: updateError } =
        await repository.updateMemberStatus(values);

      if (updateError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member status could not be updated.",
          500,
          updateError,
        );
      }

      const action =
        values.status === "suspended"
          ? "member_suspended"
          : "member_reactivated";
      const { error: auditError } = await repository.createAuditLog({
        organisationId: values.organisationId,
        userId: values.reviewedByUserId,
        action,
        entityType: "member",
        entityId: values.memberId,
        oldValues: {
          status: existingMember.status,
          expires_at: existingMember.expires_at,
        },
        newValues: {
          status: updatedMember.status,
          expires_at: updatedMember.expires_at,
        },
      });

      if (auditError) {
        throw new AppError(
          "INTERNAL_ERROR",
          "Member status audit log could not be created.",
          500,
          auditError,
        );
      }

      return updatedMember;
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

      if (existingApplication.status !== "pending") {
        throw new AppError(
          "CONFLICT",
          "Only pending membership applications can be approved.",
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
