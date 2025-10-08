import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { TEST_USERS } from './fixtures/test-data';

test.describe('Authentication', () => {
  let auth: AuthHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AuthHelper(page);
    await auth.goto();
  });

  test('should display landing page correctly', async ({ page }) => {
    await expect(page.getByText('ARMORA')).toBeVisible();
    await expect(page.getByText('For Professional CPOs')).toBeVisible();
    await expect(page.getByText('Verified SIA Jobs')).toBeVisible();
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SIGN UP' })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('button:has-text("SIGN IN")');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('button:has-text("SIGN UP")');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await auth.loginAsCPO();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.click('button:has-text("SIGN IN")');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/invalid (login )?credentials/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button:has-text("SIGN IN")');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/email is required|please enter your email/i)).toBeVisible();
    await expect(page.getByText(/password is required|please enter your password/i)).toBeVisible();
  });

  test('should signup with valid details', async ({ page }) => {
    const newUser = TEST_USERS.newUser;
    await auth.signup(
      newUser.email,
      newUser.password,
      newUser.fullName,
      newUser.siaNumber
    );

    await expect(page.getByText(/verify your email|check your inbox/i)).toBeVisible();
  });

  test('should show error when signing up with existing email', async ({ page }) => {
    await auth.signup(
      TEST_USERS.cpo.email,
      TEST_USERS.cpo.password,
      TEST_USERS.cpo.fullName,
      TEST_USERS.cpo.siaNumber
    );

    await expect(page.getByText(/email already (exists|registered)/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await auth.loginAsCPO();
    await auth.logout();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'SIGN IN' })).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should persist session after page reload', async ({ page }) => {
    await auth.loginAsCPO();
    await page.reload();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.click('button:has-text("SIGN IN")');
    await page.click('a:has-text("Forgot Password")');

    await expect(page).toHaveURL(/.*reset-password/);
    await page.fill('input[type="email"]', TEST_USERS.cpo.email);
    await page.click('button[type="submit"]');

    await expect(page.getByText(/check your email|reset link sent/i)).toBeVisible();
  });
});
