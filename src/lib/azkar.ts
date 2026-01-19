
export interface AzkarItem {
    arabic: string;
    translation: string;
    repetitions?: number;
}
  
export interface AzkarCategory {
    id: string;
    name: string;
    nameAr: string;
    icon: string; // Name of the lucide-react icon
    color: string; // Tailwind CSS gradient class
    subCategories?: AzkarCategory[];
    items?: AzkarItem[];
}
  
export const azkarData: AzkarCategory = {
    id: 'root',
    name: 'Categories',
    nameAr: 'الأصناف',
    icon: 'LayoutGrid',
    color: '',
    subCategories: [
      {
        id: 'morning-azkar',
        name: 'Morning Azkar',
        nameAr: 'أذكار الصباح',
        icon: 'Sunrise',
        color: 'from-yellow-400 to-orange-500',
        items: [
          {
            arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
            translation: 'Ayat Al-Kursi: Allah! There is no god but He, the Living, the Self-subsisting. Neither slumber nor sleep overtakes Him. To Him belongs whatsoever is in the heavens and whatsoever is in the earth. Who is he that can intercede with Him except with His Permission? He knows what happens to them in this world, and what will happen to them in the Hereafter. And they will never compass anything of His Knowledge except that which He wills. His Throne extends over the heavens and the earth, and He feels no fatigue in guarding and preserving them. And He is the Most High, the Most Great.',
            repetitions: 1,
          },
          {
            arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ... (سورة الإخلاص)\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (سورة الفلق)\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ... (سورة الناس)',
            translation: 'Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas.',
            repetitions: 3,
          },
          {
            arabic: 'اللّهُمّ أنْتَ رَبّي لا إلهَ إلاّ أنْتَ، خَلَقْتَنِي وَأنا عَبْدُكَ، وَأنا عَلى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أعُوذُ بِكَ مِنْ شَرّ مَا صَنَعْتُ، أبُوءُ لَكَ بِنِعْمَتِكَ عَلَيّ، وَأبُوءُ بِذَنْبِي فَاغْفِرْ لي فَإِنّهُ لا يَغْفِرُ الذّنُوبَ إلاّ أنْتَ',
            translation: 'Sayyid al-Istighfar: O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have committed. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
            repetitions: 1,
          },
          {
            arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.',
            translation: 'O Allah, by your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
            repetitions: 1,
          },
          {
            arabic: 'بِسْمِ اللهِ الذِي لا يَضُرّ مَعَ اسْمِهِ شَيْءٌ في الأرْضِ وَلا في السّمَاءِ وَهُوَ السّمِيعُ العَلِيم',
            translation: 'In the Name of Allah, with Whose Name nothing on the earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
            repetitions: 3,
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
        nameAr: 'أذكار المساء',
        icon: 'Sunset',
        color: 'from-orange-500 to-red-600',
        items: [
          {
            arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ... (آية الكرسي)',
            translation: 'Ayat Al-Kursi: Allah! There is no god but He, the Living, the Self-subsisting...',
            repetitions: 1,
          },
          {
            arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ... (سورة الإخلاص)\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ... (سورة الفلق)\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ... (سورة الناس)',
            translation: 'Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas.',
            repetitions: 3,
          },
          {
            arabic: 'اللّهُمّ أنْتَ رَبّي لا إلهَ إلاّ أنْتَ، خَلَقْتَنِي وَأنا عَبْدُكَ...',
            translation: 'Sayyid al-Istighfar: O Allah, You are my Lord, none has the right to be worshipped except You...',
            repetitions: 1,
          },
          {
            arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ...',
            translation: 'We have reached the evening and at this very time all sovereignty belongs to Allah, and all praise is for Allah...',
            repetitions: 1,
          },
          {
            arabic: 'بِسْمِ اللهِ الذِي لا يَضُرّ مَعَ اسْمِهِ شَيْءٌ في الأرْضِ وَلا في السّمَاءِ وَهُوَ السّمِيعُ العَلِيم',
            translation: 'In the Name of Allah, with Whose Name nothing on the earth or in the heaven can cause harm, and He is the All-Hearing, the All-Knowing.',
            repetitions: 3,
          },
          {
            arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
            translation: 'I seek refuge in the perfect words of Allah from the evil of that which He has created.',
            repetitions: 3,
          },
          {
            arabic: 'اللّهُمّ بِكَ أمْسَيْنَا، وَبِكَ أصْبَحْنَا، وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإلَيْكَ الْمَصِير',
            translation: 'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.',
            repetitions: 1,
          },
        ],
      },
      {
        id: 'after-prayer-azkar',
        name: 'After Prayer',
        nameAr: 'بعد الصلاة',
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
        id: 'sleep-dreams',
        name: 'Sleep &amp; Dreams',
        nameAr: 'النوم والأحلام',
        icon: 'Bed',
        color: 'from-indigo-500 to-purple-600',
        items: [
            {
                arabic: 'بِاسْمِكَ اللّهُمّ أمُوتُ وَأحْيَا',
                translation: 'In Your name O Allah, I die and I live.',
                repetitions: 1
            },
            {
                arabic: 'يجمع كفيه وينفث فيهما ويقرأ: سورة الإخلاص، وسورة الفلق، وسورة الناس (ثلاث مرات) ويمسح بهما ما استطاع من جسده.',
                translation: 'Cup your hands, blow into them and recite: Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas (3 times), then wipe your hands over whatever you can of your body.',
                repetitions: 1
            },
            {
                arabic: 'بِاسْمِكَ رَبّي وَضَعْتُ جَنْبي، وَبِكَ أرْفَعُهُ، فَإنْ أمْسَكْتَ نَفْسِي فارْحَمْهَا، وَإنْ أرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصّالِحِينَ',
                translation: 'In Your name my Lord, I place my side (upon the bed) and in Your name I raise it. If You take my soul, have mercy on it, and if You release it, protect it with that which You protect Your righteous servants.',
                repetitions: 1
            },
            {
                arabic: 'لا إلهَ إلاّ اللهُ الوَاحِدُ القَهّار، رَبّ السّمَواتِ والأرْضِ وَمَا بَيْنَهُمَا العَزِيزُ الغَفّار',
                translation: 'If you turn over in bed at night: None has the right to be worshipped but Allah, the One, the Subduer, Lord of the heavens and the earth and all that is between them, the All-Mighty, the All-Forgiving.',
                repetitions: 1
            },
            {
                arabic: 'أعُوذُ بِكَلِمَاتِ اللهِ التّامّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشّيَاطِينِ وَأنْ يَحْضُرُون',
                translation: 'For anxiety and fear in sleep: I seek refuge in the perfect words of Allah from His anger and His punishment, from the evil of His slaves, and from the evil suggestions of the devils and from their presence.',
                repetitions: 1
            },
            {
                arabic: '١. ينفث عن يساره (ثلاثاً)\n٢. يستعيذ بالله من الشيطان ومن شر ما رأى (ثلاثاً)\n٣. لا يحدث بها أحداً\n٤. يتحول عن جنبه الذي كان عليه',
                translation: 'What to do upon seeing a bad dream:\n1. Spit dryly to your left (3 times).\n2. Seek refuge in Allah from Satan and from the evil of what you have seen (3 times).\n3. Do not tell anyone about it.\n4. Turn over to the other side you were sleeping on.',
                repetitions: 1
            }
        ]
      },
      {
        id: 'special-prayers',
        name: 'Special Duas',
        nameAr: 'أدعية خاصة',
        icon: 'Star',
        color: 'from-amber-400 to-yellow-500',
        items: [
            {
                arabic: 'اللّهُمّ إني أسْتَخِيرُكَ بِعِلْمِكَ، وَأسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأسْألُكَ مِنْ فَضْلِكَ العَظِيمِ، فَإِنّكَ تَقْدِرُ وَلا أقْدِرُ، وَتَعْلَمُ وَلا أعْلَمُ، وَأنْتَ عَلاّمُ الغُيُوبِ...',
                translation: 'Dua for Istikhara (Guidance): O Allah, I seek Your guidance in Your knowledge, and I seek ability in Your power, and I ask from Your great bounty. For You have power, but I do not. And You know, but I do not. And You are the Knower of the unseen... (mention your need).',
                repetitions: 1
            },
            {
                arabic: 'اللّهُمّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلّنِي فِيمَنْ تَوَلّيْتَ، وَبَارِكْ لي فِيمَا أعْطَيْتَ، وَقِنِي شَرّ مَا قَضَيْتَ، فَإِنّكَ تَقْضِي وَلا يُقْضَى عَلَيْكَ، إنّهُ لا يَذِلّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبّنَا وَتَعَالَيْتَ',
                translation: 'Dua for Qunoot Al-Witr: O Allah, guide me among those You have guided, and grant me wellbeing among those You have granted wellbeing, and protect me among those You have protected...',
                repetitions: 1
            }
        ]
      },
      {
        id: 'hardship-relief',
        name: 'Hardship &amp; Relief',
        nameAr: 'الهم والكرب',
        icon: 'HeartPulse',
        color: 'from-rose-400 to-red-500',
        items: [
            {
                arabic: 'اللّهُمّ إنّي عَبْدُكَ ابْنُ عَبْدِكَ ابْنُ أمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيّ حُكْمُكَ، عَدْلٌ فِيّ قَضَاؤُكَ...',
                translation: 'For worry and grief: O Allah, I am Your servant, son of Your servant, son of Your female servant. My forelock is in Your hand. Your command over me is forever executed and Your decree over me is just...',
                repetitions: 1
            },
            {
                arabic: 'اللّهُمّ إنّي أعُوذُ بِكَ مِنَ الهَمّ وَالحَزَنِ، وَالعَجْزِ وَالكَسَلِ، وَالبُخْلِ وَالجُبْنِ، وَضَلَعِ الدّيْنِ وَغَلَبَةِ الرّجَالِ',
                translation: 'O Allah, I seek refuge in You from worry and grief, from incapacity and laziness, from cowardice and miserliness, from being heavily in debt and from being overpowered by men.',
                repetitions: 1
            },
            {
                arabic: 'لا إلهَ إلاّ اللهُ العَظِيمُ الحَلِيم، لا إلهَ إلاّ اللهُ رَبّ العَرْشِ العَظِيم، لا إلهَ إلاّ اللهُ رَبّ السّمَواتِ وَرَبّ الأرْضِ وَرَبّ العَرْشِ الكَرِيم',
                translation: 'For distress: There is no god but Allah, the All-Mighty, the Forbearing. There is no god but Allah, Lord of the magnificent throne. There is no god but Allah, Lord of the heavens and Lord of the earth, and Lord of the noble throne.',
                repetitions: 1
            },
            {
                arabic: 'اللّهُمّ اكْفِنِي بِحَلالِكَ عَنْ حَرَامِكَ، وَأغْنِنِي بِفَضْلِكَ عَمّنْ سِوَاكَ',
                translation: 'For paying off a debt: O Allah, suffice me with what You have permitted against what You have forbidden, and make me independent of all others besides You.',
                repetitions: 1
            },
            {
                arabic: 'اللّهُمّ لا سَهْلَ إلاّ مَا جَعَلْتَهُ سَهْلاً، وَأنْتَ تَجْعَلُ الحَزْنَ إذَا شِئْتَ سَهْلاً',
                translation: 'For a difficult matter: O Allah, there is no ease except in that which You have made easy, and You make the difficulty, if You wish, easy.',
                repetitions: 1
            },
            {
                arabic: 'اللّهُمّ إنّا نَجْعَلُكَ في نُحُورِهِم، وَنَعُوذُ بِكَ مِنْ شُرُورِهِم',
                translation: 'When meeting an enemy: O Allah, we place You before them and we seek refuge in You from their evil.',
                repetitions: 1
            },
            {
                arabic: 'أعُوذُ بِاللهِ مِنَ الشّيْطَانِ الرّجِيم',
                translation: 'For waswasa (whisperings): I seek refuge in Allah from the accursed Satan.',
                repetitions: 1
            },
            {
                arabic: 'قَدّرَ اللهُ وَمَا شَاءَ فَعَل',
                translation: 'When something undesirable happens: Allah has decreed and what He wills, He does.',
                repetitions: 1
            }
        ]
      },
      {
        id: 'daily-duas',
        name: 'Daily Duas',
        nameAr: 'أدعية يومية',
        icon: 'Calendar',
        color: 'from-green-400 to-emerald-600',
        subCategories: [
          {
            id: 'wakeup-azkar',
            name: 'When waking up',
            nameAr: 'عند الاستيقاظ',
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
            nameAr: 'للمسجد',
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
        nameAr: 'أدعية قرآنية',
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

    