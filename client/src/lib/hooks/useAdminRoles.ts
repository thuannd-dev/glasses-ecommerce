import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import agent from "../../lib/api/agent";

interface RoleDto {
  id: string;
  name: string;
  userCount: number;
}

interface UserRoleDto {
  userId: string;
  userName: string;
  email: string;
  displayName: string;
  roles: string[];
}

export const useAdminRoles = () => {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const response = await agent.get<RoleDto[]>("/admin/roles");
      return response.data;
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await agent.get<UserRoleDto[]>("/admin/users");
      return response.data;
    },
  });

  const assignRolesMutation = useMutation({
    mutationFn: async ({
      userId,
      roles,
    }: {
      userId: string;
      roles: string[];
    }) => {
      await agent.post("/admin/assign-roles", {
        userId,
        roles,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });

  return {
    roles,
    users,
    rolesLoading,
    usersLoading,
    assignRoles: assignRolesMutation.mutate,
    isAssigning: assignRolesMutation.isPending,
  };
};
