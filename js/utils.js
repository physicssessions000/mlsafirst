const CONTRIBUTOR_ID = 'studentamb_395468';

function generateTrackedLink(url) {
    if (!url) return '#';

    try {
        const urlObj = new URL(url);

        // 1. Remove locale from path (e.g. /en-us/something -> /something)
        // Regex looks for /xx-xx/ at the start of the path
        const localeRegex = /^\/[a-z]{2}-[a-z]{2}\//i;
        if (localeRegex.test(urlObj.pathname)) {
            urlObj.pathname = urlObj.pathname.replace(localeRegex, '/');
        }

        // 2. Append or merge query param
        // If 'wt.mc_id' already exists, we might want to overwrite it or leave it. 
        // Requirement says: "if url contains '?', replace '?' in YOUR ID with '&'".
        // This implies appending. If params exist, we append &key=value.

        urlObj.searchParams.append('wt.mc_id', CONTRIBUTOR_ID);

        return urlObj.toString();
    } catch (e) {
        console.error('Invalid URL:', url, e);
        return url;
    }
}
