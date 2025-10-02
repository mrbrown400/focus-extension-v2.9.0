(function () {
    const hasBrowserRuntime = (typeof browser !== "undefined" && browser.runtime);
    const runtime = hasBrowserRuntime
        ? browser.runtime
        : ((typeof chrome !== "undefined" && chrome.runtime) ? chrome.runtime : null);
    const chromeRuntime = (typeof chrome !== "undefined" && chrome.runtime) ? chrome.runtime : null;
    const params = new URLSearchParams(window.location.search);
    const tabId = Number(params.get("tabId"));
    const url = params.get("url") || "";

    const siteNameEl = document.getElementById("site-name");
    const countdownEl = document.getElementById("countdown");
    const leaveButton = document.getElementById("leave-now");
    const stayButton = document.getElementById("stay");

    let remainingSeconds = 60;
    let timerId = null;
    let hasLeft = false;

    function getDisplayHost(rawUrl) {
        try {
            const { hostname } = new URL(rawUrl);
            return hostname || "this site";
        } catch (err) {
            return "this site";
        }
    }

    function updateCountdown() {
        countdownEl.textContent = `Leaving in ${remainingSeconds} seconds...`;
    }

    function closePrompt() {
        window.close();
    }

    function leaveSite() {
        if (hasLeft) { return; }
        hasLeft = true;
        if (timerId) {
            clearInterval(timerId);
        }

        if (runtime && !Number.isNaN(tabId)) {
            const message = { type: "focus-leave-site", tabId: tabId };

            if (hasBrowserRuntime) {
                runtime.sendMessage(message)
                    .then(closePrompt)
                    .catch(function (err) {
                        console.log(`Unable to send leave-site message: ${err.message}`);
                        closePrompt();
                    });
            } else {
                runtime.sendMessage(message, function () {
                    if (chromeRuntime && chromeRuntime.lastError) {
                        console.log(`Unable to send leave-site message: ${chromeRuntime.lastError.message}`);
                    }
                    closePrompt();
                });
                // Ensure the window closes if the runtime call hangs
                setTimeout(closePrompt, 200);
            }
        } else {
            closePrompt();
        }
    }

    function handleStay() {
        if (hasLeft) { return; }
        hasLeft = true;
        if (timerId) {
            clearInterval(timerId);
        }
        closePrompt();
    }

    function tick() {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
            clearInterval(timerId);
            leaveSite();
            return;
        }
        updateCountdown();
    }

    function init() {
        siteNameEl.textContent = getDisplayHost(url);
        updateCountdown();
        timerId = setInterval(tick, 1000);
        leaveButton.addEventListener("click", leaveSite);
        stayButton.addEventListener("click", handleStay);
    }

    init();
})();
