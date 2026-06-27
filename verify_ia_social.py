import asyncio
import json
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 3000},
            permissions=['geolocation'],
            geolocation={'latitude': -23.5891, 'longitude': -46.6833}
        )
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
            "days": [{"id": "day-1", "label": "Treino A", "exercises": []}]
        }

        init_script = f"""
            localStorage.setItem('@TreinoApp:onboarding', 'true');
            localStorage.setItem('@TreinoIA:starterUser', JSON.stringify({{
                id: 'test-user',
                name: 'Test User',
                objective: 'hipertrofia',
                level: 'intermediario',
                anamnesisCompleted: true
            }}));
            localStorage.setItem('@TreinoIA:profile', JSON.stringify({json.dumps(profile)}));
            localStorage.setItem('@TreinoIA:currentPlan', JSON.stringify({json.dumps(plan)}));
            localStorage.setItem('@TreinoApp:feature-audience', 'internal');

            const overrides = {{
                'social': true,
                'cameraFormCheck': true,
                'advancedAi': true
            }};
            localStorage.setItem('@TreinoApp:product-surface-overrides', JSON.stringify(overrides));
        """
        await page.add_init_script(init_script)

        await page.goto("http://localhost:3000")

        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(8)

        results = []

        # Check Form Checker
        try:
            await page.wait_for_selector("text=Análise de forma", timeout=10000)
            results.append("SUCCESS: Form Checker section found")
        except:
            results.append("FAILURE: Form Checker section NOT found")

        # Check Social Hub
        try:
            # Look for heading
            social_header = await page.wait_for_selector("h2:has-text('Advanced Social')", timeout=10000)
            if social_header:
                results.append("SUCCESS: Advanced Social section found")

                # Test Rival Matching (Fallback path)
                btn = await page.query_selector("text=Encontrar Rival")
                if btn:
                    await btn.click()
                    await page.wait_for_selector("text=Seu rival:", timeout=5000)
                    results.append("SUCCESS: Rival Matching functional (Fallback mode)")

                # Check Skill Tree
                await page.wait_for_selector("text=Skill Tree", timeout=2000)
                results.append("SUCCESS: Skill Tree visible")
        except Exception as e:
            results.append(f"FAILURE: Social section error: {e}")

        for r in results:
            print(r)

        await page.screenshot(path="ia_social_final_verified.png", full_page=True)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
