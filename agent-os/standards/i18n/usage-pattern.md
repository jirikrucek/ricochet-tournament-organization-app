# Usage Pattern

Use `useTranslation()` hook and `t()` function in components.

## Basic Usage

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t } = useTranslation();
    
    return (
        <h1>{t('navigation.live')}</h1>
    );
}
```

## With Interpolation

```javascript
// Translation file:
{
  "importSuccess": "Successfully added {{count}} new players."
}

// Component:
{t('players.importSuccess', { count: 5 })}
// Result: "Successfully added 5 new players."
```

## Language Switching

```javascript
const { i18n } = useTranslation();

// Change language
i18n.changeLanguage('en');

// Get current language
const currentLang = i18n.language;
```

## What to Translate

**Use t() for:**
- All user-visible text
- Buttons, labels, titles
- Error messages shown to users

**Don't translate:**
- Technical IDs (match IDs, player IDs)
- Console logs
- Variable names
