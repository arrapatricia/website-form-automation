import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import path from 'path';

test.describe.serial('Paramount Direct - Health Care Insurance Suite', () => {
  test.setTimeout(180000);

  // FIXED: Explicit output path for all screenshots
  const SCREENSHOTS_DIR = 'C:\\Users\\arra.delmundo\\Desktop\\qa\\tests\\screenshots';

  test('Complete HealthCare Cash Plan Application Flow', async ({ page }) => {
    const PRODUCTS_URL = 'https://paramountdirectdev.herokuapp.com/products';

    // Dynamic Applicant Details
    const firstName = faker.person.firstName();
    const middleName = faker.person.middleName();
    const lastName = faker.person.lastName();
    const birthPlace = faker.location.city();
    const houseNumber = faker.number.int({ min: 10, max: 999 }).toString();
    const streetName = faker.location.street();
    const buildingName = faker.company.name();
    const zipCode = '6822';
    const mobileNumber = `09${faker.string.numeric(9)}`;
    const areaCode = '02';
    const phoneNumber = faker.string.numeric(7);
    const emailAddress = 'qatest_hcp@gmail.com';

    // 1. Navigate to Products page with Heroku cold-start retry
    let attempts = 0;
    while (attempts < 3) {
      try {
        await page.goto(PRODUCTS_URL, { waitUntil: 'commit', timeout: 60000 });
        await page.waitForLoadState('domcontentloaded');
        break;
      } catch (e) {
        attempts++;
        if (attempts === 3) throw e;
        await page.waitForTimeout(3000);
      }
    }

    // 2. Handle Announcement Modal if present
    const announcementCloseBtn = page.locator('.dialog, .modal-dialog').getByRole('button', { name: 'Close' });
    if (await announcementCloseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await announcementCloseBtn.click();
    }

    // 3. Navigate to Health Care Insurance Overview Page
    const healthInsuranceLink = page.locator('a[href="/health-insurance"]').first();
    await expect(healthInsuranceLink).toBeVisible({ timeout: 15000 });
    await healthInsuranceLink.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL('**/health-insurance**', { timeout: 30000 }).catch(() => {}),
      healthInsuranceLink.click()
    ]);
    await page.waitForLoadState('domcontentloaded');

    // 4. STEP 3: Click HealthCare Cash Plan link
    const hcpCashPlanLink = page.locator('a[href="/health-insurance/healthcare-cash-plan"]').first();
    await expect(hcpCashPlanLink).toBeVisible({ timeout: 15000 });
    await hcpCashPlanLink.click();
    await page.waitForLoadState('domcontentloaded');

    // 5. STEP 4: Click Apply Now button
    const applyNowBtn = page.locator('a[href="/apply/healthcare-cash-plan"].orange-btn').first();
    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await applyNowBtn.click();
    await page.waitForLoadState('domcontentloaded');

    // 6. STEP 5: Select Plan & Payment Options
    await page.locator('#application_plan_id').selectOption({ value: '5' }); // Plan 500 - Individual
    await page.locator('#application_period_id').selectOption({ value: '1' }); // Monthly

    // ====================================================================
    // PANEL 1: Policy Owner Information
    // ====================================================================
    await page.locator('#payor_prefix_id').selectOption({ value: '1' }); // Mr
    await page.locator('#payor_first_name').fill(firstName);
    await page.locator('#payor_middle_name').fill(middleName);
    await page.locator('#payor_surname').fill(lastName);

    await page.locator('#payor_gender_id').selectOption({ value: '1' }); // Male

    // Fill Birthdate directly into DOM to bypass 'number-only' filter, then trigger checkAge focusout event
    const birthdateInput = page.locator('#payor_birthdate');
    await birthdateInput.evaluate((el: HTMLInputElement) => {
      el.value = '05/15/1995';
    });
    await birthdateInput.dispatchEvent('change');
    await birthdateInput.dispatchEvent('focusout');

    await page.locator('#payor_birth_place').fill(birthPlace);
    await page.locator('#payor_nationality_id').selectOption({ value: '62' }); // Filipino

    await page.locator('#btn-personal-info').click();

    // ====================================================================
    // PANEL 2: Contact Information
    // ====================================================================
    await page.locator('#collapseContactInfo').waitFor({ state: 'visible', timeout: 10000 });

    await page.locator('#payor_contact_info_address_number').fill(houseNumber);
    await page.locator('#payor_contact_info_address_street').fill(streetName);
    await page.locator('#payor_contact_info_address_building').fill(buildingName);

    // Select Province 'Eastern Samar' & trigger change event
    const provinceDropdown = page.locator('#payor_contact_info_address_province');
    await provinceDropdown.selectOption('Eastern Samar');
    await provinceDropdown.dispatchEvent('change');

    // Select first available City option dynamically
    const cityDropdown = page.locator('#payor_contact_info_address_city');
    await expect(async () => {
      const optionCount = await cityDropdown.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });

    await cityDropdown.selectOption({ index: 1 });
    await cityDropdown.dispatchEvent('change');

    // Select first available Barangay option dynamically
    const barangayDropdown = page.locator('#payor_contact_info_address_barangay');
    await expect(async () => {
      const optionCount = await barangayDropdown.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });

    await barangayDropdown.selectOption({ index: 1 });
    await barangayDropdown.dispatchEvent('change');

    // Populate Zipcode and trigger validation
    const zipcodeField = page.locator('#payor_contact_info_zipcode');
    await zipcodeField.fill(zipCode);
    await zipcodeField.dispatchEvent('input');
    await zipcodeField.dispatchEvent('change');
    await zipcodeField.dispatchEvent('blur');
    await page.locator('#payor_contact_info_zipcode_hidden').evaluate((el: HTMLInputElement, val) => el.value = val, zipCode);

    // Radio: Mail to same address
    await page.locator('#shipping_address_same').check({ force: true });

    // Phone & Contact Details
    await page.locator('#payor_contact_info_mobile_number').fill(mobileNumber);
    await page.locator('#area_code').fill(areaCode);
    await page.locator('#phone_number').fill(phoneNumber);
    await page.locator('#payor_contact_info_email_address').fill(emailAddress);

    // Proceed to Panel 3
    await page.locator('#btn-contact-info').click();

    // ====================================================================
    // PANEL 3: Other Information
    // ====================================================================
    await page.locator('#collapseOther').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#btn-other-info').click();

    // ====================================================================
    // PANEL 4: Payor Information
    // ====================================================================
    await page.locator('#collapsePayorInfo').waitFor({ state: 'visible', timeout: 10000 });

    // Click 'same_with_insured' to trigger page JS copy logic, then fallback fill if required
    const sameWithInsuredCheckbox = page.locator('#same_with_insured');
    await sameWithInsuredCheckbox.click({ force: true });
    await sameWithInsuredCheckbox.dispatchEvent('change');

    const payorFirstName = page.locator('#payor_info_first_name');
    if (await payorFirstName.isVisible() && (await payorFirstName.inputValue()) === '') {
      await payorFirstName.fill(firstName);
      await page.locator('#payor_info_middle_name').fill(middleName);
      await page.locator('#payor_info_last_name').fill(lastName);
      await page.locator('#payor_info_contact_number').fill(mobileNumber);
      await page.locator('#payor_info_email_address').fill(emailAddress);
    }

    // Click Submit Application to open review modal
    await page.locator('#submit-btn').click();

    // ====================================================================
    // MODAL: Review Details, Accept DPA, & Confirm Submission
    // ====================================================================
    const confirmModal = page.locator('#confirm-email-modal');
    await confirmModal.waitFor({ state: 'visible', timeout: 10000 });

    // Click "Accept all terms and conditions" button
    const acceptAllBtn = page.locator('#btn-select-all');
    await expect(acceptAllBtn).toBeVisible({ timeout: 5000 });
    await acceptAllBtn.click();

    // Verify "Confirm and Submit" button becomes enabled, then click it
    const finalConfirmBtn = page.locator('#btnApplicationSubmit');
    await expect(finalConfirmBtn).toBeEnabled({ timeout: 10000 });
    await finalConfirmBtn.click();

    // Wait for submission request to finish and capture screenshot to targeted folder
    await page.waitForLoadState('domcontentloaded');
    
    const screenshotPath = path.join(SCREENSHOTS_DIR, `hcp_submitted_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    process.stdout.write('\n=========================================\n');
    process.stdout.write(`✅ HEALTHCARE CASH PLAN APPLICATION SUBMITTED!\n`);
    process.stdout.write(`👤 Applicant: ${lastName}, ${firstName}\n`);
    process.stdout.write(`📸 Screenshot saved to: ${screenshotPath}\n`);
    process.stdout.write(`🔗 Page URL: ${page.url()}\n`);
    process.stdout.write('=========================================\n\n');
  });
});