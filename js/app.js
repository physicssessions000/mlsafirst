// Imports removed for file:// protocol compatibility
// Data and Utils are now loaded as global scripts in index.html

// Global Error Handler for "clean" console experience
window.onerror = function (message, source, lineno, colno, error) {
    // Suppress common non-critical UI warnings
    if (message.includes('ResizeObserver') || message.includes('Script error')) {
        return true;
    }
    return false; // Let critical errors show
};

// SVG Icons (Lucide-like paths)
const icons = {
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>',
    code: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    database: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"/></svg>',
    rocket: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    "graduation-cap": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>'
};

const externalIcon = '<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

function renderCategories() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = '';

    categories.forEach((cat, catIndex) => {
        const card = document.createElement('article');
        card.className = 'card category-card';
        card.style.animationDelay = `${catIndex * 100}ms`; // Staggered entrance

        const iconSvg = icons[cat.icon] || icons.code;

        let linksHtml = cat.links.map((link, linkIndex) => {
            const trackedUrl = generateTrackedLink(link.url);
            // Use unique ID for tracking: catIndex-linkIndex
            const uniqueId = `${catIndex}-${linkIndex}`;
            return `
                <a href="${trackedUrl}" data-track-id="${uniqueId}" data-original-text="${link.text}" target="_blank" rel="noopener noreferrer" class="link-item">
                    <span class="link-text">${link.text}</span>
                    ${externalIcon}
                </a>
            `;
        }).join('');

        card.innerHTML = `
            <div class="card-header">
                <div class="icon-box">${iconSvg}</div>
                <h2>${cat.title}</h2>
            </div>
            <div class="links-list">
                ${linksHtml}
            </div>
        `;

        grid.appendChild(card);
    });
}

// Simple Intersection Observer for scroll animations
function setupObservers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

