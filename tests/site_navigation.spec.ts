import { test, expect } from '@playwright/test';

const BASE_URL = 'https://plgic-test.paramount.com.ph';

test.describe('PLGIC AWS Site - Homepage & Main Navigation', () => {
  test.setTimeout(60000);

  test('Homepage renders header, hero section and product category links', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page.locator('#plgic-logo')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('FIND THE RIGHT INSURANCE FOR YOU')).toBeVisible();

    for (const category of ['Life', 'Auto', 'Homecare', 'HealthCare', 'Travel']) {
      await expect(page.getByRole('link', { name: category, exact: true })).toBeVisible();
    }
  });

  // Each entry: link text in the header/footer, expected resulting path, and text unique to that page
  const navPages: { name: string; path: string; expectedText: string }[] = [
    { name: 'ABOUT US', path: '/about-us', expectedText: 'OUR VISION' },
    { name: 'OFW', path: '/ofw-insurance', expectedText: 'Migrant Workers and Overseas Filipinos Act' },
    { name: 'NEWS & EVENTS', path: '/news-and-events', expectedText: 'News and Events' },
    { name: 'HOW TO FILE A CLAIM', path: '/how-to-file-a-claim', expectedText: 'SETTLE YOUR CLAIMS' },
    { name: 'FORMS & FAQ', path: '/forms-and-faq', expectedText: 'FORMS' },
    { name: 'CONTACT US', path: '/contact-us', expectedText: "We'd love to hear from you" },
  ];

  for (const { name, path, expectedText } of navPages) {
    test(`Header nav link "${name}" navigates to ${path}`, async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Nav links live in an off-canvas menu (#sidebar-wrapper) that must be opened via the hamburger toggle first
      await page.locator('#menu-toggle').click();
      await page.locator('#sidebar-wrapper').getByRole('link', { name, exact: true }).click();
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/') + '$'));
      await expect(page.getByText(expectedText, { exact: false }).first()).toBeVisible({ timeout: 15000 });
    });
  }

  const footerPages: { name: string; path: string; expectedText: string }[] = [
    { name: 'Life Products', path: '/life-insurance', expectedText: 'LIFE INSURANCE' },
    { name: 'Non-Life Products', path: '/nonlife-insurance', expectedText: 'NON-LIFE INSURANCE' },
    { name: 'Special Lines', path: '/special-lines', expectedText: 'HEALTH PROTECTOR' },
    { name: 'LifePlanning Partner', path: '/life-planning-partners', expectedText: 'FINANCIAL CONSULTANT' },
    { name: 'Payment Options', path: '/payment-options', expectedText: 'Life Insurance Policy Holders' },
  ];

  for (const { name, path, expectedText } of footerPages) {
    test(`Footer link "${name}" navigates to ${path}`, async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await page.locator('footer').getByRole('link', { name, exact: true }).click();
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, '\\/') + '$'));
      await expect(page.getByText(expectedText, { exact: false }).first()).toBeVisible({ timeout: 15000 });
    });
  }
});
