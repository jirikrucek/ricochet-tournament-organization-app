# Component Structure

Consistent internal component organization.

## Pattern

```javascript
const MyComponent = ({ prop1, prop2 }) => {
    // 1. HOOKS (useState, custom hooks, etc.)
    const { t } = useTranslation();
    const [state, setState] = useState(null);
    const { data, loading } = useCustomHook();
    
    // 2. EFFECTS (useEffect, useCallback, useMemo)
    useEffect(() => {
        // Side effects
    }, [dependencies]);
    
    const memoValue = useMemo(() => compute(), [deps]);
    
    // 3. HELPER FUNCTIONS (event handlers, utils)
    const handleClick = () => {
        setState(newValue);
    };
    
    // 4. EARLY RETURNS / GUARDS
    if (loading) return <div>Loading...</div>;
    if (!data) return null;
    
    // 5. MAIN JSX RETURN
    return (
        <div>
            <button onClick={handleClick}>
                {t('common.save')}
            </button>
        </div>
    );
};
```

## Guidelines

- **Group similar hooks together** (all useState, then useEffect)
- **Keep helpers close to where they're used** (or extract to utils if reusable)
- **Early returns for loading/error states** before main render
- **Extract complex JSX** to sub-components if > 100 lines
