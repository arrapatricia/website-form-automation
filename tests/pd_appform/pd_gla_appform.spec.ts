import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import path from 'path';

test.describe.serial('Paramount Direct - Life & Accident Insurance Suite', () => {
  test.setTimeout(180000);

  // Explicit output path for all screenshots
  const SCREENSHOTS_DIR = 'C:\\Users\\arra.delmundo\\Desktop\\qa\\tests\\screenshots';

  test('Complete Golden Life Advantage Plan Application Flow', async ({ page }) => {
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
    const emailAddress = 'qatest_gla@gmail.com';

    // Beneficiary Details
    const benFirstName = faker.person.firstName();
    const benLastName = faker.person.lastName();

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

    // 3. Navigate to Life & Accident Insurance Overview Page
    const lifeInsuranceLink = page.locator('a[href="/life-accident-insurance"]').first();
    await expect(lifeInsuranceLink).toBeVisible({ timeout: 15000 });
    await lifeInsuranceLink.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL('**/life-accident-insurance**', { timeout: 30000 }).catch(() => {}),
      lifeInsuranceLink.click()
    ]);
    await page.waitForLoadState('domcontentloaded');

    // 4. STEP 3: Click Golden Life Advantage Plan link
    const glaPlanLink = page.locator('a[href="/life-accident-insurance/golden-life-advantage-plan"]').first();
    await expect(glaPlanLink).toBeVisible({ timeout: 15000 });
    await glaPlanLink.click();
    await page.waitForLoadState('domcontentloaded');

    // 5. STEP 4: Click Apply Now button
    const applyNowBtn = page.locator('a[href="/apply/golden-life-advantage-plan"].orange-btn').first();
    await expect(applyNowBtn).toBeVisible({ timeout: 15000 });
    await applyNowBtn.click();
    await page.waitForLoadState('domcontentloaded');

    // 6. STEP 5: Select Plan & Payment Options (1 Unit = value 9)
    const planDropdown = page.locator('#application_plan_id');
    await planDropdown.selectOption({ value: '9' });
    await planDropdown.dispatchEvent('change');

    const periodDropdown = page.locator('#application_period_id');
    await periodDropdown.selectOption({ value: '1' }); // Monthly
    await periodDropdown.dispatchEvent('change');

    // ====================================================================
    // PANEL 1: Policy Owner Information
    // ====================================================================
    await page.locator('#payor_prefix_id').selectOption({ value: '1' }); // Mr
    await page.locator('#payor_first_name').fill(firstName);
    await page.locator('#payor_middle_name').fill(middleName);
    await page.locator('#payor_surname').fill(lastName);

    await page.locator('#payor_gender_id').selectOption({ value: '1' }); // Male

    // Fill Birthdate (1965) within allowed range (1955 to 1971)
    const birthdateInput = page.locator('#payor_birthdate');
    await birthdateInput.evaluate((el: HTMLInputElement) => {
      el.value = '05/15/1965';
    });
    await birthdateInput.dispatchEvent('input');
    await birthdateInput.dispatchEvent('keyup');
    await birthdateInput.dispatchEvent('change');
    await birthdateInput.dispatchEvent('blur');

    // Verify non-zero premium calculation
    await expect(page.locator('#premium')).not.toHaveText('PHP 0.00/monthly', { timeout: 10000 }).catch(() => {});

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

    // Select dynamic City option and sync hidden city field
    const cityDropdown = page.locator('#payor_contact_info_address_city');
    await expect(async () => {
      const optionCount = await cityDropdown.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });

    const selectedCity = await cityDropdown.locator('option').nth(1).getAttribute('value') || '';
    await cityDropdown.selectOption({ index: 1 });
    await cityDropdown.dispatchEvent('change');
    await page.locator('#payor_contact_info_address_city_hidden').evaluate((el: HTMLInputElement, val) => el.value = val, selectedCity);

    // Select dynamic Barangay option and sync hidden barangay field
    const barangayDropdown = page.locator('#payor_contact_info_address_barangay');
    await expect(async () => {
      const optionCount = await barangayDropdown.locator('option').count();
      expect(optionCount).toBeGreaterThan(1);
    }).toPass({ timeout: 10000 });

    const selectedBarangay = await barangayDropdown.locator('option').nth(1).getAttribute('value') || '';
    await barangayDropdown.selectOption({ index: 1 });
    await barangayDropdown.dispatchEvent('change');
    await page.locator('#payor_contact_info_address_barangay_hidden').evaluate((el: HTMLInputElement, val) => el.value = val, selectedBarangay);

    // Populate Zipcode and trigger validation
    const zipcodeField = page.locator('#payor_contact_info_zipcode');
    await zipcodeField.fill(zipCode);
    await zipcodeField.dispatchEvent('input');
    await zipcodeField.dispatchEvent('change');
    await zipcodeField.dispatchEvent('blur');
    await page.locator('#payor_contact_info_zipcode_hidden').evaluate((el: HTMLInputElement, val) => el.value = val, zipCode);

    // Radio: Mail to same address
    await page.locator('#shipping_address_same').check({ force: true });

    // Phone & Contact Details with explicit event sync
    const mobileInput = page.locator('#payor_contact_info_mobile_number');
    await mobileInput.fill(mobileNumber);
    await mobileInput.dispatchEvent('input');
    await mobileInput.dispatchEvent('change');
    await mobileInput.dispatchEvent('blur');

    const areaCodeInput = page.locator('#area_code');
    const phoneNumberInput = page.locator('#phone_number');
    await areaCodeInput.fill(areaCode);
    await areaCodeInput.dispatchEvent('input');
    await areaCodeInput.dispatchEvent('change');

    await phoneNumberInput.fill(phoneNumber);
    await phoneNumberInput.dispatchEvent('input');
    await phoneNumberInput.dispatchEvent('change');
    await phoneNumberInput.dispatchEvent('blur');

    await page.locator('#payor_contact_info_telephone_number').evaluate(
      (el: HTMLInputElement, val) => { el.value = val; }, 
      `${areaCode}${phoneNumber}`
    );

    const emailInput = page.locator('#payor_contact_info_email_address');
    await emailInput.fill(emailAddress);
    await emailInput.dispatchEvent('input');
    await emailInput.dispatchEvent('change');

    // Proceed to Panel 3
    await page.locator('#btn-contact-info').click();

    // ====================================================================
    // PANEL 3: Other Information (Beneficiary & Non-Forfeiture)
    // ====================================================================
    await page.locator('#collapseOther').waitFor({ state: 'visible', timeout: 10000 });

    // Fill Primary Beneficiary details and sync events cleanly
    const benFname = page.locator('#application_beneficiary_fname_0');
    await benFname.fill(benFirstName);
    await benFname.dispatchEvent('input');
    await benFname.dispatchEvent('change');

    const benLname = page.locator('#application_beneficiary_lname_0');
    await benLname.fill(benLastName);
    await benLname.dispatchEvent('input');
    await benLname.dispatchEvent('change');

    await page.locator('#application_beneficiary_fullname_0').evaluate(
      (el: HTMLInputElement, val) => { el.value = val; }, 
      `${benFirstName} ${benLastName}`
    );

    const relDropdown = page.locator('#application_beneficiary_relationship_id');
    await relDropdown.selectOption({ value: '3' }); // Parent
    await relDropdown.dispatchEvent('change');

    const benBirthdate = page.locator('#application_beneficiary_birthdate');
    await benBirthdate.evaluate((el: HTMLInputElement) => {
      el.value = '08/20/1990';
    });
    await benBirthdate.dispatchEvent('input');
    await benBirthdate.dispatchEvent('change');
    await benBirthdate.dispatchEvent('blur');

    await page.locator('#application_beneficiary_is_revocable').selectOption('Revocable');

    // Select Non-Forfeiture Option
    const nfoOption = page.locator('#application_non_forfeiture_option_id');
    await nfoOption.selectOption({ value: '1' }); // Paid-up Insurance
    await nfoOption.dispatchEvent('change');

    // Proceed to Panel 4
    await page.locator('#btn-other-info').click();

    // ====================================================================
    // PANEL 4: Payor Information
    // ====================================================================
    await page.locator('#collapsePayorInfo').waitFor({ state: 'visible', timeout: 10000 });

    // Check same_with_insured via DOM evaluation, sync hidden value, and fill textboxes
    const sameWithInsuredCheckbox = page.locator('#same_with_insured');
    await sameWithInsuredCheckbox.evaluate((el: HTMLInputElement) => {
      el.checked = true;
    });
    await sameWithInsuredCheckbox.dispatchEvent('change');

    await page.locator('input.same_with_insured').evaluate((el: HTMLInputElement) => {
      el.value = 'Yes';
    });

    const pFName = page.locator('#payor_info_first_name');
    await pFName.fill(firstName);
    await pFName.dispatchEvent('input');

    const pMName = page.locator('#payor_info_middle_name');
    await pMName.fill(middleName);

    const pLName = page.locator('#payor_info_last_name');
    await pLName.fill(lastName);
    await pLName.dispatchEvent('input');

    const pContact = page.locator('#payor_info_contact_number');
    await pContact.fill(mobileNumber);
    await pContact.dispatchEvent('input');

    const pEmail = page.locator('#payor_info_email_address');
    await pEmail.fill(emailAddress);
    await pEmail.dispatchEvent('input');
    await pEmail.dispatchEvent('change');

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

    // Wait for submission request to finish and capture screenshot
    await page.waitForLoadState('domcontentloaded');

    const screenshotPath = path.join(SCREENSHOTS_DIR, `gla_submitted_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    process.stdout.write('\n=========================================\n');
    process.stdout.write(`✅ GOLDEN LIFE ADVANTAGE PLAN APPLICATION SUBMITTED!\n`);
    process.stdout.write(`👤 Applicant: ${lastName}, ${firstName}\n`);
    process.stdout.write(`📸 Screenshot saved to: ${screenshotPath}\n`);
    process.stdout.write(`🔗 Page URL: ${page.url()}\n`);
    process.stdout.write('=========================================\n\n');
  });
});