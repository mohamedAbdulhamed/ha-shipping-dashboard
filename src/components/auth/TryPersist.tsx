import React, { memo, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useLocalStorageState from "@/hooks/useLocalStorageState";
import useRefreshToken from "@/hooks/useRefreshToken";
import { PageLoader } from "../ui/PageLoader";
import { retryWithBackoff } from "@/utils/index";
import { useAuthStore } from "@/store";
import { Button } from "@mui/material";

const OfflineMessage = memo(() => (
  <div>
    <p>تعذر الاتصال بالإنترنت. الرجاء التحقق من الاتصال.</p>
    <p>سنعيد المحاولة تلقائيًا عند استعادة الاتصال.</p>
  </div>
));

const TryPersist: React.FC= () => {
  const [persist] = useLocalStorageState<boolean>("persist", false);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  // Network status handling with stable callbacks
  const handleNetworkChange = useCallback(() => {
    setIsOffline(!navigator.onLine);
  }, []);

  const handleCancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    // Optionally, navigate to the login page upon cancellation.
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    window.addEventListener("offline", handleNetworkChange);
    window.addEventListener("online", handleNetworkChange);
    return () => {
      window.removeEventListener("offline", handleNetworkChange);
      window.removeEventListener("online", handleNetworkChange);
    };
  }, [handleNetworkChange]);

  useEffect(() => {
    let isMounted = true;
    controllerRef.current = new AbortController();

    const verifyRefreshToken = async () => {
      if (!persist) {
        setIsLoading(false);
        return;
      }

      if (isOffline) {
        setIsLoading(false);
        return;
      }

      if (user) {
        setIsLoading(false);
        return;
      }

      try {
        await retryWithBackoff(
          () => refresh(controllerRef.current!.signal),
          3,
          1000
        );
      } catch (error) {
        console.error("Token refresh failed:", error);
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    verifyRefreshToken();

    return () => {
      isMounted = false;
      controllerRef.current?.abort();
    };
  }, [persist, refresh, navigate, isOffline, user]);

  const cancelAction = (): ReactNode => (
    <Button
      variant="contained"
      color="error"
      onClick={handleCancel}
      sx={{
        my: 3,
      }}
    >
      الغاء
    </Button>
  )

  if (isOffline) return <OfflineMessage />;
  if (isLoading) return <PageLoader text="...جاري تحديث جلستك" action={cancelAction} />;

  return <Outlet />;
};

export default TryPersist;
