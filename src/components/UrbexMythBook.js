import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Rakkas&family=Caveat:wght@400;700&display=swap');
.hw-ar { font-family:'Amiri','Rakkas',Georgia,serif; line-height:2.1; }
.hw-en { font-family:'Caveat',cursive; font-size:1.1em; line-height:1.9; }
@keyframes coverPulse { 0%,100%{filter:drop-shadow(0 0 8px #8b000033)} 50%{filter:drop-shadow(0 0 22px #8b000066)} }
@keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.3} 94%{opacity:1} 97%{opacity:.6} 98%{opacity:1} }
@keyframes dust { 0%{opacity:0;transform:translateY(0)} 20%{opacity:.8} 100%{opacity:0;transform:translateY(-70px) translateX(15px)} }
`;

// ══════════════════════════════════════════════════════════════
// بيانات الصفحات — كل فصل ليه محتواه
// ══════════════════════════════════════════════════════════════
const BOOK_PAGES = {

  chapter_forest_01: {
    ar: [
      { type:"intro",        content:{ title:"حكايات الأماكن المنسية", subtitle:"جُمعت من شهادات الناجين", warning:"كل ما تقرأه هنا سُجِّل كما رُوي.\nلا نؤكد صحته.\nلا ننفيه.", seal:"✦ مجمع الأرشيف السري — ١٩٩٨ ✦" }},
      { type:"dedication",   content:{ text:"إلى الذين دخلوا\nولم يعودوا كما ذهبوا.", signature:"— الجامع" }},
      { type:"chapter_start",content:{ number:"الفصل الأول", title:"كوخ الغابة السوداء", location:"غابة الصنوبر — شمال المدينة", year:"آخر توثيق: أكتوبر ١٩٩٤" }},
      { type:"myth",         content:{ eyebrow:"الخرافة الشعبية", text:"يقول أهل القرية إن غابة الصنوبر السوداء\nمسكونة بروح امرأة ضلّت طريقها منذ قرون.\n\nيقولون إنها تتبع الضوء.\nوإنها تدخل البيوت المضاءة ليلاً.\n\nومن يراها... لا يعود كما كان.", note:"رُويت هذه الرواية لأول مرة سنة ١٨٧٢." }},
      { type:"truth",        content:{ eyebrow:"ما وثّقه الأرشيف", text:"في أكتوبر ١٩٩٤ أبلغ أهل القرية\nعن اختفاء عائلة كاملة في ليلة واحدة.\n\nالأب: كمال يوسف — باحث.\nالأم: سلمى.\nالابنة: ريا — ١٢ عاماً.\n\nفُتح تحقيق.\nأُغلق بعد ثلاثة أشهر.\nبدون سبب معلن.", stamp:"سري — لا يُنشر" }},
      { type:"warning",      content:{ text:"من يدخل هذا المكان\nيجب أن يعرف:\n\nالغابة تأكل الذكريات.\n\nثلاثة دخلوا للتحقيق سنة ١٩٩٥\nوعادوا لا يتذكرون شيئاً.", question:"هل هذا خرافة؟\nأم حقيقة؟\n\nادخل واكتشف." }},
    ],
    en: [
      { type:"intro",        content:{ title:"Tales of Forgotten Places", subtitle:"Collected from survivor testimonies", warning:"Everything recorded here was told as-is.\nWe neither confirm nor deny it.", seal:"✦ Secret Archive — 1998 ✦" }},
      { type:"dedication",   content:{ text:"To those who entered\nand never returned as they left.", signature:"— The Collector" }},
      { type:"chapter_start",content:{ number:"Chapter One", title:"The Black Forest Cabin", location:"Pine Forest — North of the City", year:"Last documented: October 1994" }},
      { type:"myth",         content:{ eyebrow:"The Folk Myth", text:"The villagers say the Black Pine Forest\nis haunted by a woman lost centuries ago.\n\nThey say she follows the light.\nThat she enters lit homes at night.\n\nWhoever sees her... never returns the same.", note:"First recorded in 1872." }},
      { type:"truth",        content:{ eyebrow:"What the Archive Documented", text:"In October 1994, villagers reported\nan entire family missing in a single night.\n\nFather: Kamal Yousef — researcher.\nMother: Salma.\nDaughter: Riya — 12 years old.\n\nInvestigation opened.\nClosed after three months.\nNo stated reason.", stamp:"CLASSIFIED" }},
      { type:"warning",      content:{ text:"Whoever enters must know:\n\nThe forest devours memories.\n\nThree entered to investigate in 1995\nand returned remembering nothing.", question:"Is this myth?\nOr reality?\n\nEnter and find out." }},
    ],
  },

  chapter_library_02: {
    ar: [
      { type:"intro",        content:{ title:"المكتبة المركزية", subtitle:"من أرشيف الحوادث غير المفسّرة", warning:"ما ستقرأه هنا موثق.\nلكنه لم يُنشر أبداً.\nولسبب.", seal:"✦ الأرشيف السري — قسم ب ✦" }},
      { type:"dedication",   content:{ text:"إلى نادية، سامية، وحسام.\nالذين عرفوا.\nوالذين لم يعودوا.", signature:"— الجامع" }},
      { type:"chapter_start",content:{ number:"الفصل الثاني", title:"المكتبة المركزية", location:"وسط المدينة — الحي القديم", year:"آخر توثيق: أكتوبر ١٩٩٠" }},
      { type:"myth",         content:{ eyebrow:"ما يقوله الناس", text:"من يقرأ الكتاب الأحمر في المكتبة\nيرى من مات بين رفوفها.\n\nثلاثة أمناء اختفوا في خمسين عاماً.\nكل واحد بعد الثاني بثماني عشرة سنة.\n\nالمكتبة لم تُغلق يوماً.\nالكتب لم تتوقف عن الحركة.", note:"أول إبلاغ عن الظاهرة: ١٩٥٤." }},
      { type:"truth",        content:{ eyebrow:"ما وثّقه الأرشيف", text:"نادية حسن — اختفت ١٩٥٤.\nسامية رشيد — اختفت ١٩٧٢.\nحسام الدين — اختفى ١٩٩٠.\n\nالفارق الزمني: ١٨ سنة بالضبط.\nالتحقيقات الثلاثة أُغلقت.\nبدون سبب معلن.", stamp:"سري — لا يُنشر" }},
      { type:"warning",      content:{ text:"الكتاب الأحمر موجود هناك.\nصفحاته بيضاء — إلا واحدة.\n\nفيها خريطة بخمس نقاط.\nأنت النقطة الثانية.", question:"من أرسل الجامع؟\nولماذا المكتبة؟\n\nادخل واكتشف." }},
    ],
    en: [
      { type:"intro",        content:{ title:"The Central Library", subtitle:"From the archive of unexplained incidents", warning:"What you will read here is documented.\nBut never published.\nFor a reason.", seal:"✦ Secret Archive — Section B ✦" }},
      { type:"dedication",   content:{ text:"To Nadia, Samia, and Hossam.\nWho knew.\nAnd who never returned.", signature:"— The Collector" }},
      { type:"chapter_start",content:{ number:"Chapter Two", title:"The Central Library", location:"City Center — Old District", year:"Last documented: October 1990" }},
      { type:"myth",         content:{ eyebrow:"What People Say", text:"Whoever reads the Red Book in the library\nsees those who died between its shelves.\n\nThree librarians disappeared over fifty years.\nEach exactly eighteen years after the last.\n\nThe library never closed.\nThe books never stopped moving.", note:"First report of the phenomenon: 1954." }},
      { type:"truth",        content:{ eyebrow:"What the Archive Documented", text:"Nadia Hassan — disappeared 1954.\nSamia Rashid — disappeared 1972.\nHossam el-Din — disappeared 1990.\n\nTime gap: exactly 18 years each.\nAll three investigations closed.\nNo stated reason.", stamp:"CLASSIFIED" }},
      { type:"warning",      content:{ text:"The Red Book is in there.\nIts pages are white — except one.\n\nIt holds a map with five points.\nYou are the second point.", question:"Who sent The Collector?\nAnd why the library?\n\nEnter and find out." }},
    ],
  },

};

// ══════════════════════════════════════════════════════════════
// غلاف الكتاب
// ══════════════════════════════════════════════════════════════
function BookCover({ lang, isRtl }) {
  return (
    <div className="absolute inset-0 rounded-sm overflow-hidden"
      style={{ background:"linear-gradient(135deg,#180700 0%,#2d0e00 25%,#1a0800 55%,#0e0400 100%)", boxShadow:"0 0 0 1px #3d1500,inset 0 0 80px #00000066" }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(70,25,0,.4) 2px,rgba(70,25,0,.4) 4px),repeating-linear-gradient(-45deg,transparent,transparent 3px,rgba(50,15,0,.3) 3px,rgba(50,15,0,.3) 5px)" }}/>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 520" xmlns="http://www.w3.org/2000/svg">
        <path d="M18,45 Q38,40 33,78 Q28,108 48,102" stroke="#5a2000" strokeWidth="1.5" fill="none" opacity=".55"/>
        <path d="M295,195 Q318,185 312,228 Q306,258 328,252" stroke="#4a1800" strokeWidth="1.2" fill="none" opacity=".45"/>
        <ellipse cx="285" cy="78" rx="30" ry="19" fill="#6b0000" opacity=".6" transform="rotate(-18,285,78)"/>
        <ellipse cx="296" cy="87" rx="14" ry="9" fill="#4a0000" opacity=".45" transform="rotate(-12,296,87)"/>
        <ellipse cx="315" cy="104" rx="5" ry="7" fill="#5a0000" opacity=".55" transform="rotate(22,315,104)"/>
        <circle cx="324" cy="112" r="3.5" fill="#5a0000" opacity=".5"/>
        <circle cx="308" cy="116" r="2.5" fill="#4a0000" opacity=".4"/>
        <ellipse cx="58" cy="452" rx="16" ry="11" fill="#5a0000" opacity=".45" transform="rotate(5,58,452)"/>
        <circle cx="74" cy="462" r="4.5" fill="#4a0000" opacity=".4"/>
        <rect x="14" y="14" width="332" height="492" rx="2" fill="none" stroke="#5a3000" strokeWidth="1" opacity=".35"/>
        <path d="M18,18 L58,18 L58,23 L23,23 L23,58 L18,58 Z" fill="#5a3000" opacity=".45"/>
        <path d="M342,18 L302,18 L302,23 L337,23 L337,58 L342,58 Z" fill="#5a3000" opacity=".45"/>
        <path d="M18,502 L58,502 L58,497 L23,497 L23,462 L18,462 Z" fill="#5a3000" opacity=".45"/>
        <path d="M342,502 L302,502 L302,497 L337,497 L337,462 L342,462 Z" fill="#5a3000" opacity=".45"/>
        <circle cx="180" cy="185" r="72" fill="none" stroke="#6a3a00" strokeWidth=".8" opacity=".35"/>
        <polygon points="180,118 240,232 120,232" fill="none" stroke="#c9a84c" strokeWidth="1.4" opacity=".55"/>
        <ellipse cx="180" cy="185" rx="32" ry="19" fill="none" stroke="#c9a84c" strokeWidth="1.8" opacity=".8"/>
        <circle cx="180" cy="185" r="9" fill="#120600" stroke="#c9a84c" strokeWidth="1.2" opacity=".9"/>
        <circle cx="180" cy="185" r="4" fill="#c9a84c" opacity=".75"/>
        <circle cx="183" cy="182" r="1.5" fill="#fff" opacity=".5"/>
        {[0,45,90,135,180,225,270,315].map((deg,i) => {
          const r=Math.PI*deg/180, x1=180+38*Math.cos(r), y1=185+38*Math.sin(r), x2=180+46*Math.cos(r), y2=185+46*Math.sin(r);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7a4800" strokeWidth=".8" opacity=".45"/>;
        })}
        <rect x="161" y="420" width="38" height="30" rx="3" fill="#1a0800" stroke="#6a3500" strokeWidth="1.5" opacity=".85"/>
        <path d="M168,420 L168,410 Q168,398 180,398 Q192,398 192,410 L192,420" fill="none" stroke="#6a3500" strokeWidth="2.2" opacity=".8"/>
        <circle cx="180" cy="435" r="6" fill="#2d1200" stroke="#8a4800" strokeWidth="1.2" opacity=".9"/>
        <line x1="180" y1="437" x2="180" y2="443" stroke="#8a4800" strokeWidth="1.5" opacity=".8"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none" style={{paddingBottom:"100px"}}>
        <p className="text-[#9a6a10]/65 text-xs tracking-[.35em] uppercase" style={{fontFamily:"Georgia,serif",textShadow:"0 0 10px #c9a84c33"}}>
          {isRtl ? "أرشيف الأماكن المنسية" : "Archive of Forgotten Places"}
        </p>
        <h1 className="text-[#d4b060] text-xl font-bold leading-snug text-center px-10"
          style={{ fontFamily:isRtl?"'Rakkas','Amiri',Georgia,serif":"'Caveat',cursive", textShadow:"0 0 20px #c9a84c44,0 2px 6px #00000099", animation:"flicker 9s infinite" }}>
          {isRtl ? "حكايات الأماكن المنسية" : "Tales of Forgotten Places"}
        </h1>
        <div className="flex items-center gap-3 px-14 w-full mt-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#5a3000]/55"/>
          <span className="text-[#5a3000] text-sm">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#5a3000]/55"/>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse at 35% 35%,rgba(160,100,15,.06) 0%,transparent 65%)"}}/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ورقة متهالكة
// ══════════════════════════════════════════════════════════════
function AgedPaper({ idx=0, pageNum, children }) {
  const bgs = [
    "radial-gradient(ellipse at 30% 20%, #d4a84a 0%, #c49038 40%, #b07c28 80%, #9a6a18 100%)",
    "radial-gradient(ellipse at 70% 80%, #cfa042 0%, #bb8c32 40%, #a87822 80%, #946618 100%)",
    "radial-gradient(ellipse at 50% 50%, #d8ac4e 0%, #c89a3c 35%, #b4862c 70%, #9e7220 100%)",
  ];
  const topClips = [
    "polygon(0 0,2% 100%,5% 15%,9% 100%,14% 5%,19% 90%,24% 20%,29% 100%,34% 8%,39% 95%,44% 12%,49% 100%,54% 18%,59% 95%,64% 5%,69% 100%,74% 15%,79% 90%,84% 8%,89% 100%,94% 12%,98% 80%,100% 0)",
    "polygon(0 0,3% 90%,6% 10%,10% 100%,15% 20%,20% 95%,25% 5%,30% 100%,35% 15%,40% 88%,45% 8%,50% 100%,55% 22%,60% 90%,65% 10%,70% 100%,75% 18%,80% 85%,85% 5%,90% 95%,95% 20%,100% 0)",
    "polygon(0 0,4% 100%,7% 8%,11% 95%,16% 12%,21% 100%,26% 18%,31% 88%,36% 6%,41% 100%,46% 14%,51% 90%,56% 20%,61% 95%,66% 8%,71% 100%,76% 16%,81% 88%,86% 10%,91% 98%,96% 15%,100% 0)",
  ];
  const botClips = [
    "polygon(0 100%,3% 5%,6% 85%,10% 0%,15% 90%,20% 5%,25% 80%,30% 0%,35% 88%,40% 10%,45% 80%,50% 0%,55% 85%,60% 5%,65% 92%,70% 0%,75% 88%,80% 5%,85% 90%,90% 0%,95% 85%,100% 100%)",
    "polygon(0 100%,4% 0%,7% 90%,12% 5%,17% 82%,22% 0%,27% 88%,32% 8%,37% 78%,42% 0%,47% 85%,52% 10%,57% 80%,62% 0%,67% 90%,72% 5%,77% 85%,82% 0%,87% 88%,92% 8%,97% 80%,100% 100%)",
    "polygon(0 100%,2% 8%,5% 80%,9% 0%,13% 88%,18% 12%,23% 75%,28% 0%,33% 90%,38% 5%,43% 82%,48% 0%,53% 88%,58% 8%,63% 78%,68% 0%,73% 85%,78% 10%,83% 80%,88% 0%,93% 88%,97% 12%,100% 100%)",
  ];
  const ci = idx % 3;
  return (
    <div className="relative h-full overflow-hidden" style={{ background: bgs[ci] }}>
      <div className="absolute inset-0 opacity-[.04]"
        style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundSize:"180px" }}/>
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow:"inset 0 0 40px rgba(20,6,0,.55), inset 0 0 12px rgba(40,10,0,.35), inset 0 0 3px rgba(80,20,0,.25)" }}/>
      <div className="absolute top-0 inset-x-0 pointer-events-none" style={{ height:"16px", background:"linear-gradient(to bottom,rgba(8,2,0,.85) 0%,rgba(20,5,0,.5) 40%,transparent 100%)", clipPath: topClips[ci] }}/>
      <div className="absolute bottom-0 inset-x-0 pointer-events-none" style={{ height:"16px", background:"linear-gradient(to top,rgba(8,2,0,.8) 0%,rgba(20,5,0,.45) 40%,transparent 100%)", clipPath: botClips[ci] }}/>
      <div className="absolute inset-y-0 left-0 w-4 pointer-events-none" style={{ background:"linear-gradient(to right,rgba(10,3,0,.6),transparent)" }}/>
      <div className="absolute inset-y-0 right-0 w-4 pointer-events-none" style={{ background:"linear-gradient(to left,rgba(10,3,0,.5),transparent)" }}/>
      <div className="relative z-10 h-full">{children}</div>
      {pageNum && (
        <div className="absolute bottom-2 inset-x-0 text-center z-10">
          <span className="text-[#4a2800]/55 text-xs" style={{fontFamily:"Georgia,serif"}}>— {pageNum} —</span>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// محتوى الصفحة
// ══════════════════════════════════════════════════════════════
function PageContent({ page, isRtl }) {
  if (!page) return <div className="flex items-center justify-center h-full"><span className="text-[#8B6000]/12 text-5xl">✦</span></div>;
  const hw = isRtl ? "hw-ar" : "hw-en";
  const dir = isRtl ? "rtl" : "ltr";
  const { type, content } = page;
  const C = { base:"text-[#241000]", muted:"text-[#6b4010]/75", gold:"text-[#7a4500]" };

  if (type==="intro") return (
    <div className={`flex flex-col items-center justify-center h-full gap-5 px-5 py-6 ${hw}`} dir={dir}>
      <div className="text-center">
        <p className="text-[#8B6000]/55 text-2xl mb-3">☽ ✦ ☾</p>
        <h1 className={`${C.base} text-lg font-bold leading-snug mb-2`}>{content.title}</h1>
        <p className={`${C.muted} text-xs tracking-wider italic`}>{content.subtitle}</p>
      </div>
      <div className="w-2/3 h-px bg-[#8B6000]/28"/>
      <p className={`${C.muted} text-xs leading-loose text-center italic whitespace-pre-line`}>{content.warning}</p>
      <div className="w-2/3 h-px bg-[#8B6000]/28"/>
      <p className={`${C.gold} text-xs tracking-wider text-center opacity-55`}>{content.seal}</p>
    </div>
  );
  if (type==="dedication") return (
    <div className={`flex flex-col items-center justify-center h-full px-8 ${hw}`} dir={dir}>
      <p className={`${C.base} text-base leading-loose text-center italic whitespace-pre-line`}>{content.text}</p>
      <p className={`${C.muted} text-xs tracking-widest mt-6`}>{content.signature}</p>
    </div>
  );
  if (type==="chapter_start") return (
    <div className={`flex flex-col h-full px-5 py-5 gap-4 ${hw}`} dir={dir}>
      <p className={`${C.gold} text-xs tracking-widest text-center uppercase opacity-58`}>{content.number}</p>
      <div className="flex justify-center">
        <svg width="120" height="82" viewBox="0 0 120 82" opacity="0.52">
          {[8,20,35,82,97,112].map((x,i)=>(<g key={i}><polygon points={`${x},${56-i%3*4} ${x-7},70 ${x+7},70`} fill="#2d1200" opacity=".5"/><polygon points={`${x},${46-i%3*4} ${x-5},61 ${x+5},61`} fill="#2d1200" opacity=".32"/></g>))}
          <rect x="40" y="48" width="38" height="28" fill="#3d1800" opacity=".62"/>
          <polygon points="40,48 59,32 78,48" fill="#2d1200" opacity=".72"/>
          <rect x="53" y="60" width="12" height="16" fill="#180800" opacity=".58"/>
          <rect x="44" y="53" width="8" height="7" fill="#c9a84c" opacity=".18"/>
          <rect x="68" y="53" width="8" height="7" fill="#c9a84c" opacity=".11"/>
        </svg>
      </div>
      <div className="text-center">
        <h2 className={`${C.base} text-base font-bold leading-snug`}>{content.title}</h2>
        <div className="w-1/2 mx-auto h-px bg-[#8B6000]/22 my-2"/>
        <p className={`${C.muted} text-xs italic`}>{content.location}</p>
        <p className={`${C.gold} text-xs tracking-wider mt-1 opacity-48`}>{content.year}</p>
      </div>
    </div>
  );
  if (type==="myth") return (
    <div className={`flex flex-col h-full px-5 py-4 gap-3 ${hw}`} dir={dir}>
      <p className={`${C.gold} text-xs tracking-widest text-center uppercase border-b border-[#8B6000]/18 pb-2 opacity-65`}>{content.eyebrow}</p>
      <div className="flex-1 flex items-center">
        <p className={`${C.base} leading-loose whitespace-pre-line`} style={{fontSize:isRtl?"15px":"14px"}}>{content.text}</p>
      </div>
      {content.note && <p className={`${C.muted} text-xs italic border-t border-[#8B6000]/14 pt-2 leading-relaxed`}>* {content.note}</p>}
    </div>
  );
  if (type==="truth") return (
    <div className={`flex flex-col h-full px-5 py-4 gap-3 ${hw}`} dir={dir}>
      <p className="text-[#5a0000]/65 text-xs tracking-widest text-center uppercase border-b border-[#8b1a1a]/18 pb-2">{content.eyebrow}</p>
      <div className="flex-1 flex items-center">
        <p className={`${C.base} leading-loose whitespace-pre-line`} style={{fontSize:isRtl?"14px":"13px"}}>{content.text}</p>
      </div>
      {content.stamp && (
        <div className="border border-[#8b1a1a]/32 text-center py-1 px-3 mx-auto rotate-[-2.5deg] opacity-52">
          <p className="text-[#8b1a1a] text-xs tracking-widest font-bold" style={{fontFamily:"Georgia,serif"}}>{content.stamp}</p>
        </div>
      )}
    </div>
  );
  if (type==="warning") return (
    <div className={`flex flex-col h-full px-5 py-4 gap-4 ${hw}`} dir={dir}>
      <p className={`${C.base} leading-loose whitespace-pre-line`} style={{fontSize:isRtl?"14px":"13px"}}>{content.text}</p>
      <div className="w-full h-px bg-[#8B6000]/28"/>
      <p className={`${C.base} leading-loose whitespace-pre-line italic text-center font-bold`} style={{fontSize:isRtl?"15px":"14px"}}>{content.question}</p>
      <div className={`text-center ${C.gold} opacity-38 text-lg`}>◈ ✦ ◈</div>
    </div>
  );
  return null;
}

