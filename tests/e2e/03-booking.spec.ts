import { expect, test } from "@playwright/test";

const CODE = /^SV-[A-Z2-9]{6}$/;

test("a guest can book a tour and gets an order code", async ({ page }) => {
  await page.goto("/en/tours/ta-xua-cloud-sea-milky-way");
  await page.locator('fieldset button[aria-pressed="false"]').nth(5).click();
  await page.getByPlaceholder("Full name").fill("Guest Tester");
  await page.getByPlaceholder("Email").fill("guest@saoviet.test");
  await page.getByPlaceholder("Phone").fill("+84 912 345 678");
  await page.getByRole("button", { name: "Send booking request" }).click();
  await expect(page.getByText(CODE)).toBeVisible();
});

test("without a date the booking is not sent and typed input is kept", async ({ page }) => {
  await page.goto("/en/tours/ta-xua-cloud-sea-milky-way");
  await page.getByPlaceholder("Full name").fill("Keep Me");
  await page.getByPlaceholder("Email").fill("keep@saoviet.test");
  await page.getByPlaceholder("Phone").fill("0912345678");
  await page.getByRole("button", { name: "Send booking request" }).click();
  await expect(page.getByPlaceholder("Full name")).toHaveValue("Keep Me");
  await expect(page.getByText(CODE)).toHaveCount(0);
});
