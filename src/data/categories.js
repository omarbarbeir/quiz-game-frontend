// // src/data/categories.js
// const categories = [
//   // {
//   //   id: "football",
//   //   name: "Football",
//   //   icon: "⚽",
//   //   color: "from-green-600 to-emerald-600"
//   // },
//   {
//     id: "cinema",
//     name: "أفلام بعد 2000",
//     icon: "🎬",
//     color: "from-purple-600 to-indigo-600"
//   },
//  {
//     id: 'card-game',
//     name: 'لعبة البطاقات',
//     description: 'لعبة البطاقات الجماعية'
//   },
//   {
//     id: "reverse",
//     name: "الكلمات المعكوسة",
//     icon: "🔄",
//     color: "from-orange-600 to-amber-600"
//   },
//     {
//     id: 'whiteboard',
//     name: 'السبورة التعاونية',
//     icon: '🖌️',
//     color: 'from-blue-600 to-cyan-600'
//   },
  
//   // {
//   //   id: "science",
//   //   name: "Science",
//   //   icon: "🔬",
//   //   color: "from-blue-600 to-cyan-600"
//   // },
//   {
//     id: "history",
//     name: "أفلام قبل 2000",
//     icon: "🏛️",
//     color: "from-amber-600 to-orange-600"
//   },
//   // {
//   //   id: "geography",
//   //   name: "Geography",
//   //   icon: "🌍",
//   //   color: "from-teal-600 to-cyan-600"
//   // },
//   {
//     id: "music",
//     name: "أغاني معكوسة",
//     icon: "🎵",
//     color: "from-pink-600 to-rose-600"
//   },
//   // {
//   //   id: 'photos',
//   //   name: 'الصور'
//   // },

//   {
//     id: 'random-photos',
//     name: 'أنا مين',
//     subcategories: [
//       // {
//       //   id: 'footballers',
//       //   name: 'Football Players'
//       // },
//       {
//         id: 'food',
//         name: 'أكلات'
//       },
//       {
//         id: 'actors',
//         name: 'فنانين'
//       },
//       // {
//       //   id: 'animals',
//       //   name: 'Animals'
//       // },
//       // {
//       //   id: 'nature',
//       //   name: 'Nature'
//       // },
//       // {
//       //   id: 'art',
//       //   name: 'Art'
//       // }
//     ]
//   } 

// ];

// export default categories;


const categories = [
  {
    id: "cinema",
    name: "سينما",
    icon: "🎬",
    color: "from-purple-600 to-indigo-600",
    subcategories: [
      { id: "cinema", name: "أفلام بعد 2000", icon: "🎬", color: "from-purple-600 to-indigo-600" },
      { id: "history", name: "أفلام قبل 2000", icon: "🏛️", color: "from-amber-600 to-orange-600" }
    ]
  },

  {
    id: "casino",
    name: "كازينو",
    icon: "🎰",
    color: "from-red-600 to-orange-600",
    subcategories: [
      { id: "reverse", name: "الكلمات المعكوسة", icon: "🔄", color: "from-orange-600 to-amber-600" },
      { id: "music", name: "أغاني معكوسة", icon: "🎵", color: "from-pink-600 to-rose-600" },
      { id: "who-said", name: "مين قال الجملة دي", icon: "🎬", color: "from-yellow-500 to-orange-400" },
      { id: "song-for", name: "أغنية لـ", icon: "🎤", color: "from-purple-500 to-pink-500" },
      { id: "put-word-in-song", name: "حط كلمة في أغنية", icon: "🎶", color: "from-teal-500 to-cyan-500" }
    ]
  },

  {
    id: "whoami",
    name: "أنا مين",
    icon: "🤔",
    color: "from-green-600 to-teal-600",
    subcategories: [
      { id: "food", name: "أكلات" },
      { id: "actors", name: "فنانين" },
      { id: "football", name: "لاعبين كرة قدم" }
    ]
  },

  {
    id: "card-game",
    name: "لعبة البطاقات",
    icon: "🃏",
    color: "from-yellow-600 to-amber-600",
    subcategories: []
  },

  {
    id: "whiteboard",
    name: "السبورة التعاونية",
    icon: "🖌️",
    color: "from-blue-600 to-cyan-600",
    subcategories: []
  },

  // ---------- NEW CATEGORIES ----------
  {
    id: "flags",
    name: "أعلام الدول",
    icon: "🏳️",
    color: "from-red-500 to-blue-500",
    subcategories: []
  },

  {
    id: "spy",
    name: "جاسوس",
    icon: "🕵️",
    color: "from-gray-700 to-black",
    subcategories: []
  },

  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    icon: "⭕❌",
    color: "from-yellow-400 to-orange-500",
    subcategories: []
  },

  {
    id: "grid-game",
    name: "اوتوبيس كومبليت",
    icon: "📊",
    color: "from-teal-500 to-green-500",
    subcategories: []
  },

  {
    id: "bingo",
    name: "بينجو",
    icon: "🎯",
    color: "from-yellow-400 to-orange-500",
    subcategories: []
  },

  {
    id: "battleship",
    name: "حرب السفن",
    icon: "🚢",
    color: "from-blue-600 to-cyan-600",
    subcategories: []
  },

  {
    id: "sword-of-knowledge",
    name: "سيف المعرفة",
    icon: "🗡️",
    color: "from-yellow-600 to-red-700",
    subcategories: []
  },

  {
    id: "round16",
    name: "دور الـ١٦",
    icon: "🏆",
    color: "from-yellow-500 to-orange-600",
    subcategories: []
  },

  { id: 'crime-game',
    name: 'حل الجرائم',
    description: 'اكتشف الجاني',
    subcategories: []
  }

];

export default categories;