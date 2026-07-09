export type Level = "beginner" | "intermediate" | "advanced" | "freestyle";

export type LanguageCode =
  | "en"
  | "zh"
  | "hi"
  | "es"
  | "ar"
  | "fr"
  | "bn"
  | "pt"
  | "ru"
  | "ur";

export type BnDialect =
  | "standard"
  | "sylheti"
  | "chatgaiya"
  | "barishali"
  | "noakhailla"
  | "rangpuri"
  | "varendri"
  | "mymensinghi"
  | "dhakaiya-kutti"
  | "comillan"
  | "jessore-khulnaiya";

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  zh: "Mandarin Chinese",
  hi: "Hindi",
  es: "Spanish",
  ar: "Modern Standard Arabic",
  fr: "French",
  bn: "Bengali",
  pt: "Portuguese",
  ru: "Russian",
  ur: "Urdu",
};

export const LANGUAGE_ORDER: LanguageCode[] = [
  "en",
  "zh",
  "hi",
  "es",
  "ar",
  "fr",
  "bn",
  "pt",
  "ru",
  "ur",
];

export const BN_DIALECT_LABELS: Record<BnDialect, string> = {
  standard: "Standard Bengla (প্রমিত বাংলা)",
  sylheti: "Sylheti (Sylhet Division)",
  chatgaiya: "Chatgaiya (Chittagong Division)",
  barishali: "Barishali (Barisal Division)",
  noakhailla: "Noakhailla (Noakhali region)",
  rangpuri: "Rangpuri (Rangpur Division)",
  varendri: "Varendri (Rajshahi Division)",
  mymensinghi: "Mymensinghi (Mymensingh Division)",
  "dhakaiya-kutti": "Dhakaiya Kutti (Old Dhaka)",
  comillan: "Comillan (Comilla region)",
  "jessore-khulnaiya": "Jessore-Khulnaiya (Khulna Division)",
};

export const BN_DIALECT_ORDER: BnDialect[] = [
  "standard",
  "sylheti",
  "chatgaiya",
  "barishali",
  "noakhailla",
  "rangpuri",
  "varendri",
  "mymensinghi",
  "dhakaiya-kutti",
  "comillan",
  "jessore-khulnaiya",
];

/** BCP-47 locale used for browser SpeechSynthesis TTS. */
export const LANGUAGE_TTS_LOCALE: Record<LanguageCode, string> = {
  en: "en-US",
  zh: "zh-CN",
  hi: "hi-IN",
  es: "es-ES",
  ar: "ar-SA",
  fr: "fr-FR",
  bn: "bn-BD",
  pt: "pt-PT",
  ru: "ru-RU",
  ur: "ur-PK",
};

export type TargetSentence = {
  id: string;
  text: string;
  translit?: string;
  meaning: string;
  level: Level;
};

type Bank = Record<LanguageCode, Partial<Record<Level, TargetSentence[]>>>;

const FREESTYLE_SENTENCE: TargetSentence = {
  id: "freestyle",
  level: "freestyle",
  text: "",
  meaning: "Speak freely — no target sentence.",
};

