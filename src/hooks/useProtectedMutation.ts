import { useAuthStore } from "@/store";
import { ROLES } from "@/types";
import { hasRole } from "@/utils";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useToast } from "./useToast";

export function useProtectedMutation<TData, TVariables>(
  fn: (vars: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const isAdmin = hasRole(user, ROLES.ADMIN);

  const unauthorizedMsg = "غير مصرح به";

  return useMutation<TData, Error, TVariables>({
    mutationFn: (vars) => {
      if (!isAdmin) {
        return Promise.reject(new Error(unauthorizedMsg));
      }
      return fn(vars);
    },
    onError: (err, vars) => {
      if (err.message === unauthorizedMsg) {
        showToast("ليس لديك صلاحية لهذا الإجراء", { type: "warning" });
      }
      (options?.onError as ((error: Error, variables: TVariables) => void) | undefined)?.(
        err,
        vars
      );
    },
    ...options,
  });
}
