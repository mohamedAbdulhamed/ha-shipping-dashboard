import { Alert, Button } from "@mui/material";

type QueryErrorAlertProps = {
  onRetry: () => unknown;
  message?: string;
};

export function QueryErrorAlert({
  onRetry,
  message = "تعذر تحميل البيانات. تحقق من الاتصال وحاول مرة أخرى.",
}: QueryErrorAlertProps) {
  return (
    <Alert
      severity="error"
      role="alert"
      action={
        <Button color="inherit" size="small" onClick={() => void onRetry()}>
          إعادة المحاولة
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
