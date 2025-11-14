#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const log = (color, message) => {
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
};

async function extractKeysFromSourceCode() {
  log('blue', '🔍 Step 1: Extracting translation keys used in source code...');

  const sourceFiles = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
  });

  log('cyan', `Found ${sourceFiles.length} source files to scan`);

  const usedKeys = new Set();
  const keyPattern = /(?:t\(['\"]|i18next\.t\(['\"]|\.t\(['\"])([a-zA-Z0-9_.]+)['\"]/g;

  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      let match;
      while ((match = keyPattern.exec(content)) !== null) {
        usedKeys.add(match[1]);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }

  log('green', `✓ Found ${usedKeys.size} unique keys used in source code`);
  return usedKeys;
}

function getAllKeysFromFile(obj, prefix = '') {
  const keys = new Set();

  function traverse(obj, prefix) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        traverse(value, fullKey);
      }
    }
  }

  traverse(obj, prefix);
  return keys;
}

function getValueByKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

async function generateCSVReport(usedKeys) {
  log('blue', '📊 Step 2: Generating CSV report of unused keys...');

  const languages = ['en', 'sl'];
  const reportData = [];

  for (const lang of languages) {
    const filePath = path.join('public/locales', lang, 'translation.json');

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);

      const allKeys = getAllKeysFromFile(translations);
      const unused = Array.from(allKeys).filter((key) => !usedKeys.has(key));

      log('cyan', `${lang.toUpperCase()}: ${unused.length} unused keys`);

      for (const key of unused) {
        const value = getValueByKey(translations, key);
        reportData.push({
          language: lang.toUpperCase(),
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          status: 'UNUSED',
        });
      }
    } catch (err) {
      log('red', `Error processing ${lang}: ${err.message}`);
    }
  }

  return reportData;
}

function saveCSVReport(reportData) {
  if (reportData.length === 0) {
    log('green', '✓ No unused keys found! CSV report not generated.');
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `translation-unused-keys-${timestamp}.csv`;
  const filepath = path.join('reports', filename);

  // Ensure reports directory exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }

  // Create CSV header
  const headers = ['Language', 'Translation Key', 'Current Value', 'Status', 'Recommendation'];
  const csvLines = [headers.join(',')];

  // Add data rows with proper CSV escaping
  for (const row of reportData) {
    const language = row.language;
    const key = `"${row.key.replace(/"/g, '""')}"`;
    const value = `"${(row.value || '').toString().replace(/"/g, '""')}"`;
    const status = row.status;
    const recommendation = 'Review for removal or mark as in-use';

    csvLines.push([language, key, value, status, recommendation].join(','));
  }

  const csvContent = csvLines.join('\n');
  fs.writeFileSync(filepath, csvContent, 'utf-8');

  log('green', `✓ CSV report generated: ${filepath}`);
  log('cyan', `  Total unused keys: ${reportData.length}`);

  return filepath;
}

function printSummary(reportData) {
  console.log('');
  log('blue', '📋 Summary:');

  const byLanguage = {};
  for (const row of reportData) {
    if (!byLanguage[row.language]) {
      byLanguage[row.language] = 0;
    }
    byLanguage[row.language]++;
  }

  for (const [lang, count] of Object.entries(byLanguage)) {
    log('cyan', `  ${lang}: ${count} unused keys`);
  }

  if (reportData.length > 0) {
    console.log('');
    log('yellow', '💡 Notes:');
    log('yellow', '  - Unused keys are translation entries not used in the current codebase');
    log('yellow', '  - They may be deprecated, placeholder, or dynamically referenced keys');
    log('yellow', '  - Review the CSV report to decide whether to keep or remove them');
    log('yellow', '  - Keep keys that might be used dynamically or are reserved for future features');
  }
}

function printManualReviewPause() {
  console.log('');
  console.log('');
  log('blue', '⏸️  MANUAL REVIEW REQUIRED - PROCESS PAUSED');
  console.log('');
  log('green', '✅ CSV report has been generated successfully!');
  console.log('');
  log('cyan', '📋 Next Steps for Translators:');
  log('cyan', '   1. Locate the CSV file in the reports/ folder');
  log('cyan', '   2. Open it in Excel, Google Sheets, or your preferred spreadsheet app');
  log('cyan', '   3. Review each unused translation key');
  log('cyan', '   4. Add a "Decision" column with one of these values:');
  log('cyan', '      - KEEP: Keep the key (might be used dynamically or reserved)');
  log('cyan', '      - REMOVE: Safe to delete from translation files');
  log('cyan', '      - REVIEW: Needs further investigation');
  log('cyan', '      - DYNAMIC: Used dynamically in code');
  log('cyan', '      - RESERVED: Reserved for future features');
  log('cyan', '   5. Save your decisions to the CSV file');
  log('cyan', '   6. Share the annotated CSV with your team for final approval');
  console.log('');
  log('yellow', '⚠️  IMPORTANT: No keys are being deleted automatically.');
  log('yellow', '    Manual decision-making is REQUIRED before any action.');
  log('yellow', '    Translation files remain unchanged until explicitly updated.');
  console.log('');
  log('cyan', '📚 For detailed instructions, see: TRANSLATION_CSV_REPORT_GUIDE.md');
  log('cyan', '📚 For scripts info, see: TRANSLATION_AUTOMATION_GUIDE.md');
  console.log('');
}

async function main() {
  try {
    log('blue', '📄 Translation Unused Keys CSV Report Generator\n');

    const usedKeys = await extractKeysFromSourceCode();
    console.log('');

    const reportData = await generateCSVReport(usedKeys);

    const filepath = saveCSVReport(reportData);
    printSummary(reportData);

    if (filepath) {
      printManualReviewPause();
    }
  } catch (error) {
    log('red', `\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();