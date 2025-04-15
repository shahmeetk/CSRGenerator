// @ts-check
const { test, expect } = require('@playwright/test');

test('homepage has correct title and links', async ({ page }) => {
  await page.goto('/');

  // Check title
  await expect(page).toHaveTitle(/CSR Generator/);

  // Check for the app bar
  await expect(page.locator('header')).toBeVisible();

  // Check main content
  await expect(page.locator('h4').first()).toContainText('CSR Generator Tool');

  // Check navigation to Generator page
  await page.locator('button:has-text("Generator")').click();
  await expect(page.url()).toContain('/generator');

  // Check navigation to Validator page
  await page.locator('button:has-text("Validator")').click();
  await expect(page.url()).toContain('/validator');

  // Navigate back to home
  await page.locator('button:has-text("Home")').click();
  await expect(page.url()).not.toContain('/generator');
  await expect(page.url()).not.toContain('/validator');
});

test('generator page functionality', async ({ page }) => {
  await page.goto('/generator');

  // Check for the form
  await expect(page.locator('form')).toBeVisible();

  // Fill the form with required fields
  await page.locator('#service').click();
  await page.locator('li[data-value="NI-3DS"]').click();

  await page.locator('#commonName').fill('test.example.com');
  await page.locator('#organization').fill('Test Organization');
  await page.locator('#country').fill('US');

  // Submit the form
  await page.locator('button[type="submit"]').click();

  // Wait for the response (with longer timeout)
  await page.waitForSelector('pre', { timeout: 30000 });

  // Check if CSR and private key are displayed
  const csrPre = await page.locator('pre').first();
  const privateKeyPre = await page.locator('pre').nth(1);

  await expect(csrPre).toContainText('-----BEGIN CERTIFICATE REQUEST-----');
  await expect(privateKeyPre).toContainText('-----BEGIN PRIVATE KEY-----');
});

test('validator page functionality', async ({ page }) => {
  // First generate a CSR to validate
  await page.goto('/generator');

  // Fill the form with required fields
  await page.locator('#service').click();
  await page.locator('li[data-value="NI-3DS"]').click();

  await page.locator('#commonName').fill('test.example.com');
  await page.locator('#organization').fill('Test Organization');
  await page.locator('#country').fill('US');

  // Submit the form
  await page.locator('button[type="submit"]').click();

  // Wait for the response (with longer timeout)
  await page.waitForSelector('pre', { timeout: 30000 });

  // Get the generated CSR
  const csrContent = await page.locator('pre').first().textContent();

  // Navigate to validator page
  await page.goto('/validator');

  // Paste the CSR
  await page.locator('textarea').fill(csrContent);

  // Submit for validation
  await page.locator('button[type="submit"]').click();

  // Check validation results (with longer timeout)
  await page.waitForSelector('h6:has-text("Subject Information")', { timeout: 30000 });
  await expect(page.locator('h6:has-text("Subject Information")')).toBeVisible();
  await expect(page.locator('h6:has-text("Technical Details")')).toBeVisible();
});
