-- Seed all DSA subchapters from provided JSON map.
-- Requires:
-- 1) prepkarta_concepts seeded (migration 016)
-- 2) prepkarta_subchapters table created (migration 017)

INSERT INTO prepkarta_subchapters (id, chapter_id, name)
SELECT UUID(), c.id, x.subchapter_name
FROM (
  SELECT 'Mathematics and Complexity' AS chapter_name, 'Time and Space Complexity' AS subchapter_name UNION ALL
  SELECT 'Mathematics and Complexity', 'Logarithms and Exponentials' UNION ALL
  SELECT 'Mathematics and Complexity', 'Recurrence Relations' UNION ALL
  SELECT 'Mathematics and Complexity', 'Modular Arithmetic' UNION ALL
  SELECT 'Mathematics and Complexity', 'Prime Numbers and Sieve of Eratosthenes' UNION ALL
  SELECT 'Mathematics and Complexity', 'GCD and LCM' UNION ALL
  SELECT 'Mathematics and Complexity', 'Fast Exponentiation' UNION ALL

  SELECT 'Arrays and Strings', 'Static and Dynamic Arrays' UNION ALL
  SELECT 'Arrays and Strings', 'Prefix Sum' UNION ALL
  SELECT 'Arrays and Strings', 'Sliding Window Technique' UNION ALL
  SELECT 'Arrays and Strings', 'Two Pointer Technique' UNION ALL
  SELECT 'Arrays and Strings', 'Kadane''s Algorithm' UNION ALL
  SELECT 'Arrays and Strings', 'Sorting an Array' UNION ALL
  SELECT 'Arrays and Strings', 'Searching in Array' UNION ALL
  SELECT 'Arrays and Strings', 'Matrix Traversal' UNION ALL
  SELECT 'Arrays and Strings', 'String Basics' UNION ALL
  SELECT 'Arrays and Strings', 'Pattern Searching' UNION ALL
  SELECT 'Arrays and Strings', 'String Hashing' UNION ALL
  SELECT 'Arrays and Strings', 'Palindrome Problems' UNION ALL
  SELECT 'Arrays and Strings', 'Anagram Problems' UNION ALL

  SELECT 'Linked List', 'Singly Linked List' UNION ALL
  SELECT 'Linked List', 'Doubly Linked List' UNION ALL
  SELECT 'Linked List', 'Circular Linked List' UNION ALL
  SELECT 'Linked List', 'Fast and Slow Pointer Technique' UNION ALL
  SELECT 'Linked List', 'Detect Cycle' UNION ALL
  SELECT 'Linked List', 'Reverse Linked List' UNION ALL
  SELECT 'Linked List', 'Merge Two Lists' UNION ALL
  SELECT 'Linked List', 'LRU Cache Design' UNION ALL

  SELECT 'Stack', 'Stack Implementation' UNION ALL
  SELECT 'Stack', 'Balanced Parentheses' UNION ALL
  SELECT 'Stack', 'Infix Prefix Postfix Expressions' UNION ALL
  SELECT 'Stack', 'Next Greater Element' UNION ALL
  SELECT 'Stack', 'Monotonic Stack' UNION ALL
  SELECT 'Stack', 'Min Stack' UNION ALL
  SELECT 'Stack', 'Largest Rectangle in Histogram' UNION ALL

  SELECT 'Queue', 'Queue Implementation' UNION ALL
  SELECT 'Queue', 'Circular Queue' UNION ALL
  SELECT 'Queue', 'Deque' UNION ALL
  SELECT 'Queue', 'Priority Queue' UNION ALL
  SELECT 'Queue', 'Sliding Window Maximum' UNION ALL
  SELECT 'Queue', 'BFS using Queue' UNION ALL

  SELECT 'Recursion and Backtracking', 'Recursion Basics' UNION ALL
  SELECT 'Recursion and Backtracking', 'Tail Recursion' UNION ALL
  SELECT 'Recursion and Backtracking', 'Subsets' UNION ALL
  SELECT 'Recursion and Backtracking', 'Permutations' UNION ALL
  SELECT 'Recursion and Backtracking', 'Combination Sum' UNION ALL
  SELECT 'Recursion and Backtracking', 'N Queens Problem' UNION ALL
  SELECT 'Recursion and Backtracking', 'Sudoku Solver' UNION ALL
  SELECT 'Recursion and Backtracking', 'Rat in a Maze' UNION ALL
  SELECT 'Recursion and Backtracking', 'Backtracking on Strings' UNION ALL

  SELECT 'Trees', 'Binary Tree Basics' UNION ALL
  SELECT 'Trees', 'Tree Traversals' UNION ALL
  SELECT 'Trees', 'Height and Depth of Tree' UNION ALL
  SELECT 'Trees', 'Diameter of Tree' UNION ALL
  SELECT 'Trees', 'Lowest Common Ancestor' UNION ALL
  SELECT 'Trees', 'Binary Search Tree' UNION ALL
  SELECT 'Trees', 'Balanced Trees' UNION ALL
  SELECT 'Trees', 'AVL Tree Basics' UNION ALL
  SELECT 'Trees', 'Tree Serialization' UNION ALL
  SELECT 'Trees', 'Segment Tree' UNION ALL
  SELECT 'Trees', 'Fenwick Tree' UNION ALL

  SELECT 'Heap', 'Binary Heap' UNION ALL
  SELECT 'Heap', 'Min Heap and Max Heap' UNION ALL
  SELECT 'Heap', 'Heap Sort' UNION ALL
  SELECT 'Heap', 'Priority Queue Applications' UNION ALL
  SELECT 'Heap', 'K Largest and K Smallest Elements' UNION ALL
  SELECT 'Heap', 'Median in Stream' UNION ALL
  SELECT 'Heap', 'Merge K Sorted Lists' UNION ALL

  SELECT 'Hashing', 'Hash Table Basics' UNION ALL
  SELECT 'Hashing', 'Collision Handling' UNION ALL
  SELECT 'Hashing', 'HashMap and HashSet' UNION ALL
  SELECT 'Hashing', 'Frequency Counting' UNION ALL
  SELECT 'Hashing', 'Two Sum and K Sum Problems' UNION ALL
  SELECT 'Hashing', 'Rolling Hash' UNION ALL
  SELECT 'Hashing', 'Caching Basics' UNION ALL

  SELECT 'Graphs', 'Graph Representation' UNION ALL
  SELECT 'Graphs', 'Breadth First Search' UNION ALL
  SELECT 'Graphs', 'Depth First Search' UNION ALL
  SELECT 'Graphs', 'Topological Sort' UNION ALL
  SELECT 'Graphs', 'Cycle Detection' UNION ALL
  SELECT 'Graphs', 'Shortest Path Algorithms' UNION ALL
  SELECT 'Graphs', 'Dijkstra Algorithm' UNION ALL
  SELECT 'Graphs', 'Bellman Ford Algorithm' UNION ALL
  SELECT 'Graphs', 'Floyd Warshall Algorithm' UNION ALL
  SELECT 'Graphs', 'Minimum Spanning Tree' UNION ALL
  SELECT 'Graphs', 'Disjoint Set Union' UNION ALL
  SELECT 'Graphs', 'Strongly Connected Components' UNION ALL
  SELECT 'Graphs', 'Bipartite Graph' UNION ALL
  SELECT 'Graphs', 'Network Flow Basics' UNION ALL

  SELECT 'Greedy Algorithms', 'Activity Selection' UNION ALL
  SELECT 'Greedy Algorithms', 'Fractional Knapsack' UNION ALL
  SELECT 'Greedy Algorithms', 'Huffman Coding' UNION ALL
  SELECT 'Greedy Algorithms', 'Job Scheduling' UNION ALL
  SELECT 'Greedy Algorithms', 'Greedy Interval Problems' UNION ALL
  SELECT 'Greedy Algorithms', 'Gas Station Problem' UNION ALL
  SELECT 'Greedy Algorithms', 'Minimum Platforms Problem' UNION ALL

  SELECT 'Dynamic Programming', 'Dynamic Programming Basics' UNION ALL
  SELECT 'Dynamic Programming', 'Memoization vs Tabulation' UNION ALL
  SELECT 'Dynamic Programming', 'Zero One Knapsack' UNION ALL
  SELECT 'Dynamic Programming', 'Unbounded Knapsack' UNION ALL
  SELECT 'Dynamic Programming', 'Longest Common Subsequence' UNION ALL
  SELECT 'Dynamic Programming', 'Longest Increasing Subsequence' UNION ALL
  SELECT 'Dynamic Programming', 'Matrix Chain Multiplication' UNION ALL
  SELECT 'Dynamic Programming', 'Coin Change' UNION ALL
  SELECT 'Dynamic Programming', 'Subset Sum' UNION ALL
  SELECT 'Dynamic Programming', 'Partition Equal Subset Sum' UNION ALL
  SELECT 'Dynamic Programming', 'DP on Grids' UNION ALL
  SELECT 'Dynamic Programming', 'DP on Trees' UNION ALL
  SELECT 'Dynamic Programming', 'Bitmask DP' UNION ALL
  SELECT 'Dynamic Programming', 'Digit DP Basics' UNION ALL

  SELECT 'Searching and Sorting', 'Binary Search' UNION ALL
  SELECT 'Searching and Sorting', 'Binary Search Variants' UNION ALL
  SELECT 'Searching and Sorting', 'Merge Sort' UNION ALL
  SELECT 'Searching and Sorting', 'Quick Sort' UNION ALL
  SELECT 'Searching and Sorting', 'Counting Sort' UNION ALL
  SELECT 'Searching and Sorting', 'Radix Sort' UNION ALL
  SELECT 'Searching and Sorting', 'Bucket Sort' UNION ALL
  SELECT 'Searching and Sorting', 'Order Statistics' UNION ALL
  SELECT 'Searching and Sorting', 'Dutch National Flag Algorithm' UNION ALL

  SELECT 'Bit Manipulation', 'Bitwise Operators' UNION ALL
  SELECT 'Bit Manipulation', 'Odd Even Check' UNION ALL
  SELECT 'Bit Manipulation', 'Power of Two' UNION ALL
  SELECT 'Bit Manipulation', 'Counting Set Bits' UNION ALL
  SELECT 'Bit Manipulation', 'XOR Tricks' UNION ALL
  SELECT 'Bit Manipulation', 'Subset Generation using Bits' UNION ALL
  SELECT 'Bit Manipulation', 'Bitmasking Techniques' UNION ALL

  SELECT 'Advanced Data Structures', 'Trie' UNION ALL
  SELECT 'Advanced Data Structures', 'Suffix Array Basics' UNION ALL
  SELECT 'Advanced Data Structures', 'Suffix Tree Basics' UNION ALL
  SELECT 'Advanced Data Structures', 'B Tree and B Plus Tree' UNION ALL
  SELECT 'Advanced Data Structures', 'Red Black Tree' UNION ALL
  SELECT 'Advanced Data Structures', 'Skip List' UNION ALL
  SELECT 'Advanced Data Structures', 'Sparse Table' UNION ALL
  SELECT 'Advanced Data Structures', 'Heavy Light Decomposition' UNION ALL

  SELECT 'Advanced Algorithmic Paradigms', 'Divide and Conquer' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Meet in the Middle' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Randomized Algorithms' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Advanced Sliding Window' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Advanced Two Pointers' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Monotonic Queue' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Convex Hull' UNION ALL
  SELECT 'Advanced Algorithmic Paradigms', 'Line Sweep Algorithm' UNION ALL

  SELECT 'Design Based DSA', 'LRU Cache' UNION ALL
  SELECT 'Design Based DSA', 'LFU Cache' UNION ALL
  SELECT 'Design Based DSA', 'Design HashMap' UNION ALL
  SELECT 'Design Based DSA', 'Design Stack with Min' UNION ALL
  SELECT 'Design Based DSA', 'Design Circular Queue' UNION ALL
  SELECT 'Design Based DSA', 'Rate Limiter' UNION ALL
  SELECT 'Design Based DSA', 'Consistent Hashing' UNION ALL
  SELECT 'Design Based DSA', 'Design Autocomplete System'
) x
INNER JOIN prepkarta_subjects s
  ON s.name = 'DSA'
INNER JOIN prepkarta_concepts c
  ON c.subject_id = s.id
 AND c.name = x.chapter_name
ON DUPLICATE KEY UPDATE name = VALUES(name);
