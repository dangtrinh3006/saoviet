import { type Browser, expect, test } from "@playwright/test";
import postgres from "postgres";
import { expectNoHorizontalScroll, promoteToAdmin, signUp, uid } from "./helpers";

const CODE = /SV-[A-Z2-9]{6}/;

const db = () => postgres(process.env.DATABASE_URL!, { max: 1 });

async function adminPage(browser: Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const a = await signUp(page, `Ops ${uid()}`);
  await promoteToAdmin(a.email);
  return { ctx, page };
}

test("dashboard shows KPIs and the admin navigation", async ({ browser }) => {
  const { ctx, page } = await adminPage(browser);
  await page.goto("/en/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Operations" })).toBeVisible();
  const kpis = page.getByTestId("kpis");
  await expect(kpis.getByText("Revenue (excl. cancelled)")).toBeVisible();
  await expect(kpis.getByText("Open change requests")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Orders by status" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Departures in the next 14 days" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Latest outgoing mail" })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  for (const name of ["Overview", "Tours", "Services", "Orders", "Change queue", "Users", "Outbox", "Moderation"]) {
    await expect(nav.getByRole("link", { name })).toBeVisible();
  }
  // Old deep link to the orders tab lands on the new route.
  await page.goto("/en/admin?tab=orders");
  await expect(page).toHaveURL(/\/en\/admin\/orders$/);
  await ctx.close();
});

test("service create → public → edit → unpublish → hidden", async ({ browser, page }) => {
  const { ctx, page: admin } = await adminPage(browser);
  const slug = `e2e-svc-${uid()}`;
  const title = `Comet Watch ${uid()}`;
  try {
    await admin.goto("/en/admin/services/new");
    await admin.getByLabel("Slug").fill(slug);
    await admin.getByLabel("From (VND)").fill("480000");
    await admin.getByRole("combobox", { name: "Icon" }).selectOption("tent");
    await expect(admin.getByRole("img", { name: "Icon preview: Tent" })).toBeVisible();
    await admin.getByLabel("Title (Vietnamese)").fill(`Ngắm sao chổi ${uid()}`);
    await admin.getByLabel("Title (English)").fill(title);
    await admin.getByLabel("Description (Vietnamese)").fill("Một đêm ngắm sao chổi cùng hướng dẫn viên.");
    await admin.getByLabel("Description (English)").fill("A night watching a comet with a guide.");
    await admin.getByLabel("Status").selectOption("published");
    await admin.getByRole("button", { name: "Save" }).click();
    await expect(admin).toHaveURL(/\/en\/admin\/services$/);
    await expect(admin.locator(`li[data-slug="${slug}"]`)).toContainText(title);

    await page.goto("/en/services");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    const edited = `${title} Deluxe`;
    await admin.getByRole("link", { name: `Edit ${title}` }).click();
    await expect(admin.getByLabel("Slug")).toBeDisabled();
    await admin.getByLabel("Title (English)").fill(edited);
    await admin.getByRole("button", { name: "Save" }).click();
    await expect(admin).toHaveURL(/\/en\/admin\/services$/);
    await page.reload();
    await expect(page.getByRole("heading", { name: edited })).toBeVisible();

    await admin.getByRole("link", { name: `Edit ${edited}` }).click();
    await admin.getByLabel("Status").selectOption("draft");
    await admin.getByRole("button", { name: "Save" }).click();
    await expect(admin.locator(`li[data-slug="${slug}"]`)).toContainText("Draft");
    await page.reload();
    await expect(page.getByRole("heading", { name: edited })).toHaveCount(0);
  } finally {
    const sql = db();
    await sql`delete from service where slug = ${slug}`;
    await sql.end();
    await ctx.close();
  }
});

