import { arSD } from '@mui/x-data-grid/locales';
import { CRUDLocaleText } from '@toolpad/core/Crud/localeText';

// change 
export const PHONE_REGEX = /^(?:01[0125]\d{8}|0[2-9]\d{8})$/;

export const DEFAULT_PAGE_SIZE_OPTIONS = [50, 100, 250, 1000];

export const DataGridArLocaleText = {
  ...arSD.components.MuiDataGrid.defaultProps.localeText,
  filterOperatorDoesNotContain: "لا يحتوي على",
  filterOperatorDoesNotEqual: "لا يساوي",
};

export const CRUDLocaleTextEgyptianArabic: CRUDLocaleText = {
  createNewButtonLabel: "إنشاء جديد",
  reloadButtonLabel: "تحديث",
  createLabel: "إنشاء",
  createSuccessMessage: "تم الإنشاء بنجاح",
  createErrorMessage: "حدث خطأ أثناء الإنشاء",
  editLabel: "تعديل",
  editSuccessMessage: "تم التعديل بنجاح",
  editErrorMessage: "حدث خطأ أثناء التعديل",
  deleteLabel: "حذف",
  deleteConfirmTitle: "تأكيد الحذف",
  deleteConfirmMessage: "هل أنت متأكد من حذف هذا العنصر؟",
  deleteConfirmLabel: "نعم، احذف",
  deleteCancelLabel: "إلغاء",
  deleteSuccessMessage: "تم الحذف بنجاح",
  deleteErrorMessage: "حدث خطأ أثناء الحذف",
  deletedItemMessage: "العنصر المحذوف"
};

export const ApiUrls = Object.freeze({
  // branches
  fetchAllBranches: "/Branchs/GetAll",
  createBranchRequest: "/Branchs/Add",
  deleteBranchRequest: "/Branchs/Delete/", // :id
  
  // orders
  fetchAllOrders: "/Orders/GetAll",
  fetchOrderById: "/Orders/GetById/", // :id
  createOrderRequest: "/Orders/Add",
  updateOrder: "/Orders/Update/", // :id
  deleteOrder: "/Orders/Delete/", // :id
  
  fetchAllFinancialStatuses: "/Orders/GetFinancialStatus",
  collectOrders: "/Orders/OrdersFinancialClose",

  fetchAllServiceTypes: "/Orders/GetServiceTypes",
  fetchAllShipmentStatuses: "/OrderStatusHistories/GetShipmentStatus",
  fetchAllowedTransitions: "/OrderStatusHistories/GetAllowedTransitions/",

  addShipmentStatus: "/OrderStatusHistories/Add",
  deleteShipmentStatus: "/OrderStatusHistories/Delete/", // :id
  
  // users
  fetchAllUsers: "/Account/GetAll",
  fetchAllEmployeeNames: "/Account/GetEmployeesNames",
  fetchAllCustomerNames: "/Account/GetCustomerNames",
  fetchAllRoles: "/Account/GetRoles",
  fetchUserById: "/Account/GetById/", // :id
  createUserRequest: "/Account/register",
  updateUserRequest: "/Account/Update/", // :userId
  toggleUserActive: "/Account/ToggleActive",
  deleteUser: "/Account/DeleteUser/", // :id
  updateUserPassword: "",

  // reports
  fetchProfitReports: "/Report/ProfitReport",
  fetchUserOrdersReport: "/Report/UserOrdersReport",
});