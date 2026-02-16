# Context Access Pattern

Always export contexts with a useContext wrapper hook.

## Pattern

```javascript
// MyContext.jsx
import { createContext, useContext } from 'react';

const MyContext = createContext(null);

export const MyProvider = ({ children }) => {
    // ... provider logic
    return (
        <MyContext.Provider value={value}>
            {children}
        </MyContext.Provider>
    );
};

// Export wrapper hook (NOT the context itself)
export const useMyContext = () => {
    const context = useContext(MyContext);
    if (!context) {
        throw new Error('useMyContext must be used within MyProvider');
    }
    return context;
};
```

## Usage in Components

```javascript
// ✓ Correct
import { useMyContext } from '../contexts/MyContext';

const MyComponent = () => {
    const { data, actions } = useMyContext();
    // ...
};
```

```javascript
// ✗ Don't access context directly
import { useContext } from 'react';
import { MyContext } from '../contexts/MyContext';

const MyComponent = () => {
    const context = useContext(MyContext); // NO!
};
```

## Benefits

- **Type safety:** Hook ensures context exists
- **Clear errors:** "used outside provider" instead of undefined values
- **Consistency:** All contexts accessed the same way
- **Refactoring:** Change context internals without updating imports
