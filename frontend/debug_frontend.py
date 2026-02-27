from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:3000")
    print(page.title())
    print(page.url)
    page.screenshot(path="debug_page.png")
    # Dump body text to see what is rendered
    print(page.inner_text("body")[:500])
    browser.close()
