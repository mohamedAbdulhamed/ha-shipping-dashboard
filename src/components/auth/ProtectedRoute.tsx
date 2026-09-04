import {
  FC,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Navigate, useLocation, Location } from "react-router-dom";
import { UserRole } from "@/entities/User";
import { PageLoader } from "../ui/PageLoader";
import { useAuthStore } from "@/store";
import { hasAnyRole, isAuthenticated as isUserAuthenticated } from "@/utils";

export type ProtectedRouteProps = {
  children: ReactNode;
  /**
   * Required roles to access the route (any of the roles)
   * @default []
   */
  allowedRoles?: UserRole[];
  /**
   * Redirect path when unauthenticated
   * @default '/login'
   */
  unauthenticatedRedirect?: string;
  /**
   * Redirect path when unauthorized
   * @default '/access-denied'
   */
  unauthorizedRedirect?: string;
  /**
   * Enable route logging for security audits
   * @default false
   */
  enableLogging?: boolean;
  /**
   * Custom render function for access denied
   */
  renderForbidden?: (location: Location) => ReactNode;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  unauthenticatedRedirect = "/login",
  unauthorizedRedirect = "/access-denied",
  renderForbidden,
}) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  const isAuthenticated = isUserAuthenticated(user, token)

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkAuthorization = useMemo(() => {
    // No auth required
    if (allowedRoles.length === 0) {
      return true;
    }

    return hasAnyRole(user, allowedRoles);
  }, [user, allowedRoles]);

  useEffect(() => {
    const verifyAccess = async () => {
      setIsChecking(true);

      try {
        // Authorization check
        setIsAuthorized(checkAuthorization);
      } catch {
        setIsAuthorized(false);
      } finally {
        setIsChecking(false);
      }
    };

    verifyAccess();
  }, [user, allowedRoles, checkAuthorization]);

  if (isChecking) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={unauthenticatedRedirect}
        state={{ from: location }}
        replace
      />
    );
  }

  if (!isAuthorized) {
    if (renderForbidden) {
      return <>{renderForbidden(location)}</>;
    }

    return (
      <Navigate
        to={unauthorizedRedirect}
        state={{
          from: location,
          requiredRoles: allowedRoles,
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};