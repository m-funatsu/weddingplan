import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to a page and handle guest mode authentication.
 */
async function navigateWithGuestMode(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);

  const guestButton = page.getByText('ログインせずに使う（ゲストモード）');
  try {
    await guestButton.waitFor({ state: 'visible', timeout: 5000 });
    await guestButton.click();
  } catch {
    // Auth form did not appear
  }

  await page.waitForLoadState('networkidle');
}

test.describe('Budget Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateWithGuestMode(page, '/budget');
  });

  test('budget overview section exists', async ({ page }) => {
    // Wait for the page heading
    await expect(page.getByRole('heading', { name: '予算管理' })).toBeVisible();

    // The BudgetChart component renders a "予算概要" (Budget Overview) section
    await expect(page.getByText('予算概要')).toBeVisible();

    // Verify the overview contains the three metrics
    await expect(page.getByText('予算総額')).toBeVisible();
    await expect(page.getByText('見積平均')).toBeVisible();
    await expect(page.getByText('実費合計')).toBeVisible();

    // Verify the budget usage bar label exists
    await expect(page.getByText('予算消化率')).toBeVisible();
  });

  test('category breakdown section exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '予算管理' })).toBeVisible();

    // The "カテゴリ別内訳" (Category Breakdown) section with donut chart
    await expect(page.getByText('カテゴリ別内訳')).toBeVisible();

    // The donut chart center label shows "見積合計"
    await expect(page.getByText('見積合計')).toBeVisible();
  });

  test('estimate vs actual table exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '予算管理' })).toBeVisible();

    // The "見積 vs 実費" (Estimate vs Actual) section
    await expect(page.getByText('見積 vs 実費')).toBeVisible();

    // Verify the table headers exist
    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(page.getByRole('columnheader', { name: 'カテゴリ' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '見積' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '実費' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '差額' })).toBeVisible();

    // Verify the table footer total row exists
    const footerRow = table.locator('tfoot tr');
    await expect(footerRow).toBeVisible();
    await expect(footerRow).toContainText('合計');
  });
});
