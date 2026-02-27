from playwright.sync_api import sync_playwright

def verify_seat_list():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the Seat Management page
        # Note: In a real app we might need to login first, but this is a dev environment
        # Assuming the app starts at the root and has navigation, or direct access

        try:
            # Go to home first
            page.goto("http://localhost:3000")

            # Wait for any loading
            page.wait_for_load_state("networkidle")

            # Take a screenshot of the dashboard/home
            page.screenshot(path="verification/dashboard.png")
            print("Dashboard screenshot taken")

            # Try to navigate to Seat Management if there's a link, or go directly
            # Based on file structure, it's likely /seat-management or similar
            # Let's try to find a link first

            # Use a more generic approach to find navigation
            # Assuming there is a sidebar or header with "座位管理" (Seat Management)
            try:
                page.get_by_text("座位管理").click()
                page.wait_for_load_state("networkidle")
            except:
                print("Could not find '座位管理' link, trying direct URL /seats")
                page.goto("http://localhost:3000/seats")
                page.wait_for_load_state("networkidle")

            # Take a screenshot of the Seat List
            page.screenshot(path="verification/seat_list.png")
            print("Seat List screenshot taken")

            # Verify some content exists
            # We expect to see "座位管理" title
            assert page.get_by_text("座位管理").is_visible()

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_seat_list()
