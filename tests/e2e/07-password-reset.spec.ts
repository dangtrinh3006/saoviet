import { type Page, expect, test } from "@playwright/test";
import postgres from "postgres";
import { promoteToAdmin, signUp, uid } from "./helpers";

/** Reads the newest reset link sent to `email` from mail_outbox (works without a real mail provider). */
async function latestResetLink(email: string) {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    const rows = await sql<{ text: string }[]>`
      select text from mail_outbox where "to" = ${email} and kind = 'reset-password'
      order by created_at desc limit 1`;
    const match = rows[0]?.text.match(/https?:\/\/\S+\/reset-password\/\S+/);
    return match?.[0] ?? null;
  } finally {
    await sql.end();
  }
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/en/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("user resets a forgotten password through the emailed link", async ({ page }) => {
  const user = await signUp(page);
  // Dropping the cookies is a sign-out from this browser's point of view.
  await page.context().clearCookies();

  await page.goto("/en/sign-in");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/en\/forgot-password/);
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If this email has a Sao Việt account")).toBeVisible();

  let link: string | null = null;
  await expect.poll(async () => (link = await latestResetLink(user.email))).not.toBeNull();
  // Follow the link on the test's base URL, whatever host BETTER_AUTH_URL put in the mail.
  const url = new URL(link!);
  await page.goto(url.pathname + url.search);
  await expect(page).toHaveURL(/\/en\/reset-password\?token=/);

  const newPassword = `new-${uid()}-${uid()}`;
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("Password changed")).toBeVisible();

  await signIn(page, user.email, user.password);
  await expect(page.locator("form [role=alert]")).toBeVisible();

  await signIn(page, user.email, newPassword);
  await expect(page).toHaveURL(/\/en\/account/);
});

test("an invalid reset link offers to request a new one", async ({ page }) => {
  await page.goto("/en/reset-password?error=INVALID_TOKEN");
  await expect(page.getByText("invalid or has expired")).toBeVisible();
  await expect(page.getByRole("link", { name: "Request a new link" })).toBeVisible();
});

test("admin sets a temporary password and the user signs in with it", async ({ page, browser }) => {
  const user = await signUp(page);
  await page.context().clearCookies();

  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  const a = await signUp(admin, `Admin ${uid()}`);
  await promoteToAdmin(a.email);
  await admin.goto("/en/admin?tab=users");
  const row = admin.locator("li").filter({ hasText: user.email });
  await row.getByRole("button", { name: "Set temporary password" }).click();
  await row.getByRole("button", { name: "Confirm" }).click();
  const shown = row.getByTestId("temp-password");
  await expect(shown).toBeVisible();
  const temp = (await shown.textContent())?.trim() ?? "";
  expect(temp.length).toBeGreaterThanOrEqual(12);
  await ctx.close();

  await signIn(page, user.email, temp);
  await expect(page).toHaveURL(/\/en\/account/);
});
