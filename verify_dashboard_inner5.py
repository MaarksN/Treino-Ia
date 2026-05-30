from playwright.sync_api import Page, expect, sync_playwright

def test_dashboard_clean(page: Page):
    page.goto("http://localhost:3000/")

    # Wait for the app to initialize
    page.wait_for_selector("text=Bem-vindo", timeout=15000)

    # Set mock user profile in local storage to bypass anamnesis screen
    page.evaluate("""() => {
        window.localStorage.setItem('@TreinoIA:starterUser', JSON.stringify({
            name: 'Jules',
            email: 'jules@example.com',
            authProvider: 'local'
        }));

        window.localStorage.setItem('@TreinoApp:profile', JSON.stringify({
            goal: 'hypertrophy',
            level: 'intermediate',
            daysPerWeek: 4,
            timePerWorkout: 60,
            equipment: 'full_gym',
            injuries: 'none',
            gender: 'M',
            experienceYears: 2
        }));

        window.localStorage.setItem('@TreinoApp:plan', JSON.stringify({
            id: 'mock',
            planName: 'Plano Mock',
            goalDescription: 'Test',
            weeklySplit: 'ABCD',
            volume: 'Alto',
            frequency: 'Media',
            focus: 'Geral',
            days: [{
                dayIndex: 0,
                dayName: 'Segunda',
                dayFocus: 'Peito',
                workoutType: 'strength',
                estimatedMinutes: 60,
                exercises: []
            }],
            nextRecommendation: 'mock',
            confidenceScore: 0.9,
            expiresAt: '2030-01-01'
        }));

        window.localStorage.setItem('@TreinoApp:onboarding', 'true');
    }""")

    # Reload
    page.reload()

    page.wait_for_timeout(3000)

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/clean_dashboard7.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 390x844 size
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        try:
            test_dashboard_clean(page)
        finally:
            browser.close()
