# Module 7 — Web Crawler for Automated Content Delivery

## Product Function
Automates seller catalog onboarding by crawling merchant websites, extracting product metadata, and queueing listings for review and one-click publishing.

## Guardrails & Compliance
1. **Robots.txt Adherence**:
   - Parses `robots.txt` per host; checks `Disallow` and `Allow` rules; respects `Crawl-delay`.
2. **SSRF Guard**:
   - Rejects loopback (127.0.0.1/8), private IP blocks (10/8, 192.168/16, 172.16/12), and cloud metadata endpoints (`169.254.169.254`) unless explicitly allowlisted.
3. **Cheerio Extraction Pipeline**:
   - First parses structured JSON-LD `Product` schemas.
   - Falls back to OpenGraph metadata (`og:title`, `og:price:amount`, `og:image`).
   - Falls back to semantic HTML selectors.
4. **Deduplication & SimHash**:
   - Computes 64-bit locality-sensitive SimHash for near-duplicate page detection.
5. **Review Queue**:
   - Extracted listings are stored in a review queue (`crawled_items`) for seller/admin approval before publishing to the live catalog.
