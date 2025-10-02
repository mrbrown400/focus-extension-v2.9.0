const blockURL = vendor.extension.getURL("/block.html");
const breakPromptPath = "/break-ended.html";
const breakPromptURL = vendor.extension.getURL(breakPromptPath);

function openBreakEndPrompt() {
    vendor.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs || !tabs.length) { return; }

        const activeTab = tabs[0];
        if (!activeTab || activeTab.id === undefined) { return; }

        const params = new URLSearchParams({
            tabId: String(activeTab.id),
            url: activeTab.url || ""
        });

        vendor.windows.create({
            url: `${breakPromptURL}?${params.toString()}`,
            type: "popup",
            width: 480,
            height: 360,
            focused: true
        }, function () {
            const err = vendor.runtime.lastError;
            if (err) {
                console.log(`Error opening break prompt: ${err.message}`);
            }
        });
    });
}

const conn = new FocusConnection();
conn.version = config.version;
conn.platform = BrowserDetect.browser;



function processFrontmostTab() {
    console.log("Processing front-most tab");
    vendor.windows.getCurrent({ populate: true }, function (currentWindow) {
        for (var i = 0; i < currentWindow.tabs.length; i++) {
            const tab = currentWindow.tabs[i];
            if (tab.active) {
                processTab(tab.id, tab.url);
                break;
            }
        }
    });
}

function handleBeforeNavigate(navDetails) {
    if (!conn.isFocusing) { return }

    if (navDetails.frameId == 0) {
        processTab(navDetails.tabId, navDetails.url);
    }
}

function convertRedirectURLToLocalTemplate(redirectURL) {
    const url = new URL(redirectURL);
    const templateURL = new URL(blockURL);
    templateURL.search = url.search;
    return templateURL.toString();
}


function processTab(tabId, url) {
    if (url.indexOf(blockURL) == 0) return;
    conn.check(tabId, url);
}

vendor.webNavigation.onBeforeNavigate.addListener(handleBeforeNavigate);

conn.block = function (data) {
    if (!data.url) return;
    if (!data.redirectURL) return;
    if (!data.tabId) return;
    console.log(`blocking ${data.url}`);

    const redirectURL = convertRedirectURLToLocalTemplate(data.redirectURL);

    vendor.tabs.update(data.tabId, { url: redirectURL });
};

conn.onfocus = function () {
    openBreakEndPrompt();
    processFrontmostTab();
}

conn.connect();

vendor.runtime.onMessage.addListener(function (request) {
    if (!request || !request.type) { return; }

    if (request.type === "focus-leave-site") {
        const tabId = Number(request.tabId);
        if (Number.isNaN(tabId)) { return; }

        vendor.tabs.remove(tabId, function () {
            const removalError = vendor.runtime.lastError;
            if (removalError) {
                console.log(`Unable to close tab ${tabId}: ${removalError.message}`);
                vendor.tabs.update(tabId, { url: blockURL }, function () {
                    const updateError = vendor.runtime.lastError;
                    if (updateError) {
                        console.log(`Unable to update tab ${tabId}: ${updateError.message}`);
                    }
                });
            }
        });
    }
});
