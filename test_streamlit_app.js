// @ts-check
const { chromium } = require('@playwright/test');

/**
 * Simple script to test the Streamlit app in production
 * Run with: node test_streamlit_app.js
 */
async function testStreamlitApp() {
  console.log('Starting test of Streamlit app at https://csrgenerator.streamlit.app/');

  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Homepage loads correctly
    console.log('Test 1: Checking if homepage loads correctly...');
    await page.goto('https://csrgenerator.streamlit.app/');
    await page.waitForLoadState('networkidle');

    // Wait for Streamlit to fully load (look for the sidebar)
    await page.waitForSelector('[data-testid="stSidebar"]', { timeout: 60000 });
    console.log('✅ Homepage loaded successfully');

    // Take a screenshot
    await page.screenshot({ path: 'streamlit_homepage.png' });
    console.log('Screenshot saved as streamlit_homepage.png');

    // Check if the sidebar navigation is working
    console.log('Test 2: Checking sidebar navigation...');

    // Check if the sidebar contains the expected options
    const sidebarText = await page.locator('[data-testid="stSidebar"]').textContent();
    console.log('Sidebar content:', sidebarText);

    // Check if the Generator option is available in the sidebar
    const hasGenerator = sidebarText.includes('Generator');
    console.log(hasGenerator ? '✅ Generator option is available' : '❌ Generator option is not available');

    // Check if the Validator option is available in the sidebar
    const hasValidator = sidebarText.includes('Validator');
    console.log(hasValidator ? '✅ Validator option is available' : '❌ Validator option is not available');

    // Navigate to Generator page using the sidebar radio button
    console.log('Test 3: Navigating to Generator page...');

    // Find and click the Generator radio button in the sidebar
    await page.locator('[data-testid="stSidebar"]').getByText('Generator').click();
    await page.waitForTimeout(5000); // Wait for navigation

    // Take a screenshot of the Generator page
    await page.screenshot({ path: 'streamlit_generator.png' });
    console.log('Screenshot saved as streamlit_generator.png');

    // Check if we can see the Generator form
    const mainContent = await page.locator('[data-testid="stAppViewContainer"]').textContent();
    const hasGeneratorTitle = mainContent.includes('CSR Generator');
    console.log(hasGeneratorTitle ? '✅ Generator page loaded successfully' : '❌ Generator page failed to load');

    // Navigate to Validator page using the sidebar radio button
    console.log('Test 4: Navigating to Validator page...');

    // Find and click the Validator radio button in the sidebar
    await page.locator('[data-testid="stSidebar"]').getByText('Validator').click();
    await page.waitForTimeout(5000); // Wait for navigation

    // Take a screenshot of the Validator page
    await page.screenshot({ path: 'streamlit_validator.png' });
    console.log('Screenshot saved as streamlit_validator.png');

    // Check if we can see the Validator form
    const validatorContent = await page.locator('[data-testid="stAppViewContainer"]').textContent();
    const hasValidatorTitle = validatorContent.includes('CSR Validator');
    console.log(hasValidatorTitle ? '✅ Validator page loaded successfully' : '❌ Validator page failed to load');

    console.log('All tests completed!');

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'streamlit_error.png' });
    console.log('Error screenshot saved as streamlit_error.png');
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the tests
testStreamlitApp().catch(console.error);
