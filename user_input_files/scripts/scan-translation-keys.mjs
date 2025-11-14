#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}🔍 Scanning for missing translation keys...${colors.reset}\n`);

const LOCALES_DIR = 'public/locales';
const SRC_DIR = 'src';
const LANGUAGES = ['en', 'sl'];

// Extract translation keys from source code
function extractKeysFromSource() {
  const keys = new Set();
  const patterns = [
    /t\(['"`]([a-zA-Z0-9._-]+)['"`]\)/g, // t('key')
    /t\(['"`]([a-zA-Z0-9._-]+)['"`]/g,   // t('key - without closing paren
    /i18n\.t\(['"`]([a-zA-Z0-9._-]+)['"`]\)/g, // i18n.t('key')
    /useTranslation[\s\S]*?t\(['"`]([a-zA-Z0-9._-]+)['"`]\)/g, // useTranslation hook
  ];

  try {
    const files = globSync(`${SRC_DIR}/**/*.{tsx,ts,jsx,js}`, {
      ignore: ['**/node_modules/**', '**/.next/**']
    });

    console.log(`${colors.cyan}Found ${files.length} source files to scan${colors.reset}`);

    let filesWithTranslations = 0;
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        let fileHasKeys = false;

        patterns.forEach(pattern => {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            if (match[1]) {
              keys.add(match[1]);
              fileHasKeys = true;
            }
          }
        });

        if (fileHasKeys) {
          filesWithTranslations++;
        }
      } catch (error) {
        console.warn(`${colors.yellow}⚠ Could not read file ${file}${colors.reset}`);
      }
    });

    console.log(`${colors.cyan}Found translation keys in ${filesWithTranslations} files${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Error scanning files: ${error.message}${colors.reset}`);
  }

  return Array.from(keys).sort();
}

// Load translation file
function loadTranslations(language) {
  const filePath = path.join(LOCALES_DIR, language, 'translation.json');
  try {
    if (fs.existsSync(filePath)) {
      return {
        path: filePath,
        data: JSON.parse(fs.readFileSync(filePath, 'utf-8')),
        exists: true
      };
    }
  } catch (error) {
    console.error(`${colors.red}✗ Error parsing ${filePath}: ${error.message}${colors.reset}`);
  }
  return { path: filePath, data: {}, exists: false };
}

// Find missing keys
function findMissingKeys(sourceKeys, translationData) {
  return sourceKeys.filter(key => !translationData.hasOwnProperty(key));
}

// Add missing keys to translations
function addMissingKeys(language, missingKeys, sourceKeys) {
  const loaded = loadTranslations(language);
  const updated = { ...loaded.data };
  let addedCount = 0;

  missingKeys.forEach(key => {
    // Generate placeholder based on language
    const placeholder = language === 'en' 
      ? key.split('_').join(' ').split('.').join(' ')
      : `[SL] ${key}`;
    
    updated[key] = placeholder;
    addedCount++;
  });

  // Sort keys alphabetically
  const sorted = {};
  Object.keys(updated).sort().forEach(key => {
    sorted[key] = updated[key];
  });

  // Write back to file
  if (addedCount > 0) {
    try {
      fs.writeFileSync(loaded.path, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
      console.log(`${colors.green}✓ Added ${addedCount} keys to ${language} (${loaded.path})${colors.reset}`);
      return addedCount;
    } catch (error) {
      console.error(`${colors.red}✗ Error writing to ${loaded.path}: ${error.message}${colors.reset}`);
      return 0;
    }
  }

  return 0;
}

// Main execution
try {
  console.log(`${colors.blue}Step 1: Extracting keys from source code...${colors.reset}`);
  const sourceKeys = extractKeysFromSource();
  console.log(`${colors.green}✓ Found ${sourceKeys.length} unique translation keys${colors.reset}\n`);

  if (sourceKeys.length === 0) {
    console.log(`${colors.yellow}⚠ No translation keys found in source code${colors.reset}`);
    process.exit(0);
  }

  console.log(`${colors.blue}Step 2: Checking translation files...${colors.reset}`);
  let totalAdded = 0;

  LANGUAGES.forEach(lang => {
    const loaded = loadTranslations(lang);
    
    if (!loaded.exists) {
      console.log(`${colors.yellow}⚠ Translation file not found: ${loaded.path}${colors.reset}`);
      return;
    }

    const currentKeys = Object.keys(loaded.data);
    console.log(`${colors.cyan}${lang}: Has ${currentKeys.length} keys${colors.reset}`);

    const missing = findMissingKeys(sourceKeys, loaded.data);
    
    if (missing.length > 0) {
      console.log(`${colors.yellow}⚠ Missing ${missing.length} keys in ${lang}${colors.reset}`);
      const added = addMissingKeys(lang, missing, sourceKeys);
      totalAdded += added;
    } else {
      console.log(`${colors.green}✓ All keys present in ${lang}${colors.reset}`);
    }
  });

  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  console.log(`${colors.cyan}Total source keys: ${sourceKeys.length}${colors.reset}`);
  console.log(`${colors.cyan}Keys added: ${totalAdded}${colors.reset}`);
  
  if (totalAdded > 0) {
    console.log(`${colors.green}✓ Translation files updated successfully!${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ All translations are up to date!${colors.reset}\n`);
  }

  process.exit(0);
} catch (error) {
  console.error(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
}
