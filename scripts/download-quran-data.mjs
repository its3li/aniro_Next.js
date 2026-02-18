#!/usr/bin/env node

/**
 * Downloads all Quran data from the Al Quran Cloud API and saves as static JSON.
 * 
 * This bundles the data into the APK so the app works fully offline.
 * 
 * Output structure:
 *   public/data/quran/surah/{edition}/{surahNumber}.json
 *   public/data/quran/page/{edition}/{pageNumber}.json
 *   public/data/quran/surah-list.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data', 'quran');

const API_BASE = 'https://api.alquran.cloud/v1';

// Editions to download
const ARABIC_EDITIONS = ['quran-uthmani', 'quran-tajweed', 'quran-warsh'];
const TRANSLATION_EDITIONS = ['en.sahih', 'ar.jalalayn'];
const MUSHAF_EDITIONS = ['quran-uthmani']; // pages only need uthmani for mushaf view

const TOTAL_SURAHS = 114;
const TOTAL_PAGES = 604;
const CONCURRENCY = 3; // parallel requests to avoid rate-limiting
const DELAY_MS = 200; // delay between batches

// ============================================

async function fetchJSON(url, retries = 3) {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.code !== 200) throw new Error(`API error: ${json.code}`);
            return json.data;
        } catch (err) {
            if (i < retries) {
                console.log(`  ⟳ Retry ${i + 1} for ${url}`);
                await sleep(500 * (i + 1));
            } else {
                throw err;
            }
        }
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(filePath, data) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data));
}

async function runBatched(tasks, concurrency, delayMs) {
    for (let i = 0; i < tasks.length; i += concurrency) {
        const batch = tasks.slice(i, i + concurrency);
        await Promise.all(batch.map(fn => fn()));
        if (i + concurrency < tasks.length) await sleep(delayMs);
    }
}

// ============================================
// Step 1: Download Surah List
// ============================================
async function downloadSurahList() {
    console.log('📋 Downloading surah list...');
    const data = await fetchJSON(`${API_BASE}/surah`);
    const list = data.map(s => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType,
    }));
    writeJSON(path.join(DATA_DIR, 'surah-list.json'), list);
    console.log(`  ✅ ${list.length} surahs`);
    return list;
}

// ============================================
// Step 2: Download Surahs for each edition
// ============================================
async function downloadSurahs(edition) {
    const editionDir = path.join(DATA_DIR, 'surah', edition);
    console.log(`\n📖 Downloading surahs: ${edition}`);

    let completed = 0;
    const tasks = [];

    for (let i = 1; i <= TOTAL_SURAHS; i++) {
        const filePath = path.join(editionDir, `${i}.json`);
        if (fs.existsSync(filePath)) {
            completed++;
            continue;
        }
        tasks.push(async () => {
            const data = await fetchJSON(`${API_BASE}/surah/${i}/${edition}`);
            const surah = {
                number: data.number,
                name: data.name,
                englishName: data.englishName,
                englishNameTranslation: data.englishNameTranslation,
                numberOfAyahs: data.numberOfAyahs,
                revelationType: data.revelationType,
                ayahs: data.ayahs.map(a => ({
                    number: a.number,
                    numberInSurah: a.numberInSurah,
                    text: a.text,
                    juz: a.juz,
                    page: a.page,
                    hizbQuarter: a.hizbQuarter,
                })),
            };
            writeJSON(filePath, surah);
            completed++;
            process.stdout.write(`\r  ${completed}/${TOTAL_SURAHS}`);
        });
    }

    if (tasks.length === 0) {
        console.log(`  ✅ Already complete (${completed}/${TOTAL_SURAHS})`);
        return;
    }

    await runBatched(tasks, CONCURRENCY, DELAY_MS);
    console.log(`\n  ✅ Done`);
}

// ============================================
// Step 3: Download Mushaf Pages
// ============================================
async function downloadPages(edition) {
    const editionDir = path.join(DATA_DIR, 'page', edition);
    console.log(`\n📄 Downloading mushaf pages: ${edition}`);

    let completed = 0;
    const tasks = [];

    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const filePath = path.join(editionDir, `${i}.json`);
        if (fs.existsSync(filePath)) {
            completed++;
            continue;
        }
        tasks.push(async () => {
            const data = await fetchJSON(`${API_BASE}/page/${i}/${edition}`);
            const page = {
                pageNumber: data.number,
                ayahs: data.ayahs.map(a => ({
                    number: a.number,
                    numberInSurah: a.numberInSurah,
                    text: a.text,
                    juz: a.juz,
                    hizbQuarter: a.hizbQuarter,
                    page: a.page,
                    surah: { number: a.surah.number, name: a.surah.name, englishName: a.surah.englishName },
                })),
                juz: data.ayahs[0]?.juz || 1,
                hizbQuarter: data.ayahs[0]?.hizbQuarter || 1,
                surahs: data.surahs,
            };
            writeJSON(filePath, page);
            completed++;
            process.stdout.write(`\r  ${completed}/${TOTAL_PAGES}`);
        });
    }

    if (tasks.length === 0) {
        console.log(`  ✅ Already complete (${completed}/${TOTAL_PAGES})`);
        return;
    }

    await runBatched(tasks, CONCURRENCY, DELAY_MS);
    console.log(`\n  ✅ Done`);
}

// ============================================
// Main
// ============================================
async function main() {
    console.log('🕌 Quran Offline Data Downloader');
    console.log(`   Output: ${DATA_DIR}\n`);

    // Surah list
    await downloadSurahList();

    // Arabic editions
    for (const edition of ARABIC_EDITIONS) {
        await downloadSurahs(edition);
    }

    // Translations
    for (const edition of TRANSLATION_EDITIONS) {
        await downloadSurahs(edition);
    }

    // Mushaf pages (only uthmani needed — warsh/tajweed get pages from same API)
    for (const edition of MUSHAF_EDITIONS) {
        await downloadPages(edition);
    }

    // Also download tajweed pages for tajweed view
    await downloadPages('quran-tajweed');
    await downloadPages('quran-warsh');

    console.log('\n\n✅ All Quran data downloaded successfully!');

    // Calculate size
    let totalSize = 0;
    function calcSize(dir) {
        if (!fs.existsSync(dir)) return;
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) calcSize(full);
            else totalSize += fs.statSync(full).size;
        }
    }
    calcSize(DATA_DIR);
    console.log(`📦 Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
