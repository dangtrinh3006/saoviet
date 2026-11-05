import { expect, test } from "@playwright/test";

const TOUR = "/en/tours/ta-xua-cloud-sea-milky-way";

test("desktop renders the 3D itinerary with step 1 active", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "desktop only");
  await page.goto(TOUR);
  const itinerary = page.getByTestId("itinerary");
  await itinerary.scrollIntoViewIfNeeded();
  await expect(itinerary).toHaveAttribute("data-mode", "3d");
  await expect(itinerary.locator("canvas")).toBeVisible();
  const steps = itinerary.locator("ol > li");
  await expect(steps.first()).toHaveAttribute("aria-current", "step");
  await expect(itinerary.locator('li[aria-current="step"]')).toHaveCount(1);
});

test("mobile shows the list fallback without WebGL", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "mobile only");
  await page.goto(TOUR);
  const itinerary = page.getByTestId("itinerary");
  await itinerary.scrollIntoViewIfNeeded();
  await expect(itinerary).toHaveAttribute("data-mode", "list");
  await expect(itinerary.locator("ol > li").first()).toBeVisible();
  await expect(itinerary.locator("canvas")).toHaveCount(0);
});
