// import("../styles/orders.css");
import "../styles/orders.css";
import { memo, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import Order from "@/entities/Order";
import { ROUTES } from "@/app/routes/routesConfig";
import { themeSettings } from "@/app/theme";

interface InvoicePageProps {
  perPage: 1 | 3;
}

const Container = styled("div")(({ theme }) => ({
  width: "250mm",
  minHeight: "100vh",
  background: theme.palette.grey[100],
  color: theme.palette.text.primary,
  margin: "auto",
  padding: "20mm",
  boxSizing: "border-box",
}));

const InvoicePage = styled("div", {
  shouldForwardProp: (prop) => prop !== "perPage",
})<InvoicePageProps>(({ perPage }) => ({
  pageBreakAfter: "always",
  padding: "12px",
  breakInside: "avoid",

  // Don’t break after the very last page:
  "&:last-of-type": {
    pageBreakAfter: "auto",
  },

  ...(perPage === 3 && {
    "@media print": {
      pageBreakInside: "avoid",
      breakInside: "avoid-page",
      zoom: "80%",
      transformOrigin: "top center",

      "&:last-of-type": {
        pageBreakAfter: "auto",
      },
    },
  }),
}));

const InvoiceItem = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: "12px",
  padding: "20px",
  flex: 1,
  marginBottom: "24px",
  background: "white",
  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden",

  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "4px",
    height: "100%",
    background: theme.palette.primary.main,
  },

  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
  },

  "@media print": {
    border: "1px solid #ddd",
    boxShadow: "none",
    "&:before": {
      background: "#666",
    },
    "&:hover": {
      transform: "none",
    },
    pageBreakInside: "avoid",
    breakInside: "avoid-page",
    marginBottom: "12mm",
    minHeight: "85mm", // ~1/3 of A4 height (297mm)
  },
}));

const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: "row-reverse",
  marginBottom: "24px",
  paddingBottom: "16px",
  borderBottom: `2px solid ${theme.palette.primary.light}`,
}));

const TitleGroup = styled("div")(({ theme }) => ({
  textAlign: "center",
  "& > div:first-of-type": {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: theme.palette.primary.dark,
    marginBottom: "8px",
  },
  "& > div:nth-of-type(2)": {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
    marginBottom: "4px",
  },
  "& > div:last-of-type": {
    fontSize: "0.9rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
  },
}));

const BodyTable = styled("table")(({ theme }) => ({
  width: "100%",
  borderCollapse: "collapse",
  "& td, & th": {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: "8px",
    fontSize: "0.9rem",
    verticalAlign: "top",
  },
  "& th": {
    background: theme.palette.grey[100],
    fontWeight: 600,
    textAlign: "right",
    width: "20%",
  },
  "& tr:nth-of-type(even) td": {
    background: theme.palette.background.paper,
  },
  "@media print": {
    "& th": { background: "#f5f5f5" },
    "& td, & th": { border: "1px solid #999" },
  },
}));

const StyledSquare = styled("div")(({ theme }) => ({
  padding: "10px",
  borderRadius: "10px",
  border: `2px solid ${theme.palette.primary.main}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.background.paper,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  transition: "all 0.3s ease",

  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
  },

  ".value": {
    fontSize: "1rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
  },

  "@media print": {
    borderColor: "#666",
    boxShadow: "none",
    background: "transparent",
    "&:hover": {
      transform: "none",
    },
  },
}));

const OrderQrCode = memo(({ order }: { order: Order }) => {
  const qrValue = useMemo(
    () =>
      `${ROUTES.DOMAIN.url}/${ROUTES.ORDERS.BASE.url}?billOfLading=${order.billOfLading}`,
    [order.billOfLading]
  );

  return <QRCode value={qrValue} size={64} />;
});

export function PrintOrdersPage() {
  const navigate = useNavigate();

  // The printed bill of lading is a paper document: it must always render
  // with the light palette, even when the app is in dark mode.
  const printTheme = useMemo(() => createTheme(themeSettings("light")), []);

  const [searchParams] = useSearchParams();
  const printKey = searchParams.get("printKey")!;
  const perPage = Number(searchParams.get("perPage") ?? "1") as 1 | 3;

  const orders: Order[] = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(printKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [printKey]);

  // Redirect if no orders
  useEffect(() => {
    if (orders.length === 0) {
      navigate("/orders", { replace: true });
    }
  }, [orders, navigate]);

  // Trigger print when orders are available
  const printTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (orders.length > 0) {
      const PRINT_DELAY_DURATION = 200;
      printTimeout.current = setTimeout(
        () => window.print(),
        PRINT_DELAY_DURATION
      );
      return () => {
        if (printTimeout.current) clearTimeout(printTimeout.current);
      };
    }
  }, [orders]);

  // Chunk orders into pages
  const pages = useMemo(() => {
    const result: Order[][] = [];
    for (let i = 0; i < orders.length; i += perPage) {
      result.push(orders.slice(i, i + perPage));
    }
    return result;
  }, [orders, perPage]);

  return (
    <ThemeProvider theme={printTheme}>
      <Container className="print-container">
        {pages.map((pageOrders, pageIndex) => (
          <InvoicePage perPage={perPage} key={pageIndex} className="print-page">
            {pageOrders.map((order) => (
              <InvoiceItem key={order.id} className="invoice-item">
                <Header>
                  <Stack direction="column" alignItems="center">
                    <Barcode value={order.billOfLading} />
                    <div className="print-timestamp">
                      طُبع بتاريخ: {new Date().toLocaleString("ar-EG")}
                    </div>
                  </Stack>

                  <TitleGroup>
                    <Box
                      component="img"
                      src="/wesal-logo.png"
                      alt="H&A Logistics"
                      sx={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        width: "140px",
                        height: "auto",
                      }}
                    />
                    <div>{order.senderName}</div>
                    <div>
                      {order.receiverGovernorate} - {order.receiverCity}
                    </div>
                  </TitleGroup>

                  <div
                    style={{ display: "flex", gap: "16px", alignItems: "center" }}
                  >
                    <StyledSquare>
                      <div className="value">{order.shippingCost}</div>
                    </StyledSquare>

                    <StyledSquare>
                      <div className="value">{order.serviceType}</div>
                    </StyledSquare>
                  </div>

                  <OrderQrCode order={order} />
                </Header>

                <BodyTable>
                  <tbody>
                    <tr>
                      <th>المرسل إليه</th>
                      <td>{order.receiverName}</td>
                      <th>الهاتف</th>
                      <td>{order.phoneNumber1}</td>
                    </tr>
                    <tr>
                      <th>العدد</th>
                      <td>{order.quantity}</td>
                      <th>رقم الطلب</th>
                      <td>{order.orderSerialNumber}</td>
                    </tr>
                    <tr>
                      <th colSpan={4} style={{ textAlign: "right" }}>
                        العنوان: {order.receiverAddress || "-"}
                      </th>
                    </tr>
                    <tr>
                      <th colSpan={4} style={{ textAlign: "right" }}>
                        الملاحظات: {order.description || "-"}
                      </th>
                    </tr>
                  </tbody>
                </BodyTable>
              </InvoiceItem>
            ))}
          </InvoicePage>
        ))}
      </Container>
    </ThemeProvider>
  );
}
