/**
 * DELSTON ROOFING - Main JavaScript
 * Navigation, Mobile Menu, Smooth Scroll, Form Handling
 */

(function() {
    'use strict';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const contactForm = document.getElementById('contact-form');

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Throttle scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(handleHeaderScroll);
    });

    // Initial check
    handleHeaderScroll();

    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(function() {
            handleHeaderScroll();
            updateActiveNavLink();
        });
    });

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('.form__submit');
            const originalBtnText = submitBtn.innerHTML;

            // Validate form
            if (!validateForm(this)) {
                return;
            }

            // Show loading state
            submitBtn.innerHTML = `
                <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                Sending...
            `;
            submitBtn.disabled = true;

            try {
                // Get form data
                const formData = new FormData(this);

                // Send to Formspree (or your preferred service)
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    showFormMessage('success', 'Thank you! We\'ll be in touch within 24 hours.');
                    this.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                showFormMessage('error', 'Something went wrong. Please call us directly or try again.');
                console.error('Form error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });

        // Real-time validation
        const inputs = contactForm.querySelectorAll('.form__input, .form__textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });

            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateInput(this);
                }
            });
        });
    }

    function validateForm(form) {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateInput(input) {
        const value = input.value.trim();
        let isValid = true;

        // Remove existing error state
        input.classList.remove('error');

        // Check required
        if (input.hasAttribute('required') && !value) {
            isValid = false;
        }

        // Check email format
        if (input.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
            }
        }

        // Check phone format (UK)
        if (input.type === 'tel' && value) {
            const phoneRegex = /^[\d\s+()-]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
            }
        }

        if (!isValid) {
            input.classList.add('error');
            input.style.borderColor = '#ef4444';
        } else {
            input.style.borderColor = '';
        }

        return isValid;
    }

    function showFormMessage(type, message) {
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.style.cssText = `
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            border-radius: 0.75rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            grid-column: 1 / -1;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            messageEl.style.background = '#dcfce7';
            messageEl.style.color = '#166534';
            messageEl.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                ${message}
            `;
        } else {
            messageEl.style.background = '#fef2f2';
            messageEl.style.color = '#991b1b';
            messageEl.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                ${message}
            `;
        }

        // Insert at beginning of form
        contactForm.insertBefore(messageEl, contactForm.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // FAQ ACCORDION BEHAVIOR
    // ============================================
    const faqItems = document.querySelectorAll('.faq__item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            if (this.open) {
                // Close other open items
                faqItems.forEach(otherItem => {
                    if (otherItem !== this && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });

    // ============================================
    // LAZY LOAD IMAGES (if any are added later)
    // ============================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ============================================
    // PHONE NUMBER FORMATTING
    // ============================================
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Remove non-numeric characters except + and spaces
            let value = this.value.replace(/[^\d\s+]/g, '');
            this.value = value;
        });
    }

    // ============================================
    // POSTCODE FORMATTING (UK)
    // ============================================
    const postcodeInput = document.getElementById('postcode');
    if (postcodeInput) {
        postcodeInput.addEventListener('input', function(e) {
            // Uppercase and format
            this.value = this.value.toUpperCase();
        });
    }

    // ============================================
    // CONSOLE BRANDING
    // ============================================
    console.log(
        '%c Delston Roofing ',
        'background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px;'
    );
    console.log('Website built with care. Your roof, done right.');

})();
