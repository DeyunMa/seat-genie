from playwright.sync_api import sync_playwright, expect

def verify_seat_filtering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for clipboard/clipboard-read/write if needed,
        # but mainly we just need to access the page.
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # 1. Navigate to the app (assuming it starts on login or dashboard)
        # We need to bypass login if possible or log in.
        # The store has a default user mock or we can try to hit the page directly if no auth guard?
        # Let's check if we need to login.
        page.goto("http://localhost:3000")

        # Check if we are on login page
        if page.get_by_role("button", name="登录").is_visible():
            print("Logging in...")
            # Default creds from memory: admin / admin123
            page.get_by_placeholder("请输入邮箱").fill("admin@example.com") # Guessing placeholder
            page.get_by_placeholder("请输入密码").fill("admin123")
            page.get_by_role("button", name="登录").click()
            # Wait for navigation
            page.wait_for_url("**/dashboard")

        # 2. Navigate to Seat Management
        # Assuming there is a nav link
        print("Navigating to Seat Management...")
        # If the menu is collapsible or in a sidebar, we might need to find it.
        # Let's try to go directly if we know the route, or click the link.
        # Based on file structure: frontend/src/pages/SeatManagement/SeatList.jsx
        # It's likely routed at /seats or similar.
        # Let's look for a link with text "座位管理"
        try:
            page.get_by_role("link", name="座位管理").click()
        except:
            # Fallback: try direct URL if router permits
            page.goto("http://localhost:3000/seats")

        # Wait for page load
        expect(page.get_by_text("座位管理", exact=True).first).to_be_visible()

        # 3. Verify Baseline (All Seats)
        # The mock data or seed data should be present.
        # Let's assume there are seats.
        # We want to verify the filter works.

        print("Taking initial screenshot...")
        page.screenshot(path="/home/jules/verification/1-all-seats.png")

        # 4. Apply Room Filter
        # Find the room select. It defaults to "all".
        # We need to select a specific room.
        # We first need to know what rooms are available.
        # We can get the options from the select.

        # The select for room is likely the first one in the filter bar.
        # Or look for text "全部房间"
        room_select = page.locator("select").filter(has_text="全部房间")

        # Get options
        # We want to select a room that HAS seats to verify they show up,
        # and maybe a room that DOESN'T (if any).
        # But crucially, we want to ensure it DOESN'T show 0 seats if there are seats (the bug).

        # Let's just pick the second option (index 1), assuming index 0 is "all".
        # value might be "1" (string) which caused the bug against roomId: 1 (number).

        options = room_select.locator("option").all_innerTexts()
        if len(options) > 1:
            target_room = options[1] # The first actual room
            print(f"Selecting room: {target_room}")

            # Select by label/text
            room_select.select_option(label=target_room)

            # 5. Verify Filter Result
            # Wait a moment for react to update (though it should be instant)
            page.wait_for_timeout(500)

            print("Taking screenshot after filtering...")
            page.screenshot(path="/home/jules/verification/2-filtered-seats.png")

            # Check if we have seats shown.
            # If the bug was present, we might see "暂无座位数据" or 0 count.
            # If fixed, we should see seats (assuming the room has seats).

            # Let's assert we don't see the empty state if we expect data.
            # Since we don't strictly know the data state, visual verification via screenshot is key.
            # But we can print the count.
            count_text = page.locator(".filter-stats").inner_text()
            print(f"Stats: {count_text}")

        else:
            print("No rooms found to filter by.")

        browser.close()

if __name__ == "__main__":
    verify_seat_filtering()