test("guest booking appears in order search, edit recomputes total, status confirmed", async ({ browser, page }) => {
  await page.goto("/en/tours/ta-xua-cloud-sea-milky-way");
  await page.locator('fieldset button[aria-pressed="false"]').nth(5).click();
  await page.getByPlaceholder("Full name").fill("Ops Guest");
  await page.getByPlaceholder("Email").fill(`ops-${uid()}@saoviet.test`);
  await page.getByPlaceholder("Phone").fill("+84 912 345 678");
  await page.getByRole("button", { name: "Send booking request" }).click();
  const code = ((await page.getByText(CODE).first().textContent()) ?? "").match(CODE)?.[0] ?? "";
  expect(code).toMatch(CODE);

  const { ctx, page: admin } = await adminPage(browser);
  const sql = db();
  try {
    await admin.goto("/en/admin/orders");
    await admin.getByRole("searchbox").fill(code);
    await admin.getByRole("button", { name: "Apply" }).click();
    await expect(admin).toHaveURL(new RegExp(`q=${code}`));
    await expect(admin.getByTestId("order-count")).toHaveText("1 order");
    const row = admin.locator(`li[data-code="${code}"]`);
    await expect(row).toContainText("Ops Guest");

    await row.getByRole("link", { name: code }).click();
    await expect(admin.getByRole("heading", { level: 1 })).toContainText(code);
    const [before] = await sql`select guests, unit_price_vnd from "order" where code = ${code}`;
    const guests = Number(before.guests) + 1;
    const expected = new Intl.NumberFormat("en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(before.unit_price_vnd) * guests);

    await admin.getByLabel("Guests").fill(String(guests));
    await expect(admin.getByTestId("order-total")).toHaveText(expected);
    await admin.getByLabel("Activity note").fill("Customer called to add a guest");
    await admin.getByRole("button", { name: "Save" }).click();
    await expect(admin.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    await expect(admin.getByLabel("Note and activity log")).toHaveValue(/Customer called to add a guest/);

    const [after] = await sql`select guests, total_vnd from "order" where code = ${code}`;
    expect(Number(after.guests)).toBe(guests);
    expect(Number(after.total_vnd)).toBe(Number(before.unit_price_vnd) * guests);

    await admin.getByLabel("Status").selectOption("confirmed");
    await expect.poll(async () => (await sql`select status from "order" where code = ${code}`)[0].status).toBe("confirmed");
    await admin.reload();
    await expect(admin.getByLabel("Status")).toHaveValue("confirmed");
    await expect(admin.getByTestId("order-total")).toHaveText(expected);
  } finally {
    await sql`delete from "order" where code = ${code}`;
    await sql.end();
    await ctx.close();
  }
});

test("change request from the DB is shown with its payload and marked done", async ({ browser }) => {
  const sql = db();
  const id = `e2e-cr-${uid()}`;
  const title = `New dark-sky site ${uid()}`;
  await sql`insert into change_request (id, kind, title, details, payload) values (${id}, 'location', ${title}, 'Add coordinates and SQM for a new site.', ${sql.json({ lat: 22.25, lng: 104.1, sqm: 21.4 })})`;
  const { ctx, page: admin } = await adminPage(browser);
  try {
    await admin.goto("/en/admin/queue");
    await expect(admin.getByText("need a developer to ship in code")).toBeVisible();
    await expect(admin.getByTestId("queue-badge")).toBeVisible();
    await admin.getByRole("link", { name: title }).click();
    await expect(admin.getByRole("heading", { level: 1, name: title })).toBeVisible();
    await expect(admin.getByTestId("cr-payload")).toContainText('"sqm": 21.4');
    await expect(admin.getByTestId("cr-status")).toHaveText("Open");

    await admin.getByRole("button", { name: "Reject" }).click();
    await expect(admin.getByText("Add a resolution note before rejecting.")).toBeVisible();

    await admin.getByLabel("Resolution note").fill("Shipped in content/locations.ts");
    await admin.getByRole("button", { name: "Mark done" }).click();
    await expect(admin.getByTestId("cr-status")).toHaveText("Done");
    const [row] = await sql`select status, resolution_note, resolved_at from change_request where id = ${id}`;
    expect(row.status).toBe("done");
    expect(row.resolution_note).toBe("Shipped in content/locations.ts");
    expect(row.resolved_at).not.toBeNull();
  } finally {
    await sql`delete from change_request where id = ${id}`;
    await sql.end();
    await ctx.close();
  }
});

test("admin pages fit a phone screen without sideways scroll", async ({ browser }) => {
  const { ctx, page } = await adminPage(browser);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/en/admin", "/en/admin/services", "/en/admin/services/new", "/en/admin/orders", "/en/admin/queue", "/en/admin?tab=outbox"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
  await ctx.close();
});
