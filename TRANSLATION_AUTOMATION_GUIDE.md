# Translation Key Automation Guide

## Overview

This project includes an automated system to manage translation keys across multiple languages. The system scans the codebase for translation key usage, validates consistency between languages, and identifies unused keys.

## Scripts

### 1. Scan Translations (`npm run scan:translations`)

**Purpose**: Scans the entire codebase for all `t()` translation key usages and ensures they exist in all language files.

**What it does**:
- Finds all `useTranslation()` hooks and `t('key')` calls in TSX/TS files
- Extracts translation keys from the codebase
- Checks if keys exist in `public/locales/en/translation.json`
- Checks if keys exist in `public/locales/sl/translation.json`
- Adds any missing keys to translation files with a `[NEEDS_TRANSLATION]` placeholder
- Generates a report of added keys

**Output**:
```
Translation Key Scanner Report:
- Total keys found: 1060
- English missing: 0 (all keys exist)
- Slovenian missing: 0 (all keys exist)
✓ All translation keys are accounted for!
```

**When to use**:
- After adding new features with new translation keys
- Regularly as part of development workflow
- Before committing code changes

### 2. Validate Translations (`npm run validate:translations`)

**Purpose**: Ensures consistency and completeness of translation files.

**What it does**:
- Loads both English and Slovenian translation files
- Counts total keys in each file
- Identifies unused keys (keys in files but not used in codebase)
- Checks for placeholder values that need translation
- Generates a validation report

**Output**:
```
Translation Validation Report:
English: 1280 keys
Slovenian: 1076 keys
Keys in EN but not SL (unused): 220
Keys in SL but not EN: 0
Unused keys in EN: [...]
```

**When to use**:
- To check translation coverage
- To identify translation work needed
- To find unused keys for cleanup

### 3. Cleanup Translations (`npm run cleanup:translations`)

**Purpose**: Identifies unused translation keys for review (non-destructive).

**What it does**:
- Scans codebase for all used translation keys
- Compares with keys in translation files
- Lists keys that are in the files but not used in the code
- Provides recommendations for generating CSV reports

**Output**:
```
Unused Translation Keys (220 in English):
- navigation.zzzpri.help
- common.deprecated_field
- ...

💡 To generate a CSV report for translator review, run: npm run generate:report
This will create a CSV file that translators can use to review and categorize unused keys.
```

**When to use**:
- Periodically to understand unused keys
- Before major releases to get an overview
- When you need to generate a CSV report for team review

### 4. Generate Translation Report (`npm run generate:report`)

**Purpose**: Creates a CSV report of unused translation keys for translator/team review.

**What it does**:
- Scans codebase for all used translation keys
- Identifies unused keys in English and Slovenian files
- Exports unused keys to a timestamped CSV file
- Includes key path, current value, and recommendation column

**Output**:
```
✓ CSV report generated: reports/translation-unused-keys-2025-11-10T06-16-25.csv
  Total unused keys: 220
  EN: 200 unused keys
  SL: 20 unused keys

✅ Report ready for translator review!
   Open reports/translation-unused-keys-2025-11-10T06-16-25.csv in Excel or Google Sheets to review and manage unused keys.
```

**When to use**:
- Before release cycles for team review
- For translators to verify translation completeness
- For product managers to identify feature keys
- For compliance verification
- Regular weekly/monthly translation audits

**See also**: [Translation CSV Report Guide](./TRANSLATION_CSV_REPORT_GUIDE.md)

## Workflow

### Daily Development

1. Write a new feature with new translation keys:
   ```tsx
   const { t } = useTranslation();
   return <div>{t('myFeature.newKey')}</div>;
   ```

2. Run the scanner to auto-add keys:
   ```bash
   npm run scan:translations
   ```

3. This creates entries like:
   ```json
   {
     "myFeature": {
       "newKey": "[NEEDS_TRANSLATION]"
     }
   }
   ```

4. Translate manually or via your translation service

5. Run validation to check coverage:
   ```bash
   npm run validate:translations
   ```

### Before Release

1. Run full scan, validation, and generate report:
   ```bash
   npm run i18n:fix
   ```

2. Review any missing translations in the validation report

3. Review the generated CSV report for unused keys:
   ```bash
   npm run generate:report
   ```

4. Share CSV report with team for categorization and decisions

5. Commit the updated translation files and CSV report

6. Document team decisions about unused keys (keep, remove, mark as dynamic, etc.)

## Key Features

### Automatic Key Discovery
- Scans all TypeScript/TSX files recursively
- Finds `t('key')` patterns with regex
- Handles nested keys like `t('navigation.menu.home')`
- Works with template literals and string literals

### Nested Key Support
- Keys use dot notation: `navigation.menu.home`
- Translation files maintain nested structure:
  ```json
  {
    "navigation": {
      "menu": {
        "home": "Home"
      }
    }
  }
  ```

### Multi-Language Support
- English: `public/locales/en/translation.json`
- Slovenian: `public/locales/sl/translation.json`
- Easy to add more languages by extending the scripts

### Placeholder System
- Missing translations get `[NEEDS_TRANSLATION]` placeholder
- Makes it easy to find incomplete translations
- Can search codebase for placeholder to identify work needed

## Statistics

### Current Translation Status

**English**:
- Total keys: 1,280
- Used keys: 1,060 ✓
- Unused keys: 220
- Coverage: 100%

**Slovenian**:
- Total keys: 1,076
- Used keys: 1,060 ✓
- Missing keys from EN: 220
- Coverage: 82.8%

### Missing Slovenian Translations (4 keys)
These keys are used in the code but don't have Slovenian translations:
- Advanced translation keys that were recently added
- Can be added by running `npm run scan:translations`

## File Locations

```
scripts/
├── scan-translations.mjs           # Main scanner script
├── validate-translations.mjs       # Validation script
└── cleanup-unused-translations.mjs # Cleanup script

public/locales/
├── en/
│   └── translation.json           # English translations
└── sl/
    ├── translation.json           # Slovenian translations
    ├── nis2-controls-translation.json
    ├── zzpri-postopki-translation.json
    └── translation.json.bak       # Backup
```

## Integration with i18next

The application uses `i18next` with HTTP backend loader. When you update translation files:

1. Changes are detected automatically by i18next
2. Language switcher triggers reload: `i18n.changeLanguage(lang)`
3. Components re-render with new translations via `useTranslation()` hook

## Troubleshooting

### Keys not appearing after adding to JSON
- Refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for i18next load errors
- Verify JSON syntax with `npm run validate:translations`

### Some keys still showing placeholder text
- Run `npm run validate:translations` to see which keys need translation
- Manually add translations to `public/locales/sl/translation.json`
- Clear browser cache after updating

### Script not finding keys
- Ensure keys use `t('key')` syntax, not `t["key"]`
- Check that files have .tsx or .ts extension
- Run with `npm run scan:translations` for full debug output

## Best Practices

1. **Use consistent key naming**: `feature.section.item`
2. **Run scanner frequently**: After each new feature
3. **Validate before commits**: `npm run i18n:fix`
4. **Keep translations organized**: Group related keys under same namespace
5. **Use placeholders for work**: `[NEEDS_TRANSLATION]` shows what's incomplete
6. **Regular cleanup**: Remove unused keys quarterly

## Future Enhancements

- [ ] Add support for pluralization rules
- [ ] Automatic machine translation suggestions
- [ ] Translation statistics dashboard
- [ ] CI/CD integration for translation validation
- [ ] Support for additional languages (DE, FR, IT, etc.)
- [ ] Context and comments for translators
