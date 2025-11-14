# Translation Management System

## Overview

This document describes the automated translation key management system for the Standario application. The system provides:

1. **Automatic Key Detection** - Scans source code for all translation key usages
2. **Missing Key Generation** - Automatically adds missing keys to translation files
3. **Translation Validation** - Ensures consistency across language files
4. **Unused Key Detection** - Identifies translation keys that are no longer used in code

## Key Statistics

- **Source Files Scanned**: 234 TypeScript/React files
- **Active Translation Keys**: 1,060 unique keys currently used in source code
- **English Translation Keys**: 2,643 total (1,583 unused)
- **Slovenian Translation Keys**: 2,885 total (1,825 unused)

### Note on Unused Keys

The unused keys detected (1,583 in English, 1,825 in Slovenian) are primarily:
- **Structured namespaces** from imported translation modules (e.g., `addModals`, `addModals.device`)
- **Legacy translations** from deprecated components
- **Keys used dynamically** via string concatenation (not captured by static analysis)
- **Placeholder keys** for future features or A/B testing

These are typically safe to keep as they provide namespace organization and forward compatibility.

## Usage

### 1. Scan for Missing Keys (Add Missing Translations)

This command scans all source code files for translation key usages and automatically adds any missing keys to the translation JSON files with placeholder values.

```bash
npm run scan:translations
```

**What it does:**
- Extracts all `t('key')` patterns from TypeScript/React files
- Identifies missing keys in `public/locales/en/translation.json`
- Identifies missing keys in `public/locales/sl/translation.json`
- Automatically adds missing keys with placeholder values: `"[MISSING: key.name]"`
- Creates backups of original files before modifications

**Output Example:**
```
🔍 Scanning for missing translation keys...
Found 234 source files to scan
Extracted 1060 unique translation keys

📝 Processing English translations...
  Added 0 missing keys to EN
  File: public/locales/en/translation.json

📝 Processing Slovenian translations...
  Added 5 missing keys to SL
  File: public/locales/sl/translation.json
```

### 2. Validate Translation Coverage

This command checks translation file consistency and identifies coverage gaps.

```bash
npm run validate:translations
```

**What it does:**
- Compares keys in English and Slovenian translation files
- Reports keys present in one language but missing in another
- Provides detailed coverage statistics
- Lists all keys for detailed inspection if needed

**Output Example:**
```
📊 Translation Validation Report

English Translations: 2,643 total keys, 1,583 unused
Slovenian Translations: 2,885 total keys, 1,825 unused

✓ All keys used in source code are present in translation files
```

### 3. Identify Unused Keys

This command identifies translation keys that exist in files but aren't used in the source code.

```bash
npm run cleanup:translations
```

**What it does:**
- Extracts all keys from source code (same as scan command)
- Compares against keys in translation JSON files
- Reports unused keys with context
- Helps identify deprecated or legacy translations

**Output Example:**
```
📊 Summary:
Used keys: 1060
Total unused keys across languages: 3408

⚠️  Note: These keys are in translation files but not used in source code.
They may be:
  - Deprecated keys that can be safely removed
  - Keys used dynamically (via variables)
  - Placeholder keys for future features
```

## Implementation Details

### Scanning Algorithm

The translation key scanner uses regex patterns to extract translation key usages:

```javascript
/(?:t\(['"]|i18next\.t\(['"]|\.t\(['"])([a-zA-Z0-9_.]+)['"]/g
```

This pattern matches:
- `t('key')`
- `t("key")`
- `i18next.t('key')`
- `i18next.t("key")`
- `.t('key')`
- `.t("key")`

### Key Structure

Translation keys follow a hierarchical dot-notation format:

```
feature.section.element
example:
  navigation.sidebar.dashboard
  modals.device.title
  status.success
```

### File Structure

```
public/locales/
├── en/
│   └── translation.json          # English translations (2,643 keys)
└── sl/
    ├── translation.json          # Slovenian translations (2,885 keys)
    ├── nis2-controls-translation.json   # NIS2-specific translations
    └── zzpri-postopki-translation.json  # ZZPri-specific translations
```

### i18n Configuration

The i18n system is configured in `src/i18n.ts`:

```typescript
i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    }
  })
```

