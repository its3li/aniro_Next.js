export interface Wisdom {
    type: 'Quran' | 'Hadith';
    arabic: string;
    english: string;
    reference: string;
}
  
const wisdomData: Wisdom[] = [
    {
      type: 'Quran',
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      english: 'For indeed, with hardship [will be] ease.',
      reference: 'Surah Ash-Sharh, 94:5',
    },
    {
      type: 'Quran',
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      english: 'And whoever relies upon Allah - then He is sufficient for him.',
      reference: 'Surah At-Talaq, 65:3',
    },
    {
      type: 'Quran',
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      english: 'Unquestionably, by the remembrance of Allah hearts are assured.',
      reference: 'Surah Ar-Ra`d, 13:28',
    },
    {
        type: 'Hadith',
        arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
        english: 'Verily, actions are but by intentions.',
        reference: 'Sahih al-Bukhari',
    },
    {
        type: 'Hadith',
        arabic: 'الطُّهُورُ شَطْرُ الإِيمَانِ',
        english: 'Purity is half of faith.',
        reference: 'Sahih Muslim',
    }
];
  
export function getRandomWisdom(): Wisdom {
    const randomIndex = Math.floor(Math.random() * wisdomData.length);
    return wisdomData[randomIndex];
}
