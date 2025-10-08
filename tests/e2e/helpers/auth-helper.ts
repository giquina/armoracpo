import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

export class AuthHelper {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.page.click('button:has-text("SIGN IN")');
    await this.page.waitForURL('**/login');

    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  async loginAsCPO() {
    await this.login(TEST_USERS.cpo.email, TEST_USERS.cpo.password);
  }

  async loginAsAdmin() {
    await this.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  }

  async signup(email: string, password: string, fullName: string, siaNumber: string) {
    await this.page.click('button:has-text("SIGN UP")');
    await this.page.waitForURL('**/signup');

    await this.page.fill('input[name="fullName"]', fullName);
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="siaNumber"]', siaNumber);

    await this.page.click('button[type="submit"]');

    // Wait for verification message or redirect
    await expect(this.page.getByText(/verify your email|check your inbox/i)).toBeVisible();
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('button:has-text("Logout")');
    await this.page.waitForURL('/');
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
}
