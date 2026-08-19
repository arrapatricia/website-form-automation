import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('WPS Website - GTP Application Process', async ({ page }) => {
  // --- DYNAMIC FAKER VARIABLES ---
  
  // Keep travel dates static so we don't accidentally pick past dates or break business logic
  const DEPT_MONTH = '12';
  const DEPT_DAY = '25';
  const DEPT_YEAR = '2024';
  
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
  const MOBILE_NUM = '09' + faker.string.numeric(9); // Ensures an 11-digit PH mobile number
  
  const EXECUTIVE_BUTTON = '#executive-plan-btn'; // Replace with actual locator
  // ------------------------------------------------------------------------------------------

  // Open Website - GTP
  await page.goto('https://www.yourtravelinsurance.ph/online-applications#'); 

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

  await page.locator('button[data-nextsection="passenger-section"]').click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'travel_details.png' });

  // ==========================================
  // STEP 2: Fill-Out Traveller Details
  // ==========================================
  await page.waitForTimeout(10000);

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
  // STEP 3: Select Plan
  // ==========================================
  await page.waitForTimeout(10000);
  
  const executivePlanBtn = page.locator(EXECUTIVE_BUTTON);
  await executivePlanBtn.scrollIntoViewIfNeeded();
  await executivePlanBtn.click();
  console.log('Successfully clicked the Select button for the Executive plan!');

  // ==========================================
  // STEP 4: Review Page & Submission
  // ==========================================
  
  const dpaCheckbox = page.locator('#dpa_all');
  await dpaCheckbox.scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  await dpaCheckbox.click();

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

  const recaptchaFrame = page.frameLocator('iframe[title="reCAPTCHA"]');
  const recaptchaCheckbox = recaptchaFrame.locator('div.recaptcha-checkbox-border');
  
  await recaptchaCheckbox.waitFor({ state: 'visible', timeout: 10000 });
  await recaptchaCheckbox.click();
  await page.waitForTimeout(5000); 

  const submitBtn = page.locator('#submit-application');
  await submitBtn.waitFor({ state: 'attached', timeout: 10000 });
  await submitBtn.click();
});