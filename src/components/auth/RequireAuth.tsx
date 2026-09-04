import { useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { ReactNode } from "react";
import { hasAnyRole } from "@/utils";
import { UserRole } from "@/entities/User";

type RequireAuthProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

const RequireAuth = ({ allowedRoles, children }: RequireAuthProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const isAllowed = hasAnyRole(user, allowedRoles);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
