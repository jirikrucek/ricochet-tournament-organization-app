# Brazilian Drop Patterns

`getTargetDropId()` defines where losers drop in the bracket. **Never modify without understanding the complete flow.**

## Drop Rules

```javascript
// WB R1 → LB R1 (Sequential)
wb-r1-m{N} → lb-r1-m{ceil(N/2)}

// WB R2 → LB R2 (Diagonal)
wb-r2-m{N} → lb-r2-m{9-N}

// WB R3 → LB R4 (Cross)
wb-r3-m1 → lb-r4-m2
wb-r3-m2 → lb-r4-m1  
wb-r3-m3 → lb-r4-m4
wb-r3-m4 → lb-r4-m3

// WB R4 → LB R6 (Cross)
wb-r4-m1 → lb-r6-m2
wb-r4-m2 → lb-r6-m1

// WB R5 Final → Consolation Final
wb-r5-m1 → consolation-final
```

**Critical:** These patterns ensure balanced competitive paths. Changing them breaks the tournament structure.
