# Module 1 — URL Shortener Using Hashing and Redis

## Product Function
Short, branded, trackable links (`spk.link/aB3xY9q`) for sharing products, carts, wishlists, and campaigns.

## Implementation Architecture
1. **URL Normalization**: Lowercases scheme and host, strips tracking parameters (`utm_*`, `gclid`), and sorts remaining query parameters.
2. **Hashing & Base62**: Computes `SHA-256(normalizedURL + salt)`, takes the first 64 bits (Big-Endian unsigned integer), and encodes in Base62 to a 7-character code.
3. **Collision Strategy**:
   - Re-hashes with `salt = salt + _retry_ + attemptNumber` (up to 5 attempts).
   - Falls back to counter-based strategy if needed.
   - Idempotent: returns existing short code if the same normalized URL already exists.
4. **Data Model**:
   - Shard key on `_id` (short code) for uniform distribution.
