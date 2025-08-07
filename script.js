(() => {
    // Scoped script to avoid globals and improve maintainability

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const nav = document.querySelector('.navigation');

    function setNavState(open) {
        const isOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('active');
        navMenu.classList.toggle('active', isOpen);
        navToggle.classList.toggle('active', isOpen);
        if (navToggle) navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    // Toggle handlers (click + keyboard)
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => setNavState());
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setNavState();
            }
        });
    }

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', () => setNavState(false));
    });

    // Make cards keyboard-accessible and navigable via data-href
    document.querySelectorAll('.service-card, .project-card').forEach(card => {
        const href = card.dataset && card.dataset.href;
        if (!href) return;
        card.addEventListener('click', () => {
            window.location.href = href;
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.href = href;
            }
        });
    });

    // Smooth scrolling for same-page anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setNavState(false);
            }
        });
    });

    // Scroll effect: add/remove .scrolled class (uses CSS for visuals)
    let scrollTimer = null;
    window.addEventListener('scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
            if (nav) {
                if (window.scrollY > 50) nav.classList.add('scrolled');
                else nav.classList.remove('scrolled');
            }
            clearTimeout(scrollTimer);
            scrollTimer = null;
        }, 50);
    }, { passive: true });

    // IntersectionObserver to add a reusable .animate class (no inline styles)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .project-card').forEach(card => {
        observer.observe(card);
    });

    /**
     * FAQ interaction
     * - Moves FAQ logic out of page scripts into centralized script.js
     * - Adds ARIA attributes, keyboard support and ensures only one FAQ is open at a time
     */
    function initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        let idCounter = 0;
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');

            if (!question || !answer) return;

            // ensure answer has an id for aria-controls
            if (!answer.id) {
                answer.id = `faq-answer-${idCounter++}`;
            }

            // initial ARIA states
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('aria-controls', answer.id);
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
            answer.setAttribute('aria-hidden', 'true');

            // helper to update toggle symbol
            function setOpenState(open) {
                item.classList.toggle('active', open);
                question.setAttribute('aria-expanded', String(open));
                answer.setAttribute('aria-hidden', String(!open));
                if (toggle) toggle.textContent = open ? '−' : '+';
            }

            // click handler
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // close all
                document.querySelectorAll('.faq-item').forEach(i => {
                    if (i === item) return;
                    i.classList.remove('active');
                    const q = i.querySelector('.faq-question');
                    const a = i.querySelector('.faq-answer');
                    const t = i.querySelector('.faq-toggle');
                    if (q) q.setAttribute('aria-expanded', 'false');
                    if (a) a.setAttribute('aria-hidden', 'true');
                    if (t) t.textContent = '+';
                });
                // toggle current
                setOpenState(!isActive);
            });

            // keyboard support (Enter / Space)
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    }

    // init FAQ on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFAQ);
    } else {
        initFAQ();
    }

})();
