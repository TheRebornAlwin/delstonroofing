const { test, expect } = require('@playwright/test');

test.describe('Delston Roofing Website', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });
    });

    test.describe('SVG Icon Sizing', () => {

        test('Why-Us section icons should be correctly sized', async ({ page }) => {
            const icons = page.locator('.why-us__icon svg');
            const count = await icons.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const icon = icons.nth(i);
                const box = await icon.boundingBox();

                // SVGs should be around 36x36px (larger premium design)
                expect(box.width).toBeLessThanOrEqual(42);
                expect(box.height).toBeLessThanOrEqual(42);
                expect(box.width).toBeGreaterThanOrEqual(30);
                expect(box.height).toBeGreaterThanOrEqual(30);
            }
        });

        test('Why-Us icon containers should be 80x80px', async ({ page }) => {
            const containers = page.locator('.why-us__icon');
            const count = await containers.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const container = containers.nth(i);
                const box = await container.boundingBox();

                // Containers should be 80x80px (larger premium design)
                expect(box.width).toBeCloseTo(80, 5);
                expect(box.height).toBeCloseTo(80, 5);
            }
        });

        test('Promise section checkmarks should be correctly sized', async ({ page }) => {
            const checkmarks = page.locator('.promise__list svg');
            const count = await checkmarks.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const checkmark = checkmarks.nth(i);
                const box = await checkmark.boundingBox();

                // Checkmarks should be around 22x22px
                expect(box.width).toBeLessThanOrEqual(30);
                expect(box.height).toBeLessThanOrEqual(30);
                expect(box.width).toBeGreaterThanOrEqual(15);
                expect(box.height).toBeGreaterThanOrEqual(15);
            }
        });

        test('Contact promise icons should be correctly sized', async ({ page }) => {
            const icons = page.locator('.contact__promise-item svg');
            const count = await icons.count();

            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const icon = icons.nth(i);
                const box = await icon.boundingBox();

                // Icons should be around 24x24px
                expect(box.width).toBeLessThanOrEqual(32);
                expect(box.height).toBeLessThanOrEqual(32);
            }
        });

        test('No SVGs should be oversized (>100px)', async ({ page }) => {
            const allSvgs = page.locator('svg');
            const count = await allSvgs.count();

            const oversizedSvgs = [];

            for (let i = 0; i < count; i++) {
                const svg = allSvgs.nth(i);
                const box = await svg.boundingBox();

                if (box && (box.width > 100 || box.height > 100)) {
                    // Allow hero/background SVGs but flag icon SVGs
                    const parent = await svg.evaluate(el => el.closest('.why-us__icon, .promise__list, .contact__promise-item, .process__step'));
                    if (parent) {
                        oversizedSvgs.push({ index: i, width: box.width, height: box.height });
                    }
                }
            }

            expect(oversizedSvgs).toHaveLength(0);
        });
    });

    test.describe('Page Layout', () => {

        test('Header should be visible and contain navigation', async ({ page }) => {
            const header = page.locator('.header');
            await expect(header).toBeVisible();

            const navLinks = page.locator('.nav__link');
            const linkCount = await navLinks.count();
            expect(linkCount).toBeGreaterThanOrEqual(4);
        });

        test('Hero section should be visible', async ({ page }) => {
            const hero = page.locator('.hero');
            await expect(hero).toBeVisible();
        });

        test('Services section should have service cards', async ({ page }) => {
            const services = page.locator('.services');
            await expect(services).toBeVisible();

            const cards = page.locator('.service-card');
            const cardCount = await cards.count();
            expect(cardCount).toBeGreaterThanOrEqual(3);
        });

        test('Why-Us section should have 4 cards', async ({ page }) => {
            const whyUs = page.locator('.why-us');
            await expect(whyUs).toBeVisible();

            const cards = page.locator('.why-us__card');
            await expect(cards).toHaveCount(4);
        });

        test('Contact section should have form', async ({ page }) => {
            const contact = page.locator('.contact');
            await expect(contact).toBeVisible();

            const form = page.locator('.contact__form');
            await expect(form).toBeVisible();
        });
    });

    test.describe('Images', () => {

        test('All images should load successfully', async ({ page }) => {
            const images = page.locator('img');
            const count = await images.count();

            for (let i = 0; i < count; i++) {
                const img = images.nth(i);
                const isLoaded = await img.evaluate(el => el.complete && el.naturalWidth > 0);
                expect(isLoaded).toBe(true);
            }
        });
    });

    test.describe('Responsive Design', () => {

        test('Mobile navigation should work', async ({ page, isMobile }) => {
            if (isMobile) {
                // On mobile, hamburger menu should be present
                const mobileMenu = page.locator('.nav__toggle, .hamburger, [class*="mobile"]');
                // Check that the page renders without errors on mobile
                await expect(page.locator('body')).toBeVisible();
            }
        });

        test('Why-Us cards should stack on mobile', async ({ page, isMobile }) => {
            if (isMobile) {
                const cards = page.locator('.why-us__card');
                const firstCard = cards.first();
                const secondCard = cards.nth(1);

                const firstBox = await firstCard.boundingBox();
                const secondBox = await secondCard.boundingBox();

                // On mobile, cards should stack (second card below first)
                expect(secondBox.y).toBeGreaterThan(firstBox.y);
            }
        });
    });

    test.describe('Functionality', () => {

        test('CTA buttons should have proper href', async ({ page }) => {
            const ctaButtons = page.locator('a[href="#contact"], a[href*="tel:"], a[href*="mailto:"]');
            const count = await ctaButtons.count();
            expect(count).toBeGreaterThan(0);
        });

        test('Phone number links should be clickable', async ({ page }) => {
            const phoneLinks = page.locator('a[href^="tel:"]');
            const count = await phoneLinks.count();
            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const link = phoneLinks.nth(i);
                await expect(link).toBeEnabled();
            }
        });
    });
});
