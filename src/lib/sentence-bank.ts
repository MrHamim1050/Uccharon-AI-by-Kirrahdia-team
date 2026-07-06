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
  | "chattogramia"
  | "noakhailla"
  | "rangpuri"
  | "barishailla";

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
  standard: "Standard Bangla (প্রমিত)",
  sylheti: "Sylheti (সিলেটি)",
  chattogramia: "Chattogramia (চাটগাঁইয়া)",
  noakhailla: "Noakhailla (নোয়াখাইল্লা)",
  rangpuri: "Rangpuri (রংপুরী)",
  barishailla: "Barishailla (বরিশাইল্লা)",
};

export const BN_DIALECT_ORDER: BnDialect[] = [
  "standard",
  "sylheti",
  "chattogramia",
  "noakhailla",
  "rangpuri",
  "barishailla",
];

export type TargetSentence = {
  id: string;
  text: string;
  translit?: string;
  meaning: string;
  level: Level;
};

type Bank = Record<LanguageCode, Record<Level, TargetSentence[]>>;

export const SENTENCE_BANK: Bank = {
  en: {
    beginner: [
      { id: "en-b1", level: "beginner", text: "The weather is nice today.", meaning: "A simple observation about the day." },
      { id: "en-b2", level: "beginner", text: "I would like a cup of coffee, please.", meaning: "Polite request at a café." },
      { id: "en-b3", level: "beginner", text: "My name is Alex and I live in London.", meaning: "Introducing yourself." },
      { id: "en-b4", level: "beginner", text: "Can you help me find the train station?", meaning: "Asking for directions." },
    ],
    intermediate: [
      { id: "en-i1", level: "intermediate", text: "She usually reads a book before going to bed.", meaning: "A daily habit." },
      { id: "en-i2", level: "intermediate", text: "We should schedule the meeting for next Thursday.", meaning: "Making plans at work." },
      { id: "en-i3", level: "intermediate", text: "The mountains looked beautiful in the morning light.", meaning: "Describing a scene." },
    ],
    advanced: [
      { id: "en-a1", level: "advanced", text: "Curiosity is the engine that drives every genuine breakthrough.", meaning: "A quote about learning." },
      { id: "en-a2", level: "advanced", text: "Although the results were unexpected, the team remained optimistic.", meaning: "Complex clause with contrast." },
      { id: "en-a3", level: "advanced", text: "Technological progress must be balanced with ethical responsibility.", meaning: "Formal statement." },
    ],
  },
  zh: {
    beginner: [
      { id: "zh-b1", level: "beginner", text: "你好,很高兴认识你。", translit: "Nǐ hǎo, hěn gāoxìng rènshi nǐ.", meaning: "Hello, nice to meet you." },
      { id: "zh-b2", level: "beginner", text: "我想喝一杯茶。", translit: "Wǒ xiǎng hē yì bēi chá.", meaning: "I would like a cup of tea." },
      { id: "zh-b3", level: "beginner", text: "今天天气很好。", translit: "Jīntiān tiānqì hěn hǎo.", meaning: "The weather is nice today." },
    ],
    intermediate: [
      { id: "zh-i1", level: "intermediate", text: "我每天早上都去公园散步。", translit: "Wǒ měitiān zǎoshang dōu qù gōngyuán sànbù.", meaning: "I walk in the park every morning." },
      { id: "zh-i2", level: "intermediate", text: "请问,火车站怎么走?", translit: "Qǐngwèn, huǒchēzhàn zěnme zǒu?", meaning: "Excuse me, how do I get to the train station?" },
    ],
    advanced: [
      { id: "zh-a1", level: "advanced", text: "学习一门语言需要长期的努力和耐心。", translit: "Xuéxí yì mén yǔyán xūyào chángqī de nǔlì hé nàixīn.", meaning: "Learning a language takes long-term effort and patience." },
      { id: "zh-a2", level: "advanced", text: "科技的发展改变了我们的生活方式。", translit: "Kējì de fāzhǎn gǎibiànle wǒmen de shēnghuó fāngshì.", meaning: "Technological progress has changed our way of life." },
    ],
  },
  hi: {
    beginner: [
      { id: "hi-b1", level: "beginner", text: "नमस्ते, आप कैसे हैं?", translit: "Namaste, aap kaise hain?", meaning: "Hello, how are you?" },
      { id: "hi-b2", level: "beginner", text: "मेरा नाम राहुल है।", translit: "Mera naam Rahul hai.", meaning: "My name is Rahul." },
      { id: "hi-b3", level: "beginner", text: "मुझे चाय पसंद है।", translit: "Mujhe chai pasand hai.", meaning: "I like tea." },
    ],
    intermediate: [
      { id: "hi-i1", level: "intermediate", text: "मैं हर सुबह पार्क में टहलने जाता हूँ।", translit: "Main har subah park mein tehelne jaata hoon.", meaning: "I go for a walk in the park every morning." },
      { id: "hi-i2", level: "intermediate", text: "क्या आप मुझे स्टेशन का रास्ता बता सकते हैं?", translit: "Kya aap mujhe station ka rasta bata sakte hain?", meaning: "Can you tell me the way to the station?" },
    ],
    advanced: [
      { id: "hi-a1", level: "advanced", text: "शिक्षा किसी भी समाज की सबसे बड़ी शक्ति होती है।", translit: "Shiksha kisi bhi samaaj ki sabse badi shakti hoti hai.", meaning: "Education is the greatest strength of any society." },
      { id: "hi-a2", level: "advanced", text: "विज्ञान और कला दोनों ही मानव जीवन को समृद्ध बनाते हैं।", translit: "Vigyaan aur kala dono hi maanav jeevan ko samriddh banaate hain.", meaning: "Both science and art enrich human life." },
    ],
  },
  es: {
    beginner: [
      { id: "es-b1", level: "beginner", text: "Hola, ¿cómo estás?", meaning: "Hello, how are you?" },
      { id: "es-b2", level: "beginner", text: "Me llamo María y soy de Madrid.", meaning: "My name is María and I'm from Madrid." },
      { id: "es-b3", level: "beginner", text: "Quisiera un café, por favor.", meaning: "I would like a coffee, please." },
    ],
    intermediate: [
      { id: "es-i1", level: "intermediate", text: "Todos los sábados voy al mercado por la mañana.", meaning: "Every Saturday I go to the market in the morning." },
      { id: "es-i2", level: "intermediate", text: "¿Puedes decirme dónde está la estación de tren?", meaning: "Can you tell me where the train station is?" },
    ],
    advanced: [
      { id: "es-a1", level: "advanced", text: "Aunque la tarea sea difícil, siempre vale la pena intentarlo.", meaning: "Even if the task is hard, it's always worth trying." },
      { id: "es-a2", level: "advanced", text: "La cultura y la lengua son el reflejo del alma de un pueblo.", meaning: "Culture and language reflect the soul of a people." },
    ],
  },
  ar: {
    beginner: [
      { id: "ar-b1", level: "beginner", text: "مرحبا، كيف حالك؟", translit: "Marhaban, kayfa haluk?", meaning: "Hello, how are you?" },
      { id: "ar-b2", level: "beginner", text: "اسمي أحمد وأنا من القاهرة.", translit: "Ismi Ahmad wa ana min al-Qahira.", meaning: "My name is Ahmad and I am from Cairo." },
      { id: "ar-b3", level: "beginner", text: "أريد كوب شاي من فضلك.", translit: "Ureed koob shay min fadlik.", meaning: "I would like a cup of tea, please." },
    ],
    intermediate: [
      { id: "ar-i1", level: "intermediate", text: "أذهب إلى العمل كل يوم في الصباح الباكر.", translit: "Adh-hab ila al-'amal kull yawm fi as-sabah al-baakir.", meaning: "I go to work every day early in the morning." },
      { id: "ar-i2", level: "intermediate", text: "هل يمكنك أن ترشدني إلى المحطة؟", translit: "Hal yumkinuka an turshidani ila al-mahatta?", meaning: "Can you guide me to the station?" },
    ],
    advanced: [
      { id: "ar-a1", level: "advanced", text: "العلم نور والجهل ظلام في حياة الإنسان.", translit: "Al-'ilm noor wal-jahl zalaam fi hayat al-insaan.", meaning: "Knowledge is light and ignorance is darkness in human life." },
      { id: "ar-a2", level: "advanced", text: "التعاون بين الشعوب أساس السلام العالمي.", translit: "At-ta'aawun bayn ash-shu'oob asaas as-salaam al-'aalami.", meaning: "Cooperation between peoples is the foundation of world peace." },
    ],
  },
  fr: {
    beginner: [
      { id: "fr-b1", level: "beginner", text: "Bonjour, comment ça va ?", meaning: "Hello, how are you?" },
      { id: "fr-b2", level: "beginner", text: "Je m'appelle Marie et j'habite à Paris.", meaning: "My name is Marie and I live in Paris." },
      { id: "fr-b3", level: "beginner", text: "Je voudrais un café, s'il vous plaît.", meaning: "I would like a coffee, please." },
    ],
    intermediate: [
      { id: "fr-i1", level: "intermediate", text: "Chaque matin, je prends le métro pour aller au travail.", meaning: "Every morning I take the metro to go to work." },
      { id: "fr-i2", level: "intermediate", text: "Pouvez-vous m'indiquer le chemin de la gare ?", meaning: "Can you show me the way to the station?" },
    ],
    advanced: [
      { id: "fr-a1", level: "advanced", text: "La curiosité est le moteur de toute véritable découverte.", meaning: "Curiosity is the engine of every true discovery." },
      { id: "fr-a2", level: "advanced", text: "Malgré les difficultés, l'équipe est restée optimiste.", meaning: "Despite the difficulties, the team remained optimistic." },
    ],
  },
  bn: {
    beginner: [
      { id: "bn-b1", level: "beginner", text: "আমি বাংলা শিখছি।", translit: "Ami Bangla shikhchi.", meaning: "I am learning Bengali." },
      { id: "bn-b2", level: "beginner", text: "আপনি কেমন আছেন?", translit: "Apni kemon achen?", meaning: "How are you?" },
      { id: "bn-b3", level: "beginner", text: "আমার নাম রফিক।", translit: "Amar naam Rofik.", meaning: "My name is Rofik." },
      { id: "bn-b4", level: "beginner", text: "আজ আবহাওয়া খুব সুন্দর।", translit: "Aaj abhaowa khub shundor.", meaning: "The weather is very nice today." },
      { id: "bn-b5", level: "beginner", text: "আমি ভাত খেতে ভালোবাসি।", translit: "Ami bhaat khete bhalobashi.", meaning: "I love to eat rice." },
    ],
    intermediate: [
      { id: "bn-i1", level: "intermediate", text: "আমি প্রতিদিন সকালে হাঁটতে যাই।", translit: "Ami protidin shokale hantte jai.", meaning: "I go for a walk every morning." },
      { id: "bn-i2", level: "intermediate", text: "ঢাকা বাংলাদেশের রাজধানী।", translit: "Dhaka Bangladesher rajdhani.", meaning: "Dhaka is the capital of Bangladesh." },
      { id: "bn-i3", level: "intermediate", text: "বইটি টেবিলের উপরে রাখো।", translit: "Boi-ti table-er upore rakho.", meaning: "Put the book on the table." },
    ],
    advanced: [
      { id: "bn-a1", level: "advanced", text: "সংস্কৃতি ছাড়া মানুষ পরিপূর্ণ হতে পারে না।", translit: "Shongskriti chhara manush poripurno hote pare na.", meaning: "A person cannot be complete without culture." },
      { id: "bn-a2", level: "advanced", text: "রবীন্দ্রনাথ ঠাকুর নোবেল পুরস্কার পেয়েছিলেন।", translit: "Rabindranath Thakur Nobel puroshkar peyechhilen.", meaning: "Rabindranath Tagore received the Nobel Prize." },
      { id: "bn-a3", level: "advanced", text: "শিক্ষাই জাতির মেরুদণ্ড।", translit: "Shikkhai jatir merudondo.", meaning: "Education is the backbone of a nation." },
    ],
  },
  pt: {
    beginner: [
      { id: "pt-b1", level: "beginner", text: "Olá, tudo bem?", meaning: "Hello, how are you?" },
      { id: "pt-b2", level: "beginner", text: "Meu nome é João e moro em Lisboa.", meaning: "My name is João and I live in Lisbon." },
      { id: "pt-b3", level: "beginner", text: "Eu gostaria de um café, por favor.", meaning: "I would like a coffee, please." },
    ],
    intermediate: [
      { id: "pt-i1", level: "intermediate", text: "Todos os dias eu vou ao trabalho de ônibus.", meaning: "Every day I go to work by bus." },
      { id: "pt-i2", level: "intermediate", text: "Você pode me mostrar o caminho para a estação?", meaning: "Can you show me the way to the station?" },
    ],
    advanced: [
      { id: "pt-a1", level: "advanced", text: "A leitura amplia os horizontes da mente humana.", meaning: "Reading broadens the horizons of the human mind." },
      { id: "pt-a2", level: "advanced", text: "Apesar das dificuldades, continuamos acreditando no futuro.", meaning: "Despite the difficulties, we keep believing in the future." },
    ],
  },
  ru: {
    beginner: [
      { id: "ru-b1", level: "beginner", text: "Здравствуйте, как дела?", translit: "Zdravstvuyte, kak dela?", meaning: "Hello, how are you?" },
      { id: "ru-b2", level: "beginner", text: "Меня зовут Иван, я из Москвы.", translit: "Menya zovut Ivan, ya iz Moskvy.", meaning: "My name is Ivan, I'm from Moscow." },
      { id: "ru-b3", level: "beginner", text: "Я хочу чашку чая, пожалуйста.", translit: "Ya khochu chashku chaya, pozhaluysta.", meaning: "I would like a cup of tea, please." },
    ],
    intermediate: [
      { id: "ru-i1", level: "intermediate", text: "Каждое утро я хожу в парк на прогулку.", translit: "Kazhdoye utro ya khozhu v park na progulku.", meaning: "Every morning I go to the park for a walk." },
      { id: "ru-i2", level: "intermediate", text: "Скажите, пожалуйста, где находится вокзал?", translit: "Skazhite, pozhaluysta, gde nakhoditsya vokzal?", meaning: "Please tell me where the train station is." },
    ],
    advanced: [
      { id: "ru-a1", level: "advanced", text: "Образование — это ключ к будущему нации.", translit: "Obrazovaniye — eto klyuch k budushchemu natsii.", meaning: "Education is the key to the future of a nation." },
      { id: "ru-a2", level: "advanced", text: "Несмотря на трудности, команда сохраняла оптимизм.", translit: "Nesmotrya na trudnosti, komanda sokhranyala optimizm.", meaning: "Despite the difficulties, the team stayed optimistic." },
    ],
  },
  ur: {
    beginner: [
      { id: "ur-b1", level: "beginner", text: "السلام علیکم، آپ کیسے ہیں؟", translit: "Assalamu alaikum, aap kaise hain?", meaning: "Peace be upon you, how are you?" },
      { id: "ur-b2", level: "beginner", text: "میرا نام علی ہے۔", translit: "Mera naam Ali hai.", meaning: "My name is Ali." },
      { id: "ur-b3", level: "beginner", text: "مجھے چائے پسند ہے۔", translit: "Mujhe chai pasand hai.", meaning: "I like tea." },
    ],
    intermediate: [
      { id: "ur-i1", level: "intermediate", text: "میں ہر صبح پارک میں سیر کرنے جاتا ہوں۔", translit: "Main har subah park mein sair karne jaata hoon.", meaning: "I go for a walk in the park every morning." },
      { id: "ur-i2", level: "intermediate", text: "کیا آپ مجھے اسٹیشن کا راستہ بتا سکتے ہیں؟", translit: "Kya aap mujhe station ka rasta bata sakte hain?", meaning: "Can you tell me the way to the station?" },
    ],
    advanced: [
      { id: "ur-a1", level: "advanced", text: "علم انسان کی سب سے بڑی دولت ہے۔", translit: "Ilm insaan ki sab se badi daulat hai.", meaning: "Knowledge is the greatest wealth of a person." },
      { id: "ur-a2", level: "advanced", text: "مشکلات کے باوجود ہمیں امید نہیں چھوڑنی چاہیے۔", translit: "Mushkilaat ke baawajood hamein umeed nahin chhorni chahiye.", meaning: "Despite hardships, we should not lose hope." },
    ],
  },
};

export function randomSentence(
  language: LanguageCode,
  level: Level,
  excludeId?: string,
): TargetSentence {
  const pool = SENTENCE_BANK[language][level].filter((s) => s.id !== excludeId);
  const source = pool.length > 0 ? pool : SENTENCE_BANK[language][level];
  return source[Math.floor(Math.random() * source.length)];
}

export function firstSentence(language: LanguageCode, level: Level): TargetSentence {
  return SENTENCE_BANK[language][level][0];
}
