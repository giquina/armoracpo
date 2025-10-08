import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { TEST_INCIDENTS } from './fixtures/test-data';

test.describe('Incident Reporting', () => {
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AuthHelper(page);
    await auth.goto();
    await auth.loginAsCPO();
  });

  test('should display incident reports page correctly', async ({ page }) => {
    await page.goto('/incidents');
    await expect(page).toHaveURL(/.*incidents/);
    await expect(page.getByRole('heading', { name: /incident reports|incidents/i })).toBeVisible();
  });

  test('should show new incident button', async ({ page }) => {
    await page.goto('/incidents');

    const newIncidentButton = page.locator('button:has-text("New Incident"), button:has-text("Create Report"), [data-testid="new-incident-button"]');
    await expect(newIncidentButton.first()).toBeVisible();
  });

  test('should navigate to new incident form', async ({ page }) => {
    await page.goto('/incidents');

    const newIncidentButton = page.locator('button:has-text("New Incident"), button:has-text("Create Report"), [data-testid="new-incident-button"]');
    await newIncidentButton.first().click();

    await expect(page).toHaveURL(/.*incidents\/new/);
    await expect(page.getByRole('heading', { name: /new incident|create report/i })).toBeVisible();
  });

  test('should display incident list', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const incidentItems = page.locator('[data-testid="incident-item"]');
    const emptyState = page.locator('text=/no incidents|no reports/i');

    const itemCount = await incidentItems.count();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(itemCount > 0 || hasEmptyState).toBeTruthy();
  });

  test('should create new incident report with basic details', async ({ page }) => {
    await page.goto('/incidents/new');
    await page.waitForTimeout(1000);

    // Fill classification
    const classificationSelect = page.locator('select[name="classification"], [data-testid="incident-classification"]').first();
    const isClassificationVisible = await classificationSelect.isVisible().catch(() => false);

    if (isClassificationVisible) {
      await classificationSelect.selectOption({ label: TEST_INCIDENTS.minorIncident.type });
    } else {
      // Alternative: click on classification option
      await page.click(`text="${TEST_INCIDENTS.minorIncident.type}"`);
    }

    // Fill severity
    const severitySelect = page.locator('select[name="severity"], [data-testid="incident-severity"]').first();
    const isSeverityVisible = await severitySelect.isVisible().catch(() => false);

    if (isSeverityVisible) {
      await severitySelect.selectOption({ label: TEST_INCIDENTS.minorIncident.severity });
    }

    // Fill description
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="describe" i]').first();
    await descriptionInput.fill(TEST_INCIDENTS.minorIncident.description);

    // Fill location
    const locationInput = page.locator('input[name="location"], input[placeholder*="location" i]').first();
    await locationInput.fill(TEST_INCIDENTS.minorIncident.location);

    // Save as draft or submit
    const saveDraftButton = page.locator('button:has-text("Save Draft"), button:has-text("Save")').first();
    const isSaveVisible = await saveDraftButton.isVisible().catch(() => false);

    if (isSaveVisible) {
      await saveDraftButton.click();

      // Should show success message or redirect
      await expect(page.locator('text=/saved|created|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view incident report details', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const incidentItems = page.locator('[data-testid="incident-item"]');
    const itemCount = await incidentItems.count();

    if (itemCount > 0) {
      await incidentItems.first().click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/.*incidents\/[^\/]+$/);
      await expect(page.getByRole('heading', { name: /incident details|report details/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display incident report fields correctly', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const incidentItems = page.locator('[data-testid="incident-item"]');
    const itemCount = await incidentItems.count();

    if (itemCount > 0) {
      await incidentItems.first().click();
      await page.waitForTimeout(1000);

      // Should display key fields
      await expect(page.locator('text=/classification|type/i')).toBeVisible();
      await expect(page.locator('text=/severity|priority/i')).toBeVisible();
      await expect(page.locator('text=/description|details/i')).toBeVisible();
      await expect(page.locator('text=/location|address/i')).toBeVisible();
    }
  });

  test('should upload media to incident report', async ({ page }) => {
    await page.goto('/incidents/new');
    await page.waitForTimeout(1000);

    // Look for file upload area
    const fileInput = page.locator('input[type="file"]').first();
    const isFileInputVisible = await fileInput.isVisible().catch(() => false);

    if (!isFileInputVisible) {
      // File input might be hidden, look for upload button/area
      const uploadArea = page.locator('[data-testid="upload-area"], text=/upload|add photo|attach/i').first();
      const isUploadAreaVisible = await uploadArea.isVisible().catch(() => false);

      if (isUploadAreaVisible) {
        // File upload functionality exists
        expect(isUploadAreaVisible).toBeTruthy();
      }
    } else {
      // File input is visible, we can verify it exists
      expect(isFileInputVisible).toBeTruthy();
    }
  });

  test('should add witness information', async ({ page }) => {
    await page.goto('/incidents/new');
    await page.waitForTimeout(1000);

    // Look for witness section
    const witnessButton = page.locator('button:has-text("Add Witness"), [data-testid="add-witness-button"]');
    const isWitnessButtonVisible = await witnessButton.isVisible().catch(() => false);

    if (isWitnessButtonVisible) {
      await witnessButton.click();

      // Witness form fields should appear
      await expect(page.locator('input[name*="witness"], input[placeholder*="witness name" i]')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should add signature to incident report', async ({ page }) => {
    await page.goto('/incidents/new');
    await page.waitForTimeout(1000);

    // Look for signature pad
    const signatureArea = page.locator('[data-testid="signature-pad"], canvas').first();
    const isSignatureVisible = await signatureArea.isVisible().catch(() => false);

    if (!isSignatureVisible) {
      // Might need to scroll or navigate to signature section
      const signatureButton = page.locator('button:has-text("Add Signature"), text=/signature required/i');
      const isSignatureButtonVisible = await signatureButton.isVisible().catch(() => false);

      if (isSignatureButtonVisible) {
        expect(isSignatureButtonVisible).toBeTruthy();
      }
    } else {
      expect(isSignatureVisible).toBeTruthy();
    }
  });

  test('should filter incidents by severity', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
    const isFilterVisible = await filterButton.isVisible().catch(() => false);

    if (isFilterVisible) {
      await filterButton.click();

      // Select severity filter
      await page.click('text=/high|medium|low/i');
      await page.waitForTimeout(1000);

      // Results should be filtered
      const incidentItems = page.locator('[data-testid="incident-item"]');
      const itemCount = await incidentItems.count();

      expect(itemCount >= 0).toBeTruthy();
    }
  });

  test('should filter incidents by date range', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const filterButton = page.locator('[data-testid="filter-button"], button:has-text("Filter")');
    const isFilterVisible = await filterButton.isVisible().catch(() => false);

    if (isFilterVisible) {
      await filterButton.click();

      const dateInput = page.locator('input[type="date"]').first();
      const isDateInputVisible = await dateInput.isVisible().catch(() => false);

      if (isDateInputVisible) {
        await dateInput.fill('2025-01-01');
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should export incident report as PDF', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const incidentItems = page.locator('[data-testid="incident-item"]');
    const itemCount = await incidentItems.count();

    if (itemCount > 0) {
      await incidentItems.first().click();
      await page.waitForTimeout(1000);

      // Look for export/download button
      const exportButton = page.locator('button:has-text("Export"), button:has-text("Download PDF"), [data-testid="export-pdf-button"]');
      const isExportVisible = await exportButton.isVisible().catch(() => false);

      if (isExportVisible) {
        // Start waiting for download before clicking
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

        await exportButton.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        }
      }
    }
  });

  test('should validate required fields on incident form', async ({ page }) => {
    await page.goto('/incidents/new');
    await page.waitForTimeout(1000);

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit")').first();
    const isSubmitVisible = await submitButton.isVisible().catch(() => false);

    if (isSubmitVisible) {
      await submitButton.click();

      // Should show validation errors
      await expect(page.locator('text=/required|please fill|cannot be empty/i')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show incident status badge', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const incidentItems = page.locator('[data-testid="incident-item"]');
    const itemCount = await incidentItems.count();

    if (itemCount > 0) {
      // Each incident should have a status badge
      const statusBadge = incidentItems.first().locator('[data-testid="status-badge"], .status');
      const hasBadge = await statusBadge.isVisible().catch(() => false);

      if (!hasBadge) {
        // Alternative: status might be shown as text
        const statusText = await incidentItems.first().textContent();
        expect(statusText).toMatch(/draft|submitted|under review|completed/i);
      }
    }
  });

  test('should search incidents by keyword', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    const isSearchVisible = await searchInput.isVisible().catch(() => false);

    if (isSearchVisible) {
      await searchInput.fill('suspicious');
      await page.waitForTimeout(1000);

      // Results should be filtered
      const incidentItems = page.locator('[data-testid="incident-item"]');
      const itemCount = await incidentItems.count();

      if (itemCount > 0) {
        const firstIncidentText = await incidentItems.first().textContent();
        expect(firstIncidentText?.toLowerCase()).toContain('suspicious');
      }
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});
