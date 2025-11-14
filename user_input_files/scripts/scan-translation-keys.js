#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}🔍 Scanning for translation keys...${colors.reset}\n`);

// Configuration
const SOURCE_DIRS = ['src/'];
const EXTENSIONS = ['tsx', 'ts', 'jsx', 'js'];
const LOCALES_DIR = 'public/locales';
const LANGUAGES = ['en', 'sl'];

// Translation key patterns
const patterns = [
  /t\(['"`]([^'"`]+)['"`]/g,           // t('key') or t("key") or t(`key`)
  /t\({[^}]*key:\s*['"`]([^'"`]+)['"`]/g, // t({ key: 'key' })
  /i18n\.t\(['"`]([^'"`]+)['"`]/g,    // i18n.t('key')
  /useTranslation\(\)[^;]*;\s*.*t\(['"`]([^'"`]+)['"`]/g, // extracted t function
];

// Find all source files
function getAllSourceFiles() {
  let files = [];
  EXTENSIONS.forEach(ext => {
    SOURCE_DIRS.forEach(dir => {
      const pattern = path.join(dir, `**/*.${ext}`);
      files = files.concat(glob.sync(pattern, {
        ignore: ['node_modules/**', 'dist/**', '.git/**']
      }));
    });
  });
  return files;
}

// Extract translation keys from source code
function extractKeysFromSourceCode() {
  const files = getAllSourceFiles();
  const keys = new Set();
  const keyLocations = {};

  console.log(`${colors.cyan}Processing ${files.length} source files...${colors.reset}`);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      
      patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern);
        while ((match = regex.exec(content)) !== null) {
          const key = match[1];
          if (key && key.trim()) {
            keys.add(key);
            if (!keyLocations[key]) {
              keyLocations[key] = [];
            }
            keyLocations[key].push(file);
          }
        }
      });
    } catch (error) {
      console.error(`Error reading ${file}: ${error.message}`);
    }
  });

  return { keys: Array.from(keys).sort(), keyLocations };
}

// Load existing translations from JSON files
function loadExistingTranslations(language) {
  const filePath = path.join(LOCALES_DIR, language, 'translation.json');
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
  }
  return {};
}

// Find missing keys for a language
function findMissingKeys(foundKeys, translations) {
  return foundKeys.filter(key => !translations.hasOwnProperty(key));
}

// Add missing keys to translation file
function addMissingKeysToFile(language, missingKeys) {
  const filePath = path.join(LOCALES_DIR, language, 'translation.json');
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let translations = {};
  
  // Load existing translations
  if (fs.existsSync(filePath)) {
    try {
      translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      console.error(`Error parsing ${filePath}: ${error.message}`);
      translations = {};
    }
  }

  // Add missing keys with placeholder values
  let added = 0;
  missingKeys.forEach(key => {
    if (!translations.hasOwnProperty(key)) {
      // Use the key itself or a placeholder
      translations[key] = language === 'sl' 
        ? `[SL] ${key}` 
        : `[EN] ${key}`;
      added++;
    }
  });

  if (added > 0) {
    // Sort keys alphabetically for consistency
    const sortedTranslations = {};
    Object.keys(translations).sort().forEach(key => {
      sortedTranslations[key] = translations[key];
    });

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(sortedTranslations, null, 2), 'utf-8');
    return added;
  }

  return 0;
}

// Main execution
try {
  const { keys: foundKeys, keyLocations } = extractKeysFromSourceCode();

  console.log(`\n${colors.green}✓ Found ${foundKeys.length} unique translation keys${colors.reset}`);
  console.log(`${colors.cyan}Example keys: ${foundKeys.slice(0, 5).join(', ')}${colors.reset}\n`);

  // Process each language
  let totalMissingAdded = 0;

  LANGUAGES.forEach(language => {
    console.log(`\n${colors.blue}Processing ${language.toUpperCase()}...${colors.reset}`);
    
    const existingTranslations = loadExistingTranslations(language);
    const missingKeys = findMissingKeys(foundKeys, existingTranslations);

    if (missingKeys.length === 0) {
      console.log(`${colors.green}✓ All keys present for ${language}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Found ${missingKeys.length} missing keys for ${language}${colors.reset}`);
      
      // Show first 10 missing keys
      console.log(`First missing keys: ${missingKeys.slice(0, 10).join(', ')}`);
      
      // Add missing keys
      const added = addMissingKeysToFile(language, missingKeys);
      
      if (added > 0) {
        console.log(`${colors.green}✓ Added ${added} missing keys to ${language}/translation.json${colors.reset}`);
        totalMissingAdded += added;
      }
    }
  });

  console.log(`\n${colors.green}✓ Translation scan complete!${colors.reset}`);
  console.log(`${colors.cyan}Total keys processed: ${foundKeys.length}${colors.reset}`);
  console.log(`${colors.green}Total missing keys added: ${totalMissingAdded}${colors.reset}\n`);

  process.exit(0);
} catch (error) {
  console.error(`${colors.red}✗ Error during scan: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
}
