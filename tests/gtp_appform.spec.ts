import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
// Give this specific test 60 seconds to finish instead of 30
test.setTimeout(60000); 
test('WPS Website - GTP Application Process', async ({ page }) => {
  // --- DYNAMIC FAKER VARIABLES ---
  
  // Keep travel dates static so we don't accidentally pick past dates or break business logic
  const DEPT_MONTH = '12';
  const DEPT_DAY = '25';
  const DEPT_YEAR = '2026';
  
  // Random Personal Information
  const LAST_NAME = faker.person.lastName();
  const FIRST_NAME = faker.person.firstName();
  
  // Generate a random adult birthdate and split it into Month, Day, Year (with leading zeros)
  const birthdate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const T_BMONTH = String(birthdate.getMonth() + 1).padStart(2, '0'); 
  const T_BDATE = String(birthdate.getDate()).padStart(2, '0');
  const T_BYEAR = String(birthdate.getFullYear());
  
  // Random Passport & Contact Info
  const PASSPORT_NUMBER = faker.string.alpha(2).toUpperCase() + faker.string.numeric(7);
  const PP_YEAR_EXPIRY = faker.number.int({ min: 2027, max: 2035 }).toString();
  const RANDOM_ADDRESS = faker.location.streetAddress();
  const EMAIL_ADDRESS = faker.internet.email();
  const MOBILE_NUM = '9' + faker.string.numeric(9); // Ensures an 11-digit PH mobile number
  
  const EXECUTIVE_BUTTON = '#executive-plan-btn'; // Replace with actual locator
  // ------------------------------------------------------------------------------------------

  // Open Website - GTP
  await page.goto('https://globaltravelprotectstaging.herokuapp.com/online-applications#', { waitUntil: 'domcontentloaded' });
  // ==========================================
  // STEP 1: Fill-Out Travel Details
  // ==========================================
  
  await page.locator("xpath=//select[@id='itenerary-destinations']/following-sibling::span[contains(@class, 'select2')]").click();
  await page.locator('.select2-search__field').fill('Jap');
  await page.waitForTimeout(2000); 
  await page.locator('.select2-search__field').press('Enter');

  await page.locator('#annual-travel-btn').click();
  await page.locator('#annual_coverage_type_annual_multi90').click();

  await page.locator('#departure-date-month').fill(DEPT_MONTH);
  await page.locator('#departure-date-day').fill(DEPT_DAY);
  await page.locator('#departure-date-year').fill(DEPT_YEAR);

  await page.locator('body').click();
  await expect(page.locator('#days-of-travel')).toHaveValue('365', { timeout: 10000 });

// OLD LINE (Fails because it matches 2 buttons)
  await page.locator('button[data-nextsection="passenger-section"][data-currentsection="coverage-section"]').click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'travel_details.png' });

  // ==========================================
  // STEP 2: Fill-Out Traveller Details
  // ==========================================
// Wait specifically for the Last Name box to become visible, then type in it
  const lastNameInput = page.locator('#gtp_application_gtp_passenger_info_attributes_last_name');
  await lastNameInput.waitFor({ state: 'visible', timeout: 10000 });
  await lastNameInput.fill(LAST_NAME);
  // Using Faker variables here
  await page.locator('#gtp_application_gtp_passenger_info_attributes_last_name').fill(LAST_NAME);
  await page.locator("xpath=//input[@placeholder='First Name']").fill(FIRST_NAME);

  await page.locator('#passenger-birth-month').fill(T_BMONTH);
  await page.locator('#passenger-birth-day').fill(T_BDATE);
  await page.locator('#passenger-birth-year').fill(T_BYEAR);

  await page.locator('#gtp_application_gtp_passenger_info_attributes_gender_female').click();

  await page.locator('#gtp_application_gtp_passenger_info_attributes_passport_number').fill(PASSPORT_NUMBER);
  await page.locator('#passenger-passport-expiry-month').fill(T_BMONTH); // Kept matching birth month from original
  await page.locator('#passenger-passport-expiry-day').fill(T_BDATE);   // Kept matching birth day from original
  await page.locator('#passenger-passport-expiry-year').fill(PP_YEAR_EXPIRY);

  await page.locator('#gtp_application_gtp_passenger_info_attributes_address').fill(RANDOM_ADDRESS);
  await page.locator('#gtp_application_gtp_passenger_info_attributes_email').fill(EMAIL_ADDRESS);
  await page.locator('#gtp_application_gtp_passenger_info_attributes_phone').fill(MOBILE_NUM);

  await page.locator("button[data-nextsection='plan-section']").click();
  await page.screenshot({ path: 'traveller_information.png' });

