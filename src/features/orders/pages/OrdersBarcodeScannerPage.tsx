import { motion } from "framer-motion";
import QrCodeScannerRounded from "@mui/icons-material/QrCodeScannerRounded";
import { MultiLineChipInput } from "@/components/ui/MultiLineChipInput";
import { ROUTES } from "@/app/routes/routesConfig";
import { useNavigate } from "react-router-dom";

export function OrdersBarcodeScannerPage() {
  const navigate = useNavigate();

  return (
    <MultiLineChipInput<string>
      title="مسح بوليصات الشحن"
      headerIcon={<QrCodeScannerRounded sx={{ fontSize: 40, color: "white" }} />}
      placeholder="امسح أو ألصق أكواد بوليصات الشحن هنا، كود في كل سطر"
      parseItems={(raw) =>
        raw
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter((s) => !!s)
      }
      renderLabel={(code) => code}
      onSubmit={(codes) => {
        const params = new URLSearchParams();
        codes.forEach((c) => params.append("billOfLading", c));
        navigate(`${ROUTES.ORDERS.BASE.url}?${params.toString()}`);
        return Promise.resolve();
      }}
      buttonLabel={(count, loading) =>
        loading ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ display: "inline-block", marginRight: 8 }}
            >
              ⏳
            </motion.span>
            جارٍ التحويل...
          </>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            🚀 ابدأ التحليل ({count})
          </motion.span>
        )
      }
    />
  );
}
export default OrdersBarcodeScannerPage;