// Progress Tracking Logic (Robust & Error-Free)
function initProgressTracker() {
    const STORAGE_KEY = 'ambassador_clicked_ids_v2';

    let totalLinks = 0;
    categories.forEach(cat => totalLinks += cat.links.length);

    let clickedIds = [];
    let activeClosingIds = new Set();
    let sessionHeartbeat = null;

    localStorage.removeItem(STORAGE_KEY);

    const countEl = document.getElementById('progress-count');
    const fillEl = document.getElementById('progress-fill');
    const topFillEl = document.getElementById('top-progress-fill');
    const percentEl = document.getElementById('progress-percent');
    const resetBtn = document.getElementById('reset-btn');
    const startBtn = document.getElementById('start-session-btn');

    function updateUI() {
        const count = clickedIds.length;
        const percent = totalLinks > 0 ? Math.round((count / totalLinks) * 100) : 0;

        if (countEl) countEl.textContent = `${count}/${totalLinks}`;
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (fillEl) fillEl.style.width = `${percent}%`;
        if (topFillEl) topFillEl.style.width = `${percent}%`;

        document.querySelectorAll('.link-item').forEach(link => {
            const id = link.getAttribute('data-track-id');
            if (activeClosingIds.has(id)) return;

            const originalText = link.getAttribute('data-original-text') || link.querySelector('.link-text')?.innerText || "Link";

            if (clickedIds.includes(id)) {
                link.classList.add('visited-link');
                link.innerHTML = `
                    <div>
                        <span class="link-text">${originalText}</span>
                        <span class="badge-done">DONE</span>
                    </div>
                    <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                `;
            } else {
                link.classList.remove('visited-link');
                link.innerHTML = `
                    <span class="link-text">${originalText}</span>
                    ${externalIcon}
                `;
            }
        });

        // Celebration
        if (percent === 100 && totalLinks > 0 && !sessionStorage.getItem('celebrated_current_session')) {
            sessionStorage.setItem('celebrated_current_session', 'true');
            setTimeout(() => {
                // Infinite Confetti (0)
                if (typeof Confetti !== 'undefined') Confetti.launch(0);
                const modal = document.getElementById('celebration-modal');
                if (modal) modal.style.display = 'flex';
            }, 500);
        }
    }

    document.querySelectorAll('.link-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;
            const id = link.getAttribute('data-track-id');

            if (activeClosingIds.has(id)) return;

            const newWindow = window.open(url, '_blank');
            
            // Check if blocked
            if (!newWindow) {
                // Popup Blocked
                link.innerHTML = `
                    <span class="link-text" style="color: #ef4444">POPUP BLOCKED</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                `;
                // Do not start countdown or add to closing list
                return;
            }

            if (newWindow) {
                try {
                    newWindow.blur();
                    window.focus();
                } catch (e) {
                    // Ignored: expected focus behavior
                }
            }

            // Robust Interval Timer
            const DURATION = 10000;
            const startTime = Date.now();
            const endTime = startTime + DURATION;
            activeClosingIds.add(id);

            // Visual Updates - Ensure clean state
            link.classList.remove('visited-link'); // Force remove visited status if present
            link.classList.add('closing');

            const timerInterval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
                const progress = Math.min(100, ((now - startTime) / DURATION) * 100);

                link.innerHTML = `
                    <div class="countdown-bar" style="width: ${progress}%"></div>
                    <span style="position:relative; z-index:2">CLOSING IN ${remaining}s...</span>
                `;

                if (now >= endTime) {
                    clearInterval(timerInterval);
                    try { if (newWindow) newWindow.close(); } catch (e) { }
                    activeClosingIds.delete(id);
                    link.classList.remove('closing');
                    if (id && !clickedIds.includes(id)) clickedIds.push(id);
                    updateUI();
                }
            }, 250);
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Reset all progress?')) {
                if (sessionHeartbeat) {
                    clearInterval(sessionHeartbeat);
                    sessionHeartbeat = null;
                }
                clickedIds = [];
                activeClosingIds.clear();
                if (startBtn) {
                    startBtn.classList.remove('running');
                    startBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        <span>START SESSION</span>
                    `;
                }
                sessionStorage.removeItem('celebrated_current_session');
                updateUI();
            }
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (startBtn.classList.contains('running')) return;
            if (!confirm("Start automated session? Tabs will open and close automatically.")) return;

            startBtn.classList.add('running');
            const originalText = startBtn.innerHTML;
            startBtn.innerHTML = '<span>SESSION STARTED</span>';

            const links = Array.from(document.querySelectorAll('.link-item'));
            const unvisitedLinks = links.filter(link => {
                const id = link.getAttribute('data-track-id');
                return !clickedIds.includes(id);
            });

            if (unvisitedLinks.length === 0) {
                alert("All links already visited!");
                startBtn.classList.remove('running');
                startBtn.innerHTML = originalText;
                return;
            }

            let index = 0;
            let nextActionTime = Date.now();
            const PACE = 2500; // Slower pace to prevent popup blocking (2.5s)

            sessionHeartbeat = setInterval(() => {
                const now = Date.now();
                if (now < nextActionTime) return;

                if (index >= unvisitedLinks.length) {
                    clearInterval(sessionHeartbeat);
                    startBtn.classList.remove('running');
                    startBtn.innerHTML = '<span>SESSION ENDED</span>';
                    setTimeout(() => startBtn.innerHTML = originalText, 3000);
                    return;
                }

                const link = unvisitedLinks[index];
                link.scrollIntoView({ behavior: 'smooth', block: 'center' });
                link.style.boxShadow = '0 0 20px #0078d4';

                setTimeout(() => {
                    link.click();
                    link.style.boxShadow = '';
                }, 200);

                index++;
                nextActionTime = now + PACE;
            }, 500);
        });
    }

    updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
    // Header Pill Copy Functionality
    const copyBtn = document.getElementById('copy-query-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = '?wt.mc_id=studentamb_395468';
            navigator.clipboard.writeText(text).then(() => {
                const codeEl = copyBtn.querySelector('.query-text');
                const originalText = codeEl.textContent;
                codeEl.textContent = 'COPIED!';
                codeEl.style.color = '#22c55e';

                setTimeout(() => {
                    codeEl.textContent = originalText;
                    codeEl.style.color = '';
                }, 2000);
            });
        });
    }

    renderCategories();
    setupObservers();
    initProgressTracker(); // Initialize the tracker

    // Mouse positioning for card glow effects & 3D Tilt
    const grid = document.getElementById('categories-grid');
    if (grid) {
        grid.onmousemove = e => {
            for (const card of document.getElementsByClassName('card')) {
                const rect = card.getBoundingClientRect(),
                    x = e.clientX - rect.left,
                    y = e.clientY - rect.top;

                // Set CSS variables for spotlight
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // 3D Tilt Calculation
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const MAX_ROTATION = 10;
                const rotateX = ((y - centerY) / centerY) * -MAX_ROTATION;
                const rotateY = ((x - centerX) / centerX) * MAX_ROTATION;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }
        };

        grid.onmouseleave = () => {
            for (const card of document.getElementsByClassName('card')) {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            }
        };
    }

    // Global Ripple Effect
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    });

    // Magic Cursor Trail (Synced with RAF for drawing alignment)
    const cursor = document.createElement('div');
    cursor.className = 'magic-cursor';
    document.body.appendChild(cursor);

    let mouseX = -100, mouseY = -100; // Start off-screen
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function loopCursor() {
        // Use double translate for explicit centering without CSS margin reliance
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
        requestAnimationFrame(loopCursor);
    }
    loopCursor();

    // Trigger Curtain Entrance
    setTimeout(() => {
        const curtain = document.getElementById('loading-curtain');
        if (curtain) {
            curtain.classList.add('open');
            // Remove from DOM for performance after animation
            setTimeout(() => {
                // curtain.style.display = 'none'; // Keep structure for smoothness, but could hide
            }, 2000);
        }
    }, 500); // Short delay to ensure styles loaded
});

// Global Function for HTML onclick
window.closeCelebration = function () {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
        modal.style.display = 'none';
        if (typeof Confetti !== 'undefined') {
            Confetti.stop();
        }
    }
};
