// @ts-check
const { test, expect } = require('@playwright/test');

test('homepage has correct title and links', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  
  // Check title
  await expect(page).toHaveTitle(/CSR Generator/);
  
  // Check navigation links
  await expect(page.locator('nav')).toContainText('Home');
  await expect(page.locator('nav')).toContainText('Generator');
  await expect(page.locator('nav')).toContainText('Validator');
  
  // Check main content
  await expect(page.locator('h1')).toContainText('CSR Generator Tool');
  
  // Check navigation to Generator page
  await page.click('text=Generator');
  await expect(page).toHaveURL(/.*\/generator/);
  await expect(page.locator('h1')).toContainText('CSR Generator');
  
  // Check navigation to Validator page
  await page.click('text=Validator');
  await expect(page).toHaveURL(/.*\/validator/);
  await expect(page.locator('h1')).toContainText('CSR Validator');
  
  // Navigate back to home
  await page.click('text=Home');
  await expect(page).toHaveURL(/.*\/$/);
});

test('generator page functionality', async ({ page }) => {
  await page.goto('http://localhost:3001/generator');
  
  // Check form elements
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('select[name="service"]')).toBeVisible();
  await expect(page.locator('select[name="environment"]')).toBeVisible();
  await expect(page.locator('input[name="organization"]')).toBeVisible();
  
  // Fill the form
  await page.selectOption('select[name="service"]', 'NI-3DS');
  await page.selectOption('select[name="environment"]', 'DEV');
  await page.fill('input[name="organization"]', 'Test Organization');
  await page.fill('input[name="country"]', 'US');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for the response
  await page.waitForSelector('textarea', { timeout: 10000 });
  
  // Check if CSR and private key are displayed
  const csrTextarea = await page.locator('textarea').first();
  const privateKeyTextarea = await page.locator('textarea').nth(1);
  
  await expect(csrTextarea).toContainText('-----BEGIN CERTIFICATE REQUEST-----');
  await expect(privateKeyTextarea).toContainText('-----BEGIN PRIVATE KEY-----');
});

test('validator page functionality', async ({ page }) => {
  // First generate a CSR to validate
  await page.goto('http://localhost:3001/generator');
  await page.selectOption('select[name="service"]', 'NI-3DS');
  await page.selectOption('select[name="environment"]', 'DEV');
  await page.fill('input[name="organization"]', 'Test Organization');
  await page.fill('input[name="country"]', 'US');
  await page.click('button[type="submit"]');
  await page.waitForSelector('textarea', { timeout: 10000 });
  
  // Get the generated CSR
  const csrContent = await page.locator('textarea').first().inputValue();
  
  // Navigate to validator page
  await page.goto('http://localhost:3001/validator');
  
  // Paste the CSR
  await page.fill('textarea', csrContent);
  
  // Submit for validation
  await page.click('button:has-text("Validate CSR")');
  
  // Check validation results
  await page.waitForSelector('.validation-results', { timeout: 10000 });
  await expect(page.locator('.validation-results')).toContainText('Subject Information');
  await expect(page.locator('.validation-results')).toContainText('Key Size');
  await expect(page.locator('.validation-results')).toContainText('Signature Algorithm');
});
