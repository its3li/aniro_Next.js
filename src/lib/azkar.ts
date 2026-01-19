export interface AzkarItem {
    arabic: string;
    translation: string;
    repetitions?: number;
}
  
export interface AzkarCategory {
    id: string;
    name: string;
    icon: string; // Name of the lucide-react icon
    color: string; // Tailwind CSS gradient class
    subCategories?: AzkarCategory[];
    items?: AzkarItem[];
}
  
export const azkarData: AzkarCategory = {
    id: 'root',
    name: 'Categories',
    icon: 'LayoutGrid',
    color: '',
    subCategories: [
      {
        id: 'morning-azkar',
        name: 'Morning Azkar',
        icon: 'Sunrise',
        color: 'from-yellow-400 to-orange-500',
        items: [
          {
            arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
            translation: 'We have reached the morning and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
            repetitions: 1,
          },
          {
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.',
            translation: 'O Allah, by your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
            repetitions: 1,
          },
          {
            arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
            translation: 'Glory is to Allah and praise is to Him.',
            repetitions: 100,
          },
        ],
      },
      {
        id: 'evening-azkar',
        name: 'Evening Azkar',
        icon: 'Sunset',
        color: 'from-orange-500 to-red-600',
        items: [
          {
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
            translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
            repetitions: 1,
          },
          {
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            translation: 'I seek refuge in the perfect words of Allah from the evil of that which He has created.',
            repetitions: 3,
          },
        ],
      },
      {
        id: 'after-prayer-azkar',
        name: 'After Prayer',
        icon: 'PersonStanding',
        color: 'from-sky-400 to-blue-600',
        items: [
          {
            arabic: 'أَسْتَغْفِرُ اللَّهَ (ثَلَاثًا) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',
            translation: 'I seek the forgiveness of Allah (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.',
            repetitions: 1,
          },
          {
            arabic: 'سُبْحَانَ اللَّهِ',
            translation: 'Glory is to Allah.',
            repetitions: 33,
          },
          {
            arabic: 'الْحَمْدُ لِلَّهِ',
            translation: 'Praise is to Allah.',
            repetitions: 33,
          },
          {
            arabic: 'اللَّهُ أَكْبَرُ',
            translation: 'Allah is the Greatest.',
            repetitions: 33,
          },
        ],
      },
      {
        id: 'before-sleep-azkar',
        name: 'Before Sleep',
        icon: 'Bed',
        color: 'from-indigo-500 to-purple-600',
        items: [
            {
                arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
                translation: 'In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it as You protect Your righteous slaves.',
                repetitions: 1,
            },
            {
                arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
                translation: 'O Allah, save me from Your punishment on the day that You resurrect Your slaves.',
                repetitions: 3,
            }
        ]
      },
      {
        id: 'daily-duas',
        name: 'Daily Duas',
        icon: 'Calendar',
        color: 'from-green-400 to-emerald-600',
        subCategories: [
          {
            id: 'wakeup-azkar',
            name: 'When waking up',
            icon: 'Sunrise',
            color: 'from-yellow-400 to-orange-500',
            items: [{
              arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
              translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
              repetitions: 1,
            }]
          },
          {
            id: 'mosque-azkar',
            name: 'For the Mosque',
            icon: 'Building2',
            color: 'from-teal-400 to-cyan-600',
            items: [{
              arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
              translation: 'O Allah, open the gates of Your mercy for me. (upon entering)',
              repetitions: 1,
            }, {
              arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
              translation: 'O Allah, I ask You from Your bounty. (upon leaving)',
              repetitions: 1,
            }]
          }
        ]
      },
      {
        id: 'quranic-duas',
        name: 'Quranic Duas',
        icon: 'BookOpen',
        color: 'from-purple-500 to-violet-600',
        items: [
          {
            arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
            translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
            repetitions: 1,
          },
          {
            arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
            translation: 'My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.',
            repetitions: 1,
          }
        ]
      }
    ],
};
