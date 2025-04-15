// @ts-check
const { chromium } = require('@playwright/test');

/**
 * Simple script to take screenshots of the Streamlit app
 * Run with: node take_screenshots.js
 */
async function takeScreenshots() {
  console.log('Taking screenshots of Streamlit app at https://csrgenerator.streamlit.app/');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Homepage
    console.log('Taking screenshot of homepage...');
    await page.goto('https://csrgenerator.streamlit.app/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000); // Wait 10 seconds for the page to fully load
    await page.screenshot({ path: 'streamlit_homepage.png', fullPage: true });
    console.log('Screenshot saved as streamlit_homepage.png');
    
    // Wait for user to manually check the page
    console.log('Please check the Streamlit app in the browser.');
    console.log('Press Enter to continue...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run the script
takeScreenshots().catch(console.error);
