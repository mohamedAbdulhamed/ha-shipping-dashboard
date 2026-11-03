import { expect, Page, Route, test } from "@playwright/test";

type UserRole = "Admin" | "Sender";

type MockApiState = {
  role: UserRole;
  refreshCount: number;
  expiredPath: string | null;
  expiredPathCount: number;
  failRefresh: boolean;
  deniedPaths: Set<string>;
  failCollection: boolean;
  failProfitReport: boolean;
  profitReportRequests: string[];
  createOrderRequests: Record<string, unknown>[];
  collectionRequests: Record<string, unknown>[];
  updateOrderRequests: Record<string, unknown>[];
  orderRows: Record<string, unknown>[];
};

const senderUser = {
  fullName: "اختبار الشحن",
  phoneNumber: "01012345678",
  governorate: "أسوان",
  city: "ادفو",
  address: "عنوان الاختبار",
  role: "Sender",
};

const success = (result: unknown) => ({
  Success: true,
  StatusCode: 200,
  ErrorMessage: null,
  Result: result,
});

async function fulfill(route: Route, result: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(
      status >= 400
        ? { Success: false, StatusCode: status, ErrorMessage: "Test API error" }
        : success(result)
    ),
  });
}

async function installApiMocks(page: Page): Promise<MockApiState> {
  const state: MockApiState = {
    role: "Admin",
    refreshCount: 0,
    expiredPath: null,
    expiredPathCount: 0,
    failRefresh: false,
    deniedPaths: new Set(),
    failCollection: false,
    failProfitReport: false,
    profitReportRequests: [],
    createOrderRequests: [],
    collectionRequests: [],
    updateOrderRequests: [],
    orderRows: [],
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.toLowerCase();
    const method = request.method();

    if (path === "/api/account/login") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          success({ token: "test-access-token", user: { ...senderUser, role: state.role } })
        ),
      });
      return;
    }

    if (path === "/api/account/refresh-token") {
      state.refreshCount += 1;
      if (state.failRefresh) {
        await fulfill(route, null, 401);
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          success({ token: "refreshed-access-token", user: { ...senderUser, role: state.role } })
        ),
      });
      return;
    }

    if (state.deniedPaths.has(path)) {
      await fulfill(route, null, 403);
      return;
    }

    if (state.expiredPath === path && state.expiredPathCount === 0) {
      state.expiredPathCount += 1;
      await fulfill(route, null, 401);
      return;
    }

    if (path === "/api/account/total-count") {
      await fulfill(route, 9);
      return;
    }
    if (path === "/api/account/active-count") {
      await fulfill(route, 7);
      return;
    }
    if (path.includes("/total-") || path.endsWith("/branchs/total-count")) {
      await fulfill(route, 2);
      return;
    }

    if (path === "/api/branchs/getall") {
      await fulfill(route, [{ id: 1, name: "فرع الاختبار", isActive: true }]);
      return;
    }
    if (path === "/api/orders/getservicetypes") {
      await fulfill(route, [{ id: 1, name: "توصيل" }]);
      return;
    }
    if (path === "/api/orders/getbyid/501") {
      await fulfill(route, {
        id: 501,
        senderName: "راسل الاختبار",
        senderGovernorate: "أسوان",
        senderCity: "ادفو",
        senderAddress: "عنوان الراسل",
        receiverName: "مستلم قديم",
        phoneNumber1: "01012345678",
        phoneNumber2: "",
        receiverGovernorate: "أسوان",
        receiverCity: "ادفو",
        receiverAddress: "عنوان المستلم",
        description: "",
        shippingCost: 15,
        codAmount: 100,
        quantity: 1,
        serviceType: 1,
      });
      return;
    }
    if (path === "/api/account/getcustomernames") {
      await fulfill(route, [{ id: "customer-1", name: "راسل الاختبار", phoneNumber: "01012345678" }]);
      return;
    }
    if (path === "/api/account/getbyid/customer-1") {
      await fulfill(route, {
        id: "customer-1",
        fullName: "راسل الاختبار",
        phoneNumber: "01012345678",
        governorate: "أسوان",
        city: "ادفو",
        address: "عنوان الراسل",
      });
      return;
    }
    if (path === "/api/orders/getfinancialstatus") {
      await fulfill(route, [
        { id: 1, name: "قابل للتقفيل" },
        { id: 2, name: "تم التقفيل" },
      ]);
      return;
    }
    if (path === "/api/orderstatushistories/getshipmentstatus") {
      await fulfill(route, []);
      return;
    }
    if (path === "/api/orders/getall") {
      await fulfill(route, {
        data: state.orderRows,
        totalCount: state.orderRows.length,
        totalPageCount: 1,
      });
      return;
    }
    if (path === "/api/report/profitreport") {
      state.profitReportRequests.push(url.search);
      if (state.failProfitReport) {
        await fulfill(route, null, 500);
        return;
      }
      await fulfill(route, { data: [], totalCount: 0, totalPageCount: 1, netProfit: 0 });
      return;
    }
    if (path === "/api/report/userordersreport") {
      await fulfill(route, { data: [], totalCount: 0, totalPageCount: 1, netAmount: 0, totalCODAmount: 0, totalShippingCost: 0 });
      return;
    }

    if (path === "/api/orders/add" && method === "POST") {
      state.createOrderRequests.push(request.postDataJSON() as Record<string, unknown>);
      await fulfill(route, "created");
      return;
    }
    if (path === "/api/orders/update/501" && method === "PUT") {
      state.updateOrderRequests.push(request.postDataJSON() as Record<string, unknown>);
      await fulfill(route, null);
      return;
    }
    if (path === "/api/orders/ordersfinancialclose" && method === "PUT") {
      state.collectionRequests.push(request.postDataJSON() as Record<string, unknown>);
      await fulfill(route, null, state.failCollection ? 500 : 200);
      return;
    }

    await fulfill(route, []);
  });

  return state;
}

