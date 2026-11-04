import { type Page, expect } from "@playwright/test";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

export const uid = () => Math.random().toString(36).slice(2, 8);

/** Sign up a fresh throwaway account; the password is generated per run, never stored. */
export async function signUp(page: Page, name = `E2E ${uid()}`) {
  const email = `e2e-${uid()}@saoviet.test`;
  const password = `pw-${uid()}-${uid()}`;
  await page.goto("/en/sign-up");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/en\/account/);
  return { name, email, password };
}

export async function promoteToAdmin(email: string) {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await sql`update "user" set role = 'admin' where email = ${email}`;
  await sql.end();
}

/** Guards against horizontal scrolling, the most common mobile layout bug. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}