// ══════════════════════════════════════════════════════════════
// الكتاب المفتوح
// ══════════════════════════════════════════════════════════════
function OpenBook({ pages, lang, isRtl }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flipping,    setFlipping]    = useState(false);
  const [flipDir,     setFlipDir]     = useState(null);
  const [flipKey,     setFlipKey]     = useState(0);

  const totalSpreads = Math.ceil(pages.length / 2);
  const rightIdx  = spreadIndex * 2;
  const leftIdx   = spreadIndex * 2 + 1;
  const rightPage = pages[rightIdx];
  const leftPage  = pages[leftIdx];

  const playSound = () => {
    try {
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const b=ctx.createBuffer(1,ctx.sampleRate*.22,ctx.sampleRate);
      const d=b.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.08))*.28;
      const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=650; f.Q.value=.55;
      const s=ctx.createBufferSource(); s.buffer=b; s.connect(f); f.connect(ctx.destination); s.start();
    } catch(_){}
  };

  const goNext = () => {
    if (flipping || spreadIndex >= totalSpreads - 1) return;
    playSound(); setFlipDir("next"); setFlipping(true); setFlipKey(k => k+1);
  };
  const goPrev = () => {
    if (flipping || spreadIndex <= 0) return;
    playSound(); setFlipDir("prev"); setFlipping(true); setFlipKey(k => k+1);
  };
  const onFlipComplete = () => {
    if (flipDir === "next") setSpreadIndex(i => i + 1);
    else                    setSpreadIndex(i => i - 1);
    setFlipping(false); setFlipDir(null);
  };

  useEffect(() => {
    const h = e => {
      if (e.key === "ArrowLeft")  isRtl ? goNext() : goPrev();
      if (e.key === "ArrowRight") isRtl ? goPrev() : goNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [flipping, spreadIndex, isRtl]);

  const W = "min(94vw,700px)";
  const H = "min(84vh,500px)";

  return (
    <motion.div
      initial={{ opacity:0, scale:0.88, y:30 }}
      animate={{ opacity:1, scale:1,    y:0  }}
      transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative" style={{ width:W, height:H, perspective:"1600px" }}>
        <div className="absolute inset-0 translate-y-5 -z-10 rounded-sm" style={{background:"#000",filter:"blur(16px)",opacity:.55}}/>
        <div className="absolute inset-0 flex" style={{boxShadow:"0 0 0 1px #2a1200,0 20px 60px #00000099"}}>

          {/* الجانب الأيسر — الصفحة الزوجية */}
          <div className="relative flex-1 overflow-hidden" style={{borderRadius:"4px 0 0 4px",boxShadow:"inset -4px 0 10px rgba(0,0,0,.15)"}}>
            <AgedPaper idx={leftIdx} pageNum={leftIdx+1}>
              <PageContent page={leftPage} isRtl={isRtl}/>
            </AgedPaper>
            <div className="absolute inset-y-0 right-0 w-6 pointer-events-none" style={{background:"linear-gradient(to left,rgba(0,0,0,.18),transparent)"}}/>
            <AnimatePresence>
              {flipping && flipDir === "next" && (
                <motion.div key={`next-${flipKey}`} className="absolute inset-0 z-20"
                  style={{ transformOrigin:"right center", transformStyle:"preserve-3d", backfaceVisibility:"hidden" }}
                  initial={{ rotateY:0 }} animate={{ rotateY:180 }}
                  transition={{ duration:.5, ease:[0.4,0,0.2,1] }} onAnimationComplete={onFlipComplete}>
                  <div className="absolute inset-0" style={{backfaceVisibility:"hidden"}}>
                    <AgedPaper idx={leftIdx} pageNum={leftIdx+1}>
                      <PageContent page={leftPage} isRtl={isRtl}/>
                    </AgedPaper>
                    <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to left,rgba(0,0,0,.45) 0%,transparent 55%)"}}/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* التجليد */}
          <div className="relative w-5 shrink-0 z-20" style={{background:"linear-gradient(to right,#0d0400,#2a1000,#0d0400)",boxShadow:"0 0 12px rgba(0,0,0,.7)"}}>
            {[20,40,60,80].map(y => (
              <div key={y} className="absolute w-full h-px opacity-22" style={{top:`${y}%`,background:"linear-gradient(to right,transparent,#c9a84c,transparent)"}}/>
            ))}
          </div>

          {/* الجانب الأيمن — الصفحة الفردية */}
          <div className="relative flex-1 overflow-hidden" style={{borderRadius:"0 4px 4px 0",boxShadow:"inset 4px 0 10px rgba(0,0,0,.2)"}}>
            <AgedPaper idx={rightIdx} pageNum={rightIdx+1}>
              <PageContent page={rightPage} isRtl={isRtl}/>
            </AgedPaper>
            <div className="absolute inset-y-0 left-0 w-6 pointer-events-none" style={{background:"linear-gradient(to right,rgba(0,0,0,.12),transparent)"}}/>
            <AnimatePresence>
              {flipping && flipDir === "prev" && (
                <motion.div key={`prev-${flipKey}`} className="absolute inset-0 z-20"
                  style={{ transformOrigin:"left center", transformStyle:"preserve-3d", backfaceVisibility:"hidden" }}
                  initial={{ rotateY:-180 }} animate={{ rotateY:0 }}
                  transition={{ duration:.5, ease:[0.4,0,0.2,1] }} onAnimationComplete={onFlipComplete}>
                  <div className="absolute inset-0" style={{backfaceVisibility:"hidden"}}>
                    <AgedPaper idx={Math.max(0,rightIdx-2)} pageNum={Math.max(1,rightIdx-1)}>
                      <PageContent page={pages[Math.max(0,rightIdx-2)]} isRtl={isRtl}/>
                    </AgedPaper>
                    <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(to right,rgba(0,0,0,.4) 0%,transparent 55%)"}}/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* أزرار التقليب */}
        {spreadIndex < totalSpreads - 1 && (
          <button onClick={goNext} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-30">
            <div className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#6a3500]/70 bg-[#1a0800]/95 text-[#c9a84c] text-xl font-bold hover:border-[#c9a84c] hover:bg-[#2a1200] hover:scale-110 transition-all duration-200 shadow-lg">
              {isRtl ? "‹" : "›"}
            </div>
          </button>
        )}
        {spreadIndex > 0 && (
          <button onClick={goPrev} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-30">
            <div className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#6a3500]/70 bg-[#1a0800]/95 text-[#c9a84c] text-xl font-bold hover:border-[#c9a84c] hover:bg-[#2a1200] hover:scale-110 transition-all duration-200 shadow-lg">
              {isRtl ? "›" : "‹"}
            </div>
          </button>
        )}
      </div>

      {/* مؤشر الصفحات */}
      <div className="flex items-center gap-2">
        {Array.from({length:totalSpreads}).map((_,i) => (
          <motion.div key={i}
            animate={{ width: i===spreadIndex ? 20 : 6, opacity: i===spreadIndex ? 1 : 0.35 }}
            transition={{ duration:.3 }}
            className="h-1.5 rounded-full bg-[#c9a84c] cursor-pointer"
            onClick={() => !flipping && setSpreadIndex(i)}
          />
        ))}
      </div>

      <p className="text-[#3a1200]/50 text-xs tracking-wider" dir={isRtl?"rtl":"ltr"}>
        {isRtl ? `صفحة ${rightIdx+1} — ${leftIdx+1} من ${pages.length}` : `Pages ${rightIdx+1} — ${leftIdx+1} of ${pages.length}`}
      </p>
      <p className="text-[#2a0e00]/40 text-xs tracking-widest">
        {isRtl ? "← → للتنقل" : "← → to turn pages"}
      </p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// الكتاب المغلق
// ══════════════════════════════════════════════════════════════
function ClosedBook({ lang, isRtl, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div className="flex flex-col items-center gap-6"
      initial={{ opacity:0, y:40, scale:.9 }} animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:.8, ease:[0.22,1,0.36,1] }}>
      <motion.div className="relative cursor-pointer select-none"
        style={{ width:"min(88vw,340px)", height:"min(78vh,500px)", perspective:"1200px" }}
        animate={{ filter: hovered ? "drop-shadow(0 0 30px #8b000055)" : "drop-shadow(0 0 8px #8b000033)" }}
        transition={{ duration:.4 }}
        onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} onClick={onOpen}>
        <div className="absolute inset-0 translate-x-4 translate-y-5 -z-10 rounded-sm" style={{background:"#000",filter:"blur(12px)",opacity:.55}}/>
        <motion.div className="absolute inset-0 rounded-sm overflow-hidden"
          animate={{ rotateY: hovered ? -8 : 0, scale: hovered ? 1.02 : 1 }}
          transition={{ duration:.4, ease:"easeOut" }} style={{ transformStyle:"preserve-3d" }}>
          <BookCover lang={lang} isRtl={isRtl}/>
        </motion.div>
        <div className="absolute top-2 bottom-2 right-0 w-3 rounded-r-sm overflow-hidden"
          style={{ background:"linear-gradient(to right,#e8d090,#d4bc78,#c8a860)", boxShadow:"2px 0 8px rgba(0,0,0,.4)" }}>
          {Array.from({length:12}).map((_,i) => (
            <div key={i} className="w-full border-b border-[#b89040]/30" style={{height:"8.33%"}}/>
          ))}
        </div>
      </motion.div>
      <motion.p animate={{ opacity:[0.5,0.9,0.5] }} transition={{ duration:2, repeat:Infinity, ease:"easeInOut" }}
        className="text-[#6a3500]/80 text-xs tracking-[.35em]" style={{fontFamily:"Georgia,serif"}}>
        {isRtl ? "انقر لفتح الكتاب" : "CLICK TO OPEN"}
      </motion.p>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Export
// ══════════════════════════════════════════════════════════════
export default function UrbexMythBook({ lang="ar", onClose, chapterId="chapter_forest_01" }) {
  const isRtl = lang === "ar";

  // ── جلب الصفحات حسب الفصل واللغة ─────────────────────────
  const pages = BOOK_PAGES[chapterId]?.[lang]
    || BOOK_PAGES[chapterId]?.ar
    || BOOK_PAGES["chapter_forest_01"][lang]
    || BOOK_PAGES["chapter_forest_01"].ar;

  const [phase, setPhase] = useState("closed");

  const handleOpen = () => {
    setPhase("opening");
    try {
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const b=ctx.createBuffer(1,ctx.sampleRate*.45,ctx.sampleRate);
      const d=b.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.14))*.18;
      const s=ctx.createBufferSource(); s.buffer=b; s.connect(ctx.destination); s.start();
    } catch(_){}
    setTimeout(() => setPhase("open"), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{background:"radial-gradient(ellipse at 50% 40%,#1a0700 0%,#0a0400 60%,#050200 100%)"}}>
      <style>{FONT_IMPORT}</style>

      {/* غبار */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({length:18}).map((_,i) => (
          <div key={i} className="absolute rounded-full bg-[#c9a84c]/10"
            style={{width:Math.random()*3+1,height:Math.random()*3+1,left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,animation:`dust ${Math.random()*5+4}s ${Math.random()*4}s infinite ease-out`}}/>
        ))}
      </div>

      {onClose && (
        <button onClick={onClose}
          className="absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full border border-[#3a1200]/60 bg-[#0d0400]/80 text-[#6a3500] hover:text-[#c9a84c] hover:border-[#c9a84c]/50 transition-all text-lg">
          ✕
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === "closed" && (
          <motion.div key="closed" exit={{ opacity:0, scale:.95, y:-20 }} transition={{duration:.4}}>
            <ClosedBook lang={lang} isRtl={isRtl} onOpen={handleOpen}/>
          </motion.div>
        )}
        {phase === "opening" && (
          <motion.div key="opening" className="flex items-center justify-center"
            initial={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ width:"min(88vw,340px)", height:"min(78vh,500px)" }}>
            <motion.div className="relative w-full h-full"
              style={{ transformStyle:"preserve-3d", perspective:"1200px" }}
              initial={{ rotateY:0, x:0 }} animate={{ rotateY:-180, x:20 }}
              transition={{ duration:.8, ease:[0.4,0,0.2,1] }}>
              <div className="absolute inset-0 rounded-sm overflow-hidden" style={{backfaceVisibility:"hidden"}}>
                <BookCover lang={lang} isRtl={isRtl}/>
              </div>
              <div className="absolute inset-0 rounded-sm overflow-hidden" style={{backfaceVisibility:"hidden", transform:"rotateY(180deg)"}}>
                <AgedPaper idx={0} pageNum={1}>
                  <PageContent page={pages[0]} isRtl={isRtl}/>
                </AgedPaper>
              </div>
            </motion.div>
          </motion.div>
        )}
        {phase === "open" && (
          <motion.div key="open" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{duration:.3}}>
            <OpenBook pages={pages} lang={lang} isRtl={isRtl}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}