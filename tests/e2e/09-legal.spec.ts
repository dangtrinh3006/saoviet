import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "privacy", vi: "Chính sách bảo vệ dữ liệu cá nhân", en: "Privacy Policy" },
  { path: "terms", vi: "Điều khoản đặt tour & hoàn huỷ", en: "Booking & Cancellation Terms" },
  { path: "contact", vi: "Liên hệ", en: "Contact" },
] as const;

test.describe("Legal and contact pages", () => {
  for (const p of PAGES) {
    for (const locale of ["vi", "en"] as const) {
      test(`${p.path} renders in ${locale}`, async ({ page }) => {
        await page.goto(`/${locale}/${p.path}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(p[locale]);
      });
    }
  }

  test("terms state the non-profit nature up front", async ({ page }) => {
    await page.goto("/en/terms");
    await expect(page.locator("main").getByText("Sao Việt is a non-profit community project")).toBeVisible();
  });

  test("privacy links to the contact page with the data topic preselected", async ({ page }) => {
    await page.goto("/en/privacy");
    await page.getByRole("link", { name: "via our Contact page" }).first().click();
    await expect(page).toHaveURL(/\/en\/contact\?topic=privacy$/);
    await expect(page.getByLabel("Topic")).toHaveValue("privacy");
  });

  test("contact form shows validation errors, keeps input, then succeeds", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByLabel("Full name").fill("Star Gazer");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Message").fill("Too short");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Please choose a topic.")).toBeVisible();
    await expect(page.getByText("Your message needs at least 10 characters.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Star Gazer");

    await page.getByLabel("Email").fill("gazer@saoviet.test");
    await page.getByLabel("Topic").selectOption("tour");
    await page.getByLabel("Message").fill("Which month is best for the Milky Way at Ta Xua?");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByRole("heading", { name: "Message received" })).toBeVisible();
  });

  test("FAQ answers expand on click", async ({ page }) => {
    await page.goto("/vi/contact");
    const first = page.locator("details").filter({ hasText: "Tôi chưa từng ngắm sao" });
    await first.locator("summary").click();
    await expect(first.getByText("Toàn bộ thiết bị quan sát")).toBeVisible();
  });
});
