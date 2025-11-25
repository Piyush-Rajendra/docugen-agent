# semver/is_range.ts

This module provides utilities for validating semantic version ranges and comparators according to the SemVer specification.

## Functions

### `isComparator`
**Line:** 8

**Purpose:** Validates whether a given string represents a valid semantic version comparator.

**Parameters:**
- `value: string` - The string to validate as a comparator

**Return Type:** `boolean`

**Usage Example:**
```typescript
import { isComparator } from './semver/is_range.ts';

console.log(isComparator('>=1.0.0')); // true
console.log(isComparator('~2.1.0')); // true
console.log(isComparator('invalid')); // false
```

### `isRange`
**Line:** 42

**Purpose:** Validates whether a given string represents a valid semantic version range, which may consist of one or more comparators.

**Parameters:**
- `value: string` - The string to validate as a version range

**Return Type:** `boolean`

**Usage Example:**
```typescript
import { isRange } from './semver/is_range.ts';

console.log(isRange('>=1.0.0 <2.0.0')); // true
console.log(isRange('~1.2.3 || ^2.0.0')); // true
console.log(isRange('not-a-range')); // false
```

## Types

### `assertion`
**Line:** 28

**Purpose:** Type definition used for assertion-related functionality in range validation.

*Note: Specific type details would require examining the actual implementation to provide complete parameter and structure information.*