import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/WeddingPlan/);
  });

  test('hero section has "WeddingPlan" text', async ({ page }) => {
    const hero = page.locator('header');
    await expect(hero.locator('h1')).toContainText('WeddingPlan');
  });

  test('feature cards are visible (6 features)', async ({ page }) => {
    // The features section contains 6 cards in a grid
    const featureCards = page.locator('.grid .bg-white\\/80');
    await expect(featureCards).toHaveCount(6);

    // Verify some feature titles are visible
    await expect(page.getByText('100+プリセットタスク')).toBeVisible();
    await expect(page.getByText('タイムライン管理')).toBeVisible();
    await expect(page.getByText('予算追跡')).toBeVisible();
    await expect(page.getByText('婚前契約チェックリスト')).toBeVisible();
    await expect(page.getByText('オフライン対応')).toBeVisible();
    await expect(page.getByText('日英バイリンガル')).toBeVisible();
  });

  test('CTA buttons link to /dashboard and /tasks', async ({ page }) => {
    const dashboardLink = page.getByRole('link', { name: '無料で始める' });
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const tasksLink = page.getByRole('link', { name: 'タスクを見る' });
    await expect(tasksLink).toBeVisible();
    await expect(tasksLink).toHaveAttribute('href', '/tasks');
  });

  test('timeline preview section shows 10 phases', async ({ page }) => {
    await expect(page.getByText('10フェーズのタイムライン')).toBeVisible();

    // Each phase has a numbered circle (1-10) and a label
    const phaseLabels = [
      '婚約準備', '情報収集', '式場決定', '詳細計画', '本格準備',
      '詰め作業', '最終確認', '直前準備', '挙式当日', '式後手続き',
    ];

    for (const label of phaseLabels) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test('footer is visible', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('WeddingPlan MVP v0.1.0');
    await expect(footer).toContainText('Made with');
  });
});
