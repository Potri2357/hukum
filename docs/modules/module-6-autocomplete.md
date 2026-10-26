# Module 6 — Autocomplete with Prefix Matching

## Product Function
Instant, relevant search bar suggestions within 1–2 characters for product titles, brands, and categories.

## Architecture & Scoring Formula
1. **In-Memory Trie**:
   - Each node precomputes and stores `topK` (default 10) suggestions sorted descending by score.
   - Query time: $O(\text{prefix length})$, zero subtree traversal needed at query time.
2. **Score Formulation**:
   $$\text{Score} = w_1 \cdot \log(\text{searchCount}) + w_2 \cdot \text{recencyDecay} + w_3 \cdot \text{CTR} + w_4 \cdot \text{popularity} + w_5 \cdot \text{inStockBoost}$$
3. **Typo Tolerance**:
   - Levenshtein edit-distance-1 fallback for prefix mistypes (e.g. `samsun` -> `samsung`).
4. **Client Behavior**:
   - Debounced at 100ms, arrow-key navigation, ARIA combobox pattern, highlight of matched prefix.
