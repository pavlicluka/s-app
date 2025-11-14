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
  const keyPattern = /(?:t\(['"]|i18next\.t\(['"]|\.t\(['"])([a-zA-Z0-9_.]+)['"]/g;

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

async function findUnusedKeys(usedKeys) {
  log('blue', '🔍 Step 2: Checking translation files for unused keys...');

  const languages = ['en', 'sl'];
  const unusedByLanguage = {};

  for (const lang of languages) {
    const filePath = path.join('public/locales', lang, 'translation.json');

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(fileContent);

      const allKeys = getAllKeysFromFile(translations);
      const unused = Array.from(allKeys).filter((key) => !usedKeys.has(key));

      unusedByLanguage[lang] = unused;

      log('cyan', `${lang.toUpperCase()}: ${allKeys.size} total keys, ${unused.length} unused`);

      if (unused.length > 0 && unused.length <= 50) {
        log('yellow', `  Unused keys in ${lang}:`);
        unused.forEach((key) => {
          log('yellow', `    - ${key}`);
        });
      } else if (unused.length > 50) {
        log('yellow', `  First 50 unused keys in ${lang}:`);
        unused.slice(0, 50).forEach((key) => {
          log('yellow', `    - ${key}`);
        });
        log('yellow', `  ... and ${unused.length - 50} more`);
      }
    } catch (err) {
      log('red', `Error processing ${lang}: ${err.message}`);
    }
  }

  return unusedByLanguage;
}

async function main() {
  try {
    log('blue', '🧹 Translation Cleanup Utility\n');

    const usedKeys = await extractKeysFromSourceCode();
    console.log('');

    const unusedByLanguage = await findUnusedKeys(usedKeys);

    console.log('');
    log('blue', '📊 Summary:');
    log('cyan', `Used keys: ${usedKeys.size}`);

    const totalUnused = Object.values(unusedByLanguage).reduce((sum, unused) => sum + unused.length, 0);
    log('cyan', `Total unused keys across languages: ${totalUnused}`);

    if (totalUnused > 0) {
      log('yellow', '\\n⚠️  Note: These keys are in translation files but not used in source code.');
      log('yellow', 'They may be:\\n  - Deprecated keys that can be safely removed\\n  - Keys used dynamically (via variables)\\n  - Placeholder keys for future features');
      log('cyan', '\\n💡 To generate a CSV report for translator review, run: npm run generate:report');
      log('cyan', 'This will create a CSV file that translators can use to review and categorize unused keys.');
    } else {
      log('green', '✓ No unused translation keys found!');
    }
  } catch (error) {
    log('red', '\\n❌ Error: ${error.message}');
    process.exit(1);
  }
}

main();