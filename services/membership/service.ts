import "server-only";

import { randomBytes } from "node:crypto";

import { AppError } from "@/lib/errors";
import {
  approveMembershipApplicationSchema,
  createMembershipApplicationSchema,
  listAdminMembershipApplicationsSchema,
  listMembershipApplicationsSchema,
  updateMembershipApplicationReviewSchema,
  type ApproveMembershipApplicationValues,
  type CreateMembershipApplicationValues,
  type ListAdminMembershipApplicationsValues,
  type ListMembershipApplicationsValues,
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
