import { AppError } from "@/lib/errors";
import {
  createMembershipApplicationSchema,
  listMembershipApplicationsSchema,
  type CreateMembershipApplicationValues,
  type ListMembershipApplicationsValues,
} from "@/features/membership/schemas";
import {
  createMembershipRepository,
  type MembershipRepositoryClient,
} from "@/services/membership/repository";

export function createMembershipService(client: MembershipRepositoryClient) {
  const repository = createMembershipRepository(client);

  return {
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
  };
}
