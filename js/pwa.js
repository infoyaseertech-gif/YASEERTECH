// ============================================
//   YASEERTECH PWA INSTALL PROMPT (pwa.js)
//   Save as: js/pwa.js
// ============================================

let deferredPrompt = null;

// ========================
// CATCH THE INSTALL EVENT
// ========================
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

// ========================
// SHOW INSTALL BANNER
// ========================
function showInstallBanner() {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if user already dismissed it in last 3 days
    const dismissed = localStorage.getItem("yt_pwa_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return;

    // Create banner
    const banner = document.createElement("div");
    banner.id = "pwa-banner";
    banner.innerHTML = `
        <div id="pwa-banner-inner">
            <div id="pwa-banner-left">
                <img src="/images/logo.png" alt="YaseerTech" id="pwa-banner-logo">
                <div>
                    <strong>YaseerTech</strong>
                    <span>Install our app for quick access</span>
                </div>
            </div>
            <div id="pwa-banner-btns">
                <button id="pwa-install-btn" onclick="installApp()">Install</button>
                <button id="pwa-dismiss-btn" onclick="dismissBanner()">✕</button>
            </div>
        </div>
    `;

    // Styles
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ffffff;
        border-top: 3px solid #FF6B00;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
        z-index: 99999;
        padding: 14px 20px;
        font-family: 'Poppins', sans-serif;
        animation: slideUp 0.4s ease;
    `;

    document.head.insertAdjacentHTML("beforeend", `
        <style>
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }
            #pwa-banner-inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                max-width: 600px;
                margin: 0 auto;
            }
            #pwa-banner-left {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            #pwa-banner-logo {
                width: 44px;
                height: 44px;
                object-fit: contain;
                border-radius: 10px;
                background: #0A2540;
                padding: 4px;
            }
            #pwa-banner-left strong {
                display: block;
                font-size: 14px;
                font-weight: 700;
                color: #0A2540;
            }
            #pwa-banner-left span {
                display: block;
                font-size: 12px;
                color: #6B7280;
                margin-top: 2px;
            }
            #pwa-banner-btns {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            #pwa-install-btn {
                background: #FF6B00;
                color: white;
                border: none;
                padding: 10px 22px;
                border-radius: 8px;
                font-family: 'Poppins', sans-serif;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }
            #pwa-dismiss-btn {
                background: #f3f4f6;
                color: #6B7280;
                border: none;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        </style>
    `);

    document.body.appendChild(banner);
}

// ========================
// INSTALL ACTION
// ========================
async function installApp() {
    if (!deferredPrompt) {
        // Fallback for iOS or if prompt not available
        showIOSGuide();
        return;
    }
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
        hideBanner();
    }
    deferredPrompt = null;
}

// ========================
// DISMISS
// ========================
function dismissBanner() {
    localStorage.setItem("yt_pwa_dismissed", Date.now().toString());
    hideBanner();
}

function hideBanner() {
    const banner = document.getElementById("pwa-banner");
    if (banner) {
        banner.style.animation = "none";
        banner.style.transform = "translateY(100%)";
        banner.style.opacity   = "0";
        banner.style.transition = "all 0.3s ease";
        setTimeout(() => banner.remove(), 300);
    }
}

// ========================
// iOS GUIDE (Safari)
// ========================
function showIOSGuide() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const guide = document.createElement("div");
    guide.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        z-index: 999999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding: 20px;
        font-family: 'Poppins', sans-serif;
    `;
    guide.innerHTML = `
        <div style="background:white;border-radius:20px;padding:28px 24px;width:100%;max-width:400px;text-align:center;">
            <img src="/images/logo.png" style="width:64px;height:64px;object-fit:contain;border-radius:14px;background:#0A2540;padding:6px;margin-bottom:16px;">
            <h3 style="color:#0A2540;font-size:18px;font-weight:800;margin-bottom:8px;">Install YaseerTech</h3>
            ${isIOS ? `
                <p style="color:#6B7280;font-size:14px;line-height:1.6;margin-bottom:20px;">
                    Tap the <strong>Share button</strong> (↑) at the bottom of Safari,<br>
                    then tap <strong>"Add to Home Screen"</strong>
                </p>
                <div style="font-size:36px;margin-bottom:20px;">📤</div>
            ` : `
                <p style="color:#6B7280;font-size:14px;line-height:1.6;margin-bottom:20px;">
                    Tap the <strong>menu (⋮)</strong> in Chrome,<br>
                    then tap <strong>"Add to Home Screen"</strong>
                </p>
                <div style="font-size:36px;margin-bottom:20px;">⋮</div>
            `}
            <button onclick="this.closest('div').parentElement.remove()" style="background:#FF6B00;color:white;border:none;padding:12px 32px;border-radius:8px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;width:100%;">Got It</button>
        </div>
    `;
    document.body.appendChild(guide);
}

// ========================
// REGISTER SERVICE WORKER
// ========================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(() => console.log("YaseerTech PWA active"))
            .catch(err => console.log("SW:", err));
    });
}

// ========================
// AUTO SHOW FOR iOS
// (iOS never fires beforeinstallprompt)
// ========================
window.addEventListener("load", () => {
    const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const dismissed    = localStorage.getItem("yt_pwa_dismissed");
    const tooSoon      = dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000;

    if (isIOS && !isStandalone && !tooSoon) {
        setTimeout(showInstallBanner, 2000);
    }
});
