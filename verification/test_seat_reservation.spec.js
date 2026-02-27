
import { test, expect } from '@playwright/test';

test('Verify SeatReservation page', async ({ page }) => {
  // Go to the reservation page
  await page.goto('http://localhost:5173/reservation');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Verify the title
  await expect(page.getByRole('heading', { name: '座位预约' })).toBeVisible();

  // Verify the date input is present
  await expect(page.getByLabel('选择日期')).toBeVisible();

  // Verify the room select is present
  await expect(page.getByLabel('选择房间')).toBeVisible();

  // Select a room (assuming there is at least one room)
  const roomSelect = page.getByLabel('选择房间');
  await roomSelect.selectOption({ index: 1 });

  // Wait for seats to render
  await expect(page.locator('.seat-map')).toBeVisible();
  await expect(page.locator('.seat-item').first()).toBeVisible();

  // Take a screenshot
  await page.screenshot({ path: 'verification/seat-reservation.png' });
});
