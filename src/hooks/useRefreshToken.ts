import axios from "@/services/api/axios";
import { useAuthStore } from "@/store";
import { RefreshTokenResponse } from "@/types/dtos/User.dto";
import { useCallback } from "react";

const useRefreshToken = () => {
  const login = useAuthStore((state) => state.login);

  return useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await axios.get<RefreshTokenResponse>('/Account/refresh-token', {
        withCredentials: true,
        signal,
      });

      const token = response.data?.Result?.token;
      const user = response.data?.Result?.user;

      if (
        !response.data?.Success ||
        response.data.StatusCode !== 200 ||
        !token ||
        !user
      ) {
        throw new Error("Session refresh was rejected");
      }

      login(user, token);
      return token;
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
        return null;
      }
      throw err;
    }
  }, [login]);
};

export default useRefreshToken;
