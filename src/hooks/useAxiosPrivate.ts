import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { InternalAxiosRequestConfig } from "axios";
import { axiosPrivate } from "@/services/api/axios";
import { useAuthStore } from "@/store";
import useRefreshToken from "@/hooks/useRefreshToken.ts";
import useLocalStorageState from "@/hooks/useLocalStorageState";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshInFlight: Promise<string> | null = null;

const refreshOnce = async (
  refresh: ReturnType<typeof useRefreshToken>
): Promise<string> => {
  if (!refreshInFlight) {
    refreshInFlight = refresh().then((token) => {
      if (!token) throw new Error("Session refresh was rejected");
      return token;
    }).finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
};

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { token } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [, , { remove: clearPersistedSession }] = useLocalStorageState("persist", false);

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      config => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      }, (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const request = error?.config as RetryableRequestConfig | undefined;
        if (error?.response?.status !== 401 || !request || request._authRetry) {
          return Promise.reject(error);
        }

        request._authRetry = true;
        try {
          const newToken = await refreshOnce(refresh);
          request.headers.set("Authorization", `Bearer ${newToken}`);
          return axiosPrivate(request);
        } catch (refreshError) {
          logout();
          clearPersistedSession();
          navigate("/login", { replace: true });
          return Promise.reject(refreshError);
        }
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [token, refresh, logout, clearPersistedSession, navigate]);

  return axiosPrivate;
};

export default useAxiosPrivate;
