## Goal
Verify the published Lovable app with Google Search Console, add the verification meta tag, and submit the sitemap so Google can index the site.

## Steps

1. **Connect Google Search Console account**
   - Trigger the `google_search_console` connector connect flow so you can authorize access to your Google account.
   - After connection, I will use the gateway to request a site-verification meta tag token.

2. **Add verification meta tag to the app**
   - Insert the Google-provided `<meta name="google-site-verification" content="...">` tag into the `<head>` of `src/routes/__root.tsx` so it is rendered server-side.

3. **Verify ownership with Google**
   - Call the Site Verification API through the connector gateway to tell Google to verify the meta tag.

4. **Register the site in Search Console**
   - Add the site property to Search Console via the API.

5. **Submit sitemap**
   - Submit `https://ucchararon-ai-by-kirrahdia.lovable.app/sitemap.xml` to Search Console so Google knows which pages to crawl.

## What you need to do
- Approve the Google Search Console connector connection when the modal appears (this grants the app permission to manage your Search Console properties).
- The rest is handled automatically.

## Technical details
- No new pages or routes are created; only the root layout head tags are modified.
- The site is already published at `https://ucchararon-ai-by-kirrahdia.lovable.app`, so verification and indexing can proceed immediately once the meta tag is live.
