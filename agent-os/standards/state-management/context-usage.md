# Context API Usage

Use React Context API for global state. No external state libraries.

## Current Contexts

- **TournamentContext** — Active tournament, tournament list
- **MatchesContext** — Match data, match operations
- **AuthContext** (via useAuth) — Authentication state

## Structure

```javascript
import { createContext, useContext, useState } from 'react';

const MyContext = createContext(null);

export const MyProvider = ({ children }) => {
    const [data, setData] = useState([]);
    
    // Operations
    const addItem = (item) => {
        setData(prev => [...prev, item]);
    };
    
    return (
        <MyContext.Provider value={{ data, addItem }}>
            {children}
        </MyContext.Provider>
    );
};

// Export wrapper hook
export const useMyContext = () => {
    const context = useContext(MyContext);
    if (!context) throw new Error('useMyContext must be used within MyProvider');
    return context;
};
```

## When to Use Context

**Use Context for:**
- Data needed by many components
- Global app state (auth, tournament, matches)
- Avoid prop drilling

**Use local state for:**
- Component-specific UI state (modals, forms)
- Data used by one component only
