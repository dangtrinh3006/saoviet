import { expect, test } from "@playwright/test";
import { signUp, uid } from "./helpers";

test("member journey: sign up → review → comment → forum thread → my orders", async ({ page }) => {
  await signUp(page);

  await page.goto("/en/tours/moc-chau-family-stargazing");
  const review = `Clear skies and a patient guide ${uid()}`;
  const box = page.getByRole("textbox", { name: "Write a review" });
  await box.fill(review);
  await page.getByRole("button", { name: "Save" }).click();
  // Saved = cleared input + the text rendered as a review (not just sitting in the box).
  await expect(box).toHaveValue("");
  await expect(page.locator("p", { hasText: review })).toBeVisible();

  await page.goto("/en/blog/bortle-scale-explained");
  const comment = `Great explainer ${uid()}`;
  await page.getByPlaceholder("Share an experience or a question…").fill(comment);
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.getByText(comment)).toBeVisible();

  await page.goto("/en/forum/new");
  const title = `Best lens for Milky Way ${uid()}`;
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Message").fill("Looking for a fast wide lens under 10 million VND.");
  await page.getByRole("button", { name: "Post" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.goto("/en/tours/moc-chau-family-stargazing");
  await page.locator('fieldset button[aria-pressed="false"]').nth(3).click();
  await page.getByPlaceholder("Phone").fill("0912345678");
  await page.getByRole("button", { name: "Send booking request" }).click();
  const code = page.getByText(/^SV-[A-Z2-9]{6}$/);
  await expect(code).toBeVisible();
  const value = (await code.textContent())!;

  await page.goto("/en/account");
  await expect(page.getByText(value)).toBeVisible();
});

test("logged-out visitors are asked to sign in", async ({ page }) => {
  await page.goto("/en/blog/bortle-scale-explained");
  await expect(page.getByText("Sign in to join the conversation.")).toBeVisible();
  await page.goto("/en/account");
  await expect(page).toHaveURL(/sign-in/);
});
