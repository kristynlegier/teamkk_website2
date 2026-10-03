// ==========================================================================
// Theme, Interactivity & Portfolio Logic: Kristyn Legier
// ==========================================================================

(function () {
    'use strict';

    // --------------------------------------------------------------------------
    // 1. Theme Toggle & Persistence (Default: Warm Editorial Linen / Light)
    // --------------------------------------------------------------------------
    const savedTheme = localStorage.getItem('kl-portfolio-theme-v3') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('kl-portfolio-theme-v3', newTheme);
        });
    }

    // --------------------------------------------------------------------------
    // 2. Reading Progress Bar & Scroll-To-Top Button
    // --------------------------------------------------------------------------
    function initScrollFeatures() {
        // Create reading progress bar if it doesn't exist
        let progressBar = document.getElementById('reading-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'reading-progress';
            progressBar.className = 'reading-progress-bar';
            document.body.prepend(progressBar);
        }

        // Create scroll to top button if it doesn't exist
        let scrollTopBtn = document.getElementById('scroll-top');
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.id = 'scroll-top';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
            scrollTopBtn.title = 'Back to top';
            scrollTopBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            `;
            document.body.appendChild(scrollTopBtn);

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (totalScroll > 0) {
                const scrolled = (window.scrollY / totalScroll) * 100;
                progressBar.style.width = scrolled + '%';
            }

            if (window.scrollY > 350) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });
    }

    // --------------------------------------------------------------------------
    // 3. One-Click "Copy Email" with Toast Notification
    // --------------------------------------------------------------------------
    function initCopyEmail() {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = 'toast-notification';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        let toastTimeout;
        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('visible');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.remove('visible');
            }, 3200);
        }

        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-email-btn');
            if (copyBtn) {
                e.preventDefault();
                const emailToCopy = copyBtn.getAttribute('data-email') || 'klegie1@lsu.edu';
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(emailToCopy).then(() => {
                        showToast(`Copied to clipboard: ${emailToCopy}`);
                    }).catch(() => {
                        showToast(`Email: ${emailToCopy}`);
                    });
                } else {
                    showToast(`Email: ${emailToCopy}`);
                }
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. Interactive Project Filter (on project.html)
    // --------------------------------------------------------------------------
    function initProjectFilter() {
        const filterContainer = document.getElementById('project-filters');
        if (!filterContainer) return;

        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card[data-category]');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetFilter = btn.getAttribute('data-filter');

                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                projectCards.forEach(card => {
                    const cardCategories = card.getAttribute('data-category').split(' ');
                    if (targetFilter === 'all' || cardCategories.includes(targetFilter)) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 20);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 200);
                    }
                });
            });
        });
    }

    // --------------------------------------------------------------------------
    // 5. Interactive FX Currency & Tariff Simulator (on project.html)
    // --------------------------------------------------------------------------
    function initFXSimulator() {
        const simForm = document.getElementById('fx-simulator-form');
        if (!simForm) return;

        const exposureInput = document.getElementById('sim-exposure');
        const exposureVal = document.getElementById('sim-exposure-val');
        const currencySelect = document.getElementById('sim-currency');
        const shiftInput = document.getElementById('sim-shift');
        const shiftVal = document.getElementById('sim-shift-val');
        const tariffInput = document.getElementById('sim-tariff');
        const tariffVal = document.getElementById('sim-tariff-val');

        // Results elements
        const resultLanded = document.getElementById('sim-res-landed');
        const resultFxDelta = document.getElementById('sim-res-fx-delta');
        const resultTariffBurden = document.getElementById('sim-res-tariff-burden');
        const resultMarginDelta = document.getElementById('sim-res-margin-delta');
        const commentaryEl = document.getElementById('sim-commentary');

        const rates = {
            EUR: { name: 'Euro (EUR)', rate: 1.08, volatility: 'Moderate' },
            MXN: { name: 'Mexican Peso (MXN)', rate: 18.25, volatility: 'High' },
            CAD: { name: 'Canadian Dollar (CAD)', rate: 1.36, volatility: 'Low' },
            JPY: { name: 'Japanese Yen (JPY)', rate: 154.50, volatility: 'High' },
            GBP: { name: 'British Pound (GBP)', rate: 1.29, volatility: 'Moderate' }
        };

        function calculate() {
            const baseAmount = parseFloat(exposureInput.value) || 250000;
            const currencyKey = currencySelect.value || 'EUR';
            const fxShiftPct = parseFloat(shiftInput.value) || 0; // % depreciation / appreciation
            const tariffPct = parseFloat(tariffInput.value) || 0; // % tariff duty

            // Update range labels
            if (exposureVal) exposureVal.textContent = `$${baseAmount.toLocaleString()}`;
            if (shiftVal) shiftVal.textContent = `${fxShiftPct > 0 ? '+' : ''}${fxShiftPct}%`;
            if (tariffVal) tariffVal.textContent = `${tariffPct}%`;

            // Calculations
            // FX shift impact: Positive shift means foreign currency strengthens (costs more USD to buy)
            const fxVariance = baseAmount * (fxShiftPct / 100);
            const landedBeforeTariff = baseAmount + fxVariance;
            const tariffCost = landedBeforeTariff * (tariffPct / 100);
            const totalLandedCost = landedBeforeTariff + tariffCost;
            const totalCostIncrease = totalLandedCost - baseAmount;
            const marginCompressionPct = ((totalCostIncrease / baseAmount) * 100).toFixed(1);

            // Update UI
            if (resultLanded) resultLanded.textContent = `$${Math.round(totalLandedCost).toLocaleString()}`;
            if (resultFxDelta) {
                const sign = fxVariance >= 0 ? '+' : '-';
                resultFxDelta.textContent = `${sign}$${Math.abs(Math.round(fxVariance)).toLocaleString()}`;
                resultFxDelta.style.color = fxVariance > 0 ? 'var(--accent-terracotta)' : 'var(--accent-emerald)';
            }
            if (resultTariffBurden) {
                resultTariffBurden.textContent = `+$${Math.round(tariffCost).toLocaleString()}`;
            }
            if (resultMarginDelta) {
                const sign = marginCompressionPct >= 0 ? '+' : '';
                resultMarginDelta.textContent = `${sign}${marginCompressionPct}%`;
                resultMarginDelta.style.color = marginCompressionPct > 0 ? 'var(--accent-terracotta)' : 'var(--accent-emerald)';
            }

            if (commentaryEl) {
                let note = '';
                if (fxShiftPct > 4 && tariffPct > 10) {
                    note = `<strong>High Compounded Exposure:</strong> Simultaneous ${currencyKey} appreciation and high tariff duty compound procurement cost by <strong>${marginCompressionPct}%</strong> ($${Math.round(totalCostIncrease).toLocaleString()}). Recommended strategy: Forward FX contracts hedging at least 70% of notional volume paired with localized North American sourcing reallocation.`;
                } else if (fxShiftPct < 0) {
                    note = `<strong>Favorable Currency Hedging Window:</strong> ${currencyKey} weakening provides a baseline cost buffer of $${Math.abs(Math.round(fxVariance)).toLocaleString()}, offsetting ${tariffPct > 0 ? `a portion of the ${tariffPct}% tariff surcharge` : 'procurement overhead'}. Optimal time to execute fixed-rate forward commitments.`;
                } else {
                    note = `<strong>Manageable Risk Corridor:</strong> Landed cost variance remains within standard operating reserve margins (${marginCompressionPct}%). Proactive monitoring of central bank rate signals and trade tariff reviews advised.`;
                }
                commentaryEl.innerHTML = note;
            }
        }

        [exposureInput, currencySelect, shiftInput, tariffInput].forEach(el => {
            if (el) {
                el.addEventListener('input', calculate);
                el.addEventListener('change', calculate);
            }
        });

        calculate();
    }

    // --------------------------------------------------------------------------
    // 6. Interactive Case Study Modals (on project.html)
    // --------------------------------------------------------------------------
    const caseStudiesData = {
        'portfolio-infra': {
            title: 'Multi-Page Portfolio & Digital Infrastructure',
            badge: 'Information Systems • Web Architecture',
            status: 'Completed • Spring 2026',
            objective: 'Architect an executive-tier, accessible digital portfolio with sub-second page performance, fluid responsive layouts, and light/dark theme persistence for corporate recruitment.',
            methodology: [
                'Engineered semantic HTML5 documents with unified typographic scale using Google Fonts (Plus Jakarta Sans and Inter).',
                'Developed bespoke vanilla CSS design token architecture utilizing HSL-tailored palettes (Warm Editorial Linen and Minimalist Mocha) eliminating framework bloat.',
                'Implemented automated cache-busting asset query parameters and client-side theme persistence via localStorage.',
                'Configured responsive grid breakpoints, print-optimized media stylesheets for recruiter PDF output, and full WCAG-compliant color contrast.'
            ],
            tools: ['Semantic HTML5', 'Vanilla CSS3', 'JavaScript ES6', 'Git / GitHub Pages', 'Responsive UI/UX'],
            results: '100% mobile-responsive, zero external runtime dependencies, 100/100 Lighthouse performance metrics, and a distinguished professional recruiter footprint.'
        },
        'currency-model': {
            title: 'Global Trade & Currency Risk Valuation Model',
            badge: 'International Trade • Financial Analytics',
            status: 'Academic Research • E.J. Ourso College',
            objective: 'Build quantitative sensitivity models evaluating foreign currency exchange (FX) volatility, customs tariff rate adjustments, and cross-border supply chain margin erosion for multinational corporations.',
            methodology: [
                'Constructed multi-scenario financial valuation models in Microsoft Excel incorporating dynamic exchange rate parity baselines (EUR, MXN, CAD, JPY).',
                'Synthesized macroeconomic balance-of-payments data to forecast quarterly currency appreciation/depreciation corridors.',
                'Designed two-variable sensitivity tables simulating concurrent tariff increases (0% to 25%) against currency swings (-10% to +10%).',
                'Formulated FX hedging recommendation thresholds utilizing forward contract pricing and purchasing power parity (PPP) indicators.'
            ],
            tools: ['Financial Valuation Modeling', 'Microsoft Excel (Sensitivity Tables, INDEX/MATCH)', 'Macroeconomic Trade Theory', 'Risk Quantification'],
            results: 'Provided quantitative roadmap demonstrating how strategic FX hedging protects gross margins against up to 14% unhedged landed cost swings.'
        },
        'banking-compliance': {
            title: 'Banking Transaction & Compliance Workflow Architecture',
            badge: 'Banking Systems • Internal Controls',
            status: 'Applied Industry Model • J.P. Morgan Chase & CIAP',
            objective: 'Document, audit, and optimize retail banking transaction workflows under strict federal compliance frameworks, dual-custody cash controls, and fraud detection protocols.',
            methodology: [
                'Mapped end-to-end customer onboarding and high-value wire disbursement lifecycles, identifying mandatory KYC checkpoints.',
                'Audited Bank Secrecy Act (BSA) and Anti-Money Laundering (AML) red-flag escalation paths to prevent illicit fund movement.',
                'Enforced dual-control cash vault custody and automated teller machine (ATM) dual balancing protocols, eliminating audit variance.',
                'Synthesized frontline branch experience into actionable internal control reviews aligned with LSU Center for Internal Auditing standards.'
            ],
            tools: ['Bank Secrecy Act (BSA)', 'Anti-Money Laundering (AML)', 'KYC Customer Due Diligence', 'Internal Controls (CIA Program)', 'Retail Banking Operations'],
            results: 'Maintained 100% zero-exception balancing and compliance accuracy record across high-volume branch cash and electronic operations.'
        },
        'legal-taxonomy': {
            title: 'Legal Case File Indexing & Records Classification',
            badge: 'Database • Systems Analysis',
            status: 'Public Defender Internship • Baton Rouge',
            objective: 'Design a structured records categorization taxonomy and bilingual indexing schema to eliminate case file retrieval delays for public defense attorneys.',
            methodology: [
                'Conducted systems analysis of existing paper and digital case documentation across East Baton Rouge parish court divisions.',
                'Engineered a standardized alphanumeric indexing taxonomy categorized by parish district jurisdiction, charge classification, and court date.',
                'Implemented bilingual Spanish/English cross-referencing tags for non-English primary documents, motions, and defendant intake forms.',
                'Trained intake personnel on standardized archiving nomenclature and confidential client record maintenance under attorney-client privilege.'
            ],
            tools: ['Records Taxonomy Design', 'Process Flow Engineering', 'Bilingual Translation (EN/ES)', 'Legal Informatics', 'Confidential Data Governance'],
            results: 'Reduced attorney case preparation retrieval time by an estimated 30% across 250+ active criminal dockets and prevented document misfiling.'
        },
        'ai-productivity': {
            title: 'AI-Driven Productivity & Systems Analysis Lab',
            badge: 'Emerging Technology • AI Systems',
            status: 'ISDS 3100 Lab Initiative • Spring 2026',
            objective: 'Evaluate the operational integration of agentic AI coding assistants and generative language models into systems analysis and software engineering curricula.',
            methodology: [
                'Designed structured prompt chains to accelerate systems architecture design (flow diagrams, schema specifications, and UI wireframing).',
                'Benchmarked developer productivity between manual front-end development and AI-assisted pair programming across multi-page workflows.',
                'Evaluated code verification guardrails, documentation integrity, and error mitigation strategies in agentic developer sessions.',
                'Synthesized strategic recommendations for enterprise adoption of generative AI tools balancing speed with code maintainability.'
            ],
            tools: ['Agentic AI Workflows', 'Systems Analysis & Design (SDLC)', 'Prompt Engineering', 'Semantic Web Engineering', 'Version Control'],
            results: 'Demonstrated 4x acceleration in iterative prototyping and verified quality controls for production-ready web application deployment.'
        },
        'multilingual-ed': {
            title: 'Multilingual Academic Support & Educational Materials',
            badge: 'Bilingual Pedagogy • Analytical Tutoring',
            status: 'Private Practice • 2022 – 2024',
            objective: 'Author structured bilingual instructional materials in mathematics and academic composition to bridge language divides for diverse student cohorts.',
            methodology: [
                'Authored parallel Spanish/English instructional modules decomposing multi-step algebra and statistics problem-solving into structured sequential logic.',
                'Delivered one-on-one and small group mentorship tailored to ESL learners, focusing on academic writing conventions and rhetorical clarity.',
                'Formulated individualized progress tracking metrics assessing weekly concept mastery and exam performance trajectories.',
                'Provided cross-cultural guidance to parents and guardians regarding academic expectations and university preparation pathways.'
            ],
            tools: ['Bilingual Pedagogy (Spanish/English)', 'Quantitative Math Instruction', 'Curriculum Design', 'Academic Essay Coaching'],
            results: 'Achieved average 1.5-letter-grade improvement over single academic semesters and fostered sustained quantitative problem-solving confidence.'
        }
    };

    function initCaseStudyModal() {
        let modal = document.getElementById('case-study-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'case-study-modal';
            modal.className = 'case-study-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-hidden', 'true');
            modal.innerHTML = `
                <div class="modal-backdrop"></div>
                <div class="modal-dialog">
                    <button class="modal-close-btn" aria-label="Close modal">&times;</button>
                    <div class="modal-body" id="modal-content">
                        <!-- Dynamic Content Inserted Here -->
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.modal-close-btn');
            const backdrop = modal.querySelector('.modal-backdrop');

            function closeModal() {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }

            closeBtn.addEventListener('click', closeModal);
            backdrop.addEventListener('click', closeModal);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }

        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-case-study]');
            if (trigger) {
                e.preventDefault();
                const key = trigger.getAttribute('data-case-study');
                const data = caseStudiesData[key];
                if (!data) return;

                const contentEl = document.getElementById('modal-content');
                contentEl.innerHTML = `
                    <div class="modal-header-section">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                            <span class="badge badge-primary">${data.badge}</span>
                            <span class="badge badge-gold">${data.status}</span>
                        </div>
                        <h2 style="margin-bottom: 0.5rem; font-size: 1.6rem; color: var(--text-primary);">${data.title}</h2>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-subtitle">Executive Objective</h4>
                        <p>${data.objective}</p>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-subtitle">Analytical & Technical Methodology</h4>
                        <ul class="modal-list">
                            ${data.methodology.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="modal-section">
                        <h4 class="modal-subtitle">Core Technical Stack & Competencies</h4>
                        <div class="skills-container" style="margin-top: 0.5rem;">
                            ${data.tools.map(tool => `<span class="skill-pill"><strong>${tool}</strong></span>`).join('')}
                        </div>
                    </div>

                    <div class="modal-section modal-results-callout">
                        <h4 class="modal-subtitle" style="color: var(--primary);">Measurable Impact & Outcomes</h4>
                        <p style="font-weight: 500; color: var(--text-primary); margin: 0;">${data.results}</p>
                    </div>

                    <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                        <button type="button" class="btn btn-outline modal-close-action">Close Window</button>
                        <a href="mailto:klegie1@lsu.edu?subject=Inquiry:%20${encodeURIComponent(data.title)}" class="btn btn-primary">Discuss Project &rarr;</a>
                    </div>
                `;

                contentEl.querySelector('.modal-close-action').addEventListener('click', () => {
                    modal.classList.remove('active');
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                });

                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // --------------------------------------------------------------------------
    // 7. Interactive Coursework Accordion (on resume.html)
    // --------------------------------------------------------------------------
    function initCourseworkAccordion() {
        const accordion = document.getElementById('coursework-accordion');
        if (!accordion) return;

        const headers = accordion.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isOpen = item.classList.contains('active');

                // Optional: Close others
                accordion.querySelectorAll('.accordion-item').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    }
                });

                item.classList.toggle('active', !isOpen);
                header.setAttribute('aria-expanded', String(!isOpen));
            });
        });
    }

    // --------------------------------------------------------------------------
    // 8. Contact Form Client-Side Feedback (on index.html)
    // --------------------------------------------------------------------------
    function initContactForm() {
        const form = document.querySelector('form[action^="mailto:"]');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const name = form.querySelector('[name="name"]').value.trim();
            const email = form.querySelector('[name="email"]').value.trim();
            const message = form.querySelector('[name="message"]').value.trim();

            if (!name || !email || !message) {
                e.preventDefault();
                alert('Please complete all fields before sending.');
                return;
            }

            // Let mailto proceed or provide toast
            const toast = document.getElementById('toast-notification');
            if (toast) {
                toast.textContent = 'Opening your email client to dispatch message...';
                toast.classList.add('visible');
                setTimeout(() => toast.classList.remove('visible'), 4000);
            }
        });
    }

    // --------------------------------------------------------------------------
    // Bootstrap All Features
    // --------------------------------------------------------------------------
    function initAll() {
        initThemeToggle();
        initScrollFeatures();
        initCopyEmail();
        initProjectFilter();
        initFXSimulator();
        initCaseStudyModal();
        initCourseworkAccordion();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
