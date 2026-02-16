# Custom Hooks Pattern

Encapsulate data operations and context access in custom hooks.

## Pattern

**Don't:** Use context directly in components
```javascript
// ✗ Avoid
import { useContext } from 'react';
import { TournamentContext } from '../contexts/TournamentContext';

const MyComponent = () => {
    const context = useContext(TournamentContext);
    // ...
};
```

**Do:** Create and use custom hooks
```javascript
// ✓ Correct
import { useTournament } from '../contexts/TournamentContext';

const MyComponent = () => {
    const { activeTournamentId, selectTournament } = useTournament();
    // ...
};
```

## Hook Structure

```javascript
// usePlayers.js
export const usePlayers = () => {
    const [players, setPlayers] = useState([]);
    const { activeTournamentId } = useTournament();
    
    // Data fetching
    useEffect(() => {
        fetchPlayers();
    }, [activeTournamentId]);
    
    // Operations
    const addPlayer = async (data) => { /* ... */ };
    const updatePlayer = async (id, data) => { /* ... */ };
    const deletePlayer = async (id) => { /* ... */ };
    
    return { players, addPlayer, updatePlayer, deletePlayer };
};
```

## Benefits

- **Encapsulation:** Data and operations stay together
- **Reusability:** Same hook in multiple components
- **Type safety:** Single source of truth for API
- **Testing:** Easier to mock hooks than contexts
