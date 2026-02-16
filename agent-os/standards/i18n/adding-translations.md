# Adding New Translations

Step-by-step process for adding new translation keys.

## Process

1. **Identify the section** where the key belongs
   - Use existing sections if possible
   - Create new section only if needed

2. **Choose a descriptive key name**
   ```
   Good: players.modal.labels.fullName
   Bad:  players.m.l.fn
   ```

3. **Add to ALL 5 language files simultaneously**
   
   **pl.json:**
   ```json
   "players": {
       "deleteConfirm": "Czy na pewno chcesz usunąć?"
   }
   ```
   
   **en.json:**
   ```json
   "players": {
       "deleteConfirm": "Are you sure you want to delete?"
   }
   ```
   
   (Repeat for nl.json, de.json, cs.json)

4. **Use in component**
   ```javascript
   {t('players.deleteConfirm')}
   ```

5. **Test in all languages** using language selector

## Checklist

- [ ] Key added to pl.json
- [ ] Key added to en.json
- [ ] Key added to nl.json
- [ ] Key added to de.json
- [ ] Key added to cs.json
- [ ] Same nesting level in all files
- [ ] Tested by switching languages
