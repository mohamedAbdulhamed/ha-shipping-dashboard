import useAxiosPrivate from "@/hooks/useAxiosPrivate.ts";
import { useAuthStore } from "@/store";

const useLogout = () => {
  const axiosPrivate = useAxiosPrivate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      const response = await axiosPrivate.get("/Account/logout");

      if (
        response?.data?.Success === true &&
        response?.data?.StatusCode === 200
      ) {
        logout();

        return { success: true, message: "Logged out successfully." };
      } else {
        const errorMessage =
          response?.data?.ErrorMessage || "Couldn't log you out.";
        return { success: false, message: errorMessage };
      }
    } catch {
      return { success: false, message: "An error occurred during logout." };
    }
  };

  return handleLogout;
};

export default useLogout;
