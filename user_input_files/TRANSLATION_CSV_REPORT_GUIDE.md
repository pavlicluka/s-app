# Translation CSV Report Guide

## 🚀 Quick Reference

**Run this to generate a CSV report:**
```bash
npm run generate:report
```

**What happens:**
1. ✅ CSV file created in `reports/` folder
2. ✅ Manual review instructions displayed
3. ⏸️ **Script STOPS** (no further automation)
4. ✅ You review CSV at your pace
5. ✅ You manually update translation files
6. ✅ No automatic deletions ever occur

**Key Principle**: Generate → Pause → Manual Review → Manual Action

---

## Overview

This guide explains how to use the CSV report generator to manage unused translation keys without removing them from your translation files. The workflow allows translators to review, categorize, and make informed decisions about potentially unused keys.

**Important**: No keys are deleted automatically. The process pauses after CSV generation for manual review.

## Why CSV Reports Instead of Deletion?

Unused translation keys can be valuable for several reasons:

1. **Dynamically Referenced Keys**: Some keys might be used through variables or dynamic lookups that don't appear in static code analysis
2. **Future Features**: Reserved keys for upcoming features that haven't been implemented yet
3. **Legacy Code**: Keys from previous versions that might be reactivated
4. **A/B Testing**: Keys held for experimental features
5. **Compliance**: Keys required by regulations or organizational standards

## Workflow

### ⏸️ Important: Process Pauses for Manual Review

The translation report generation includes an **automatic pause** after CSV creation. This ensures translators **manually review** all unused keys before any further action. No keys are deleted automatically.

### Step 1: Generate the CSV Report

Run the report generator to create a CSV file with all unused translation keys:

```bash
npm run generate:report
```

Or use the full i18n workflow:

```bash
npm run i18n:fix
```

This command will:
- Scan your codebase for all translation key usages
- Check English and Slovenian translation files
- Identify keys that exist in translation files but aren't used in code
- Create a timestamped CSV file in the `reports/` directory
- **PAUSE and display manual review instructions** (process stops here)

### ⏸️ Process Pauses Here for Manual Review

When you run the report generator, you'll see:

```
⏸️  MANUAL REVIEW REQUIRED - PROCESS PAUSED

✅ CSV report has been generated successfully!

📋 Next Steps for Translators:
   1. Locate the CSV file in the reports/ folder
   2. Open it in Excel, Google Sheets, or your preferred spreadsheet app
   3. Review each unused translation key
   4. Add a "Decision" column with one of these values:
      - KEEP: Keep the key (might be used dynamically or reserved)
      - REMOVE: Safe to delete from translation files
      - REVIEW: Needs further investigation
      - DYNAMIC: Used dynamically in code
      - RESERVED: Reserved for future features
   5. Save your decisions to the CSV file
   6. Share the annotated CSV with your team for final approval

⚠️  IMPORTANT: No keys are being deleted automatically.
    Manual decision-making is REQUIRED before any action.
    Translation files remain unchanged until explicitly updated.
```

**The script stops here.** No further automation continues. This allows translators to review the report at their own pace.

### Step 2: Translator Reviews CSV Offline (No Automated Continuation)

The report generation script has **completely finished** at this point. No further automation occurs. You now have **full control** over the review process.

Navigate to the `reports/` folder and open the generated CSV file in your preferred spreadsheet application:
- **Excel**: Open directly
- **Google Sheets**: File → Open → Upload → Select CSV
- **LibreOffice Calc**: Open directly
- **Apple Numbers**: Open directly

**Key Point**: There are no automatic processes running. Take as much time as needed to review the report.

### Step 3: Review Unused Keys

The CSV contains these columns:

| Column | Description |
|--------|-------------|
| Language | EN or SL (English or Slovenian) |
| Translation Key | The full key path (e.g., `navigation.menu.home`) |
| Current Value | The text currently in the translation file |
| Status | Always "UNUSED" in this report |
| Recommendation | "Review for removal or mark as in-use" |

### Step 4: Categorize Keys

Add a new column to track decisions. Categories might include:

