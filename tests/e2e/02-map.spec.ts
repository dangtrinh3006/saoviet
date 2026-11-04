import { expect, test } from "@playwright/test";

test.describe("Dark-sky map", () => {
  test("deep link opens a location panel with sky data", async ({ page }) => {
    await page.goto("/en/map?l=ta-xua");
    const panel = page.locator("aside");
    await expect(panel.getByRole("heading", { name: "Tà Xùa" })).toBeVisible();
    await expect(panel).toContainText("21.72");
    await expect(page.locator("canvas.maplibregl-canvas")).toBeVisible();
  });

  test("picking from the list selects that site", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "list is collapsed behind the search on mobile");
    await page.goto("/en/map");
    await page.getByRole("button", { name: /Côn Đảo/ }).first().click();
    await expect(page.locator("aside").getByRole("heading", { name: /Côn Đảo/ })).toBeVisible();
  });

  test("360° panorama opens and closes with Escape", async ({ page }) => {
    await page.goto("/en/map?l=ta-xua");
    await page.getByRole("button", { name: "View panorama" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("canvas")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("sky API returns conditions for every site", async ({ request }) => {
    const res = await request.get("/api/sky");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Object.keys(body.data).length).toBeGreaterThanOrEqual(20);
  });
});
