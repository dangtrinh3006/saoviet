import { expect, test } from "@playwright/test";

test.describe("Home, language and theme", () => {
  test("renders the hero in both languages", async ({ page }) => {
    await page.goto("/vi");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("bầu trời còn tối");
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("skies that are still dark");
  });

  test("root redirects to the default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/vi$/);
  });

  test("switching language keeps the current page", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "switch lives in the mobile menu; covered in responsive spec");
    await page.goto("/vi/tours");
    await page.getByRole("radio", { name: "en" }).first().click();
    await expect(page).toHaveURL(/\/en\/tours$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("theme switch sets data-theme and survives reload", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "switch lives in the mobile menu");
    await page.goto("/en");
    await page.getByRole("radio", { name: "Light" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.getByRole("radio", { name: "Red light" }).first().click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "red");
  });

  test("tonight ranking shows live scores", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator('a[href*="/map?l="]').first();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toContainText("/100");
  });
});