- **KEEP**: Keep in translation files (dynamically used, future feature, etc.)
- **REMOVE**: Safe to delete from translation files
- **REVIEW**: Needs investigation before deciding
- **DYNAMIC**: Used dynamically in code (variables, API responses, etc.)
- **RESERVED**: Reserved for future features

Example:

```
Language | Key | Value | Status | Recommendation | Decision
---------|-----|-------|--------|-----------------|----------
EN | old.deprecated.key | Old value | UNUSED | Review for removal | REMOVE
SL | feature.new.key | Vrednost | UNUSED | Review for removal | KEEP
EN | legacy.feature.x | Legacy | UNUSED | Review for removal | DYNAMIC
```

### Step 5: Manual Updates (Translator Action Required)

After reviewing the CSV and making decisions, **you must manually update translation files**:

1. **Open translation JSON files**:
   - `public/locales/en/translation.json`
   - `public/locales/sl/translation.json`

2. **For keys marked REMOVE**: Delete them from the JSON

3. **For keys marked KEEP/DYNAMIC/RESERVED**: Leave them unchanged

4. **Save files** and commit to version control

5. **Optional**: Run scan again to verify:
   ```bash
   npm run cleanup:translations
   ```

**Important**: This is a manual, deliberate process. No automation performs deletions.

### Step 6: Share with Team

Export the categorized CSV and share with:
- **Translators**: For review of translation quality and completeness
- **Product Managers**: For decisions on feature keys
- **Development Team**: For removal/archival decisions
- **Compliance Team**: For regulatory requirement checks

Share the **annotated CSV** (with your Decision column) as documentation for why keys were kept or removed.

## CSV Report Features

### ⏸️ Process Pause Mechanism

**The workflow includes a built-in pause to ensure manual review:**

1. **Generate**: `npm run generate:report` creates CSV
2. **Display Instructions**: Script displays manual review steps
3. **PAUSE**: Script stops completely
4. **Manual Review**: You review CSV at your own pace (hours, days, weeks)
5. **Manual Action**: You manually update translation files based on decisions
6. **No Automatic Continuation**: Blink does NOT automatically process or delete keys

This means:
- ✅ **You control the timeline** - review when you're ready
- ✅ **You make decisions** - no automated deletions
- ✅ **Zero risk of accidental data loss** - translation files never change automatically
- ✅ **Team collaboration** - share CSV with team for decisions
- ✅ **Audit trail** - keep CSV files for compliance records

### Automatic Generation

Run the generator to always get the latest analysis:

```bash
npm run generate:report
```

The script will create a CSV and then display detailed instructions for manual review.

### Timestamped Files

Reports are saved with timestamps to prevent overwrites:

```
reports/
├── translation-unused-keys-2025-11-10T06-16-25.csv
├── translation-unused-keys-2025-11-10T07-30-45.csv
└── translation-unused-keys-2025-11-10T09-15-20.csv
```

Keep all historical reports for audit trails and trend analysis.

### Proper CSV Formatting

The generator handles:
- Text escaping for keys and values with special characters
- Comma preservation in values
- Newline handling
- Quote escaping

## Integration with Development Workflow

### Before Each Release

```bash
# 1. Scan for new keys
npm run scan:translations

# 2. Validate translations
npm run validate:translations

# 3. Generate report for team review
npm run generate:report

# 4. Share with translators and product team
# 5. Review feedback
# 6. Manually update translation files based on feedback
```

### Continuous Translation Management

```bash
# Weekly
npm run i18n:fix  # Runs scan, validate, and generates report

# Review reports and categorize
# Update translation files manually based on decisions
# Commit changes with clear messages referencing report decisions
```

## Using Reports for Translation Tasks

### Identifying Translation Work

Translators can:
1. Open the CSV report
2. Filter for their language
3. Sort by "Current Value" or "Key"
4. Identify similar unused keys that might need attention
5. Verify if related keys have consistent translations

### Gap Analysis

Product managers can:
1. Review all unused keys
2. Identify patterns (e.g., "feature.X.Y" keys that need implementation)
3. Prioritize feature development based on reserved keys
4. Track translation completeness trends over time

### Compliance Verification

