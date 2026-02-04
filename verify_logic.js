// Verification Script to prove URL transformation logic works
// This mimics the logic in the browser-side code exactly.

const CONTRIBUTOR_ID = 'studentamb_395468';

function generateTrackedLink(url) {
    if (!url) return '#';
    try {
        const urlObj = new URL(url);

        // 1. Remove locale
        const localeRegex = /^\/[a-z]{2}-[a-z]{2}\//i;
        if (localeRegex.test(urlObj.pathname)) {
            urlObj.pathname = urlObj.pathname.replace(localeRegex, '/');
        }

        // 2. Append ID
        urlObj.searchParams.append('wt.mc_id', CONTRIBUTOR_ID);
        return urlObj.toString();
    } catch (e) {
        return 'INVALID URL';
    }
}

const testLinks = [
    // A few samples from the project
    "https://learn.microsoft.com/copilot",
    "https://azure.microsoft.com/free",
    "https://learn.microsoft.com/en-us/copilot", // Test locale removal
    "https://example.com/page?foo=bar" // Test existing params
];

console.log("--- URL VERIFICATION REPORT ---");
testLinks.forEach(link => {
    console.log(`Original: ${link}`);
    console.log(`Tracked:  ${generateTrackedLink(link)}`);
    console.log('---');
});
