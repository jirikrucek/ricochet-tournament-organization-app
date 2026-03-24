import { test, expect } from '@playwright/test';

test('changes the UI language from the selector', async ({ page }) => {
    await page.goto('/live');

    await expect(page.getByRole('link', { name: 'Matches' })).toBeVisible();

    await page.getByRole('button', { name: 'Select Language' }).click();
    await page.getByRole('button', { name: 'Polski' }).click();

    await expect(page.getByRole('link', { name: 'Mecze' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Matches' })).toHaveCount(0);
});