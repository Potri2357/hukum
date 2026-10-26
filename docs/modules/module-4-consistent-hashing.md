# Module 4 — Consistent Hashing & Distributed Data Sorting

## Product Function
Produces globally sorted catalog listings (e.g. "Top 100 Best Sellers", "Price: Low to High") across partitioned data nodes without central bottlenecks, and maps partitions onto a ring.

## Implementation Details
1. **Hash Space**: 0 .. 2³²-1 using 32-bit MurmurHash3.
2. **Virtual Nodes (vnodes)**: 150 vnodes per physical node for smooth key distribution.
3. **Replication Factor**: R=2 distinct physical replica nodes.
4. **Scatter-Sort-Merge Algorithm**:
   - Step 1: Assign records to logical nodes on the ring by ID.
   - Step 2: Each node executes local parallel sort on its partition.
   - Step 3: Top-K pruning — nodes return only their top (K + offset) items.
   - Step 4: K-way merge using Min/Max Heap in O(K log N).
5. **Rebalancing Analysis**: Proves that adding/removing a node migrates only ~ 1/(N+1) of keys, whereas naive modulo hashing remaps ~ (N-1)/N of all keys.
