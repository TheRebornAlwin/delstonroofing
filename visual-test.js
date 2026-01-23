const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runVisualTest() {
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('Starting visual test of https://delstonroofingsolutions.co.uk/\n');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        // Navigate to the website
        console.log('Loading website...');
        await page.goto('https://delstonroofingsolutions.co.uk/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        console.log('Website loaded successfully.\n');

        // Full page screenshot
        console.log('Taking full page screenshot...');
        await page.screenshot({
            path: path.join(screenshotsDir, '01-full-page.png'),
            fullPage: true
        });

        // Hero section
        console.log('Capturing hero section...');
        await page.screenshot({
            path: path.join(screenshotsDir, '02-hero.png')
        });

        // Scroll through sections and take screenshots
        const sections = [
            { name: 'services', scroll: 800 },
            { name: 'why-us', scroll: 1600 },
            { name: 'process', scroll: 2400 },
            { name: 'about', scroll: 3200 },
            { name: 'promise', scroll: 4000 },
            { name: 'gallery', scroll: 4800 },
            { name: 'reviews', scroll: 5600 },
            { name: 'contact', scroll: 6400 }
        ];

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            console.log(`Scrolling to ${section.name} section...`);
            await page.evaluate((scrollY) => window.scrollTo(0, scrollY), section.scroll);
            await page.waitForTimeout(500);
            await page.screenshot({
                path: path.join(screenshotsDir, `${String(i + 3).padStart(2, '0')}-${section.name}.png`)
            });
        }

        // Check for oversized elements
        console.log('\n--- Checking for layout issues ---\n');

        // Check SVG sizes
        const svgIssues = await page.evaluate(() => {
            const issues = [];
            const svgs = document.querySelectorAll('svg');
            svgs.forEach((svg, i) => {
                const rect = svg.getBoundingClientRect();
                if (rect.width > 200 || rect.height > 200) {
                    const parent = svg.closest('[class]');
                    issues.push({
                        index: i,
                        width: rect.width,
                        height: rect.height,
                        parentClass: parent ? parent.className : 'none',
                        viewBox: svg.getAttribute('viewBox')
                    });
                }
            });
            return issues;
        });

        if (svgIssues.length > 0) {
            console.log('ISSUE FOUND: Oversized SVGs detected:');
            svgIssues.forEach(issue => {
                console.log(`  - SVG ${issue.index}: ${issue.width.toFixed(0)}x${issue.height.toFixed(0)}px in .${issue.parentClass}`);
            });
        } else {
            console.log('SVG sizes OK - no oversized icons found');
        }

        // Check icon containers in why-us section
        const whyUsIcons = await page.evaluate(() => {
            const icons = document.querySelectorAll('.why-us__icon');
            return Array.from(icons).map((icon, i) => {
                const rect = icon.getBoundingClientRect();
                const svg = icon.querySelector('svg');
                const svgRect = svg ? svg.getBoundingClientRect() : null;
                return {
                    index: i,
                    containerSize: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`,
                    svgSize: svgRect ? `${svgRect.width.toFixed(0)}x${svgRect.height.toFixed(0)}` : 'no svg'
                };
            });
        });

        console.log('\nWhy-Us section icon sizes:');
        whyUsIcons.forEach(icon => {
            console.log(`  Icon ${icon.index + 1}: container=${icon.containerSize}px, svg=${icon.svgSize}px`);
        });

        // Check promise list icons
        const promiseIcons = await page.evaluate(() => {
            const icons = document.querySelectorAll('.promise__list svg');
            return Array.from(icons).map((svg, i) => {
                const rect = svg.getBoundingClientRect();
                return {
                    index: i,
                    size: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`
                };
            });
        });

        console.log('\nPromise section icon sizes:');
        promiseIcons.forEach(icon => {
            console.log(`  Checkmark ${icon.index + 1}: ${icon.size}px`);
        });

        // Check header navigation
        const headerCheck = await page.evaluate(() => {
            const header = document.querySelector('.header');
            const links = document.querySelectorAll('.nav__link');
            const linkColors = Array.from(links).map(link => {
                const style = window.getComputedStyle(link);
                return style.color;
            });
            return {
                headerScrolled: header?.classList.contains('scrolled'),
                linkColors
            };
        });

        console.log('\nHeader state:');
        console.log(`  Scrolled class: ${headerCheck.headerScrolled}`);
        console.log(`  Link colors: ${headerCheck.linkColors.join(', ')}`);

        // Check for broken images
        const brokenImages = await page.evaluate(() => {
            const images = document.querySelectorAll('img');
            const broken = [];
            images.forEach((img, i) => {
                if (!img.complete || img.naturalWidth === 0) {
                    broken.push({ index: i, src: img.src });
                }
            });
            return broken;
        });

        if (brokenImages.length > 0) {
            console.log('\nISSUE FOUND: Broken images:');
            brokenImages.forEach(img => {
                console.log(`  Image ${img.index}: ${img.src}`);
            });
        } else {
            console.log('\nAll images loaded successfully');
        }

        // Mobile viewport test
        console.log('\n--- Testing mobile viewport ---');
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);

        await page.screenshot({
            path: path.join(screenshotsDir, '11-mobile-hero.png')
        });

        // Mobile why-us section
        await page.evaluate(() => window.scrollTo(0, 1200));
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join(screenshotsDir, '12-mobile-why-us.png')
        });

        // Mobile promise section
        await page.evaluate(() => window.scrollTo(0, 2800));
        await page.waitForTimeout(300);
        await page.screenshot({
            path: path.join(screenshotsDir, '13-mobile-promise.png')
        });

        // Check mobile icon sizes
        const mobileWhyUsIcons = await page.evaluate(() => {
            const icons = document.querySelectorAll('.why-us__icon svg');
            return Array.from(icons).map((svg, i) => {
                const rect = svg.getBoundingClientRect();
                return {
                    index: i,
                    size: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`
                };
            });
        });

        console.log('\nMobile why-us icon sizes:');
        mobileWhyUsIcons.forEach(icon => {
            console.log(`  Icon ${icon.index + 1}: ${icon.size}px`);
        });

        console.log('\n--- Visual test complete ---');
        console.log(`Screenshots saved to: ${screenshotsDir}`);

    } catch (error) {
        console.error('Error during test:', error.message);
    } finally {
        await browser.close();
    }
}

runVisualTest();
