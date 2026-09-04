import axios from "@/services/api/axios";
import { useAuthStore } from "@/store";
import { RefreshTokenResponse } from "@/types/dtos/User.dto";

const useRefreshToken = () => {
  const { login } = useAuthStore();

  const refresh = async (signal?: AbortSignal) => {
    try {
      const response = await axios.get<RefreshTokenResponse>('/Account/refresh-token', {
        withCredentials: true,
        signal,
      });

      if (response?.data?.Success && response?.data?.StatusCode === 200)
      {
        const token = response?.data?.Result?.token;
        const user = response?.data?.Result?.user;

        if (!token || !user) {
          throw new Error("Invalid token or user data");
        }
        
        login( user, token );

        return token;
      }
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return null;
      }
      console.error(`Failed to refresh token: ${err?.response || err}`);
      throw err;
    }
    return null;
  }

  return refresh;
}

export default useRefreshToken;
