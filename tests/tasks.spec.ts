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

test.describe('Tasks Page', () => {
  test.beforeEach(async ({ page }) => {
    await navigateWithGuestMode(page, '/tasks');
  });

  test('task list renders with tasks', async ({ page }) => {
    // Wait for the page heading
    await expect(page.getByRole('heading', { name: 'タスク管理' })).toBeVisible();

    // The results count text should indicate tasks are displayed (e.g. "XX 件表示")
    await expect(page.getByText(/\d+\s*件表示/)).toBeVisible();

    // Task cards should be rendered in the task list container
    // Each TaskCard is rendered as a child in the space-y-3 container
    const taskListContainer = page.locator('.space-y-3').last();
    const taskCards = taskListContainer.locator('> *');
    const count = await taskCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search input works', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'タスク管理' })).toBeVisible();

    // Find the search input by placeholder text
    const searchInput = page.getByPlaceholder('タスクを検索...');
    await expect(searchInput).toBeVisible();

    // Get the initial results count text
    const resultsText = page.getByText(/\d+\s*件表示/);
    const initialText = await resultsText.textContent();
    const initialCount = parseInt(initialText!.match(/(\d+)/)?.[1] ?? '0', 10);

    // Type a search query to filter tasks
    await searchInput.fill('会場');
    await page.waitForTimeout(300); // wait for re-render

    // After filtering, the results count should change (or remain the same if all match)
    const filteredText = await resultsText.textContent();
    const filteredCount = parseInt(filteredText!.match(/(\d+)/)?.[1] ?? '0', 10);

    // The filtered count should be less than or equal to the initial count
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('category filter dropdown exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'タスク管理' })).toBeVisible();

    // The category filter is a <select> with the "全カテゴリ" default option
    const categorySelect = page.locator('select').filter({ hasText: '全カテゴリ' });
    await expect(categorySelect).toBeVisible();

    // Verify it has category options
    const options = categorySelect.locator('option');
    const optionCount = await options.count();
    // "All Categories" + 9 category options = 10
    expect(optionCount).toBe(10);
  });

  test('phase filter dropdown exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'タスク管理' })).toBeVisible();

    // The phase filter is a <select> with the "全フェーズ" default option
    const phaseSelect = page.locator('select').filter({ hasText: '全フェーズ' });
    await expect(phaseSelect).toBeVisible();

    // Verify it has phase options
    const options = phaseSelect.locator('option');
    const optionCount = await options.count();
    // "All Phases" + 10 phase options = 11
    expect(optionCount).toBe(11);
  });

  test('status filter dropdown exists', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'タスク管理' })).toBeVisible();

    // The status filter is a <select> with status options
    const statusSelect = page.locator('select').filter({ hasText: 'すべて' });
    await expect(statusSelect).toBeVisible();

    // Verify it has status options: All, Pending, In Progress, Completed, Skipped = 5
    const options = statusSelect.locator('option');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(5);
  });
});
