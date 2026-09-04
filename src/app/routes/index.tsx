import { lazy, Suspense, useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "@/components/layouts/AppLayout";
import AuthLayout from "@/components/layouts/AuthLayout";

import { ROUTES } from "@/app/routes/routesConfig";
import { SignInPage } from "@/features/auth";
import TryPersist from "@/components/auth/TryPersist";
import { ROLES } from "@/types";
import RequireAuth from "@/components/auth/RequireAuth";
import Unauthorized from "@/components/layouts/Unauthorized";
import { NotFoundPage } from "@/components/layouts/NotFoundPage";
import { NotFoundPage2 } from "@/components/layouts/NotFoundPage2";
import PrintLayout from "@/components/layouts/PrintLayout";
import { TruckLoader } from "@/components/ui/CustomLoader";

// Lazy-loaded pages
const DashboardPage = lazy(() =>
  import("@/features/dashboard").then((module) => ({
    default: module.DashboardPage,
  }))
);

// Users
const UsersList = lazy(() =>
  import("@/features/users").then((module) => ({ default: module.ListUsers }))
);
const ViewUser = lazy(() =>
  import("@/features/users").then((module) => ({ default: module.ViewUser }))
);
const NewUser = lazy(() =>
  import("@/features/users").then((module) => ({ default: module.NewUser }))
);
const EditUser = lazy(() =>
  import("@/features/users").then((module) => ({ default: module.EditUser }))
);

// Orders
const OrdersList = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.ListOrders }))
);
const OrdersBarcodeScannerPage = lazy(() =>
  import("@/features/orders").then((module) => ({
    default: module.OrdersBarcodeScannerPage,
  }))
);
const NewOrder = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.NewOrder }))
);
const EditOrder = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.EditOrder }))
);
const ViewOrder = lazy(() =>
  import("@/features/orders").then((module) => ({ default: module.ViewOrder }))
);
const PrintOrdersPage = lazy(() =>
  import("@/features/orders").then((module) => ({
    default: module.PrintOrdersPage,
  }))
);

// Financial
const FinancialSummary = lazy(() =>
  import("@/features/financial").then((module) => ({
    default: module.FinancialSummary,
  }))
);
const FinancialBarcodeScannerPage = lazy(() =>
  import("@/features/financial").then((module) => ({
    default: module.FinancialBarcodeScannerPage,
  }))
);

// Branches
const BranchesList = lazy(() =>
  import("@/features/branches").then((module) => ({
    default: module.ListBranches,
  }))
);
const NewBranch = lazy(() =>
  import("@/features/branches").then((module) => ({
    default: module.NewBranch,
  }))
);

// Reports
const ProfitReport = lazy(() =>
  import("@/features/reports").then((module) => ({
    default: module.ProfitReport,
  }))
);
const UserProfitReport = lazy(() =>
  import("@/features/reports").then((module) => ({
    default: module.UserProfitReport,
  }))
);

const RandomNotFound = () => {
  const NotFoundComponent = useMemo(() => {
    return Math.random() < 0.5 ? NotFoundPage : NotFoundPage2;
  }, []);

  return <NotFoundComponent />;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<TruckLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.UNAUTHORIZED.url} element={<Unauthorized />} />

          <Route element={<TryPersist />}>
            {/* Dashboard */}
            <Route
              path={ROUTES.DASHBOARD.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <DashboardPage />{" "}
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.HOME.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <DashboardPage />
                </RequireAuth>
              }
            />

            {/* Users */}
            <Route
              path={ROUTES.USERS.BASE.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.OPERATION]}>
                  <UsersList />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.USERS.NEW.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.OPERATION]}>
                  <NewUser />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.USERS.VIEW.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <ViewUser />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.USERS.EDIT.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <EditUser />
                </RequireAuth>
              }
            />

            {/* ORDERS - one parent */}
            <Route
              path={ROUTES.ORDERS.BASE.url}
              element={
                <RequireAuth
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.OPERATION,
                    ROLES.REPRESENT,
                    ROLES.SENDER,
                  ]}
                >
                  <OrdersList />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.ORDERS.NEW.url}
              element={
                <RequireAuth
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.OPERATION,
                    ROLES.REPRESENT,
                    ROLES.SENDER,
                  ]}
                >
                  <NewOrder />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.ORDERS.BARCODE.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <OrdersBarcodeScannerPage />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.ORDERS.EDIT.url}
              element={
                <RequireAuth
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.OPERATION,
                    ROLES.REPRESENT,
                    ROLES.SENDER,
                  ]}
                >
                  <EditOrder />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.ORDERS.VIEW.url}
              element={
                <RequireAuth
                  allowedRoles={[
                    ROLES.ADMIN,
                    ROLES.OPERATION,
                    ROLES.REPRESENT,
                    ROLES.SENDER,
                  ]}
                >
                  <ViewOrder />
                </RequireAuth>
              }
            />

            {/* Financial */}
            <Route
              path={ROUTES.FINANCE.BASE.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <FinancialSummary />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.FINANCE.BARCODE.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <FinancialBarcodeScannerPage />
                </RequireAuth>
              }
            />

            {/* Branches */}
            <Route
              path={ROUTES.BRANCHES.BASE.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <BranchesList />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.BRANCHES.NEW.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <NewBranch />
                </RequireAuth>
              }
            />

            {/* Reports and Profits */}
            <Route
              path={ROUTES.REPORTS.PROFITS.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN]}>
                  <ProfitReport />
                </RequireAuth>
              }
            />
            <Route
              path={ROUTES.REPORTS.USER_PROFITS.url}
              element={
                <RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.SENDER]}>
                  <UserProfitReport />
                </RequireAuth>
              }
            />
          </Route>
        </Route>

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN.url} element={<SignInPage />} />
        </Route>

        <Route element={<PrintLayout />}>
          <Route path={ROUTES.ORDERS.PRINT.url} element={<PrintOrdersPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<RandomNotFound />} />
      </Routes>
    </Suspense>
  );
}

/*
  Permissions:

  Sender:
    * Orders
      - add order > can't edit shippingCost
      - edit order > only address and phone numbers
    * Profile

  Operation:
    * Orders
      - add order
      - edit order > everything except cod
    * Users > senders only
      - can add new users
  
  Courier:
    * Orders
      - edit order > only change order status

*/
