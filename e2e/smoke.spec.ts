import { test, expect } from "@playwright/test";

test.describe("Parcours smoke", () => {
  test("login → dashboard → contacts", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /connexion/i })).toBeVisible();

    await page.getByPlaceholder(/vous@exemple\.com/i).fill("demo@golaine.sn");
    await page.getByPlaceholder(/votre mot de passe/i).fill("secret12");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });

    await page.goto("/dashboard/contacts");
    await expect(page.getByText(/contacts/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
