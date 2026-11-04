import { expect, test } from "@playwright/test";
import { promoteToAdmin, signUp, uid } from "./helpers";

test("admin can hide a review and update an order status", async ({ page, browser }) => {
  await signUp(page);
  const review = `Moderate me ${uid()}`;
  await page.goto("/en/tours/con-dao-island-night-sky");
  const box = page.getByRole("textbox", { name: "Write a review" });
  await box.fill(review);
  await page.getByRole("button", { name: "Save" }).click();
  // Saved = cleared input + the text rendered as a review (not just sitting in the box).
  await expect(box).toHaveValue("");
  await expect(page.locator("p", { hasText: review })).toBeVisible();

  // A separate admin session moderates it.
  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  const a = await signUp(admin, `Admin ${uid()}`);
  await promoteToAdmin(a.email);
  await admin.goto("/en/admin");
  await expect(admin.getByRole("heading", { level: 1 })).toBeVisible();
  const status = admin.getByLabel("Status").first();
  await status.selectOption("confirmed");
  await expect(status).toHaveValue("confirmed");

  await admin.getByRole("link", { name: "Moderation" }).click();
  await expect(admin).toHaveURL(/tab=moderation/);
  const row = admin.locator("li, tr, article, div").filter({ hasText: review }).filter({ has: admin.getByRole("button", { name: "Hide" }) }).last();
  await row.getByRole("button", { name: "Hide" }).click();
  await expect(row.getByRole("button", { name: "Show" })).toBeVisible();

  await page.reload();
  await expect(page.getByText(review)).toHaveCount(0);
  await ctx.close();
});

test("non-admins get a 404 on /admin", async ({ page }) => {
  await signUp(page);
  const res = await page.goto("/en/admin");
  expect(res?.status()).toBe(404);
});
