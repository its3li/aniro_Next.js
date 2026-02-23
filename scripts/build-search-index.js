const fs = require('fs');
const path = require('path');
const MiniSearch = require('minisearch');

// Arabic Tashkeel (diacritics) regex
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Arabic letter normalization
const ARABIC_NORMALIZATION_MAP = {
  'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
  'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه', 'ى': 'ي',
};

function normalizeArabic(text) {
  if (!text) return '';
  let normalized = text.replace(TASHKEEL_REGEX, '');
  for (const [from, to] of Object.entries(ARABIC_NORMALIZATION_MAP)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  return normalized.trim();
}

function processTerm(term) {
  return normalizeArabic(term).toLowerCase();
}

// Build search index from all Quran editions
async function buildSearchIndex() {
  const surahDir = path.join(__dirname, '../public/data/quran/surah');
  const editions = ['quran-uthmani', 'quran-tajweed', 'quran-warsh'];
  
  const allDocuments = [];
  
  // Load surah list for names
  const surahListPath = path.join(__dirname, '../public/data/quran/surah-list.json');
  const surahList = JSON.parse(fs.readFileSync(surahListPath, 'utf8'));
  
  for (const edition of editions) {
    const editionDir = path.join(surahDir, edition);
    if (!fs.existsSync(editionDir)) continue;
    
    const files = fs.readdirSync(editionDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const surahNum = parseInt(file.replace('.json', ''));
      const surahData = JSON.parse(fs.readFileSync(path.join(editionDir, file), 'utf8'));
      const surahInfo = surahList.find(s => s.number === surahNum);
      
      for (const ayah of surahData.ayahs) {
        allDocuments.push({
          id: `${surahNum}:${ayah.numberInSurah}:${edition}`,
          surahNumber: surahNum,
          surahName: surahInfo?.name || '',
          surahEnglishName: surahInfo?.englishName || '',
          ayahNumber: ayah.numberInSurah,
          ayahText: ayah.text,
          normalizedText: normalizeArabic(ayah.text),
          edition: edition
        });
      }
    }
  }
  
  console.log(`[Build] Indexing ${allDocuments.length} ayat from all editions...`);
  
  // Create MiniSearch index
  const miniSearch = new MiniSearch({
    fields: ['normalizedText', 'ayahText', 'surahName'],
    storeFields: ['surahNumber', 'surahName', 'surahEnglishName', 'ayahNumber', 'ayahText', 'edition'],
    searchOptions: {
      boost: { normalizedText: 3, ayahText: 1, surahName: 2 },
      fuzzy: 0.15,
      prefix: true,
      combineWith: 'AND',
    },
    processTerm,
  });
  
  miniSearch.addAll(allDocuments);
  
  // Save index
  const indexDir = path.join(__dirname, '../public/data/quran/search');
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  
  const serialized = JSON.stringify(miniSearch);
  fs.writeFileSync(path.join(indexDir, 'full-quran-index.json'), serialized);
  
  // Also save as compressed documents for faster loading
  fs.writeFileSync(
    path.join(indexDir, 'all-ayat.json'), 
    JSON.stringify(allDocuments.map(d => ({
      id: d.id,
      s: d.surahNumber,
      n: d.surahName,
      e: d.surahEnglishName,
      a: d.ayahNumber,
      t: d.ayahText,
      ed: d.edition
    })))
  );
  
  console.log(`[Build] ✓ Search index saved (${(serialized.length / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`[Build] ✓ Total ayat indexed: ${allDocuments.length}`);
  
  return allDocuments.length;
}

buildSearchIndex().catch(console.error);
