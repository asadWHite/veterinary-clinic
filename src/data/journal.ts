import type { Localized } from "@/i18n/localized";

export type JournalSection = {
  heading: Localized<string>;
  body: Localized<string>[];
};

export type JournalArticle = {
  slug: string;
  title: Localized<string>;
  standfirst: Localized<string>;
  category: Localized<string>;
  readMinutes: number;
  published: string;
  assetId: string;
  sections: JournalSection[];
};

/** General educational content only — no specific medical advice. */
export const journalArticles: JournalArticle[] = [
  {
    slug: "preparing-your-dog-for-a-first-visit",
    title: {
      uz: "Itni birinchi tashrifga qanday tayyorlash",
      ru: "Как подготовить собаку к первому визиту",
      en: "How to prepare your dog for a first visit",
    },
    standfirst: {
      uz: "Birinchi qabulning yaxshi o‘tishi uchun qilingan ishlarning katta qismi uydan chiqishdan oldin bajariladi.",
      ru: "Большая часть успешного первого приёма происходит ещё до выхода из дома.",
      en: "Most of what makes a first appointment go well happens before you leave the house.",
    },
    category: { uz: "Birinchi tashriflar", ru: "Первые визиты", en: "First visits" },
    readMinutes: 5,
    published: "2026-01-12",
    assetId: "puppy",
    sections: [
      {
        heading: { uz: "Hujjatlarni olib keling", ru: "Возьмите документы", en: "Bring the paperwork" },
        body: [
          {
            uz: "Emlash guvohnomalari, oldingi davolash yozuvlari va hozir ichayotgan har qanday dori nomi — qo‘shimchalarni ham. Yaqinda asrab olgan bo‘lsangiz, boshpana yoki breeder bergan har qanday ma’lumot foydali.",
            ru: "Сертификаты о прививках, выписки о прошлых лечениях и названия всех препаратов, включая добавки. Если взяли питомца недавно, пригодятся любые документы из приюта или от заводчика.",
            en: "Vaccination records, previous treatment notes, and the name of anything they currently take — including supplements. If they were adopted recently, whatever the shelter or breeder provided is worth bringing.",
          },
          {
            uz: "Imkon bo‘lsa, qanday ovqat, qancha va qachon yeyotganini yozib oling. Bu shifokorga aytadigan eng foydali narsalardan biri, biroq xonada eslab qolish qiyin.",
            ru: "Если можете, запишите, чем кормите, сколько и как часто. Это одна из самых полезных вещей для врача, и в кабинете её вспоминают с трудом.",
            en: "If you can, write down what food they eat, how much, and how often. It is one of the most useful things you can tell a clinician and it is surprisingly hard to remember in the room.",
          },
        ],
      },
      {
        heading: { uz: "Tashuvchi uy mehmusi bo‘lsin", ru: "Пусть переноска станет мебелью", en: "Let the carrier be furniture" },
        body: [
          {
            uz: "Faqat mashinaga chiqishdan oldin paydo bo‘ladigan tashuvchi — ogohlantirish belgisiga aylanadi. Uni bir hafta ichida ochiq holda polga qo‘yib, ichiga choyshab soling va o‘zi kirib o‘tirishiga yo‘l qo‘ying.",
            ru: "Переноска, которая появляется только перед поездкой, становится сигналом тревоги. Оставьте её открытой на полу неделю с пледом внутри и дайте зверю самому выбрать её.",
            en: "A carrier that only appears before a car trip becomes a warning sign. Leave it open on the floor at home for a week with a blanket inside, and let them choose to sit in it.",
          },
          {
            uz: "Mashinada o‘zini noqulay his qiladigan itlar uchun bir nechta qisqa, yo‘li yoqimli joyga tugaydigan sayohat assotsiatsiyani tezroq o‘zgartiradi.",
            ru: "Для собак, которым тяжело в машине, несколько коротких поездок с приятным финалом меняют ассоциацию быстрее, чем что-либо в сам день приёма.",
            en: "For dogs who are uncomfortable in the car, a few short trips that end somewhere pleasant changes the association faster than anything you can do on the day.",
          },
        ],
      },
      {
        heading: { uz: "Xonada", ru: "В кабинете", en: "In the room" },
        body: [
          {
            uz: "Uni ushlab turish shart emas. Tekshirsin, tarozini hidlasin va shifokor o‘z sur’atida yaqinlashsin. O‘ziga kelishga ruxsat berilgan itga kamroq ushlash kerak bo‘ladi.",
            ru: "Не нужно держать его силой. Пусть осмотрится, обнюхает весы, а врач подойдёт в своём темпе. Собаке, которой дали успокоиться, обычно нужно меньше фиксации.",
            en: "You do not need to hold them still. Let them explore, let them sniff the scale, and let the clinician approach at their pace. A dog who is allowed to settle usually needs less restraint, not more.",
          },
          {
            uz: "Savollaringizni yozib keling. Qabullar qisqa tuyuladi va uch hafta oldin sezgan narsalaringiz ko‘pincha xonadagi eng foydali ma’lumot bo‘ladi.",
            ru: "Возьмите список вопросов. Приём кажется коротким, а то, что вы заметили три недели назад, часто оказывается самой полезной информацией в кабинете.",
            en: "Come with questions written down. Appointments feel short, and the things you noticed three weeks ago are often the most useful pieces of information in the room.",
          },
        ],
      },
    ],
  },
  {
    slug: "understanding-vaccination-schedules",
    title: {
      uz: "Emlash jadvallarini tushunish",
      ru: "Как разобраться в графиках прививок",
      en: "Understanding vaccination schedules",
    },
    standfirst: {
      uz: "Nega bir xil vaksina bir necha marta takrorlanadi va “bajarilgan” haqiqatan nimani anglatadi.",
      ru: "Почему одна вакцина повторяется несколько раз и что на самом деле значит «актуально».",
      en: "Why the same vaccine appears more than once, and what 'up to date' actually means.",
    },
    category: { uz: "Profilaktika", ru: "Профилактика", en: "Prevention" },
    readMinutes: 6,
    published: "2026-01-28",
    assetId: "kitten",
    sections: [
      {
        heading: { uz: "Nega bir emas, bir necha marta", ru: "Почему серия, а не один раз", en: "Why a series, not one visit" },
        body: [
          {
            uz: "Yosh hayvon onadan antitelalar oladi — ular boshida himoya qiladi, so‘ng noma’lum sur’atda kamayadi. Bir nechta doza kamida bittasi ana shu himoya pasaygandan keyin o‘z immuniteti shakllanishiga yetib borishini kafolatlaydi.",
            ru: "Малыши получают антитела от матери: сначала они защищают, а потом угасают с непредсказуемой скоростью. Серия доз гарантирует, что хотя бы одна попадёт после того, как эта защита упадёт достаточно для собственного ответа.",
            en: "Young animals receive antibodies from their mother, which protect them early and then fade at an unpredictable rate. A series of doses makes sure at least one lands after that protection has dropped enough for their own immune response to take over.",
          },
          {
            uz: "Shuning uchun soni emas, vaqti muhim. Seriyadagi dozani o‘tkazib yuborish qaytadan boshlashni anglatmaydi, lekin jadvalni moslashtirish kerak.",
            ru: "Поэтому важен не столько номер, сколько время. Пропущенная доза не означает начала заново, но график нужно корректировать.",
            en: "This is why the timing matters more than the number. Missing a dose in a series does not mean starting again, but it does mean the schedule needs adjusting.",
          },
        ],
      },
      {
        heading: { uz: "Asosiy va qo‘shimcha", ru: "Основные и дополнительные", en: "Core and non-core" },
        body: [
          {
            uz: "Asosiy vaksinalar — shu turning deyarli har bir hayvoni uchun tavsiya etilganlari. Qo‘shimchalar turmush tarziga bog‘liq: sayohat, mehmonxona, ov, ko‘p hayvonli uy va mahalliy kasalliklar.",
            ru: "Основные вакцины рекомендованы почти каждому животному вида. Дополнительные зависят от образа жизни: поездки, передержка, охота, несколько животных дома и местные вспышки.",
            en: "Core vaccines are the ones recommended for almost every animal of that species. Non-core vaccines depend on lifestyle: travel, boarding, hunting, multi-animal households, and local disease patterns.",
          },
          {
            uz: "Uyda yashovan mushuk va bog‘ga chiqadigan mushuk uchun mos vaksina haqiqatan farq qiladi — yaxshi konsultatsiya buni so‘raydi, hamma uchun bitta jadvalni qo‘llamaydi.",
            ru: "Подходящие вакцины для кошки, которая не выходит, и для кошки с доступом во двор действительно различаются — хорошая консультация спросит об этом, а не применит один график ко всем.",
            en: "What is appropriate for an indoor-only cat and a cat with garden access is genuinely different, and a good consultation will ask about that rather than apply one schedule to everyone.",
          },
        ],
      },
      {
        heading: { uz: "Yozuv — davolashning bir qismi", ru: "Запись — часть лечения", en: "Records are part of the treatment" },
        body: [
          {
            uz: "Guvohnomani saqlang. Mehmonxonalar, grumerlar, ayrim sayohat ruxsatlari va ko‘pchilik bog‘cha xizmatlari so‘raydi; keyinchalik tarixni tiklash sekin va ba’zan imkonsiz.",
            ru: "Храните сертификат. Передержки, грумеры, часть разрешений на поездки и большинство дневных служб его спросят, а восстановить историю потом медленно и иногда невозможно.",
            en: "Keep the certificate. Boarding facilities, groomers, some travel permits and most day-care services will ask for it, and reconstructing a vaccination history later is slow and occasionally impossible.",
          },
          {
            uz: "Biror narsa bajarilganini bilmasangiz, taxmin qilmay klinikadan yozuvni tekshirishni so‘rang — ko‘p tizimlar buni bir zumda aytadi.",
            ru: "Если не уверены, сделано ли что-то, не гадайте — попросите клинику проверить запись: большинство систем отвечают мгновенно.",
            en: "If you are unsure whether something is due, ask the clinic to check the record rather than guessing — most systems can tell you in a moment.",
          },
        ],
      },
    ],
  },
  {
    slug: "signs-your-cat-may-need-attention",
    title: {
      uz: "Mushukka shifokor kerak bo‘lishi belgilari",
      ru: "Признаки, что кошке нужен врач",
      en: "Signs your cat may need veterinary attention",
    },
    standfirst: {
      uz: "Mushuklar noqulaylikni yaxshi yashiradi. Foydali belgilar odatda kundalik tartibdagi o‘zgarishlar.",
      ru: "Кошки хорошо скрывают недомогание. Полезные признаки — обычно изменения в распорядке.",
      en: "Cats hide discomfort well. The useful signs are usually changes in routine.",
    },
    category: { uz: "Kuzatish", ru: "Наблюдение", en: "Observation" },
    readMinutes: 5,
    published: "2026-02-09",
    assetId: "british-shorthair",
    sections: [
      {
        heading: { uz: "Kuzatishga arzigulik to‘rt narsa", ru: "Четыре вещи, за которыми стоит следить", en: "The four things worth tracking" },
        body: [
          {
            uz: "Ishtaha, suv, tuvalet va uyqu joylari. Bittasining bir-ikki kundan ortiq o‘zgarishi — suhbatga sabab. Ikkalasi birdan o‘zgarsa — qabulga sabab.",
            ru: "Аппетит, питьё, лоток и места сна. Изменение одного из них дольше одного-двух дней — повод поговорить. Изменение двух сразу — повод записаться.",
            en: "Appetite, water, litter tray, and sleep spots. A change in any one of these for more than a day or two is worth a conversation. A change in two of them at once is worth an appointment.",
          },
          {
            uz: "Beshinchisi — vazn, va uni sezish qiyin, chunki sekin o‘zgaradi. Uni ko‘tarib turib taroziga chiqib, so‘ng ayirib tashlash — uyda yetarlicha aniq usul.",
            ru: "Пятое — вес, и его пропустить проще всего, потому что он меняется медленно. Взвесьтесь с кошкой на руках и вычтите себя — этого достаточно.",
            en: "Weight is the fifth, and the easiest to miss because it changes slowly. Weighing yourself holding them, then subtracting, is accurate enough to be useful at home.",
          },
        ],
      },
      {
        heading: { uz: "Yashirinish — bu ham ma’lumot", ru: "Укрывание — тоже информация", en: "Hiding is information" },
        body: [
          {
            uz: "Yangi, tinchroq va yetib bo‘lmaydigan joyda uxlashni tanlash — ayniqsa ishtaha kamayishi bilan birga — mushuk o‘zini yaxshi his qilmasligining ishonchli belgilaridan biri.",
            ru: "Выбор нового, более тихого и труднодоступного места сна — особенно вместе с меньшим аппетитом — один из самых надёжных признаков того, что кошке нехорошо.",
            en: "Choosing a new, quieter, harder-to-reach sleeping place — especially combined with a smaller appetite — is one of the more reliable signs that a cat is not feeling well.",
          },
          {
            uz: "Jun parvarishi ikkala tomonga o‘zgaradi: to’satdan yog‘li yoki to‘qimalarga aylangan jun yoki bir joyning o‘ta ko‘p yalanishishi.",
            ru: "Уход за шерстью меняется в обе стороны: внезапно жирная или сбитая шерсть, либо слишком усердное вылизывание одного места.",
            en: "Grooming changes go the same way in both directions: a coat that suddenly looks greasy or matted, or an area being groomed far more than usual.",
          },
        ],
      },
      {
        heading: { uz: "Kutmaslik kerak bo‘lganda", ru: "Когда не стоит ждать", en: "When not to wait" },
        body: [
          {
            uz: "Og‘ir nafas olish, takroriy qusish, tuvaletda harakatlanib hech narsa chiqmasligi yoki oyoqqa tayanmaslik tez baholashni talab qiladi, uyda kuzatish emas.",
            ru: "Затруднённое дыхание, повторяющаяся рвота, безрезультатное натуживание в лотке или отказ опираться на лапу требуют быстрой оценки, а не наблюдения дома.",
            en: "Laboured breathing, repeated vomiting, straining in the litter tray without producing anything, or any reluctance to put weight on a limb should be assessed promptly rather than monitored at home.",
          },
          {
            uz: "Bu maqola umumiy ma’lumot, nima noto‘g‘riligini aniqlash usuli emas. Shubhalanганingizda ko‘rganlaringizni shifokorga aytib bering — shoshilinchmi yoki yo‘qmi, o‘zi hal qiladi.",
            ru: "Это общая информация, а не способ понять, что случилось. Если сомневаетесь — опишите врачу увиденное, и пусть он решает, насколько это срочно.",
            en: "This article is general information, not a way to work out what is wrong. When in doubt, describe what you have seen to a clinician and let them decide how urgent it is.",
          },
        ],
      },
    ],
  },
  {
    slug: "pet-nutrition-basics",
    title: { uz: "Hayvonlar ovqatlanishi asoslari", ru: "Основы питания питомцев", en: "Pet nutrition basics" },
    standfirst: {
      uz: "Ko‘p savol to‘rt narsaga kelib qoladi: nima, qancha, qachon va kim hal qiladi.",
      ru: "Большинство вопросов сводится к четырём вещам: что, сколько, когда и кто решает.",
      en: "Most nutrition questions come down to four things: what, how much, how often, and who decides.",
    },
    category: { uz: "Ovqatlanish", ru: "Питание", en: "Nutrition" },
    readMinutes: 4,
    published: "2026-02-21",
    assetId: "rabbit",
    sections: [
      {
        heading: { uz: "“To‘liq” — bu to‘liq", ru: "«Полноценный» означает полноценный", en: "Complete means complete" },
        body: [
          {
            uz: "“To‘liq” deb belgilangan sanoat ratsioni ko‘rsatilganidek berilganda o‘rnatilgan ehtiyojlarni qondiradi. Qolganlari — mukofotlar, stol ovqatlari, uyda tayyorlangan taomlar — qo‘shimcha, va qo‘shimcha to‘liq ratsionni siqib chiqaradi.",
            ru: "Промышленный рацион с пометкой «полноценный» при кормлении по инструкции покрывает установленные потребности. Всё остальное — лакомства, еда со стола, домашние блюда — дополнительное, и оно вытесняет полноценный рацион.",
            en: "A commercial diet labelled complete is formulated to meet established nutritional requirements when fed as directed. Anything else — treats, table food, homemade meals — is supplementary, and supplementary food displaces the complete diet.",
          },
          {
            uz: "Ko‘p shifokorlar ishlatadigan oddiy qoida: qo‘shimcha ovqat kunlik miqdorning kichik bir qismida qolishi kerak.",
            ru: "Простое правило, которым пользуются многие врачи: дополнительная еда должна оставаться малой долей съедаемого за день.",
            en: "The practical rule most clinicians use: supplementary food should stay a small fraction of what is eaten in a day.",
          },
        ],
      },
      {
        heading: { uz: "Vazndan ko‘ra tana holati", ru: "Кондиция важнее веса", en: "Body condition beats weight" },
        body: [
          {
            uz: "Bir zotning ikki hayvoni har xil vaznda bo‘lib, ikkalasi ham sog‘lom bo‘lishi mumkin. Qovurg‘alari sezilib turishi, lekin ko‘rinmasligi va yuqoridan belning ko‘rinishi — tarozidagi sondan yaxshiroq ko‘rsatkich.",
            ru: "Две собаки одной породы могут весить по-разному и обе быть здоровыми. Ощущаемые, но не видные рёбра и заметная талия сверху — показатель лучше, чем цифра на весах.",
            en: "Two animals of the same breed can weigh very different amounts and both be healthy. Body condition scoring — ribs you can feel but not see, a visible waist from above — is a better guide than the number on the scale.",
          },
          {
            uz: "Quyon va dengizchalar uchun pichan ratsionning asosiy qismi, donli ozuqa esa kichik qism. Nisbat brendan muhimroq.",
            ru: "Для кроликов и морских свинок основа рациона — сено, а гранулы — малая часть. Это соотношение важнее бренда.",
            en: "For species like rabbits and guinea pigs, hay is the majority of the diet, and pellet food is a small part. That ratio matters more than the brand.",
          },
        ],
      },
      {
        heading: { uz: "Sekin o‘zgartiring", ru: "Меняйте постепенно", en: "Change slowly" },
        body: [
          {
            uz: "Ovqatni o‘zgartirish sababi qanday bo‘lmasin, taxminan bir hafta ichida o‘tish hazm qilish bezovtaligini kamaytiradi — ayniqsa mushuklar va mayda sutemizuvchilarda.",
            ru: "Какова бы ни была причина смены корма, переход примерно за неделю снижает расстройство пищеварения — особенно у кошек и мелких млекопитающих.",
            en: "Whatever the reason for changing food, transitioning over roughly a week reduces digestive upset, particularly in cats and small mammals.",
          },
          {
            uz: "O‘zgarish tibbiy sababga ko‘ra bo‘lsa, yaxshilangan ko‘rinsa ham sizga berilgan reja bo‘yicha davom eting, orqaga qaytmang.",
            ru: "Если смена связана с медициной, следуйте полученному плану, а не возвращайтесь к прежнему, когда стало выглядеть лучше.",
            en: "If a change is being made for a medical reason, follow the plan you were given rather than switching back once things look better.",
          },
        ],
      },
    ],
  },
  {
    slug: "senior-pet-care",
    title: { uz: "Qari hayvonlarga g‘amxo‘rlik", ru: "Уход за пожилыми питомцами", en: "Senior pet care" },
    standfirst: {
      uz: "Qarish — bu kasallik emas. Lekin nima tekshirishga arziguligi va qancha tez-tez — o‘zgaradi.",
      ru: "Старение — не болезнь. Но меняется то, что стоит проверять и как часто.",
      en: "Ageing is not a disease. But it does change what is worth checking, and how often.",
    },
    category: { uz: "Qari hayvonlar", ru: "Пожилые питомцы", en: "Senior care" },
    readMinutes: 6,
    published: "2026-03-04",
    assetId: "golden-retriever",
    sections: [
      {
        heading: { uz: "Ko‘proq, qisqaroq tashriflar", ru: "Чаще, но короче", en: "More frequent, shorter visits" },
        body: [
          {
            uz: "Qari hamrohlar uchun yiliga ikki marta ko‘rik yillik ko‘rikdan ko‘ra ko‘proq narsani sezadi, chunki o‘sha yoshda o‘n ikki oyda juda ko‘p narsa o‘zgaradi.",
            ru: "Для пожилых питомцев осмотр дважды в год ловит то, что годовой пропускает, потому что в этом возрасте за двенадцать месяцев меняется очень многое.",
            en: "For senior companions, twice-yearly checks catch changes that an annual visit can miss, because a lot can move in twelve months at that age.",
          },
          {
            uz: "Qon tahlili va qon bosimi asosiy chiziq beradi. Qiymati bitta natijada emas — o‘tgan yilgi raqamlarga qarab trendni ko‘ra olishda.",
            ru: "Анализы крови и давление дают базу. Ценность не в одном результате, а в возможности видеть динамику против прошлогодних цифр.",
            en: "Bloodwork and blood pressure give a baseline. The value is not a single result — it is being able to see a trend against last year's numbers.",
          },
        ],
      },
      {
        heading: { uz: "Qulaylikni o‘lchash mumkin", ru: "Комфорт измерим", en: "Comfort is measurable" },
        body: [
          {
            uz: "Sekinlashish ko‘pincha yoshga bog‘lanadi, holbuki bu noqulaylik. Zinapoyada ikkilanish, dam olishdan keying qotib qolish yoki egasining taxminidan ko‘ra qisqaroq sayohat — bularni aytish kerak.",
            ru: "Замедление часто списывают на возраст, хотя это дискомфорт. Колебания на лестнице, скованность после сна или более короткая прогулка по решению хозяина — об этом стоит сказать.",
            en: "Slowing down is often attributed to age when it is discomfort. Hesitation on stairs, stiffness after rest, or a shorter walk that ends because of the owner's assumption rather than the animal's choice are all worth mentioning.",
          },
          {
            uz: "Kichik moslamalar — sirg‘almaydigan sirt, balandroq idish, mashinaga rampa — ko‘pincha retseptdan ko‘proq kunlik hayotni o‘zgartiradi.",
            ru: "Маленькие приспособления — нескользящие поверхности, миски повыше, пандус к машине — часто меняют ежедневную жизнь сильнее любого рецепта.",
            en: "Small adaptations — non-slip surfaces, raised bowls, a ramp to the car — often change daily life more than any prescription.",
          },
        ],
      },
      {
        heading: { uz: "Hayot sifati — siz belgilaysiz", ru: "Качество жизни определяете вы", en: "Quality of life, defined by you" },
        body: [
          {
            uz: "Foydali mashq — hayvoningiz haqiqatan yoqtiradigan to‘rt-besh narsani nomlash va ularni hali qilayotganini kuzatish. Bu mavhum tashvishni kuzatish mumkin bo‘lgan narsaga aylantiradi.",
            ru: "Полезное упражнение — назвать четыре-пять вещей, которые ваш питомец действительно любит, и смотреть, продолжает ли он ими заниматься. Это превращает тревогу в наблюдение.",
            en: "The useful exercise is naming four or five things your companion genuinely enjoys and watching whether they are still doing them. It turns an abstract worry into something you can actually observe.",
          },
          {
            uz: "Ro‘yxatni qabullarga olib boring. U shifokorga “yomonlashyapti” degan umumiy hisdan ancha yaxshiroq tasvir beradi.",
            ru: "Принесите этот список на приём. Он даёт врачу куда более точную картину, чем общее «становится хуже».",
            en: "Bring that list to appointments. It gives a clinician a far better picture than a general sense that things are getting worse.",
          },
        ],
      },
    ],
  },
  {
    slug: "dental-care-at-home",
    title: { uz: "Tashriflar orasida tish parvarishi", ru: "Уход за зубами между визитами", en: "Dental care between appointments" },
    standfirst: {
      uz: "Nima haqiqatan yordam beradi, nima — reklama va nimani shifokorga qoldirish kerak.",
      ru: "Что действительно помогает, что — маркетинг, а что оставить врачу.",
      en: "What genuinely helps, what is marketing, and what to leave to a clinician.",
    },
    category: { uz: "Stomatologiya", ru: "Стоматология", en: "Dental" },
    readMinutes: 5,
    published: "2026-03-18",
    assetId: "french-bulldog",
    sections: [
      {
        heading: { uz: "Butun sir — har kuni", ru: "Вся суть — каждый день", en: "Daily is the whole game" },
        body: [
          {
            uz: "Plitka bir necha kunda toshga aylanadi. Haftada bir marta tozalash deyarli hech narsa bermaydi; kunlarning katta qismida tozalash ko‘p narsa beradi. Barmoq cho‘tkasi va hayvonlar uchun pasta yetarli — odam pastasi mos emas.",
            ru: "Зубной налёт минерализуется в камень за считанные дни. Чистка раз в неделю почти бесполезна; чистка почти каждый день — очень полезна. Хватит напальчника и пасты для животных, человеческая не подходит.",
            en: "Plaque mineralises into tartar within days. Brushing once a week does very little; brushing most days does a lot. A finger brush and pet-specific toothpaste is enough — human toothpaste is not suitable.",
          },
          {
            uz: "Ba’zi hayvonlar tozalashni hech qachon qabul qilmaydi. Bunday holatda tasodifan mahsulot almashtirish o‘rniga shifokor bilan muqobillarni muhokama qiling.",
            ru: "Некоторые животные чистку так и не принимают. Тогда обсудите с врачом альтернативы, а не подбирайте продукты наугад.",
            en: "Some animals will never accept brushing. In that case, discuss alternatives with a clinician rather than substituting products at random.",
          },
        ],
      },
      {
        heading: { uz: "Nimaga qarash kerak", ru: "На что смотреть", en: "What to look for" },
        body: [
          {
            uz: "Sezgina o‘zgargan og‘iz hidi, ovqat oldida ikkilanish yoki tushirish, og‘izni tirnash, faqat bir tomonda chaynash. Bular nima noto‘g‘riligini aytmaydi — ko‘rik oqilona ekanini aytadi.",
            ru: "Заметно изменившийся запах изо рта, колебания или выпадение еды, лапанье морды, жевание на одной стороне. Это не говорит, что случилось, — говорит, что осмотр разумен.",
            en: "Bad breath that changes noticeably, hesitation or dropping of food, pawing at the mouth, or chewing on one side only. None of these tell you what is wrong — they tell you an examination is reasonable.",
          },
          {
            uz: "Rangsiz yoki singan tishlar ko‘pincha tasodifan topiladi va ba’zi singanlar hayvon oddiy ovqatlanayotganda ham davolashni talab qiladi.",
            ru: "Изменённые по цвету или сломанные зубы часто находят случайно, и часть переломов требует лечения даже при нормальном аппетите.",
            en: "Discoloured or fractured teeth are sometimes found incidentally, and some fractures need treatment even when the animal is eating normally.",
          },
        ],
      },
      {
        heading: { uz: "Anesteziya — to‘g‘ri bajarishning bir qismi", ru: "Анестезия — часть правильного подхода", en: "Anaesthesia is part of doing it properly" },
        body: [
          {
            uz: "To‘liq tish ko‘rigi va tozalashni o‘zini bilmagan hayvonda xavfsiz bajarib bo‘lmaydi. Anesteziyasiz tozalash taklif qiluvchilar ko‘rinadigan toshni olib tashlaydi, milk ostidagi narsani davolamaydi.",
            ru: "Тщательный осмотр и чистку невозможно безопасно провести бодрствующему животному. Предлагающие чистку без анестезии снимают видимый камень, а не лечат то, что под дёснами.",
            en: "A thorough dental examination and cleaning cannot be done safely in a conscious animal. Clinics offering anaesthesia-free cleaning are removing visible tartar, not treating what is under the gum line.",
          },
          {
            uz: "Bu har hayvonga protsedura kerak degani emas. Bu ko‘rik nima ko‘ra olishi va nima ko‘ra olmasligi halol bo‘lishi kerak degani.",
            ru: "Это не значит, что процедура нужна каждому. Это значит, что оценка должна честно говорить, что она может увидеть, а что нет.",
            en: "That does not mean every animal needs a procedure. It means the assessment should be honest about what it can and cannot see.",
          },
        ],
      },
    ],
  },
];

export const articleBySlug = (slug: string) =>
  journalArticles.find((a) => a.slug === slug) ?? journalArticles[0];
