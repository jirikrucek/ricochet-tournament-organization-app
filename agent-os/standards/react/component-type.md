# Component Type

Use functional components with hooks. No class components.

## Rule

**All components must be functional (arrow or named functions).**

```javascript
// ✓ Correct
const MyComponent = () => {
    const [state, setState] = useState(null);
    return <div>{state}</div>;
};

// ✓ Also correct
function MyComponent() {
    const [state, setState] = useState(null);
    return <div>{state}</div>;
}

// ✗ Don't use class components
class MyComponent extends React.Component {
    render() { return <div />; }
}
```

## Exception

**ErrorBoundary.jsx** is the ONLY class component.

- React Error Boundaries require `componentDidCatch` lifecycle method
- No functional equivalent exists yet
- This is the only valid use of class components

## Why Functional?

- Hooks API (useState, useEffect, custom hooks)
- Simpler, less boilerplate
- Better TypeScript support
- React team's recommended approach
