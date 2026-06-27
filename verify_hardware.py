import asyncio
import json
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        profile = {
            "id": "profile_test",
            "name": "Test User",
            "goal": "Hipertrofia",
            "level": "intermediario",
            "daysPerWeek": 4,
            "timePerWorkout": 60,
            "injuries": "Nenhuma",
            "equipment": "Academia completa",
            "updatedAt": 1700000000000
        }

        plan = {
            "id": "plan_test",
            "userId": "test-user",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "days": [
                {
                    "id": "day-1",
                    "label": "Treino A",
                    "exercises": []
                }
            ]
        }

        await page.goto("http://localhost:3000")
        await page.evaluate("""(args) => {
            localStorage.setItem('@TreinoApp:onboarding', 'true');
            localStorage.setItem('@TreinoIA:starterUser', JSON.stringify({
                id: 'test-user',
                name: 'Test User',
                objective: 'hipertrofia',
                level: 'intermediario',
                anamnesisCompleted: true
            }));
            localStorage.setItem('@TreinoIA:profile', JSON.stringify(args.p));
            localStorage.setItem('@TreinoIA:currentPlan', JSON.stringify(args.pl));
            localStorage.setItem('@TreinoApp:feature-audience', 'internal');
            window.location.reload();
        }""", {"p": profile, "pl": plan})

        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)

        # Scroll to hardware section
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1)

        # Check elements in HardwareCapabilitiesPanel
        try:
            # Note: Web Bluetooth button only appears if isSupported is true.
            # In headless chromium it might be false.
            panel_title = await page.inner_text("h2:has-text('Hardware & IoT')")
            print(f"SUCCESS: Hardware Panel title found: {panel_title}")

            # Check for NFC item
            await page.wait_for_selector("text=NFC Tap-to-Set", timeout=5000)
            print("SUCCESS: NFC item found")

        except Exception as e:
            print(f"FAILURE: Hardware elements NOT found: {e}")

        await page.screenshot(path="hardware_check.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
