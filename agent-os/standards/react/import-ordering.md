# Import Ordering

Group imports by type for consistency and readability.

## Order

1. **React** and external libraries
2. **Custom hooks** (from `../hooks/`)
3. **Components** (from `../components/`, `../pages/`)
4. **Icons** (lucide-react)
5. **Utils and constants** (from `../utils/`, `../constants/`)
6. **Styles** (CSS files)

## Example

```javascript
// 1. External libraries
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// 2. Custom hooks
import { usePlayers } from '../hooks/usePlayers';
import { useMatches } from '../hooks/useMatches';
import { useAuth } from '../hooks/useAuth.tsx';

// 3. Components
import PlayerProfileModal from '../components/PlayerProfileModal';
import Layout from '../components/Layout';

// 4. Icons
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

// 5. Utils/Constants
import { EUROPEAN_COUNTRIES } from '../constants/countries';
import { getBracketBlueprint } from '../utils/bracketLogic';

// 6. Styles
import './Players.css';
```

**Why:** Easy to locate imports, consistent across files, reduces merge conflicts.