export const SENTENCE_BANK: Bank = {
  en: {
    beginner: [
      { id: "en-b1", level: "beginner", text: "My name is Alex.", meaning: "Introducing yourself." },
      { id: "en-b2", level: "beginner", text: "I like to read books.", meaning: "A simple preference." },
      { id: "en-b3", level: "beginner", text: "The sun is shining today.", meaning: "About the weather." },
      { id: "en-b4", level: "beginner", text: "Please close the window.", meaning: "A polite request." },
      { id: "en-b5", level: "beginner", text: "We are going to school.", meaning: "A daily activity." },
    ],
    intermediate: [
      { id: "en-i1", level: "intermediate", text: "I forgot my umbrella because I was in a hurry.", meaning: "Explaining a small mistake." },
      { id: "en-i2", level: "intermediate", text: "She enjoys cooking dinner for her family.", meaning: "Describing a habit." },
      { id: "en-i3", level: "intermediate", text: "The train arrived earlier than expected.", meaning: "A comparison." },
      { id: "en-i4", level: "intermediate", text: "We should finish the project before Friday.", meaning: "A work plan." },
      { id: "en-i5", level: "intermediate", text: "Learning a new language takes patience.", meaning: "A piece of advice." },
    ],
    advanced: [
      { id: "en-a1", level: "advanced", text: "Technological innovation has transformed modern communication.", meaning: "A formal statement." },
      { id: "en-a2", level: "advanced", text: "Environmental sustainability requires collective responsibility.", meaning: "An idea about the environment." },
      { id: "en-a3", level: "advanced", text: "Although the evidence appeared convincing, further investigation was necessary.", meaning: "A complex, formal clause." },
      { id: "en-a4", level: "advanced", text: "Consistent practice significantly improves pronunciation accuracy.", meaning: "About language learning." },
      { id: "en-a5", level: "advanced", text: "Effective leadership depends on integrity, empathy, and clear communication.", meaning: "About leadership." },
    ],
  },
  zh: {
    beginner: [
      { id: "zh-b1", level: "beginner", text: "你好。", translit: "Nǐ hǎo.", meaning: "Hello." },
      { id: "zh-b2", level: "beginner", text: "我叫李明。", translit: "Wǒ jiào Lǐ Míng.", meaning: "My name is Li Ming." },
      { id: "zh-b3", level: "beginner", text: "今天天气很好。", translit: "Jīntiān tiānqì hěn hǎo.", meaning: "The weather is nice today." },
      { id: "zh-b4", level: "beginner", text: "我喜欢喝茶。", translit: "Wǒ xǐhuān hē chá.", meaning: "I like drinking tea." },
      { id: "zh-b5", level: "beginner", text: "请打开门。", translit: "Qǐng dǎkāi mén.", meaning: "Please open the door." },
    ],
    intermediate: [
      { id: "zh-i1", level: "intermediate", text: "我每天早上跑步半小时。", translit: "Wǒ měitiān zǎoshang pǎobù bàn xiǎoshí.", meaning: "I run for half an hour every morning." },
      { id: "zh-i2", level: "intermediate", text: "她正在学习汉语。", translit: "Tā zhèngzài xuéxí Hànyǔ.", meaning: "She is studying Chinese." },
      { id: "zh-i3", level: "intermediate", text: "我们周末去公园散步。", translit: "Wǒmen zhōumò qù gōngyuán sànbù.", meaning: "We go for a walk in the park on weekends." },
      { id: "zh-i4", level: "intermediate", text: "这个问题比那个问题更难。", translit: "Zhège wèntí bǐ nàge wèntí gèng nán.", meaning: "This question is harder than that one." },
      { id: "zh-i5", level: "intermediate", text: "请告诉我最近的地铁站在哪里。", translit: "Qǐng gàosù wǒ zuìjìn de dìtiě zhàn zài nǎlǐ.", meaning: "Please tell me where the nearest metro station is." },
    ],
    advanced: [
      { id: "zh-a1", level: "advanced", text: "科学技术的发展改变了我们的生活方式。", translit: "Kēxué jìshù de fāzhǎn gǎibiànle wǒmen de shēnghuó fāngshì.", meaning: "The development of science and technology has changed our way of life." },
      { id: "zh-a2", level: "advanced", text: "保护环境是每个人的责任。", translit: "Bǎohù huánjìng shì měi gèrén de zérèn.", meaning: "Protecting the environment is everyone's responsibility." },
      { id: "zh-a3", level: "advanced", text: "尽管遇到了许多困难,他还是坚持完成了任务。", translit: "Jǐnguǎn yùdàole xǔduō kùnnán, tā háishì jiānchí wánchéngle rènwù.", meaning: "Despite many difficulties, he persevered and completed the task." },
      { id: "zh-a4", level: "advanced", text: "良好的沟通能够减少误解。", translit: "Liánghǎo de gōutōng nénggòu jiǎnshǎo wùjiě.", meaning: "Good communication can reduce misunderstandings." },
      { id: "zh-a5", level: "advanced", text: "持续不断地学习能够提升个人能力。", translit: "Chíxù bùduàn de xuéxí nénggòu tíshēng gèrén nénglì.", meaning: "Continuous learning can improve personal ability." },
    ],
  },
  hi: {
    beginner: [
      { id: "hi-b1", level: "beginner", text: "मेरा नाम राहुल है।", translit: "Mera naam Rahul hai.", meaning: "My name is Rahul." },
      { id: "hi-b2", level: "beginner", text: "मुझे पानी चाहिए।", translit: "Mujhe paani chahiye.", meaning: "I need water." },
      { id: "hi-b3", level: "beginner", text: "आज मौसम अच्छा है।", translit: "Aaj mausam achha hai.", meaning: "The weather is nice today." },
      { id: "hi-b4", level: "beginner", text: "मैं स्कूल जाता हूँ।", translit: "Main school jaata hoon.", meaning: "I go to school." },
      { id: "hi-b5", level: "beginner", text: "कृपया दरवाज़ा बंद करें।", translit: "Kripya darwaza band karein.", meaning: "Please close the door." },
    ],
    intermediate: [
      { id: "hi-i1", level: "intermediate", text: "मैं हर सुबह जल्दी उठता हूँ।", translit: "Main har subah jaldi uthta hoon.", meaning: "I wake up early every morning." },
      { id: "hi-i2", level: "intermediate", text: "हमें समय पर पहुँचना चाहिए।", translit: "Humein samay par pahunchna chahiye.", meaning: "We should arrive on time." },
      { id: "hi-i3", level: "intermediate", text: "वह अपने परिवार के साथ रहती है।", translit: "Vah apne parivaar ke saath rehti hai.", meaning: "She lives with her family." },
      { id: "hi-i4", level: "intermediate", text: "किताब पढ़ना मुझे पसंद है।", translit: "Kitaab padhna mujhe pasand hai.", meaning: "I like reading books." },
      { id: "hi-i5", level: "intermediate", text: "आज बाजार में बहुत भीड़ है।", translit: "Aaj bazaar mein bahut bheed hai.", meaning: "The market is very crowded today." },
    ],
    advanced: [
      { id: "hi-a1", level: "advanced", text: "शिक्षा समाज के विकास में महत्वपूर्ण भूमिका निभाती है।", translit: "Shiksha samaaj ke vikas mein mahatvapurna bhoomika nibhati hai.", meaning: "Education plays an important role in the development of society." },
      { id: "hi-a2", level: "advanced", text: "पर्यावरण की रक्षा करना हमारी जिम्मेदारी है।", translit: "Paryavaran ki raksha karna hamari zimmedari hai.", meaning: "Protecting the environment is our responsibility." },
      { id: "hi-a3", level: "advanced", text: "कठिन परिस्थितियों में धैर्य बनाए रखना आवश्यक है।", translit: "Kathin paristhitiyon mein dhairya banaaye rakhna aavashyak hai.", meaning: "It is essential to keep patience in difficult situations." },
      { id: "hi-a4", level: "advanced", text: "तकनीकी प्रगति ने जीवन को अधिक सुविधाजनक बना दिया है।", translit: "Takniki pragati ne jeevan ko adhik suvidhajanak bana diya hai.", meaning: "Technological progress has made life more convenient." },
      { id: "hi-a5", level: "advanced", text: "प्रभावी संवाद आपसी विश्वास को मजबूत करता है।", translit: "Prabhavi samvaad aapsi vishwas ko mazboot karta hai.", meaning: "Effective communication strengthens mutual trust." },
    ],
  },
  es: {
    beginner: [
      { id: "es-b1", level: "beginner", text: "Hola, ¿cómo estás?", meaning: "Hello, how are you?" },
      { id: "es-b2", level: "beginner", text: "Me llamo Carlos.", meaning: "My name is Carlos." },
      { id: "es-b3", level: "beginner", text: "Tengo un perro.", meaning: "I have a dog." },
      { id: "es-b4", level: "beginner", text: "Hoy hace buen tiempo.", meaning: "The weather is nice today." },
      { id: "es-b5", level: "beginner", text: "Gracias por tu ayuda.", meaning: "Thanks for your help." },
    ],
    intermediate: [
      { id: "es-i1", level: "intermediate", text: "Mañana iremos al mercado.", meaning: "Tomorrow we will go to the market." },
      { id: "es-i2", level: "intermediate", text: "Ella estudia medicina en la universidad.", meaning: "She studies medicine at university." },
      { id: "es-i3", level: "intermediate", text: "Siempre desayuno antes de salir.", meaning: "I always have breakfast before leaving." },
      { id: "es-i4", level: "intermediate", text: "El autobús llegó muy temprano.", meaning: "The bus arrived very early." },
      { id: "es-i5", level: "intermediate", text: "Me gusta aprender idiomas nuevos.", meaning: "I like learning new languages." },
    ],
    advanced: [
      { id: "es-a1", level: "advanced", text: "La innovación tecnológica impulsa el desarrollo económico.", meaning: "Technological innovation drives economic development." },
      { id: "es-a2", level: "advanced", text: "Es fundamental proteger el medio ambiente.", meaning: "Protecting the environment is essential." },
      { id: "es-a3", level: "advanced", text: "Aunque fue difícil, logramos alcanzar nuestro objetivo.", meaning: "Although it was hard, we managed to reach our goal." },
      { id: "es-a4", level: "advanced", text: "La comunicación efectiva evita muchos conflictos.", meaning: "Effective communication avoids many conflicts." },
      { id: "es-a5", level: "advanced", text: "La educación contribuye al progreso de la sociedad.", meaning: "Education contributes to the progress of society." },
    ],
  },
  ar: {
    beginner: [
      { id: "ar-b1", level: "beginner", text: "مرحبًا.", translit: "Marhaban.", meaning: "Hello." },
      { id: "ar-b2", level: "beginner", text: "اسمي أحمد.", translit: "Ismi Ahmad.", meaning: "My name is Ahmad." },
      { id: "ar-b3", level: "beginner", text: "الجو جميل اليوم.", translit: "Al-jaww jameel al-yawm.", meaning: "The weather is nice today." },
      { id: "ar-b4", level: "beginner", text: "أحب القراءة.", translit: "Uhibb al-qira'ah.", meaning: "I love reading." },
      { id: "ar-b5", level: "beginner", text: "من فضلك افتح الباب.", translit: "Min fadlik iftah al-baab.", meaning: "Please open the door." },
    ],
    intermediate: [
      { id: "ar-i1", level: "intermediate", text: "أذهب إلى الجامعة كل صباح.", translit: "Adh-hab ila al-jaami'ah kull sabaah.", meaning: "I go to the university every morning." },
      { id: "ar-i2", level: "intermediate", text: "نحن نعمل معًا كفريق.", translit: "Nahnu na'mal ma'an ka-fareeq.", meaning: "We work together as a team." },
      { id: "ar-i3", level: "intermediate", text: "وصلت الحافلة في الوقت المحدد.", translit: "Wasalat al-haafilah fi al-waqt al-muhaddad.", meaning: "The bus arrived on time." },
      { id: "ar-i4", level: "intermediate", text: "أحب تعلم اللغات الجديدة.", translit: "Uhibb ta'allum al-lughaat al-jadeedah.", meaning: "I love learning new languages." },
      { id: "ar-i5", level: "intermediate", text: "هل يمكنك مساعدتي؟", translit: "Hal yumkinuka musaa'adati?", meaning: "Can you help me?" },
    ],
    advanced: [
      { id: "ar-a1", level: "advanced", text: "التعليم أساس تقدم المجتمعات.", translit: "At-ta'leem asaas taqaddum al-mujtama'aat.", meaning: "Education is the foundation of societies' progress." },
      { id: "ar-a2", level: "advanced", text: "حماية البيئة مسؤولية الجميع.", translit: "Himaayat al-bee'ah mas'ooliyyat al-jamee'.", meaning: "Protecting the environment is everyone's responsibility." },
      { id: "ar-a3", level: "advanced", text: "رغم التحديات، استمر في تحقيق أهدافه.", translit: "Raghma at-tahaddiyaat, istamarra fi tahqeeq ahdaafih.", meaning: "Despite the challenges, he continued to achieve his goals." },
      { id: "ar-a4", level: "advanced", text: "التواصل الفعال يقلل من سوء الفهم.", translit: "At-tawaasul al-fa'aal yuqallil min soo' al-fahm.", meaning: "Effective communication reduces misunderstandings." },
      { id: "ar-a5", level: "advanced", text: "التطور التكنولوجي غيّر أسلوب حياتنا.", translit: "At-tatawwur at-tiknoloji ghayyara usloob hayaatina.", meaning: "Technological development has changed our way of life." },
    ],
  },
  fr: {
    beginner: [
      { id: "fr-b1", level: "beginner", text: "Bonjour.", meaning: "Hello." },
      { id: "fr-b2", level: "beginner", text: "Je m'appelle Marie.", meaning: "My name is Marie." },
      { id: "fr-b3", level: "beginner", text: "J'aime le café.", meaning: "I like coffee." },
      { id: "fr-b4", level: "beginner", text: "Il fait beau aujourd'hui.", meaning: "The weather is nice today." },
      { id: "fr-b5", level: "beginner", text: "Merci beaucoup.", meaning: "Thank you very much." },
    ],
    intermediate: [
      { id: "fr-i1", level: "intermediate", text: "Nous allons au parc demain.", meaning: "We are going to the park tomorrow." },
      { id: "fr-i2", level: "intermediate", text: "Elle travaille dans un hôpital.", meaning: "She works in a hospital." },
      { id: "fr-i3", level: "intermediate", text: "J'apprends le français chaque jour.", meaning: "I learn French every day." },
      { id: "fr-i4", level: "intermediate", text: "Le train est arrivé à l'heure.", meaning: "The train arrived on time." },
      { id: "fr-i5", level: "intermediate", text: "Ils aiment voyager ensemble.", meaning: "They like traveling together." },
    ],
    advanced: [
      { id: "fr-a1", level: "advanced", text: "L'innovation technologique transforme notre société.", meaning: "Technological innovation transforms our society." },
      { id: "fr-a2", level: "advanced", text: "La protection de l'environnement est essentielle.", meaning: "Protecting the environment is essential." },
      { id: "fr-a3", level: "advanced", text: "Malgré les difficultés, elle a réussi.", meaning: "Despite the difficulties, she succeeded." },
      { id: "fr-a4", level: "advanced", text: "Une bonne communication renforce la confiance.", meaning: "Good communication strengthens trust." },
      { id: "fr-a5", level: "advanced", text: "L'éducation favorise le développement durable.", meaning: "Education fosters sustainable development." },
    ],
  },
  bn: {
    beginner: [
      { id: "bn-b1", level: "beginner", text: "আমার নাম রাহিম।", translit: "Amar naam Rohim.", meaning: "My name is Rohim." },
      { id: "bn-b2", level: "beginner", text: "আমি ভাত খাই।", translit: "Ami bhaat khai.", meaning: "I eat rice." },
      { id: "bn-b3", level: "beginner", text: "আজ আকাশ পরিষ্কার।", translit: "Aaj akash porishkar.", meaning: "The sky is clear today." },
      { id: "bn-b4", level: "beginner", text: "তুমি কেমন আছ?", translit: "Tumi kemon achho?", meaning: "How are you?" },
      { id: "bn-b5", level: "beginner", text: "দরজাটি বন্ধ করো।", translit: "Dorja-ti bondho koro.", meaning: "Close the door." },
    ],
    intermediate: [
      { id: "bn-i1", level: "intermediate", text: "আমি প্রতিদিন সকালে হাঁটতে যাই।", translit: "Ami protidin shokale hantte jai.", meaning: "I go for a walk every morning." },
      { id: "bn-i2", level: "intermediate", text: "সে খুব মনোযোগ দিয়ে পড়াশোনা করে।", translit: "Shey khub monojog diye porashona kore.", meaning: "He/She studies with great focus." },
      { id: "bn-i3", level: "intermediate", text: "আমরা আগামীকাল বাজারে যাব।", translit: "Amra agamikal bazaare jabo.", meaning: "We will go to the market tomorrow." },
      { id: "bn-i4", level: "intermediate", text: "আজ অনেক গরম পড়েছে।", translit: "Aaj onek gorom porechhe.", meaning: "It is very hot today." },
      { id: "bn-i5", level: "intermediate", text: "নতুন ভাষা শেখা খুব উপকারী।", translit: "Notun bhasha shekha khub upokari.", meaning: "Learning a new language is very useful." },
    ],
    advanced: [
      { id: "bn-a1", level: "advanced", text: "পরিবেশ সংরক্ষণ আমাদের সকলের দায়িত্ব।", translit: "Poribesh songrokkhon amader shokoler dayitto.", meaning: "Protecting the environment is everyone's responsibility." },
      { id: "bn-a2", level: "advanced", text: "প্রযুক্তির অগ্রগতি মানুষের জীবনকে সহজ করেছে।", translit: "Projuktir ogrogoti manusher jibon-ke shohoj korechhe.", meaning: "Technological progress has made human life easier." },
      { id: "bn-a3", level: "advanced", text: "কঠোর পরিশ্রম ছাড়া সফলতা অর্জন করা কঠিন।", translit: "Kothor porishrom chhara shofolota orjon kora kothin.", meaning: "Without hard work, success is hard to achieve." },
      { id: "bn-a4", level: "advanced", text: "কার্যকর যোগাযোগ ভুল বোঝাবুঝি কমায়।", translit: "Karjokor jogajog bhul bojhabujhi komay.", meaning: "Effective communication reduces misunderstandings." },
      { id: "bn-a5", level: "advanced", text: "শিক্ষাই একটি জাতির উন্নয়নের ভিত্তি।", translit: "Shikkha-i ekti jatir unnoyoner bhitti.", meaning: "Education is the foundation of a nation's development." },
    ],
  },
  pt: {
    beginner: [
      { id: "pt-b1", level: "beginner", text: "Olá.", meaning: "Hello." },
      { id: "pt-b2", level: "beginner", text: "Meu nome é Ana.", meaning: "My name is Ana." },
      { id: "pt-b3", level: "beginner", text: "Eu gosto de música.", meaning: "I like music." },
      { id: "pt-b4", level: "beginner", text: "Hoje está quente.", meaning: "It's hot today." },
      { id: "pt-b5", level: "beginner", text: "Obrigado pela ajuda.", meaning: "Thanks for the help." },
    ],
    intermediate: [
      { id: "pt-i1", level: "intermediate", text: "Vamos viajar no próximo mês.", meaning: "We will travel next month." },
      { id: "pt-i2", level: "intermediate", text: "Ela trabalha em um banco.", meaning: "She works at a bank." },
      { id: "pt-i3", level: "intermediate", text: "Eu estudo português todos os dias.", meaning: "I study Portuguese every day." },
      { id: "pt-i4", level: "intermediate", text: "O ônibus chegou cedo.", meaning: "The bus arrived early." },
      { id: "pt-i5", level: "intermediate", text: "Precisamos terminar o trabalho hoje.", meaning: "We need to finish the work today." },
    ],
    advanced: [
      { id: "pt-a1", level: "advanced", text: "A inovação tecnológica melhora a qualidade de vida.", meaning: "Technological innovation improves quality of life." },
      { id: "pt-a2", level: "advanced", text: "A educação é essencial para o desenvolvimento.", meaning: "Education is essential for development." },
      { id: "pt-a3", level: "advanced", text: "Apesar das dificuldades, continuamos avançando.", meaning: "Despite the difficulties, we keep moving forward." },
      { id: "pt-a4", level: "advanced", text: "A comunicação clara evita mal-entendidos.", meaning: "Clear communication prevents misunderstandings." },
      { id: "pt-a5", level: "advanced", text: "Proteger o meio ambiente é responsabilidade de todos.", meaning: "Protecting the environment is everyone's responsibility." },
    ],
  },
  ru: {
    beginner: [
      { id: "ru-b1", level: "beginner", text: "Привет.", translit: "Privet.", meaning: "Hi." },
      { id: "ru-b2", level: "beginner", text: "Меня зовут Иван.", translit: "Menya zovut Ivan.", meaning: "My name is Ivan." },
      { id: "ru-b3", level: "beginner", text: "Сегодня хорошая погода.", translit: "Segodnya khoroshaya pogoda.", meaning: "The weather is nice today." },
      { id: "ru-b4", level: "beginner", text: "Я люблю чай.", translit: "Ya lyublyu chay.", meaning: "I love tea." },
      { id: "ru-b5", level: "beginner", text: "Спасибо большое.", translit: "Spasibo bol'shoye.", meaning: "Thank you very much." },
    ],
    intermediate: [
      { id: "ru-i1", level: "intermediate", text: "Мы идём в парк завтра.", translit: "My idyom v park zavtra.", meaning: "We are going to the park tomorrow." },
      { id: "ru-i2", level: "intermediate", text: "Она учится в университете.", translit: "Ona uchitsya v universitete.", meaning: "She studies at the university." },
      { id: "ru-i3", level: "intermediate", text: "Поезд прибыл вовремя.", translit: "Poyezd pribyl vovremya.", meaning: "The train arrived on time." },
      { id: "ru-i4", level: "intermediate", text: "Я люблю изучать иностранные языки.", translit: "Ya lyublyu izuchat' inostrannyye yazyki.", meaning: "I love studying foreign languages." },
      { id: "ru-i5", level: "intermediate", text: "Сегодня очень холодно.", translit: "Segodnya ochen' kholodno.", meaning: "It's very cold today." },
    ],
    advanced: [
      { id: "ru-a1", level: "advanced", text: "Современные технологии меняют нашу жизнь.", translit: "Sovremennyye tekhnologii menyayut nashu zhizn'.", meaning: "Modern technology is changing our lives." },
      { id: "ru-a2", level: "advanced", text: "Защита окружающей среды важна для всех.", translit: "Zashchita okruzhayushchey sredy vazhna dlya vsekh.", meaning: "Environmental protection is important for everyone." },
      { id: "ru-a3", level: "advanced", text: "Несмотря на трудности, он достиг своей цели.", translit: "Nesmotrya na trudnosti, on dostig svoyey tseli.", meaning: "Despite the difficulties, he achieved his goal." },
      { id: "ru-a4", level: "advanced", text: "Хорошее общение помогает избежать конфликтов.", translit: "Khorosheye obshcheniye pomogayet izbezhat' konfliktov.", meaning: "Good communication helps avoid conflicts." },
      { id: "ru-a5", level: "advanced", text: "Образование играет важную роль в развитии общества.", translit: "Obrazovaniye igrayet vazhnuyu rol' v razvitii obshchestva.", meaning: "Education plays an important role in the development of society." },
    ],
  },
  ur: {
    beginner: [
      { id: "ur-b1", level: "beginner", text: "میرا نام علی ہے۔", translit: "Mera naam Ali hai.", meaning: "My name is Ali." },
      { id: "ur-b2", level: "beginner", text: "آج موسم اچھا ہے۔", translit: "Aaj mausam achha hai.", meaning: "The weather is nice today." },
      { id: "ur-b3", level: "beginner", text: "مجھے پانی چاہیے۔", translit: "Mujhe paani chahiye.", meaning: "I need water." },
      { id: "ur-b4", level: "beginner", text: "آپ کیسے ہیں؟", translit: "Aap kaise hain?", meaning: "How are you?" },
      { id: "ur-b5", level: "beginner", text: "براہ کرم دروازہ بند کریں۔", translit: "Barah-e-karam darwaza band karein.", meaning: "Please close the door." },
    ],
    intermediate: [
      { id: "ur-i1", level: "intermediate", text: "میں ہر روز اخبار پڑھتا ہوں۔", translit: "Main har roz akhbaar padhta hoon.", meaning: "I read the newspaper every day." },
      { id: "ur-i2", level: "intermediate", text: "ہم کل بازار جائیں گے۔", translit: "Hum kal bazaar jayenge.", meaning: "We will go to the market tomorrow." },
      { id: "ur-i3", level: "intermediate", text: "وہ یونیورسٹی میں تعلیم حاصل کر رہی ہے۔", translit: "Woh university mein taleem haasil kar rahi hai.", meaning: "She is studying at university." },
      { id: "ur-i4", level: "intermediate", text: "مجھے نئی زبانیں سیکھنا پسند ہے۔", translit: "Mujhe nayi zabaanein seekhna pasand hai.", meaning: "I like learning new languages." },
      { id: "ur-i5", level: "intermediate", text: "آج سڑک پر بہت رش ہے۔", translit: "Aaj sadak par bahut rush hai.", meaning: "There is a lot of traffic on the road today." },
    ],
    advanced: [
      { id: "ur-a1", level: "advanced", text: "تعلیم معاشرے کی ترقی کے لیے ضروری ہے۔", translit: "Taleem muashray ki taraqqi ke liye zaroori hai.", meaning: "Education is essential for the progress of society." },
      { id: "ur-a2", level: "advanced", text: "ماحول کا تحفظ ہم سب کی ذمہ داری ہے۔", translit: "Maahol ka tahaffuz hum sab ki zimmedari hai.", meaning: "Protecting the environment is all our responsibility." },
      { id: "ur-a3", level: "advanced", text: "مسلسل محنت کامیابی کی بنیاد ہوتی ہے۔", translit: "Musalsal mehnat kamyaabi ki bunyaad hoti hai.", meaning: "Consistent hard work is the foundation of success." },
      { id: "ur-a4", level: "advanced", text: "مؤثر رابطہ غلط فہمیوں کو کم کرتا ہے۔", translit: "Muassir raabta ghalat fahmiyon ko kam karta hai.", meaning: "Effective communication reduces misunderstandings." },
      { id: "ur-a5", level: "advanced", text: "جدید ٹیکنالوجی نے ہماری زندگی کو بدل دیا ہے۔", translit: "Jadeed technology ne hamari zindagi ko badal diya hai.", meaning: "Modern technology has changed our lives." },
    ],
  },
};

export function randomSentence(
  language: LanguageCode,
  level: Level,
  excludeId?: string,
): TargetSentence {
  if (level === "freestyle") return FREESTYLE_SENTENCE;
  const bank = SENTENCE_BANK[language][level] ?? [];
  const pool = bank.filter((s) => s.id !== excludeId);
  const source = pool.length > 0 ? pool : bank;
  if (source.length === 0) return FREESTYLE_SENTENCE;
  return source[Math.floor(Math.random() * source.length)];
}

export function firstSentence(language: LanguageCode, level: Level): TargetSentence {
  if (level === "freestyle") return FREESTYLE_SENTENCE;
  return SENTENCE_BANK[language][level]?.[0] ?? FREESTYLE_SENTENCE;
}
