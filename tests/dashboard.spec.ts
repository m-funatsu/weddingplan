import { test, expect } from '@playwright/test';

/**
 * Helper: navigate to a page and handle guest mode authentication.
 * If the auth form appears, click the guest mode button to skip login.
 */
async function navigateWithGuestMode(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);

  // Check if the auth form appears by looking for the guest mode button text
  const guestButton = page.getByText('ログインせずに使う（ゲストモード）');
  try {
    await guestButton.waitFor({ state: 'visible', timeout: 5000 });
    await guestButton.click();
  } catch {
    // Auth form did not appear - already authenticated or guest mode active
  }

  // Wait for the loading spinner to disappear and content to load
  await page.waitForLoadState('networkidle');
}

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateWithGuestMode(page, '/dashboard');
  });

  test('stat cards are visible (4 stats)', async ({ page }) => {
    // Wait for the dashboard heading to confirm page loaded
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

    // The dashboard has 4 stat cards: Overall Progress, Budget Used, Estimate Avg, Overdue
    await expect(page.getByText('全体進捗')).toBeVisible();
    await expect(page.getByText('予算消化')).toBeVisible();
    await expect(page.getByText('見積平均')).toBeVisible();
    await expect(page.getByText('期限超過')).toBeVisible();

    // Verify the stat cards grid exists with 4 children
    const statGrid = page.locator('.grid.grid-cols-2.lg\\:grid-cols-4');
    await expect(statGrid).toBeVisible();
    const statCards = statGrid.locator('> *');
    await expect(statCards).toHaveCount(4);
  });

  test('timeline view is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();

    // The TimelineView component is rendered in the left column
    // It shows phase information in the grid layout
    const timelineContainer = page.locator('.lg\\:col-span-1');
    await expect(timelineContainer).toBeVisible();
  });

  test('category progress section exists', async ({ page }) => {
    // The category progress section has the heading "カテゴリ別進捗"
    await expect(page.getByText('カテゴリ別進捗')).toBeVisible();

    // Verify that category icons/labels are present (at least a few)
    await expect(page.getByText('婚前の準備')).toBeVisible();
    await expect(page.getByText('式場・プランニング')).toBeVisible();
    await expect(page.getByText('ゲスト関連')).toBeVisible();
  });

  test('current phase info is shown', async ({ page }) => {
    // The current phase section has the heading "現在のフェーズ"
    await expect(page.getByText('現在のフェーズ')).toBeVisible();

    // It should display one of the phase labels
    const phaseSection = page.locator('.bg-rose-50.border-rose-100');
    await expect(phaseSection).toBeVisible();

    // The phase section contains a phase label and month range
    const phaseText = await phaseSection.textContent();
    expect(phaseText).toBeTruthy();
    expect(phaseText!.length).toBeGreaterThan(0);
  });
});
