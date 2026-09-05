#!/usr/bin/env node

/**
 * Check i18n completeness across all locale files
 * Ensures all languages have translations for all keys
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, "../public/_locales");
const SUPPORTED_LANGUAGES = ["en", "zh"];

function loadLocaleFile(lang) {
  const filePath = path.join(LOCALES_DIR, lang, "messages.json");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function getAllKeys(messages) {
  return new Set(Object.keys(messages));
}

function checkI18n() {
  console.log("🔍 Checking i18n completeness...\n");

  // Load English as reference
  const englishMessages = loadLocaleFile("en");
  if (!englishMessages) {
    console.error("❌ Error: English locale file not found!");
    process.exit(1);
  }

  const englishKeys = getAllKeys(englishMessages);
  console.log(`English has ${englishKeys.size} translation keys\n`);

  let hasErrors = false;

  // Check each language
  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === "en") {
      continue; // Skip English, it's our reference
    }

    const messages = loadLocaleFile(lang);
    if (!messages) {
      console.error(`❌ ${lang.toUpperCase()}: Locale file not found`);
      hasErrors = true;
      continue;
    }

    const langKeys = getAllKeys(messages);
    const missingKeys = [];
    const extraKeys = [];

    // Check for missing keys or empty translations
    for (const key of englishKeys) {
      if (!langKeys.has(key)) {
        missingKeys.push(key);
      } else if (
        !messages[key].message ||
        messages[key].message.trim() === ""
      ) {
        missingKeys.push(key);
      }
    }

    // Check for extra keys (optional, might be intentional)
    for (const key of langKeys) {
      if (!englishKeys.has(key)) {
        extraKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      console.error(
        `❌ ${lang.toUpperCase()}: Missing ${missingKeys.length} translations:`
      );
      for (const key of missingKeys) {
        console.error(`   - ${key}`);
      }
      hasErrors = true;
    } else {
      console.log(
        `✅ ${lang.toUpperCase()}: All translations present (${langKeys.size} keys)`
      );
    }

    if (extraKeys.length > 0) {
      console.log(
        `ℹ️  ${lang.toUpperCase()}: Has ${extraKeys.length} extra translations (not in English)`
      );
    }
  }

  console.log("");

  if (hasErrors) {
    console.error("❌ i18n check failed! Please add missing translations.\n");
    console.log("📝 Note: Do not copy English translations directly.");
    console.log("   Translate the text into the target language.\n");
    process.exit(1);
  } else {
    console.log("✅ i18n check passed! All translations are complete.\n");
    process.exit(0);
  }
}

checkI18n();
