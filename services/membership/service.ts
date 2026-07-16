import "server-only";

import { randomBytes } from "node:crypto";

import { AppError } from "@/lib/errors";
import {
  approveMembershipApplicationSchema,
  createMembershipApplicationSchema,
  listAdminMembershipApplicationsSchema,
  listAdminMembersSchema,
  listMembershipApplicationsSchema,
  updateMemberStatusSchema,
  updateMembershipApplicationReviewSchema,
  type ApproveMembershipApplicationValues,
  type CreateMembershipApplicationValues,
  type ListAdminMembershipApplicationsValues,
  type ListAdminMembersValues,
  type ListMembershipApplicationsValues,
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
  MembersAdminPage,
  MembershipAuditLog,
  MembershipCard,
  MembershipPeriod,
  MembershipType,
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
