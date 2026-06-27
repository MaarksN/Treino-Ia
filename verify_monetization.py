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

        # Scroll to monetization section
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1)

        # Check buttons
        try:
            await page.wait_for_selector("text=Ativar Contrato Real", timeout=5000)
            print("SUCCESS: Ulysses Contract button found")

            await page.wait_for_selector("text=Comprar agora", timeout=5000)
            print("SUCCESS: Marketplace buy buttons found")

            await page.wait_for_selector("text=Ativar por 24h", timeout=5000)
            print("SUCCESS: Pay-per-workout button found")

        except Exception as e:
            print(f"FAILURE: One or more buttons NOT found: {e}")

        await page.screenshot(path="monetization_check.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
