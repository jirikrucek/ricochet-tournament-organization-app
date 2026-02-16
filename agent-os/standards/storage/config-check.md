# isSupabaseConfigured Check

Always check `isSupabaseConfigured` before data operations.

## Pattern

```javascript
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const fetchData = async () => {
    if (isSupabaseConfigured) {
        // SUPABASE MODE
        const { data, error } = await supabase
            .from('table')
            .select('*');
        if (error) throw error;
        return data;
    } else {
        // LOCALSTORAGE MODE
        const stored = localStorage.getItem('key');
        return stored ? JSON.parse(stored) : [];
    }
};
```

## What It Checks

```javascript
// src/lib/supabase.js
export const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

- `true` — Both env vars present, use Supabase
- `false` — Missing env vars, use localStorage

## Critical Rules

1. **Check on EVERY data operation** (read, write, delete)
2. **Never assume** one mode or the other
3. **Both modes must work** — App is fully functional offline
