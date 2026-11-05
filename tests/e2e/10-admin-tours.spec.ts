import { expect, type Page, test } from "@playwright/test";
import postgres from "postgres";
import { promoteToAdmin, signUp, uid } from "./helpers";

let createdSlug: string | null = null;

// Safety net: a failure mid-test must not leave a published test tour on the site.
test.afterEach(async () => {
  if (!createdSlug) return;
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await sql`delete from tour where slug = ${createdSlug}`;
  await sql.end();
  createdSlug = null;
});

async function signInAsAdmin(page: Page) {
  const a = await signUp(page, `Admin ${uid()}`);
  await promoteToAdmin(a.email);
  return a;
}

test("admin takes a tour from draft to published, edits the price, archives and deletes it", async ({ page }) => {
  test.setTimeout(120_000);
  await signInAsAdmin(page);
  const id = uid();
  const titleVi = `Đêm thử nghiệm ${id}`;
  const titleEn = `E2E night ${id}`;
  const slug = `dem-thu-nghiem-${id}`;
  createdSlug = slug;

  await page.goto("/en/admin/tours/new");
  await page.getByLabel("Title (VI)", { exact: true }).fill(titleVi);
  await page.getByLabel("Title (EN)", { exact: true }).fill(titleEn);
  // Slug is derived from the Vietnamese title, tone marks stripped.
  await expect(page.getByLabel("Slug (URL)")).toHaveValue(slug);
  await page.getByLabel("Tagline (VI)").fill("Một đêm kiểm thử dưới Ngân Hà");
  await page.getByLabel("Tagline (EN)").fill("A test night under the Milky Way");
  await page.getByLabel("Observing site").selectOption("ta-xua");
  await page.getByLabel("Price (VND / guest)").fill("3200000");

  await page.getByRole("button", { name: "Add highlight" }).click();
  await page.getByLabel("Highlight 1 (VI)").fill("Biển mây");
  await page.getByLabel("Highlight 1 (EN)").fill("Cloud sea");
  await page.getByRole("button", { name: "Add step" }).click();
  await page.getByRole("button", { name: "Add step" }).click();
  await page.getByLabel("Step 1 — title (VI)").fill("Ngày 1");
  await page.getByLabel("Step 1 — title (EN)").fill("Day 1");
  await page.getByLabel("Step 1 — body (VI)").fill("Lên đỉnh");
  await page.getByLabel("Step 1 — body (EN)").fill("Up to the ridge");
  await page.getByLabel("Step 2 — title (VI)").fill("Ngày 2");
  await page.getByLabel("Step 2 — title (EN)").fill("Day 2");
  await page.getByLabel("Step 2 — body (VI)").fill("Xuống núi");
  await page.getByLabel("Step 2 — body (EN)").fill("Back down");
  // Reorder: step 2 moves to the top.
  await page.getByRole("button", { name: "Move item 2 up" }).click();
  await expect(page.getByLabel("Step 1 — title (EN)")).toHaveValue("Day 2");

  // Client validation keeps typed input and points at the broken field.
  await page.getByLabel("Max guests").fill("");
  await page.getByRole("button", { name: "Create tour" }).click();
  await expect(page.getByText("Check the highlighted fields")).toBeVisible();
  await expect(page.getByLabel("Max guests")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Title (EN)", { exact: true })).toHaveValue(titleEn);
  await page.getByLabel("Max guests").fill("8");

  await page.getByRole("button", { name: "Create tour" }).click();
  await expect(page).toHaveURL(new RegExp(`/en/admin/tours/${slug}/edit\\?created=1`));
  await expect(page.getByText("Tour created")).toBeVisible();

  // Draft: hidden from the public list and the detail page.
  await page.goto("/en/tours");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(titleEn)).toHaveCount(0);
  expect((await page.request.get(`/en/tours/${slug}`)).status()).toBe(404);

  await page.goto(`/en/admin/tours?q=${id}`);
  const row = page.locator(`tr[data-tour="${slug}"]`);
  await expect(row.getByText("Draft", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Publish" }).click();
  await expect(row.getByText("Published", { exact: true })).toBeVisible();

  await page.goto("/en/tours");
  await expect(page.getByText(titleEn).first()).toBeVisible();
  await page.goto(`/en/tours/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titleEn);
  await expect(page.getByText(/3,200,000/).first()).toBeVisible();

  await page.goto(`/en/admin/tours/${slug}/edit`);
  await expect(page.getByLabel("Slug (URL)")).toHaveAttribute("readonly", "");
  await page.getByLabel("Price (VND / guest)").fill("3450000");
  await expect(page.getByText("Unsaved changes")).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await page.goto(`/en/tours/${slug}`);
  await expect(page.getByText(/3,450,000/).first()).toBeVisible();
  await expect(page.getByText(/3,200,000/)).toHaveCount(0);

  await page.goto(`/en/admin/tours?q=${id}`);
  await row.getByRole("button", { name: "Archive" }).click();
  await expect(row.getByText("Archived", { exact: true })).toBeVisible();
  await page.goto("/en/tours");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(titleEn)).toHaveCount(0);
  await page.goto(`/en/admin/tours?status=published&q=${id}`);
  await expect(page.getByText("No tours match these filters.")).toBeVisible();

  // No bookings reference it, so a hard delete is allowed; this also cleans up the run.
  await page.goto(`/en/admin/tours?q=${id}`);
  await row.getByRole("button", { name: "Delete", exact: true }).click();
  await row.getByRole("button", { name: "Delete permanently" }).click();
  await expect(row).toHaveCount(0);
});

test("admin files a new-location request for the developers", async ({ page }) => {
  const admin = await signInAsAdmin(page);
  const title = `E2E site ${uid()}`;
  await page.goto("/en/admin/tours/new");
  await page.getByRole("button", { name: "Suggest a new location / 3D scene / 360° photo" }).click();
  const panel = page.getByRole("region", { name: "Request for the developers" });

  await panel.getByRole("button", { name: "Send request" }).click();
  await expect(panel.getByText("Required").first()).toBeVisible();

  await panel.getByLabel("Title").fill(title);
  await panel.getByLabel("Site name (VI)").fill("Núi Bà Đen");
  await panel.getByLabel("Site name (EN)").fill("Ba Den Mountain");
  await panel.getByLabel("Latitude").fill("11.38");
  await panel.getByLabel("Longitude").fill("106.17");
  await panel.getByLabel("Longitude").press("Enter"); // must not submit the tour form
  await expect(page).toHaveURL(/\/en\/admin\/tours\/new$/);
  await panel.getByRole("button", { name: "Send request" }).click();
  await expect(panel.getByText(/Hàng chờ duyệt/)).toBeVisible();

  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const rows = await sql`
      select cr.kind, cr.status, cr.payload, u.email from change_request cr
      join "user" u on u.id = cr.created_by where cr.title = ${title}`;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "location", status: "open", email: admin.email });
    expect(rows[0].payload).toMatchObject({ location: { nameEn: "Ba Den Mountain", lat: 11.38, lng: 106.17 } });
  } finally {
    await sql`delete from change_request where title = ${title}`;
    await sql.end();
  }
});

test("non-admins get a 404 on the tour admin", async ({ page }) => {
  await signUp(page);
  expect((await page.goto("/en/admin/tours"))?.status()).toBe(404);
  expect((await page.goto("/en/admin/tours/new"))?.status()).toBe(404);
});
