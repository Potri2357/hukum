# Hukum Showcase & Evaluation Demo Script

Follow this step-by-step showcase flow to demonstrate all features and the seven distributed systems capabilities:

## 1. Storefront Wow & Autocomplete (Module 6)
1. Open the storefront at `http://localhost:3000`.
2. Notice the Spark Yellow (`#FFC700`) + Ink (`#0F0F10`) luxury design system, DM Sans typography, and hero carousel.
3. In the giant search bar, type `iph`.
4. Observe **instant live suggestions** appearing in under 1 millisecond (Trie precomputed top-K).
5. Press Enter or click a suggestion to filter the product catalog.

## 2. Product Detail Page & URL Shortener (Module 1 & 2)
1. Click on the flagship **Aurora X Pro 5G** product card.
2. Notice the sticky gallery, verified ratings histogram, delivery pincode check, and **"Buy from other sellers"** offer matrix.
3. Click the **"Copy Link"** button under *Share Branded Short Link*.
4. A short URL is instantly generated: `http://localhost:8080/aB3xY9q` (or `http://localhost:4000/:code`).
5. Open this short link in a new browser tab: notice the instant 302 redirect back to the product.
6. Open `/lab` to see the **Cache Hit Ratio** jump to 100%!

## 3. Cart, Coupons & Simulated Checkout (Payment Simulator)
1. On the PDP, click **"Add to Cart"**.
2. Go to the Cart page (`/cart`).
3. Under *Apply Coupon*, enter `HUKUM500` and click Apply: see the ₹500 discount applied.
4. Click **"Proceed to Checkout"**.
5. On the checkout stepper, note the **"100% In-House Simulated Payment Gateway"** banner.
6. Test deterministic outcomes:
   - Enter UPI ID `success@hukum` -> click Pay -> instant success!
   - (Optional) Try `fail@hukum` to see simulated decline.
   - (Optional) Try Card ending in `3220` to see the simulated 3-D Secure OTP dialog (code: `123456`).
7. Upon payment success, you are routed to the **Live Order Tracking** page (`/orders/[id]`).
8. Watch the delivery stages advance in real-time via **Server-Sent Events (SSE)**!

## 4. System Lab — Engineering Console (`/lab`)
1. Click **"System Lab"** in the top navigation or navigate to `http://localhost:3000/lab`.
2. **Overview Panel**: View live service health, active shards, ring nodes, and Redis metrics.
3. **Cache & Shortener Panel**: Toggle the **Cache ON/OFF** switch live and compare latency charts.
4. **DB Sharding Panel**:
   - Inspect the 3 active MongoDB Shards (`shard-a`, `shard-b`, `shard-c`).
   - Click **"Test Targeted Query"** vs **"Test Scatter-Gather Query"** to see `explain()` query routing output.
   - Click **"Test Monotonic Timestamp Hotspot"** vs **"Test Balanced Hashed Key"** to demonstrate insert skew prevention!
   - Click **"+ Add Dynamic Shard D"** to watch chunks auto-rebalance!
5. **Consistent Hash Ring & Distributed Sort Panel**:
   - View the interactive circular canvas with 150 vnodes per physical node.
   - Click **"+ Add Node"** and watch keys rebalance with minimal movement (~ 1/(N+1)).
   - Click **"Run Distributed Sort"**: watches local top-K sorting on nodes and K-way Min-Heap merge.
6. **Rate Limiter Panel**:
   - Click **"Fire 200 Reqs Burst"**: watches the Token Bucket drain down to 0, return 429 Retry-After, and recover at 5 tokens/sec.
   - Compares Token Bucket vs Fixed Window vs Sliding Window side-by-side.
7. **Payment Simulator Chaos Panel**:
   - Force all transactions to fail or succeed, simulate duplicate webhooks, or configure webhook delay.

## 5. Web Crawler Seller Import (Module 7)
1. Go to the **Seller Hub** (`/seller`).
2. Click the **"Crawler Import"** tab.
3. Enter `http://localhost:5050` (the bundled mock seller website).
4. Click **"Start Crawl"**.
5. Watch the live console stream:
   - Fetches and verifies `robots.txt`
   - Blocks disallowed `/admin/` path
   - Extracts JSON-LD `Product` schemas
6. Click **"Approve & Publish"** on an extracted item: it appears immediately in the main marketplace catalog and autocomplete!