Compliance teams can:
1. Check if required translation keys are present
2. Verify regulatory terminology is consistent
3. Ensure deprecated terms are properly retired
4. Track version history of translation decisions

## What Does NOT Happen (Zero Auto-Deletion)

To be absolutely clear about data safety:

❌ **NO automatic key deletion**  
❌ **NO automatic file updates**  
❌ **NO automatic translation removal**  
❌ **NO hidden background processes**  
❌ **NO silent changes to translation files**  
❌ **NO data loss without your explicit action**  

✅ **ONLY manual actions you explicitly perform**  
✅ **ONLY CSV report generation**  
✅ **ONLY analysis and recommendations**  

The script generates a CSV, displays instructions, and **stops**. That's it. No further processing occurs until you manually edit translation files.

## Best Practices

1. **Generate reports regularly** (weekly or monthly)
2. **Keep historical reports** for trend analysis
3. **Share CSV with team** before removing any keys
4. **Document decisions** in a decision log
5. **Archive reviewed reports** for compliance
6. **Version control decisions** alongside code commits
7. **Review dynamically used keys** carefully before marking for deletion
8. **Never auto-delete keys** - always review manually first
9. **Track decisions** in the CSV Decision column for audit trail

## Technical Details

### How It Works

1. **Key Extraction**: Scans all `.ts` and `.tsx` files for `t('key')` patterns
2. **File Analysis**: Reads JSON translation files and maps all keys
3. **Comparison**: Creates a set difference between used keys and file keys
4. **CSV Generation**: Exports unused keys with metadata and formatting

### Key Matching

- Uses regex pattern: `/(?:t\(['\"]|i18next\.t\(['\"]|\.t\(['\"])([a-zA-Z0-9_.]+)['\"]/g`
- Handles nested keys: `navigation.menu.home`
- Works with both template literals and string literals

### Language Support

Currently scans:
- English: `public/locales/en/translation.json`
- Slovenian: `public/locales/sl/translation.json`

Easy to add more languages by extending the script.

## Troubleshooting

### CSV File Not Generated

**Problem**: No CSV file appears in `reports/` folder

**Solution**:
1. Check that `reports/` directory was created: `ls reports/`
2. Verify script ran successfully: Check terminal output
3. Ensure no errors in JSON translation files: `npm run validate:translations`

### CSV File Won't Open

**Problem**: CSV file shows as corrupted or unreadable

**Solution**:
1. Open with plain text editor first to verify content
2. Try opening in Google Sheets (better Unicode support)
3. Check file encoding is UTF-8

### Missing Keys in Report

**Problem**: Expected unused key not in CSV

**Solution**:
1. Key might be actively used in code - run `npm run cleanup:translations` to verify
2. Key might be used dynamically - add to "DYNAMIC" category
3. Re-run generator to get latest state: `npm run generate:report`

## Excel/Sheets Tips

### Sorting and Filtering

1. **Add filters**: Select header row → Data → AutoFilter
2. **Sort by language**: Dropdown → Sort A→Z
3. **Filter by value**: Click language dropdown → Select EN or SL only
4. **Find patterns**: Use Find (Ctrl+F) to search keys

### Adding Columns

1. **Insert Decision column**: Right-click column → Insert 1 left
2. **Add Notes column**: Right-click → Insert 1 right
3. **Highlight decisions**: Use conditional formatting to color-code
4. **Add comments**: Right-click cell → Insert comment for discussion

### Export Options

- **Excel**: File → Download → Microsoft Excel (.xlsx)
- **Google Sheets**: File → Download → CSV (.csv)
- **Numbers**: File → Export to → CSV

## Next Steps

1. **Generate your first report**: `npm run generate:report`
2. **Review with team**: Share CSV in Slack/Teams
3. **Document decisions**: Add Decision column with choices
4. **Update files manually**: Based on team consensus
5. **Archive report**: Save in project documentation folder
6. **Schedule regular reviews**: Weekly or before releases

## Questions or Issues?

- Check `TRANSLATION_AUTOMATION_GUIDE.md` for script details
- Review scripts in `scripts/` folder
- Check npm scripts in `package.json`
