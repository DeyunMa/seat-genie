from playwright.sync_api import sync_playwright, expect

def verify_seat_filtering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Login
        print("Logging in...")
        # Based on innerText "用户名" and "密码"
        # The debug output suggests "用户名" is visible.
        # It's likely an input field nearby.
        # Let's try filling by placeholder or role if possible, or by label.
        # Assuming placeholders are standard or labels are used.
        # If not, we might need to select by css inputs.

        # Trying placeholders first as they are common
        try:
            page.fill("input[type='text']", "admin")
            page.fill("input[type='password']", "admin123")
        except:
            # Fallback to get_by_label if accessible
            # Or just assume first input is username
            inputs = page.locator("input")
            inputs.first.fill("admin")
            inputs.last.fill("admin123")

        # Click login button "登 录"
        page.get_by_role("button", name="登 录").click()

        # Wait for dashboard
        print("Waiting for dashboard...")
        page.wait_for_url("**/dashboard")

        # Navigate to Seat Management
        print("Navigating to Seat Management...")
        # The menu might be an icon or text.
        # "座位管理" is the target.
        # It might be in a sidebar.

        # Click "座位管理" link
        page.get_by_text("座位管理").click()

        # Verify we are on the page
        expect(page.get_by_role("heading", name="座位管理")).to_be_visible()

        # Take initial screenshot
        print("Taking initial screenshot (All Seats)...")
        page.screenshot(path="/home/jules/verification/1-all-seats.png")

        # Get room filter select
        # It should be the first select in filter-bar
        selects = page.locator("select").all()
        room_select = selects[0] # Room filter

        # Get options to pick a room
        options = room_select.locator("option").all()
        # options[0] is "All"
        if len(options) > 1:
            # Pick the second option (first real room)
            room_name = options[1].inner_text()
            room_value = options[1].get_attribute("value")
            print(f"Selecting room: {room_name} (value={room_value})")

            room_select.select_option(value=room_value)

            # Wait for update
            page.wait_for_timeout(1000)

            # Take filtered screenshot
            print("Taking filtered screenshot...")
            page.screenshot(path="/home/jules/verification/2-filtered-seats.png")

            # Check stats
            stats = page.locator(".filter-stats").inner_text()
            print(f"Stats after filter: {stats}")

            # If the bug was present, we'd likely see 0 seats if value="1" and roomId=1
            # If fixed, we should see seats (assuming room has seats).
            # We can't strictly assert count > 0 without knowing data, but visual check is key.
            # However, if we see "暂无座位数据" and we KNOW the room has seats (from mock or seed), that would fail.
            # But here we are verifying the CHANGE (fix).

        else:
            print("No rooms available to filter.")

        browser.close()

if __name__ == "__main__":
    verify_seat_filtering()
