#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}📋 Validating translation files...${colors.reset}\n`);

const LOCALES_DIR = 'public/locales';
const LANGUAGES = ['en', 'sl'];

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

// Validate translation content
function validateTranslations() {
  const translations = {};
  let issues = [];

  LANGUAGES.forEach(lang => {
    const loaded = loadTranslations(lang);
    translations[lang] = loaded.data;

    console.log(`${colors.blue}Checking ${lang}...${colors.reset}`);

    if (!loaded.exists) {
      console.log(`${colors.yellow}⚠ File not found: ${loaded.path}${colors.reset}`);
      return;
    }

    const keys = Object.keys(loaded.data);
    console.log(`${colors.cyan}  Total keys: ${keys.length}${colors.reset}`);

    // Check for empty values
    let emptyValues = 0;
    keys.forEach(key => {
      const value = loaded.data[key];
      if (!value || typeof value !== 'string' || value.trim() === '') {
        emptyValues++;
        issues.push({
          lang,
          key,
          issue: 'Empty or invalid value',
          value
        });
      }
    });

    if (emptyValues > 0) {
      console.log(`${colors.yellow}  ⚠ Found ${emptyValues} empty values${colors.reset}`);
    } else {
      console.log(`${colors.green}  ✓ All values populated${colors.reset}`);
    }

    // Check for placeholder values (indicating not translated)
    let placeholders = 0;
    keys.forEach(key => {
      const value = loaded.data[key];
      if (typeof value === 'string' && (value.startsWith('[EN]') || value.startsWith('[SL]'))) {
        placeholders++;
        if (placeholders <= 5) {
          console.log(`${colors.yellow}  [PLACEHOLDER] ${key}: "${value}"${colors.reset}`);
        }
      }
    });

    if (placeholders > 0) {
      console.log(`${colors.yellow}  ⚠ Found ${placeholders} placeholder values that need translation${colors.reset}`);
    }
  });

  // Compare keys between languages
  console.log(`\n${colors.blue}Comparing languages...${colors.reset}`);
  const enKeys = new Set(Object.keys(translations.en));
  const slKeys = new Set(Object.keys(translations.sl));

  const missingInSl = Array.from(enKeys).filter(k => !slKeys.has(k));
  const missingInEn = Array.from(slKeys).filter(k => !enKeys.has(k));
  const common = Array.from(enKeys).filter(k => slKeys.has(k));

  console.log(`${colors.cyan}  Keys in EN: ${enKeys.size}${colors.reset}`);
  console.log(`${colors.cyan}  Keys in SL: ${slKeys.size}${colors.reset}`);
  console.log(`${colors.cyan}  Common keys: ${common.length}${colors.reset}`);

  if (missingInSl.length > 0) {
    console.log(`${colors.yellow}  ⚠ Missing in SL (${missingInSl.length}): ${missingInSl.slice(0, 5).join(', ')}${colors.reset}`);
    if (missingInSl.length > 5) {
      console.log(`${colors.yellow}     ... and ${missingInSl.length - 5} more${colors.reset}`);
    }
  }

  if (missingInEn.length > 0) {
    console.log(`${colors.yellow}  ⚠ Extra in SL (${missingInEn.length}): ${missingInEn.slice(0, 5).join(', ')}${colors.reset}`);
    if (missingInEn.length > 5) {
      console.log(`${colors.yellow}     ... and ${missingInEn.length - 5} more${colors.reset}`);
    }
  }

  if (missingInSl.length === 0 && missingInEn.length === 0) {
    console.log(`${colors.green}  ✓ Keys are synchronized between languages${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.blue}Summary:${colors.reset}`);
  
  const totalIssues = issues.length;
  const totalPlaceholders = Object.keys(translations.en || {})
    .concat(Object.keys(translations.sl || {}))
    .filter(k => {
      const v = (translations.en?.[k] || '') + (translations.sl?.[k] || '');
      return v.includes('[EN]') || v.includes('[SL]');
    }).length;

  if (totalIssues === 0 && totalPlaceholders === 0 && missingInSl.length === 0) {
    console.log(`${colors.green}✓ All translations are valid and complete!${colors.reset}\n`);
  } else {
    if (totalIssues > 0) {
      console.log(`${colors.yellow}⚠ Found ${totalIssues} issues with translation values${colors.reset}`);
    }
    if (totalPlaceholders > 0) {
      console.log(`${colors.yellow}⚠ Found ${totalPlaceholders} placeholder values that need translation${colors.reset}`);
    }
    if (missingInSl.length > 0) {
      console.log(`${colors.yellow}⚠ Missing ${missingInSl.length} keys in Slovenian translation${colors.reset}`);
    }
    console.log();
  }

  return {
    totalIssues,
    totalPlaceholders,
    missingInSl: missingInSl.length,
    missingInEn: missingInEn.length
  };
}

// Check JSON syntax
function validateJsonSyntax() {
  console.log(`\n${colors.blue}Validating JSON syntax...${colors.reset}`);
  let syntaxErrors = 0;

  LANGUAGES.forEach(lang => {
    const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
      try {
        JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`${colors.green}✓ ${lang}: Valid JSON${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}✗ ${lang}: Invalid JSON - ${error.message}${colors.reset}`);
        syntaxErrors++;
      }
    }
  });

  return syntaxErrors;
}

// Main execution
try {
  const syntaxErrors = validateJsonSyntax();
  
  if (syntaxErrors === 0) {
    const results = validateTranslations();
    
    console.log(`${colors.cyan}\nValidation Report:${colors.reset}`);
    console.log(`  Issues found: ${results.totalIssues}`);
    console.log(`  Placeholders: ${results.totalPlaceholders}`);
    console.log(`  Missing in SL: ${results.missingInSl}`);
    console.log(`  Extra in SL: ${results.missingInEn}\n`);
  } else {
    console.log(`${colors.red}✗ Cannot validate due to JSON syntax errors${colors.reset}\n`);
  }

  process.exit(0);
} catch (error) {
  console.error(`${colors.red}✗ Error during validation: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
}
