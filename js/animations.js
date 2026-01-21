/**
 * DELSTON ROOFING - Scroll Animations
 * Intersection Observer-based reveal animations
 */

(function() {
    'use strict';

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // If user prefers reduced motion, show all elements immediately
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('visible');
        });
        return;
    }

    // Intersection Observer for reveal animations
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally stop observing after reveal
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    });

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ============================================
    // COUNTER ANIMATIONS
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        updateCounter();
    }

    // Observe stat numbers for counter animation
    const statNumbers = document.querySelectorAll('.reviews__stat-number, .reviews__stat-rating');
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const numericValue = parseFloat(text);

                if (!isNaN(numericValue) && !el.dataset.animated) {
                    el.dataset.animated = 'true';

                    if (text.includes('%')) {
                        animateCounter(el, numericValue, 1500);
                        el.textContent = '0%';
                        setTimeout(() => {
                            el.textContent = numericValue + '%';
                        }, 1500);
                    } else if (text.includes('+')) {
                        el.textContent = '0+';
                        animateCounter(el, numericValue, 1500);
                        setTimeout(() => {
                            el.textContent = numericValue + '+';
                        }, 1500);
                    }
                }
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.5
    });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ============================================
    // PARALLAX EFFECTS (SUBTLE)
    // ============================================
    const heroContent = document.querySelector('.hero__content');

    if (heroContent && !prefersReducedMotion) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroHeight = document.querySelector('.hero').offsetHeight;

                    if (scrolled < heroHeight) {
                        const parallax = scrolled * 0.3;
                        heroContent.style.transform = `translateY(${parallax}px)`;
                        heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
                    }

                    ticking = false;
                });

                ticking = true;
            }
        });
    }

    // ============================================
    // STAGGER ANIMATIONS FOR GRIDS
    // ============================================
    function staggerReveal(selector, staggerDelay = 100) {
        const elements = document.querySelectorAll(selector);

        const observer = new IntersectionObserver((entries, observer) => {
            let delay = 0;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    delay += staggerDelay;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    // Apply stagger to grids
    // staggerReveal('.service-card', 100);
    // staggerReveal('.review-card', 100);

    // ============================================
    // SMOOTH SCROLL PROGRESS INDICATOR (optional)
    // ============================================
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa);
            width: 0%;
            z-index: 9999;
            transition: width 0.1s ease-out;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // Uncomment to enable scroll progress indicator
    // createScrollProgress();

    // ============================================
    // HOVER TILT EFFECT FOR CARDS (PREMIUM FEEL)
    // ============================================
    if (!prefersReducedMotion) {
        const tiltCards = document.querySelectorAll('.service-card, .review-card');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const tiltX = (y - centerY) / 20;
                const tiltY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ============================================
    // MAGNETIC BUTTON EFFECT (CTA BUTTONS)
    // ============================================
    if (!prefersReducedMotion) {
        const magneticButtons = document.querySelectorAll('.btn--primary');

        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ============================================
    // TEXT SPLIT ANIMATION (FOR HERO)
    // ============================================
    function splitTextAnimation(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const text = element.textContent;
        element.innerHTML = '';

        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.cssText = `
                display: inline-block;
                opacity: 0;
                transform: translateY(20px);
                animation: charReveal 0.5s ease forwards;
                animation-delay: ${i * 0.03}s;
            `;
            element.appendChild(span);
        });
    }

    // Add char reveal animation
    const charStyle = document.createElement('style');
    charStyle.textContent = `
        @keyframes charReveal {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(charStyle);

    // Uncomment to enable text split animation on hero title
    // splitTextAnimation('.hero__title');

    // ============================================
    // TYPING EFFECT (OPTIONAL FOR SUBTITLES)
    // ============================================
    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // ============================================
    // CURSOR GLOW EFFECT (SUBTLE)
    // ============================================
    if (!prefersReducedMotion && window.innerWidth > 1024) {
        const cursor = document.createElement('div');
        cursor.className = 'cursor-glow';
        cursor.style.cssText = `
            position: fixed;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
        document.body.appendChild(cursor);

        let cursorVisible = false;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            if (!cursorVisible) {
                cursor.style.opacity = '1';
                cursorVisible = true;
            }
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            cursorVisible = false;
        });
    }

})();
