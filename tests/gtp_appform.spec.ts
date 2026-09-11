import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Give this specific test 60 seconds to finish instead of 30
test.setTimeout(60000); 

test('WPS Website - GTP Application Process', async ({ page }, testInfo) => { 
  // ==========================================
  // DYNAMIC FAKER & DATE VARIABLES
  // ==========================================
  
  // --- DYNAMIC TRAVEL DATES (2 Days in the Future) ---
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 2); // Adds 2 days to today's date

  // Extract and format the future Month, Day, and Year
  const DEPT_MONTH = String(departureDate.getMonth() + 1).padStart(2, '0'); // Adds leading zero
  const DEPT_DAY = String(departureDate.getDate()).padStart(2, '0');        // Adds leading zero
  const DEPT_YEAR = String(departureDate.getFullYear());  
  
  // Extract just the file name (e.g., "gtp_appform.spec.ts") for screenshots
  const fileName = testInfo.file.split(/[\\/]/).pop();

  // Create unique folder for this specific run
  const RUN_FOLDER = `screenshots/run-${Date.now()}`;

  // --- Random Personal Information ---
  const LAST_NAME = faker.person.lastName();
  const FIRST_NAME = faker.person.firstName();
  
  // Generate a random adult birthdate and split it into Month, Day, Year
  const birthdate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  const T_BMONTH = String(birthdate.getMonth() + 1).padStart(2, '0'); 
  const T_BDATE = String(birthdate.getDate()).padStart(2, '0');
  const T_BYEAR = String(birthdate.getFullYear());
  
  // --- Random Passport & Contact Info ---
  const PASSPORT_NUMBER = faker.string.alpha(2).toUpperCase() + faker.string.numeric(7);
  const PP_YEAR_EXPIRY = faker.number.int({ min: 2027, max: 2035 }).toString();
  const RANDOM_ADDRESS = faker.location.streetAddress();
  
  // Fixed Email and Mobile Number (Passes 10-digit validation)
  const EMAIL_ADDRESS = 'qatest0321@gmail.com';
  const MOBILE_NUM = '9274074445';
  
  const EXECUTIVE_BUTTON = '#executive-plan-btn'; 

  // ==========================================
  // STEP 1: Fill-Out Travel Details
  // ==========================================
  
  // Open Website - GTP Staging
  await page.goto('https://globaltravelprotectstaging.herokuapp.com/online-applications#', { waitUntil: 'domcontentloaded' });
  
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

  await page.locator('button[data-nextsection="passenger-section"][data-currentsection="coverage-section"]').click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${RUN_FOLDER}/1_${fileName}.png` });

  // ==========================================
  // STEP 2: Fill-Out Traveller Details
  // ==========================================
  
  // Wait specifically for the Last Name box to become visible, then type in it
  const lastNameInput = page.locator('#gtp_application_gtp_passenger_info_attributes_last_name');
  await lastNameInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Using Faker variables here
  await lastNameInput.fill(LAST_NAME);
  await page.locator("xpath=//input[@placeholder='First Name']").fill(FIRST_NAME);

  await page.locator('#passenger-birth-month').fill(T_BMONTH);
  await page.locator('#passenger-birth-day').fill(T_BDATE);
  await page.locator('#passenger-birth-year').fill(T_BYEAR);

  await page.locator('#gtp_application_gtp_passenger_info_attributes_gender_female').click();

  await page.locator('#gtp_application_gtp_passenger_info_attributes_passport_number').fill(PASSPORT_NUMBER);
  await page.locator('#passenger-passport-expiry-month').fill(T_BMONTH); 
  await page.locator('#passenger-passport-expiry-day').fill(T_BDATE);   
  await page.locator('#passenger-passport-expiry-year').fill(PP_YEAR_EXPIRY);

  await page.locator('#gtp_application_gtp_passenger_info_attributes_address').fill(RANDOM_ADDRESS);
  await page.locator('#gtp_application_gtp_passenger_info_attributes_email').fill(EMAIL_ADDRESS);
  await page.locator('#gtp_application_gtp_passenger_info_attributes_phone').fill(MOBILE_NUM);

  await page.locator("button[data-nextsection='plan-section']").click();
  await page.screenshot({ path: `${RUN_FOLDER}/2_${fileName}.png` });

  // ==========================================
  // STEP 3: Select Plan & Optional Coverage
  // ==========================================
  
  // 1. Select the Economy plan
  const selectPlanBtn = page.getByRole('button', { name: 'Select', exact: true }).first();
  await selectPlanBtn.scrollIntoViewIfNeeded();
  await selectPlanBtn.click();
  console.log('Successfully clicked the Select button for the Economy plan!');

  // 2. Click the visible Next button
  const finalNextBtn = page.getByRole('button', { name: 'Next', exact: true }).and(page.locator(':visible'));
  await finalNextBtn.scrollIntoViewIfNeeded();
  await finalNextBtn.click();
  
  await page.waitForTimeout(2000); // Give the UI time to transition

  // ==========================================
  // STEP 3.5: Optional Coverage Screen
  // ==========================================
  
  // Click the red "Submit" button on the Optional Coverage page
  const optionalCoverageSubmitBtn = page.getByRole('button', { name: 'Submit', exact: true }).and(page.locator(':visible'));
  await optionalCoverageSubmitBtn.scrollIntoViewIfNeeded();
  await optionalCoverageSubmitBtn.click();
  
  await page.waitForTimeout(2000); 

  // ==========================================
  // STEP 4: Review Page & Submission
  // ==========================================
  
  // 1. Accept all 5 Data Privacy (DPA) Checkboxes 
  await page.locator('#dpa_a').scrollIntoViewIfNeeded();
  await page.locator('#dpa_a').click();
  await page.locator('#dpa_b').click();
  await page.locator('#dpa_c').click();
  await page.locator('#dpa_d').click();
  await page.locator('#dpa_e').click();

  // 2. Handle OTP Verification
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

  // 3. Handle reCAPTCHA Iframe (Forced Frontend Bypass)
  const SITE_KEY = '6LeKQg4qAAAAAG4WHzEorw2EZ818uC1ec7nvBX54';
  const SECRET_KEY = '6LeKQg4qAAAAADmyBwWQW-lIqGH85Dj99OTELCxa';

  const recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
  const recaptchaCheckbox = recaptchaFrame.locator('div.recaptcha-checkbox-border');
  
  await recaptchaCheckbox.waitFor({ state: 'visible', timeout: 10000 });
  await recaptchaCheckbox.click();
  
  // Forcefully inject your secret key into the hidden reCAPTCHA response field.
  // This tricks the frontend UI into unlocking the Submit button.
  await page.evaluate((secret) => {
    const responseField = document.querySelector('#g-recaptcha-response');
    if (responseField) {
      responseField.innerHTML = secret;
    }
  }, SECRET_KEY);

  await page.waitForTimeout(2000);

  // 4. Submit Application
  const submitBtn = page.locator('#submit-application');
  await submitBtn.evaluate(node => node.removeAttribute('disabled'));
  
  // Force the click to bypass the reCAPTCHA overlay intercepting the pointer
  await submitBtn.click({ force: true });  
  // Wait a few seconds for the success page to load before the test ends
  await page.waitForTimeout(3000); 
});