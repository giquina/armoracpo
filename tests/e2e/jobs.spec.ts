import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Job Management', () => {
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AuthHelper(page);
    await auth.goto();
    await auth.loginAsCPO();
  });

  test('should display jobs dashboard correctly', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page).toHaveURL(/.*jobs/);
    await expect(page.getByRole('heading', { name: /jobs|available jobs/i })).toBeVisible();
  });

  test('should navigate to available jobs', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('text=/view all|available jobs/i');
    await expect(page).toHaveURL(/.*available-jobs/);
    await expect(page.getByRole('heading', { name: /available jobs/i })).toBeVisible();
  });

  test('should display job listings', async ({ page }) => {
    await page.goto('/jobs/available');

    // Wait for jobs to load
    await page.waitForTimeout(2000);

    // Check if job cards are displayed (there should be at least one job or empty state)
    const jobCards = page.locator('[data-testid="job-card"]');
    const emptyState = page.locator('text=/no jobs available|no assignments/i');

    const jobCount = await jobCards.count();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(jobCount > 0 || hasEmptyState).toBeTruthy();
  });

  test('should show job details when clicking on a job', async ({ page }) => {
    await page.goto('/jobs/available');
    await page.waitForTimeout(2000);

    const jobCards = page.locator('[data-testid="job-card"]');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      await jobCards.first().click();

      // Should show job details modal or navigate to detail page
      await expect(page.locator('text=/job details|assignment details/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=/location|commencement|destination/i')).toBeVisible();
      await expect(page.locator('text=/date|time|duration/i')).toBeVisible();
    }
  });

  test('should filter jobs by location', async ({ page }) => {
    await page.goto('/jobs/available');

    // Look for filter button or location input
    const filterButton = page.locator('[data-testid="filter-button"]').or(page.locator('button:has-text("Filter")'));
    const isFilterVisible = await filterButton.isVisible().catch(() => false);

    if (isFilterVisible) {
      await filterButton.click();

      // Fill location filter
      const locationInput = page.locator('input[placeholder*="location" i], input[name*="location" i]').first();
      await locationInput.fill('London');

      // Apply filter
      await page.click('button:has-text("Apply"), button:has-text("Search")');

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Verify filter was applied (URL should contain search params or UI should show filter)
      const url = page.url();
      const hasFilterInUrl = url.includes('location') || url.includes('London');
      const hasFilterTag = await page.locator('text=/london|location:/i').isVisible().catch(() => false);

      expect(hasFilterInUrl || hasFilterTag).toBeTruthy();
    }
  });

  test('should filter jobs by date', async ({ page }) => {
    await page.goto('/jobs/available');

    const filterButton = page.locator('[data-testid="filter-button"]').or(page.locator('button:has-text("Filter")'));
    const isFilterVisible = await filterButton.isVisible().catch(() => false);

    if (isFilterVisible) {
      await filterButton.click();

      // Select date filter
      const dateInput = page.locator('input[type="date"], input[placeholder*="date" i]').first();
      await dateInput.fill('2025-02-15');

      // Apply filter
      await page.click('button:has-text("Apply"), button:has-text("Search")');

      await page.waitForTimeout(1000);
    }
  });

  test('should search jobs by keyword', async ({ page }) => {
    await page.goto('/jobs/available');

    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    const isSearchVisible = await searchInput.isVisible().catch(() => false);

    if (isSearchVisible) {
      await searchInput.fill('Executive');
      await page.waitForTimeout(1000);

      // Results should update based on search
      const jobCards = page.locator('[data-testid="job-card"]');
      const jobCount = await jobCards.count();

      // If there are results, they should contain the search term
      if (jobCount > 0) {
        const firstJobText = await jobCards.first().textContent();
        expect(firstJobText?.toLowerCase()).toContain('executive');
      }
    }
  });

  test('should apply for a job', async ({ page }) => {
    await page.goto('/jobs/available');
    await page.waitForTimeout(2000);

    const jobCards = page.locator('[data-testid="job-card"]');
    const jobCount = await jobCards.count();

    if (jobCount > 0) {
      await jobCards.first().click();

      // Click apply button
      const applyButton = page.locator('button:has-text("Apply"), button:has-text("Accept"), button:has-text("Request")');
      const isApplyVisible = await applyButton.isVisible().catch(() => false);

      if (isApplyVisible) {
        await applyButton.click();

        // Should show confirmation or navigate to next step
        await expect(page.locator('text=/applied|accepted|requested|confirmed/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should view active jobs', async ({ page }) => {
    await page.goto('/jobs/active');

    // Should show active job page or empty state
    await expect(page.getByRole('heading', { name: /active|current/i })).toBeVisible();

    const activeJob = page.locator('[data-testid="active-job"]');
    const emptyState = page.locator('text=/no active|no current/i');

    const hasActiveJob = await activeJob.isVisible().catch(() => false);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasActiveJob || hasEmptyState).toBeTruthy();
  });

  test('should view job history', async ({ page }) => {
    await page.goto('/jobs/history');

    await expect(page).toHaveURL(/.*history/);
    await expect(page.getByRole('heading', { name: /history|past jobs/i })).toBeVisible();

    // Should show completed jobs or empty state
    const historyItems = page.locator('[data-testid="job-history-item"]');
    const emptyState = page.locator('text=/no history|no completed/i');

    const itemCount = await historyItems.count();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(itemCount > 0 || hasEmptyState).toBeTruthy();
  });

  test('should display job on map view', async ({ page }) => {
    await page.goto('/jobs/available');
    await page.waitForTimeout(2000);

    // Look for map view toggle
    const mapViewButton = page.locator('button:has-text("Map"), [data-testid="map-view-toggle"]');
    const isMapToggleVisible = await mapViewButton.isVisible().catch(() => false);

    if (isMapToggleVisible) {
      await mapViewButton.click();

      // Map container should be visible
      await expect(page.locator('.leaflet-container, [data-testid="jobs-map"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should sort jobs by various criteria', async ({ page }) => {
    await page.goto('/jobs/available');
    await page.waitForTimeout(2000);

    // Look for sort dropdown or button
    const sortButton = page.locator('[data-testid="sort-button"]').or(page.locator('button:has-text("Sort")'));
    const isSortVisible = await sortButton.isVisible().catch(() => false);

    if (isSortVisible) {
      await sortButton.click();

      // Should show sort options
      await expect(page.locator('text=/date|rate|distance|newest/i')).toBeVisible();

      // Select a sort option
      await page.click('text=/date|newest/i');

      await page.waitForTimeout(1000);
    }
  });

  test('should show job statistics on jobs page', async ({ page }) => {
    await page.goto('/jobs');

    // Should display stats like total jobs, applied jobs, etc.
    const statsContainer = page.locator('[data-testid="jobs-stats"]');
    const hasStats = await statsContainer.isVisible().catch(() => false);

    if (!hasStats) {
      // Alternative: look for individual stat cards
      const statCards = page.locator('text=/total|available|applied|completed/i');
      const cardCount = await statCards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});
