import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Global variables passed sequentially between tests
let createdLastName: string = '';
let createdFirstName: string = '';
let createdReferenceNumber: string = '';
let paymentUrl: string = '';

test.describe.serial('OFW Application and Payment Suite', () => {
  test.setTimeout(180000);

  // ====================================================================
  // TEST 1: APPLICATION PROCESS & SCREENSHOT
  // ====================================================================
  test('OFW Website - Application Process', async ({ page }) => {
    const URL = 'https://plgic-ofw-staging.herokuapp.com/online-applications';

    // Dynamic Variables
    createdLastName = faker.person.lastName();
    createdFirstName = faker.person.firstName();
    const MIDDLE_NAME = faker.person.firstName();
    const ADDRESS_1 = faker.location.streetAddress();
    const ADDRESS_2 = faker.location.secondaryAddress();
    const CITY_MUNICIPALITY = 'Makati';
    const BIRTH_PLACE = faker.location.city();
    const PHONE_NUMBER = '9171234567';
    const EMAIL_ADDRESS = 'qatest_ofw@gmail.com';

    const PASSPORT_NUMBER = faker.string.alphanumeric(9).toUpperCase();
    const FOREIGN_EMPLOYER = faker.company.name();
    const FOREIGN_ADDRESS_1 = faker.location.streetAddress();
    const FOREIGN_ADDRESS_2 = faker.location.secondaryAddress();
    const ESTIMATED_SALARY = faker.number.int({ min: 1000, max: 10000 }).toString();

    const BENEFICIARY_LAST_NAME = faker.person.lastName();
    const BENEFICIARY_FIRST_NAME = faker.person.firstName();
    const BENEFICIARY_MIDDLE_NAME = faker.person.firstName();

    const today = new Date();

    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() + 6);
    const startMm = String(startDate.getMonth() + 1).padStart(2, '0');
    const startDd = String(startDate.getDate()).padStart(2, '0');
    const startYyyy = String(startDate.getFullYear());

    const endDate = new Date(today);
    endDate.setFullYear(today.getFullYear() + 2);
    const endMm = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDd = String(endDate.getDate()).padStart(2, '0');
    const endYyyy = String(endDate.getFullYear());

    const dummyUploadFile = {
      name: 'dummy_document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy file content for automation testing')
    };

    // 1. Navigate to target URL
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    // 2. Handle Announcement Modal if present
    const announcementCloseBtn = page.locator('.dialog, .modal-dialog').getByRole('button', { name: 'Close' });
    if (await announcementCloseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await announcementCloseBtn.click();
    }

    const fillSelect2Field = async (selectId: string, searchText: string) => {
      const container = page.locator(`select#${selectId} + .select2-container, [data-select2-id="${selectId}"] + .select2-container`).first();
      await container.click();

      const searchInput = page.locator('.select2-container--open .select2-search__field, input.select2-search__field');
      await searchInput.waitFor({ state: 'visible', timeout: 5000 });
      await searchInput.fill(searchText);
      await page.waitForTimeout(500);

      const optionResult = page.locator('.select2-results__option--highlighted, .select2-results__option').first();
      await optionResult.click();
    };

    // INITIAL STEP: Referral Option ("How did you learn about Paramount")
    await page.locator('#referral_select_facebook').check({ force: true });

    // STEP 1: Personal Information
    await page.locator('#ofw_application_ofw_personal_info_attributes_last_name').fill(createdLastName);
    await page.locator('#ofw_application_ofw_personal_info_attributes_first_name').fill(createdFirstName);
    await page.locator('#ofw_application_ofw_personal_info_attributes_middle_name').fill(MIDDLE_NAME);

    await page.locator('#ofw_application_ofw_personal_info_attributes_street_address1').fill(ADDRESS_1);
    await page.locator('#ofw_application_ofw_personal_info_attributes_street_address2').fill(ADDRESS_2);

    await fillSelect2Field('city-select', CITY_MUNICIPALITY);
    await page.waitForTimeout(1000);

    await page.locator('#province-select').selectOption({ index: 1 }).catch(async () => {
      await fillSelect2Field('province-select', 'Metro Manila');
    });

    await page.locator('#ofw_application_ofw_personal_info_attributes_gender_male').dispatchEvent('click');
    await page.locator('#ofw_application_ofw_personal_info_attributes_civil_status_single').dispatchEvent('click');

    await page.locator('#birth-month').fill('05');
    await page.locator('#birth-day').fill('15');
    await page.locator('#birth-year').fill('1990');

    await page.locator('#ofw_application_ofw_personal_info_attributes_place_of_birth').fill(BIRTH_PLACE);
    await page.locator('#ofw_application_ofw_personal_info_attributes_phone').fill(PHONE_NUMBER);
    await page.locator('#ofw_application_ofw_personal_info_attributes_email').fill(EMAIL_ADDRESS);

    await page.locator('#btn-personal-next').evaluate((btn: HTMLButtonElement) => btn.click());

    // STEP 2: Employment Information
    await page.locator('#employment-form-body').waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('#ofw_application_ofw_employment_info_attributes_nature_direct-hired').dispatchEvent('click');
    await page.locator('#ofw_application_ofw_employment_info_attributes_type_of_package_land-based').dispatchEvent('click');

    await page.locator('#start-month').fill(startMm);
    await page.locator('#start-day').fill(startDd);
    await page.locator('#start-year').fill(startYyyy);

    await page.locator('#end-month').fill(endMm);
    await page.locator('#end-day').fill(endDd);
    await page.locator('#end-year').fill(endYyyy);

    await page.locator('#ofw_application_ofw_employment_info_attributes_passport_number').fill(PASSPORT_NUMBER);

    await page.locator('#passport-file').setInputFiles(dummyUploadFile);
    await page.locator('#visa-file').setInputFiles(dummyUploadFile);
    await page.locator('#employment-contract-file').setInputFiles(dummyUploadFile);

    await page.locator('#occupation-category-input').selectOption({ value: 'COMPUTER/INFO TECH' });
    await page.locator('#employment-salary').fill(ESTIMATED_SALARY);
    await page.locator('#salary_currency_select_USD').dispatchEvent('click');

    await page.locator('#ofw_application_ofw_employment_info_attributes_employer_name').fill(FOREIGN_EMPLOYER);
    await page.locator('#ofw_application_ofw_employment_info_attributes_street_address1').fill(FOREIGN_ADDRESS_1);
    await page.locator('#ofw_application_ofw_employment_info_attributes_street_address2').fill(FOREIGN_ADDRESS_2);

    await fillSelect2Field('foreign-country', 'United States');
    await page.waitForTimeout(1000);

    await fillSelect2Field('foreign-city-town', 'New York').catch(async () => {
      await page.locator('#foreign-city-town').selectOption({ index: 1 });
    });
    await page.waitForTimeout(1000);

    await page.locator('#foreign-province-state').selectOption({ index: 1 }).catch(async () => {
      await fillSelect2Field('foreign-province-state', 'New York');
    });

    await page.locator('#btn-employment-next').evaluate((btn: HTMLButtonElement) => btn.click());

    // STEP 3: Beneficiary Information
    await page.locator('#beneficiary-form-body').waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('#ofw_application_ofw_beneficiary_infos_attributes_0_last_name').fill(BENEFICIARY_LAST_NAME);
    await page.locator('#ofw_application_ofw_beneficiary_infos_attributes_0_first_name').fill(BENEFICIARY_FIRST_NAME);
    await page.locator('#ofw_application_ofw_beneficiary_infos_attributes_0_middle_name').fill(BENEFICIARY_MIDDLE_NAME);

    await page.locator('#ofw_application_ofw_beneficiary_infos_attributes_0_relationship').selectOption({ value: 'Spouse' });
    await page.locator('#ofw_application_ofw_beneficiary_infos_attributes_0_phone').fill(PHONE_NUMBER);

    await page.locator('#beneficiaries-check').dispatchEvent('click');

    await page.locator('#btn-beneficiary-next').evaluate((btn: HTMLButtonElement) => btn.click());

    // STEP 4: Payment Location & Nomination
    await page.locator('#ofw_application_payment_location_philippines').waitFor({ state: 'attached' });
    await page.locator('#ofw_application_payment_location_philippines').dispatchEvent('click');

    await page.locator('#btn-payment-location-next').evaluate((btn: HTMLButtonElement) => btn.click());

    await page.locator('#payment-nomination-form-body').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#ofw_application_payment_nomination_online_payment').dispatchEvent('click');

    await page.locator('#btn-payment-nomination-next').evaluate((btn: HTMLButtonElement) => btn.click());

    // STEP 5: DPA Consent & OTP Verification
    await page.locator('#dpa_all').dispatchEvent('click');
    await page.locator('#send-otp-link').click();

    const otpInputs = page.locator('.otp-input');
    await expect(otpInputs.first()).toBeEnabled({ timeout: 10000 });

    const hardcodedOtp = '834793';
    for (let i = 0; i < hardcodedOtp.length; i++) {
      await otpInputs.nth(i).pressSequentially(hardcodedOtp[i], { delay: 150 });
    }

    // 1. Click VERIFY button on OTP Modal
    const verifyModalBtn = page.locator('#submit-application, button:has-text("VERIFY")').first();
    await expect(verifyModalBtn).toBeEnabled({ timeout: 10000 });
    await verifyModalBtn.click();

    // 2. Click final SUBMIT button on summary card
    await page.waitForTimeout(1000);
    const finalSubmitBtn = page.locator('button:has-text("SUBMIT"), input[type="submit"][value="SUBMIT"]').last();
    if (await finalSubmitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finalSubmitBtn.click();
    }

    // 3. Wait for redirect to Thank You page
    await page.waitForURL('**/thank-you**', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    // Take screenshot of Thank You page
    await page.screenshot({ path: 'successful_ofw_application.png', fullPage: true });

    process.stdout.write('\n=========================================\n');
    process.stdout.write(`✅ OFW APPLICATION SUBMITTED & SCREENSHOT CAPTURED!\n`);
    process.stdout.write(`👤 Insured: ${createdLastName}, ${createdFirstName}\n`);
    process.stdout.write(`🔗 Page URL: ${page.url()}\n`);
    process.stdout.write('=========================================\n\n');
  });

  // ====================================================================
  // TEST 2: ADMIN VERIFICATION & REFERENCE NUMBER EXTRACTION
  // ====================================================================
  test('OFW Website - Admin Verification & Save Reference Number', async ({ browser }) => {
    test.skip(!createdLastName || !createdFirstName, 'Skipping admin verification because application test failed.');

    const ADMIN_URL = 'https://paramountdirectdev.herokuapp.com/admin';
    const context = await browser.newContext();
    const adminPage = await context.newPage();

    let attempts = 0;
    while (attempts < 3) {
      try {
        await adminPage.goto(ADMIN_URL, { waitUntil: 'commit', timeout: 60000 });
        await adminPage.waitForLoadState('domcontentloaded');
        break;
      } catch (e) {
        attempts++;
        if (attempts === 3) throw e;
        await adminPage.waitForTimeout(3000);
      }
    }

    // Login
    await adminPage.locator('#session_admin_username').fill('arra');
    await adminPage.locator('#session_admin_password').fill('test');
    await adminPage.locator('input[type="submit"][name="commit"]').click();

    // Navigate Menu: Applications -> OFW Applications
    await adminPage.locator('a.dropdown-toggle', { hasText: 'Applications' }).waitFor({ state: 'visible', timeout: 15000 });
    await adminPage.locator('a.dropdown-toggle', { hasText: 'Applications' }).click();

    await adminPage.locator('a[href="/admin/ofw-applications"]').waitFor({ state: 'visible', timeout: 10000 });
    await adminPage.locator('a[href="/admin/ofw-applications"]').click();

    // Search by FIRST_NAME only and wait for search response
    await adminPage.locator('input[name="name"][placeholder*="Search by Name"]').fill(createdFirstName);

    await Promise.all([
      adminPage.waitForResponse((resp) => resp.url().includes('/admin/ofw-applications') && resp.status() === 200).catch(() => {}),
      adminPage.locator('button[type="submit"]', { hasText: 'Search' }).click()
    ]);

    await adminPage.waitForLoadState('networkidle');

    // Verify row containing created applicant first name appears in table
    const tableRow = adminPage.locator('table.table-striped tbody tr').filter({ hasText: createdFirstName });
    await expect(tableRow.first()).toBeVisible({ timeout: 15000 });

    // Extract Reference Number (located in second column <td>)
    createdReferenceNumber = (await tableRow.first().locator('td').nth(1).innerText()).trim();

    process.stdout.write('=========================================\n');
    process.stdout.write(`✅ ADMIN VERIFICATION SUCCESSFUL!\n`);
    process.stdout.write(`🔎 Found Record for: ${createdFirstName}\n`);
    process.stdout.write(`📌 Extracted Reference Number: ${createdReferenceNumber}\n`);
    process.stdout.write('=========================================\n\n');

    await context.close();
  });

  // ====================================================================
  // TEST 3: PAY VIA HOW TO PAY PAGE & BDO PAYMENT PROCESS
  // ====================================================================
  test('OFW Website - How To Pay & BDO Payment Process', async ({ page }) => {
    test.skip(!createdReferenceNumber, 'Skipping payment test because no reference number was extracted.');

    const HOW_TO_PAY_URL = 'https://plgic-ofw-staging.herokuapp.com/how-to-pay';

    // 1. Go to How To Pay page
    await page.goto(HOW_TO_PAY_URL, { waitUntil: 'domcontentloaded' });

    // Handle Announcement Modal if present
    const announcementCloseBtn = page.locator('.dialog, .modal-dialog').getByRole('button', { name: 'Close' });
    if (await announcementCloseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await announcementCloseBtn.click();
    }

    // Input Reference Number into search/input field
    const refInput = page.locator('input[type="text"], input[name*="ref"], input[placeholder*="Reference"]').first();
    await refInput.fill(createdReferenceNumber);

    // Wait for the PAY button to become enabled and click
    const payBtn = page.locator('button.btn-pay-now');
    await expect(payBtn).toBeEnabled({ timeout: 10000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
      payBtn.click()
    ]);

    await page.waitForTimeout(2000);
    paymentUrl = page.url();

    process.stdout.write('=========================================\n');
    process.stdout.write(`💳 PAY BUTTON CLICKED ON HOW TO PAY PAGE!\n`);
    process.stdout.write(`🔗 Gateway URL: ${paymentUrl}\n`);
    process.stdout.write('=========================================\n\n');

    // 2. Complete BDO Online Bills Payment Flow
    await page.getByRole('checkbox').first().check({ force: true });
    await page.locator('img[src*="online_icon.png"]').click();
    await page.locator('img[alt="BDO Online Bills Payment"]').click();
    await page.locator('#modal_btn_ok').click();

    await page.waitForURL('**/consent**', { timeout: 30000 });
    await page.locator('button#submit-btn', { hasText: 'Continue' }).click();
    await page.locator('button#submit-btn', { hasText: 'Continue' }).click();

    // Dynamic Sandbox Login Handling
    const loginBtn = page.locator('#loginBtn');
    await loginBtn.waitFor({ state: 'visible' });

    const passwordInput = page.locator('input[type="password"]');

    if (await passwordInput.isVisible()) {
      const usernameInput = page.locator('input[type="text"], input[type="email"]').first();
      const email = await usernameInput.inputValue();

      const password = email.split('@')[0];
      await passwordInput.fill(password);
    }

    await loginBtn.click();

    const firstSubmitBtn = page.locator('button#submit-btn', { hasText: 'Submit' });
    await firstSubmitBtn.waitFor({ state: 'visible', timeout: 120000 });
    await firstSubmitBtn.click();

    await page.locator('div')
      .filter({ hasText: 'SAVINGS' })
      .filter({ hasText: '₱' })
      .last()
      .click();

    await page.locator('#transferSubmitButton').click();
    await page.locator('button#submit-btn', { hasText: 'Submit' }).click();
    await page.locator('button#submit-btn', { hasText: 'Done' }).click();

    await page.waitForTimeout(5000);

    process.stdout.write('=========================================\n');
    process.stdout.write(`✅ BDO PAYMENT PROCESS COMPLETED SUCCESSFULLY!\n`);
    process.stdout.write(`🔗 Final Page URL: ${page.url()}\n`);
    process.stdout.write('=========================================\n\n');
  });
});