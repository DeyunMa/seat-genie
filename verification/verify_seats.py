from playwright.sync_api import sync_playwright

def verify_seats():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to login...")
            page.goto("http://localhost:5173/login")

            # Login
            print("Logging in...")
            # Using placeholders or attributes found in Login.jsx
            page.fill('input[placeholder="请输入用户名"]', "admin")
            page.fill('input[placeholder="请输入密码"]', "admin123")
            page.click('button[type="submit"]')

            # Wait for navigation
            page.wait_for_url("**/dashboard")
            print("Logged in successfully.")

            # Navigate to Seat Management
            print("Navigating to Seat Management...")
            page.goto("http://localhost:5173/seats")

            # Wait for seat list to load
            # Looking for a seat card or the header
            page.wait_for_selector(".seat-card", timeout=10000)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/seats_optimized.png", full_page=True)
            print("Screenshot saved to verification/seats_optimized.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_seats()
