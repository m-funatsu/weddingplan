import { test, expect } from '@playwright/test';
import {
  calculateOverallProgress,
  calculateDeadline,
  formatCurrency,
  getCurrentPhase,
} from '../src/lib/calculations';
import type { WeddingTask, TaskStatus, CategoryId, PhaseId } from '../src/types/index';

/**
 * Helper to create a minimal WeddingTask stub for testing.
 */
function createTask(overrides: Partial<WeddingTask> = {}): WeddingTask {
  return {
    id: overrides.id ?? 'test-1',
    taskId: overrides.taskId ?? 'task-1',
    categoryId: overrides.categoryId ?? 'pre_marriage',
    phaseId: overrides.phaseId ?? 'phase_01',
    name: overrides.name ?? 'Test Task',
    description: overrides.description ?? '',
    status: overrides.status ?? 'pending',
    recommendedTiming: overrides.recommendedTiming ?? '',
    monthsBefore: overrides.monthsBefore ?? 12,
    calculatedDeadline: overrides.calculatedDeadline ?? null,
    subtasks: overrides.subtasks ?? [],
    notes: overrides.notes ?? [],
    budgetEstimateMin: overrides.budgetEstimateMin ?? 0,
    budgetEstimateMax: overrides.budgetEstimateMax ?? 0,
    actualCost: overrides.actualCost ?? null,
    memo: overrides.memo ?? '',
    completedAt: overrides.completedAt ?? null,
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  };
}

test.describe('calculateOverallProgress', () => {
  test('empty array returns 0', () => {
    const result = calculateOverallProgress([]);
    expect(result).toBe(0);
  });

  test('all completed returns 100', () => {
    const tasks = [
      createTask({ id: '1', status: 'completed' }),
      createTask({ id: '2', status: 'completed' }),
      createTask({ id: '3', status: 'completed' }),
    ];
    const result = calculateOverallProgress(tasks);
    expect(result).toBe(100);
  });

  test('mixed statuses calculates correctly', () => {
    const tasks = [
      createTask({ id: '1', status: 'completed' }),
      createTask({ id: '2', status: 'pending' }),
      createTask({ id: '3', status: 'in_progress' }),
      createTask({ id: '4', status: 'completed' }),
    ];
    // 2 completed out of 4 eligible = 50%
    const result = calculateOverallProgress(tasks);
    expect(result).toBe(50);
  });

  test('skipped tasks excluded from calculation', () => {
    const tasks = [
      createTask({ id: '1', status: 'completed' }),
      createTask({ id: '2', status: 'skipped' }),
      createTask({ id: '3', status: 'pending' }),
    ];
    // Eligible: completed + pending = 2. Completed: 1. Result: 50%
    const result = calculateOverallProgress(tasks);
    expect(result).toBe(50);
  });
});

test.describe('calculateDeadline', () => {
  test('correct date subtraction', () => {
    // Wedding date is 2026-12-25, monthsBefore is 6
    // Should return 2026-06-25
    const result = calculateDeadline('2026-12-25', 6);
    expect(result).toBe('2026-06-25');
  });

  test('subtracting months that cross year boundary', () => {
    // Wedding date is 2026-03-15, monthsBefore is 6
    // Should return 2025-09-15
    const result = calculateDeadline('2026-03-15', 6);
    expect(result).toBe('2025-09-15');
  });

  test('subtracting 0 months returns same date', () => {
    const result = calculateDeadline('2026-10-10', 0);
    expect(result).toBe('2026-10-10');
  });
});

test.describe('formatCurrency', () => {
  test('formats JPY correctly with yen sign', () => {
    const result = formatCurrency(3500000);
    // Should contain the yen sign and formatted number
    expect(result).toContain('3,500,000');
    // The Intl formatter for ja-JP JPY produces a yen sign
    expect(result).toMatch(/[¥￥]/);
  });

  test('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  test('formats small amounts correctly', () => {
    const result = formatCurrency(500);
    expect(result).toContain('500');
  });

  test('rounds decimal amounts', () => {
    const result = formatCurrency(1234.56);
    // JPY has no decimal places, should be rounded to 1,235
    expect(result).toContain('1,235');
  });
});

test.describe('getCurrentPhase', () => {
  test('null weddingDate returns phase_01', () => {
    const result = getCurrentPhase(null);
    expect(result).toBe('phase_01');
  });

  test('future date far away returns phase_01', () => {
    // Set wedding date to 2+ years from now
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const dateStr = futureDate.toISOString().split('T')[0];

    const result = getCurrentPhase(dateStr);
    expect(result).toBe('phase_01');
  });

  test('past date returns phase_10', () => {
    // Set wedding date to well in the past
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    const dateStr = pastDate.toISOString().split('T')[0];

    const result = getCurrentPhase(dateStr);
    expect(result).toBe('phase_10');
  });

  test('wedding in 5 months returns phase_05', () => {
    // getCurrentPhase: monthsUntil > 4 returns phase_05
    // Set wedding date ~5 months from now
    const now = new Date();
    const wedding = new Date(now.getFullYear(), now.getMonth() + 5, now.getDate() + 15);
    const dateStr = wedding.toISOString().split('T')[0];

    const result = getCurrentPhase(dateStr);
    expect(result).toBe('phase_05');
  });

  test('wedding in 3 months returns phase_06', () => {
    // getCurrentPhase: monthsUntil > 2 returns phase_06
    const now = new Date();
    const wedding = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate() + 15);
    const dateStr = wedding.toISOString().split('T')[0];

    const result = getCurrentPhase(dateStr);
    expect(result).toBe('phase_06');
  });
});