async function login(page: Page, role: UserRole = "Admin") {
  const mockState = await installApiMocks(page);
  mockState.role = role;
  await page.goto("/login");
  await page.getByLabel("رقم الهاتف").fill("01012345678");
  await page.getByRole("textbox", { name: "كلمة المرور" }).fill("test-password");
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
  return mockState;
}

test("direct login links load and survive refresh without loading spreadsheet code", async ({ page }) => {
  const excelRequests: string[] = [];
  page.on("request", (request) => {
    if (/exceljs/i.test(request.url())) excelRequests.push(request.url());
  });

  await page.goto("/login");
  await expect(page.getByText("تسجيل الدخول")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("رقم الهاتف")).toBeVisible();
  expect(excelRequests).toEqual([]);
});

test("sender accounts cannot open the administrator dashboard", async ({ page }) => {
  await login(page, "Sender");
  await page.evaluate(() => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page).toHaveURL(/\/unauthorized$/);
});

test("an expired access token refreshes once and retries the request", async ({ page }) => {
  const state = await login(page);
  state.expiredPath = "/api/account/total-count";
  await page.evaluate(() => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await expect(page.getByRole("heading", { name: "إجمالي المستخدمين" })).toBeVisible();
  expect(state.refreshCount).toBe(1);
  expect(state.expiredPathCount).toBe(1);
});

test("a permission response does not start a token refresh", async ({ page }) => {
  const state = await login(page);
  state.deniedPaths.add("/api/account/total-count");
  await page.evaluate(() => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await expect(page.getByRole("heading", { name: "إجمالي المستخدمين" })).toBeVisible();
  expect(state.refreshCount).toBe(0);
});

test("a rejected refresh clears the session and returns to login", async ({ page }) => {
  const state = await login(page);
  state.failRefresh = true;
  state.expiredPath = "/api/account/total-count";
  await page.evaluate(() => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await expect(page).toHaveURL(/\/login$/);
  expect(state.refreshCount).toBe(1);
});

test("order creation rejects an invalid phone number and never sends the order", async ({ page }) => {
  const state = await login(page);
  await page.evaluate(() => {
    window.history.pushState({}, "", "/orders/new");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByText("تفاصيل المستلم")).toBeVisible();
  await page.getByRole("textbox", { name: "رقم الهاتف", exact: true }).fill("not-a-phone");
  await page.getByRole("button", { name: "اضافة" }).click();

  await expect(page.getByText("رقم الهاتف غير صالح")).toBeVisible();
  expect(state.createOrderRequests).toHaveLength(0);
});

test("editing an order submits the updated form values", async ({ page }) => {
  const state = await login(page);
  await page.evaluate(() => {
    window.history.pushState({}, "", "/orders/501/edit");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await page.getByRole("textbox", { name: "اسم المستلم" }).fill("مستلم جديد");
  await page.getByRole("textbox", { name: "عنوان المستلم" }).fill("عنوان معدل");
  await page.getByRole("combobox", { name: "حاله الشحنة" }).click();
  await page.getByRole("option", { name: "توصيل" }).click();
  await page.getByRole("button", { name: "تعديل" }).click();

  await expect.poll(() => state.updateOrderRequests.length).toBe(1);
  expect(state.updateOrderRequests[0].receiverName).toBe("مستلم جديد");
  await expect(page).toHaveURL(/\/orders$/);
});

test("finance totals match collectable rows and submit only collectable IDs", async ({ page }) => {
  const state = await login(page);
  state.orderRows = [
    {
      id: 101,
      billOfLading: "BOL-101",
      financialStatus: "قابل للتقفيل",
      codAmount: 100,
      shippingCost: 15,
      netAmount: 85,
      quantity: 1,
      senderName: "راسل",
      receiverName: "مستلم",
      serviceType: "توصيل",
    },
    {
      id: 102,
      billOfLading: "BOL-102",
      financialStatus: "لم يتم التقفيل",
      codAmount: 200,
      shippingCost: 20,
      netAmount: 180,
      quantity: 1,
      senderName: "راسل",
      receiverName: "مستلم آخر",
      serviceType: "توصيل",
    },
  ];

  await page.evaluate(() => {
    window.history.pushState({}, "", "/finance");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByText("BOL-101")).toBeVisible();
  await page.locator(".MuiDataGrid-row").filter({ hasText: "BOL-101" }).getByRole("checkbox").check();
  await page.locator(".MuiDataGrid-row").filter({ hasText: "BOL-102" }).getByRole("checkbox").check();

  const expectedNet = new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(85);
  await expect(page.getByText(expectedNet, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /تحصيل/ }).evaluate((button: HTMLButtonElement) => button.click());
  await expect.poll(() => state.collectionRequests.length).toBe(1);
  expect(state.collectionRequests[0].orderIds).toEqual([101]);
});

test("barcode input filters orders by every scanned code", async ({ page }) => {
  const state = await login(page);
  state.orderRows = [];
  await page.evaluate(() => {
    window.history.pushState({}, "", "/orders/barcode");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await page.getByPlaceholder("امسح أو ألصق أكواد بوليصات الشحن هنا، كود في كل سطر")
    .fill("BOL-1\nBOL-2");
  await page.getByRole("button", { name: /ابدأ التحليل/ }).click();
  await expect(page).toHaveURL(/\/orders\?.*billOfLading=BOL-1.*billOfLading=BOL-2/);
});

test("profit report applies sender filters to the API request", async ({ page }) => {
  const state = await login(page);
  await page.evaluate(() => {
    window.history.pushState({}, "", "/reports/profit");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  await page.getByRole("combobox", { name: "اسم الراسل" }).fill("راسل الاختبار");
  await page.getByRole("option", { name: /راسل الاختبار/ }).click();
  await page.getByRole("button", { name: "بحث" }).click();

  await expect.poll(() => state.profitReportRequests.some((query) => query.includes("senderId=customer-1"))).toBe(true);
});

test("profit report API failures show a retry action and recover", async ({ page }) => {
  const state = await login(page);
  state.failProfitReport = true;
  await page.evaluate(() => {
    window.history.pushState({}, "", "/reports/profit");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("تعذر تحميل البيانات");
  state.failProfitReport = false;
  await alert.getByRole("button", { name: "إعادة المحاولة" }).click();
  await expect.poll(() => state.profitReportRequests.length).toBeGreaterThan(1);
  await expect(alert).toHaveCount(0);
});

test("the production bundle contains no deferred J&T client integration markers", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const assetNames = await readdir("dist/assets");
  const jsNames = assetNames.filter((name) => name.endsWith(".js"));
  const jsText = await Promise.all(
    jsNames.map((name) => readFile(`dist/assets/${name}`, "utf8"))
  );
  const bundleText = jsText.join("\n");

  expect(bundleText).not.toContain("VITE_JT_PRIVATE_KEY");
  expect(bundleText).not.toContain("curlCommand");
  expect(bundleText).not.toContain("createOrderTime");
});
