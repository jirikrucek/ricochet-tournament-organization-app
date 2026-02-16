# Seeding Pattern

Standard 32-player snake/spread seeding defined in `SEEDING_PAIRS`.

## Seeding Pairs

```javascript
const SEEDING_PAIRS = [
    [1, 32],   // wb-r1-m1
    [16, 17],  // wb-r1-m2
    [9, 24],   // wb-r1-m3
    [8, 25],   // wb-r1-m4
    [5, 28],   // wb-r1-m5
    [12, 21],  // wb-r1-m6
    [13, 20],  // wb-r1-m7
    [4, 29],   // wb-r1-m8
    [3, 30],   // wb-r1-m9
    [14, 19],  // wb-r1-m10
    [11, 22],  // wb-r1-m11
    [6, 27],   // wb-r1-m12
    [7, 26],   // wb-r1-m13
    [10, 23],  // wb-r1-m14
    [15, 18],  // wb-r1-m15
    [2, 31]    // wb-r1-m16
];
```

## Purpose

- Ensures top seeds don't meet until later rounds
- Standard tournament bracket distribution  
- Maps seed positions to WB R1 matches

**Usage:** Loop through pairs to assign players to `wb-r1-m{N}` matches.