**Key Settings:**
- **Fallback Language**: English (`en`)
- **Default Namespace**: `translation`
- **Backend**: HTTP-based JSON loading
- **Language Detection**: Automatic based on browser settings

## Workflow Integration

### During Development

1. **Add new UI text** - Use `t('feature.new_key')` in your component
2. **Run scanner** - `npm run scan:translations` before committing
3. **Review changes** - Check git diff to see new keys added
4. **Translate missing keys** - Update `public/locales/sl/translation.json` manually
5. **Commit** - Include translation file changes in your commit

### Before Deployment

1. Run validation: `npm run validate:translations`
2. Review any coverage gaps
3. Ensure all active keys are translated
4. Commit translation changes

### Handling Unused Keys

The cleanup script identifies unused keys for optional maintenance:

1. Run cleanup: `npm run cleanup:translations`
2. Review unused keys to determine if they're truly legacy
3. For confirmed legacy keys, manually remove from JSON files
4. Keys used dynamically (via string concatenation) will appear unused - keep these

## Troubleshooting

### Missing Keys Not Being Added

**Problem**: Ran `npm run scan:translations` but new keys weren't added

**Solutions**:
- Check that keys match the regex pattern (contain only alphanumeric and dots)
- Verify the translation JSON files are valid JSON
- Ensure files have write permissions
- Check for syntax errors in your translation key usage

### Language Not Changing

**Problem**: Language switcher doesn't update UI

**Cause**: i18n not properly initialized or translation files not loading

**Solutions**:
1. Check browser console for HTTP 404 errors when loading `/locales/{{lng}}/translation.json`
2. Verify `LanguageSwitcher` component calls `i18n.changeLanguage()`
3. Ensure components use `useTranslation()` hook (provides re-render on language change)
4. Check that translation JSON files are served from `public/locales/` directory

### Performance Issues with Large Translation Files

**Problem**: App feels slow after adding many translation keys

**Optimization Options**:
1. **Split namespaces** - Create separate JSON files by feature:
   ```javascript
   ns: ['translation', 'modals', 'forms']
   ```

2. **Lazy load translations** - Load namespace on demand instead of all at startup

3. **Minify JSON** - Remove unnecessary whitespace from translation files

4. **Cache busting** - Add version hash to translation file URLs

## Advanced Usage

### Custom Key Extraction

To extract keys to a specific format or for migration:

```bash
node scripts/scan-translations.mjs > translation-keys.txt
```

### Batch Translation Updates

To update specific keys programmatically:

```javascript
// In a custom script
const translations = require('./public/locales/en/translation.json');
translations.feature.newkey = 'New translation';
fs.writeFileSync('./public/locales/en/translation.json', 
  JSON.stringify(translations, null, 2));
```

### CI/CD Integration

Add to your CI pipeline to prevent missing translations:

```yaml
# Example GitHub Actions
- name: Validate translations
  run: npm run validate:translations
  
- name: Check for missing keys
  run: npm run scan:translations
  
- name: Fail if translation JSON is invalid
  run: node scripts/validate-translations.mjs
```

## Architecture Decisions

### Why HTTP Backend Instead of Static Import?

- **Runtime Language Switching**: Users can switch languages without page reload
- **Lazy Loading**: Load translation files only when needed
- **External File Management**: Translate without rebuilding the app
- **A/B Testing**: Easy to test different translations by updating files

### Why Keep Unused Keys?

- **Namespace Organization**: Unused parent keys provide structure
- **Dynamic Key Usage**: Some keys are built at runtime
- **Forward Compatibility**: Placeholder keys for upcoming features
- **Legacy Support**: Gradual deprecation easier than immediate removal

### Why Dot Notation?

- **Hierarchical**: Natural organization of related keys
- **Accessible**: Can access nested translations: `t('modals.device.title')`
- **Maintainable**: Easy to understand scope of each key
- **Powerful**: Enables namespace loading and key namespacing

## Summary

This translation management system ensures:

✅ **Completeness** - No missing translation keys in source code  
✅ **Consistency** - All languages kept in sync  
✅ **Maintainability** - Easy to identify and fix translation issues  
✅ **Scalability** - Automated processes support large translation volumes  
✅ **Performance** - Runtime language switching without page reload

All scripts are automatically run and validated during development workflow.
