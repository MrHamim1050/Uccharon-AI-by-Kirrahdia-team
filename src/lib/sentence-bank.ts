export type Level = "beginner" | "intermediate" | "advanced";

export type TargetSentence = {
  id: string;
  text: string;
  translit: string;
  meaning: string;
  level: Level;
};

export const SENTENCE_BANK: TargetSentence[] = [
  // Beginner
  { id: "b1", level: "beginner", text: "আমি বাংলা শিখছি।", translit: "Ami Bangla shikhchi.", meaning: "I am learning Bengali." },
  { id: "b2", level: "beginner", text: "আপনি কেমন আছেন?", translit: "Apni kemon achen?", meaning: "How are you?" },
  { id: "b3", level: "beginner", text: "আমার নাম রফিক।", translit: "Amar naam Rofik.", meaning: "My name is Rofik." },
  { id: "b4", level: "beginner", text: "আজ আবহাওয়া খুব সুন্দর।", translit: "Aaj abhaowa khub shundor.", meaning: "The weather is very nice today." },
  { id: "b5", level: "beginner", text: "আমি ভাত খেতে ভালোবাসি।", translit: "Ami bhaat khete bhalobashi.", meaning: "I love to eat rice." },
  { id: "b6", level: "beginner", text: "ধন্যবাদ, আবার দেখা হবে।", translit: "Dhonnobad, abar dekha hobe.", meaning: "Thank you, see you again." },

  // Intermediate
  { id: "i1", level: "intermediate", text: "আমি প্রতিদিন সকালে হাঁটতে যাই।", translit: "Ami protidin shokale hantte jai.", meaning: "I go for a walk every morning." },
  { id: "i2", level: "intermediate", text: "ঢাকা বাংলাদেশের রাজধানী।", translit: "Dhaka Bangladesher rajdhani.", meaning: "Dhaka is the capital of Bangladesh." },
  { id: "i3", level: "intermediate", text: "আমার প্রিয় ঋতু বর্ষাকাল।", translit: "Amar priyo ritu borshakal.", meaning: "My favorite season is the rainy season." },
  { id: "i4", level: "intermediate", text: "বইটি টেবিলের উপরে রাখো।", translit: "Boi-ti table-er upore rakho.", meaning: "Put the book on the table." },
  { id: "i5", level: "intermediate", text: "আমি চা খেতে পছন্দ করি, কফি নয়।", translit: "Ami cha khete pochondo kori, coffee noy.", meaning: "I prefer tea, not coffee." },

  // Advanced
  { id: "a1", level: "advanced", text: "সংস্কৃতি ছাড়া মানুষ পরিপূর্ণ হতে পারে না।", translit: "Shongskriti chhara manush poripurno hote pare na.", meaning: "A person cannot be complete without culture." },
  { id: "a2", level: "advanced", text: "রবীন্দ্রনাথ ঠাকুর নোবেল পুরস্কার পেয়েছিলেন।", translit: "Rabindranath Thakur Nobel puroshkar peyechhilen.", meaning: "Rabindranath Tagore received the Nobel Prize." },
  { id: "a3", level: "advanced", text: "স্বাধীনতা আমাদের সবচেয়ে বড় অর্জন।", translit: "Shadhinota amader shobcheye boro orjon.", meaning: "Independence is our greatest achievement." },
  { id: "a4", level: "advanced", text: "শিক্ষাই জাতির মেরুদণ্ড।", translit: "Shikkhai jatir merudondo.", meaning: "Education is the backbone of a nation." },
];

export function randomSentence(level?: Level, excludeId?: string): TargetSentence {
  const pool = SENTENCE_BANK.filter((s) => (!level || s.level === level) && s.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}
