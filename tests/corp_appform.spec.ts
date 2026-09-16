import { test, expect } from '@playwright/test';

test.describe.serial('PLGIC AWS Site - Health Protector (Corporate/Group) Quote Form', () => {
  test.setTimeout(180000);

  const BASE_URL = 'https://plgic-test.paramount.com.ph';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/special-lines/health-protector`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test('Verify Health Protector page renders plan details', async ({ page }) => {
    await expect(page.getByText(/^Health Protector$/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Medical insurance for small to medium business enterprises.')).toBeVisible();
    await expect(page.getByText('GET A QUOTE', { exact: true })).toBeVisible();
  });

  test('Submit Get a Quote form with valid details succeeds', async ({ page }) => {
    const quoteForm = page.locator('#email-form');
    await quoteForm.scrollIntoViewIfNeeded();

    await quoteForm.locator('input[name="firstName"]').fill('QATest');
    await quoteForm.locator('input[name="lastName"]').fill('Automation');
    await quoteForm.locator('input[name="phone"]').fill(`09${Date.now().toString().slice(-9)}`);
    await quoteForm.locator('input[name="email"]').fill('qatest_corp@paramount.com.ph');
    await page.locator('#privacy-agreement').check();

    await quoteForm.locator('button[type="submit"]').click();

    await expect(page.getByText("Thank you, your form has been submitted. We'll get back to you as soon as we can.")).toBeVisible({ timeout: 15000 });
  });

  test('Submit button is blocked when privacy consent is not checked', async ({ page }) => {
    const quoteForm = page.locator('#email-form');
    await quoteForm.scrollIntoViewIfNeeded();

    await quoteForm.locator('input[name="firstName"]').fill('QATest');
    await quoteForm.locator('input[name="lastName"]').fill('Automation');
    await quoteForm.locator('input[name="phone"]').fill(`09${Date.now().toString().slice(-9)}`);
    await quoteForm.locator('input[name="email"]').fill('qatest_corp@paramount.com.ph');

    await quoteForm.locator('button[type="submit"]').click();

    // Consent checkbox is a required field - browser validation should block submission
    await expect(page.getByText("Thank you, your form has been submitted.")).not.toBeVisible();
    const isValid = await page.locator('#privacy-agreement').evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });
});
