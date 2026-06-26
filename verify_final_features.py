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
                    "exercises": [
                        {
                            "id": "ex-1",
                            "name": "Supino Reto",
                            "sets": 3,
                            "reps": "8-12",
                            "rpe": 8,
                            "rest": 90,
                            "technique": "regular"
                        }
                    ]
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
        await asyncio.sleep(5)

        # Check for Nutrition/Lifestyle Hub (beta feature)
        try:
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(1)
            # Lifestyle hub might be further up or down.
            # It's in DashboardBetaPanels.
            await page.wait_for_selector("text=Sono Recente", timeout=10000)
            print("SUCCESS: Nutrition/Lifestyle Hub visible (Sleep section found)")
        except:
            print("FAILURE: Nutrition/Lifestyle Hub NOT found")

        # Check for AI Insights (internal feature)
        try:
            await page.wait_for_selector("text=IA Insights", timeout=10000)
            print("SUCCESS: AI Insights visible")
        except:
            print("FAILURE: AI Insights NOT found")

        await page.screenshot(path="dashboard_final_check_v4.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
