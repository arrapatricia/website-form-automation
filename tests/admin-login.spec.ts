import { test, expect } from '@playwright/test';

test('Paramount Direct Admin Login and Logout', async ({ page }) => {
  // 1. Navigate to the admin page (matches Open Browser)
  await page.goto('https://paramountdirect.com/admin');

  // 2. Fill in username and password using the exact IDs from your Robot script
  await page.locator('#session_admin_username').fill('arra');
  await page.locator('#session_admin_password').fill('test');

  // 3. Click the login button using the CSS selector from your Robot script
  await page.locator('input[name="commit"]').click();

  // 4. Automate Logout Process (matching your logout steps)
  // Click the user dropdown showing 'Arra'
  await page.locator("xpath=//a[contains(@class, 'dropdown-toggle') and contains(., 'Arra')]").click();

  // Wait for the logout link to be visible and click it
  const logoutLink = page.locator("xpath=//a[@href='/logout']");
  await logoutLink.waitFor({ state: 'visible', timeout: 5000 });
  await logoutLink.click();
});