// ==========================================
  // STEP 3: Select Plan & Optional Coverage
  // ==========================================
  
  // 1. Select the Economy plan
  const selectPlanBtn = page.getByRole('button', { name: 'Select', exact: true }).first();
  await selectPlanBtn.scrollIntoViewIfNeeded();
  await selectPlanBtn.click();
  console.log('Successfully clicked the Select button for the Economy plan!');

  const finalNextBtn = page.getByRole('button', { name: 'Next', exact: true }).and(page.locator(':visible'));
  await finalNextBtn.scrollIntoViewIfNeeded();
  await finalNextBtn.click();
  
  await page.waitForTimeout(2000); // Give the UI time to transition
// ==========================================
  // STEP 3.5: Optional Coverage Screen
  // ==========================================
  
  // OPTIONAL: If you ever want to add the Hazardous or Cruise coverage in your test, 
  // you can uncomment the line below to click the first "ADD COVERAGE" button.
  // await page.getByText('ADD COVERAGE').first().click();

  // Click the red "Submit" button on the Optional Coverage page to proceed to the DPA/Review page.
  // We use .and(page.locator(':visible')) just in case there are hidden submit buttons on the page.
  const optionalCoverageSubmitBtn = page.getByRole('button', { name: 'Submit', exact: true }).and(page.locator(':visible'));
  await optionalCoverageSubmitBtn.scrollIntoViewIfNeeded();
  await optionalCoverageSubmitBtn.click();
  
  // Give the UI time to load the Review page with the checkboxes
  await page.waitForTimeout(2000); 

  // ==========================================
  // STEP 4: Review Page & Submission
  // ==========================================
  
  // 1. Accept all 5 Data Privacy (DPA) Checkboxes based on your HTML
  await page.locator('#dpa_a').scrollIntoViewIfNeeded();
  await page.locator('#dpa_a').click();
  await page.locator('#dpa_b').click();
  await page.locator('#dpa_c').click();
  await page.locator('#dpa_d').click();
  await page.locator('#dpa_e').click();

  // 2. Handle OTP
  const sendOtpLink = page.locator('#send-otp-link');
  await sendOtpLink.waitFor({ state: 'visible', timeout: 10000 });
  await sendOtpLink.click();

  const firstOtpInput = page.locator("(//input[contains(@class, 'otp-input')])[1]");
  await firstOtpInput.waitFor({ state: 'visible', timeout: 15000 }); 
  
  await firstOtpInput.fill('8');
  await page.locator("(//input[contains(@class, 'otp-input')])[2]").fill('3');
  await page.locator("(//input[contains(@class, 'otp-input')])[3]").fill('4');
  await page.locator("(//input[contains(@class, 'otp-input')])[4]").fill('7');
  await page.locator("(//input[contains(@class, 'otp-input')])[5]").fill('9');
  await page.locator("(//input[contains(@class, 'otp-input')])[6]").fill('3');

// 3. Handle reCAPTCHA Iframe
  const recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
  const recaptchaCheckbox = recaptchaFrame.locator('div.recaptcha-checkbox-border');
  
  await recaptchaCheckbox.waitFor({ state: 'visible', timeout: 10000 });
  await recaptchaCheckbox.click();
  
// PAUSE THE TEST HERE
  // A Playwright Inspector window will pop up. 
  // Solve the picture puzzle on the screen yourself, then click the 
  // "Resume" (Play) button in the Playwright Inspector to finish the test!
  await page.pause(); 

  // 4. Submit Application
  const submitBtn = page.locator('#submit-application');
  await submitBtn.waitFor({ state: 'visible', timeout: 10000 });
  await expect(submitBtn).toBeEnabled({ timeout: 15000 }); 
  await submitBtn.click();
});