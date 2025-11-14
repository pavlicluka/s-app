#!/usr/bin/env node

/**
 * Comprehensive Translation Key Scanner and Generator
 * Scans codebase for t() calls, compares with translation files, and adds missing keys
 * Usage: node scripts/scan-missing-translations.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
  stat: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`)
};

// Configuration
const CONFIG = {
  LOCALES_DIR: 'public/locales',
  LANGS: ['en', 'sl'],
  SCAN_PATTERNS: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!node_modules/**'
  ],
  TRANSLATION_NAMESPACES: ['translation'],
  I18N_FUNCTIONS: ['t(', "t('", 't("'], // Patterns to look for
};

/**
 * Recursively get all keys from a nested object
 */
function flattenKeys(obj, prefix = '') {
  let keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    }
  }
  
  return keys;
}

/**
 * Extract translation keys from a single file
 * Looks for patterns like: t('key.name'), t("key.name"), t("namespace:key.name")
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();
  
  // Pattern: t('key.name') or t("key.name") or t(`key.name`)
  const patterns = [
    /t\(['"`]([a-zA-Z0-9._:-]+)['"`]\)/g,  // t('key'), t("key"), t(`key`)
    /useTranslation\(\)\.t\(['"`]([a-zA-Z0-9._:-]+)['"`]\)/g, // useTranslation().t('key')
    /i18n\.t\(['"`]([a-zA-Z0-9._:-]+)['"`]\)/g, // i18n.t('key')
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  });
  
  return Array.from(keys);
}

/**
 * Scan all source files for translation key usage
 */
function scanSourceFiles() {
  log.header('🔍 Scanning source files for translation keys...');
  
  const allKeys = new Set();
  let filesScanned = 0;
  
  CONFIG.SCAN_PATTERNS.forEach(pattern => {
    glob.sync(pattern).forEach(file => {
      try {
        const fileKeys = extractKeysFromFile(file);
        fileKeys.forEach(key => allKeys.add(key));
        filesScanned++;
      } catch (err) {
        log.warn(`Failed to scan ${file}: ${err.message}`);
      }
    });
  });
  
  log.stat(`📊 Files scanned: ${filesScanned}`);
  log.stat(`🔑 Unique keys found: ${allKeys.size}`);
  
  return Array.from(allKeys).sort();
}

/**
 * Load translation file
 */
function loadTranslationFile(lang, namespace = 'translation') {
  const filePath = path.join(CONFIG.LOCALES_DIR, lang, `${namespace}.json`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    log.error(`Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Set nested value in object
 */
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Get nested value from object
 */
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Check if key exists in translation object
 */
function keyExists(translationObj, keyPath) {
  return getNestedValue(translationObj, keyPath) !== undefined;
}

/**
 * Compare and find missing keys
 */
function findMissingKeys(sourceKeys, translationObj) {
  const missing = [];
  const namespace = translationObj;
  
  sourceKeys.forEach(key => {
    if (!keyExists(namespace, key)) {
      missing.push(key);
    }
  });
  
  return missing.sort();
}

/**
 * Add missing keys to translation object with placeholder values
 */
function addMissingKeys(translationObj, missingKeys) {
  const addedCount = missingKeys.length;
  
  missingKeys.forEach(key => {
    // Use key name as placeholder (last part of the key path)
    const lastPart = key.split('.').pop();
    const placeholder = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/([A-Z])/g, ' $1');
    setNestedValue(translationObj, key, placeholder);
  });
  
  return addedCount;
}

/**
 * Save translation file
 */
function saveTranslationFile(lang, namespace, translationObj) {
  const dir = path.join(CONFIG.LOCALES_DIR, lang);
  const filePath = path.join(dir, `${namespace}.json`);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(translationObj, null, 2) + '\n', 'utf-8');
}

/**
 * Generate detailed report
 */
function generateReport(lang, sourceKeys, translationObj, missingKeys) {
  log.header(`📋 Report for Language: ${lang}`);
  
  const allTranslationKeys = flattenKeys(translationObj);
  const unusedKeys = allTranslationKeys.filter(key => !sourceKeys.includes(key));
  
  log.stat(`Total keys in source code: ${sourceKeys.length}`);
  log.stat(`Total keys in translation file: ${allTranslationKeys.length}`);
  log.stat(`Missing keys: ${missingKeys.length}`);
  log.stat(`Potentially unused keys: ${unusedKeys.length}`);
  
  if (missingKeys.length > 0) {
    log.warn(`\nMissing keys (first 20):`);
    missingKeys.slice(0, 20).forEach(key => {
      console.log(`  - ${key}`);
    });
    if (missingKeys.length > 20) {
      console.log(`  ... and ${missingKeys.length - 20} more`);
    }
  }
  
  return {
    sourceKeysCount: sourceKeys.length,
    translationKeysCount: allTranslationKeys.length,
    missingKeysCount: missingKeys.length,
    unusedKeysCount: unusedKeys.length,
    missingKeys,
    unusedKeys
  };
}

/**
 * Main execution
 */
function main() {
  log.header('🚀 Translation Key Scanner & Generator');
  console.log('=============================================\n');
  
  try {
    // Step 1: Scan source files
    const sourceKeys = scanSourceFiles();
    
    // Step 2: Process each language
    const reports = {};
    let totalAdded = 0;
    
    CONFIG.LANGS.forEach(lang => {
      log.header(`\n📝 Processing language: ${lang}`);
      
      // Load translation file
      let translationObj = loadTranslationFile(lang);
      
      if (!translationObj) {
        log.warn(`Translation file not found for ${lang}. Creating new one.`);
        translationObj = {};
      }
      
      // Find missing keys
      const missingKeys = findMissingKeys(sourceKeys, translationObj);
      
      // Generate report
      const report = generateReport(lang, sourceKeys, translationObj, missingKeys);
      reports[lang] = report;
      
      // Add missing keys
      if (missingKeys.length > 0) {
        const added = addMissingKeys(translationObj, missingKeys);
        saveTranslationFile(lang, 'translation', translationObj);
        log.success(`Added ${added} missing translation keys to ${lang}`);
        totalAdded += added;
      } else {
        log.success(`All translation keys are present for ${lang}`);
      }
    });
    
    // Step 3: Summary
    log.header('📊 Summary');
    console.log('=============================================');
    Object.entries(reports).forEach(([lang, report]) => {
      console.log(`\n${lang.toUpperCase()}:`);
      console.log(`  Source keys: ${report.sourceKeysCount}`);
      console.log(`  Translation keys: ${report.translationKeysCount}`);
      console.log(`  Missing: ${report.missingKeysCount}`);
      console.log(`  Potentially unused: ${report.unusedKeysCount}`);
    });
    
    log.success(`\n✅ Process complete! Added ${totalAdded} new translation keys.`);
    log.info('Translation files have been automatically updated with placeholder values.');
    log.info('Please review and update placeholder values with proper translations.');
    
  } catch (err) {
    log.error(`\nFatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { scanSourceFiles, findMissingKeys, addMissingKeys };
