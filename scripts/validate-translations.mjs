import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../public/locales');

console.log('\x1b[34m🔍 Validating translation files...\x1b[0m\n');

const languages = fs.readdirSync(localesDir).filter(f => 
  fs.statSync(path.join(localesDir, f)).isDirectory()
);

const translations = {};
const allKeys = new Set();

console.log('\x1b[34mChecking translation consistency...\x1b[0m\n');

// Load all translations
languages.forEach(lang => {
  const translationFile = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(translationFile)) {
    const content = JSON.parse(fs.readFileSync(translationFile, 'utf8'));
    translations[lang] = flattenObject(content);
    Object.keys(translations[lang]).forEach(key => allKeys.add(key));
  }
});

console.log(`\x1b[36mTotal unique translation keys: ${allKeys.size}\x1b[0m\n`);

// Validate each language
const report = {};
languages.forEach(lang => {
  if (translations[lang]) {
    const keyCount = Object.keys(translations[lang]).length;
    const missing = [];
    
    allKeys.forEach(key => {
      if (!(key in translations[lang])) {
        missing.push(key);
      }
    });
    
    report[lang] = {
      total: keyCount,
      missing: missing.length,
      percentage: ((keyCount / allKeys.size) * 100).toFixed(2)
    };
    
    console.log(`\x1b[36m${lang.toUpperCase()}:\x1b[0m`);
    console.log(`  Total keys: ${keyCount}`);
    console.log(`  Missing keys: ${missing.length}`);
    console.log(`  Coverage: ${report[lang].percentage}%`);
    
    if (missing.length > 0 && missing.length <= 10) {
      console.log(`  Missing: ${missing.join(', ')}`);
    }
    console.log('');
  }
});

// Summary
console.log('\x1b[34mValidation Summary:\x1b[0m');
const enCoverage = report.en ? parseFloat(report.en.percentage) : 0;
if (enCoverage === 100) {
  console.log('\x1b[32m✓ All languages have complete translations\x1b[0m');
} else {
  console.log(`\x1b[33m⚠ Some translations are incomplete (EN coverage: ${enCoverage}%)\x1b[0m`);
}

function flattenObject(obj, prefix = '') {
  let result = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result = { ...result, ...flattenObject(value, newKey) };
    } else if (typeof value === 'string') {
      result[newKey] = value;
    } else {
      // Handle non-string values by converting to string
      result[newKey] = String(value || '');
    }
  });
  
  return result;
}
