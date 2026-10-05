// ================================================================
// ReportsPanel — الحقيبة
// فيها: محضر البوليس + تقارير الطب الشرعي
// ================================================================
// إزاي تضيفه:
// 1. أضف ReportsPanel كـ component
// 2. في GameScreen أضف: const [showReports, setShowReports] = useState(false)
// 3. أضف زرار الحقيبة في القائمة
// 4. أضف في JSX: {showReports && <ReportsPanel ... />}
// 5. في socket.on("horror_evidence_analyzed") أضف التقرير للـ reports state
// ================================================================

// ── بيانات محضر البوليس — القضية case_hotel_01 ──────────────
// الأقوال منقوصة عن قصد — الشاهد صادق بس بيحذف تفاصيل

import { useState } from "react";


const POLICE_REPORT_hotel_01 = {
  caseNumber: "2026/JC-0891",
  date: "22 أغسطس 2026",
  time: "04:30 فجراً",
  officer: "النقيب وليد سامي — قسم شرطة النيل",
  location: "فندق الأمير الكبير — الطابق الرابع عشر",

  incident: `في الساعة الثالثة وأربع عشرة دقيقة من فجر يوم السبت الموافق 22/8/2026، تلقى القسم بلاغاً من إدارة فندق الأمير الكبير بسقوط جثة من الطابق الرابع عشر.

عند وصول قوة الشرطة بصحبة سيارة الإسعاف، عُثر على جثة رجل في منطقة المدخل الجانبي الشمالي للفندق. تبيّن لاحقاً أن المتوفى هو السيد رمزي حسين عوض، مواليد 1972، رئيس مجلس إدارة مجموعة عوض القابضة.

مُعاينة جناح البنتهاوس (الطابق 14) أظهرت أن باب الجناح كان مفتوحاً. لا آثار لكسر أو اقتحام. لا آثار نزاع واضحة. زجاجة نبيذ شبه فارغة على الطاولة الجانبية.

أفادت الطبيبة د. لمياء الشريف — طبيبة الشركة الخاصة — التي وصلت قبل فريق الإسعاف بأن الوفاة تبدو طبيعية نتيجة نوبة قلبية مفاجئة. صدر تقرير أولي بهذا الشأن.

غير أن الفحص الأولي لاحقاً من قِبل الطب الشرعي أشار إلى وجود تناقضات تستدعي التحقيق.`,

  witnesses: [
    {
      id: "w01",
      name: "أنطوان خوري",
      role: "مدير الفندق",
      age: 52,
      nationality: "لبناني",
      statement: `أدلى مدير الفندق بالأقوال الآتية:

"السيد رمزي نزيل دائم عندنا منذ سنوات. وصل مساء أمس الساعة السابعة تقريباً وطلب جناح البنتهاوس كالعادة. بدا عليه التعب لكنه كان بمزاج جيد.

طلب في وقت لاحق زجاجة نبيذ من نوع محدد عبر الروم سيرفس. هذا طلب معتاد منه.

لم أره بعد ذلك شخصياً. حين وصلني الخبر من موظف الاستقبال اتصلت فوراً بالطوارئ وبطبيبة الشركة كما هو البروتوكول."

ملاحظة المحقق: لم يذكر خوري أي تفاصيل عن الإيميل المجهول الذي طلب الزجاجة، ولم يُشر إلى أي شيء غير اعتيادي في النبيذ.`,
      credibility: "يبدو متعاوناً — إجاباته مقتضبة بشكل لافت",
    },
    {
      id: "w02",
      name: "يوسف منصور",
      role: "كونسيرج الفندق",
      age: 44,
      nationality: "مصري",
      statement: `أدلى الكونسيرج بالأقوال الآتية:

"أنا رأيت السيد رمزي آخر مرة الساعة العاشرة مساءً تقريباً في اللوبي. بدا مشغول الذهن. قال لي إنه لا يريد أن يُزعج ويريد الراحة. هذا كلامه العادي لما يكون عنده شغل كتير.

لم أرَ أي شخص غريب في الفندق طوال الليل. كان الليل هادئاً بشكل عام."

ملاحظة المحقق: لم يذكر يوسف ما همسه له رمزي عند الانصراف. لم يذكر الرجل الغريب الذي رآه لاحقاً عند السلم الخلفي.`,
      credibility: "أقواله صحيحة لكنها تفتقر لتفاصيل جوهرية",
    },
    {
      id: "w03",
      name: "نادر فتحي",
      role: "موظف أمن — الوردية الليلية",
      age: 35,
      nationality: "مصري",
      statement: `أدلى موظف الأمن بالأقوال الآتية:

"كنت في غرفة المراقبة طوال الليل. لاحظت في حدود الساعة الحادية عشرة أن كاميرات بعض الطوابق توقفت فجأة. حاولت إعادة تشغيلها لكن لم أنجح. اعتقدت أنه عطل تقني.

سمعت صوتاً غير اعتيادي من الأعلى في حدود منتصف الليل. لم أستطع تحديد مصدره بدقة. لم أتحرك للتحقق لأنني لم أكن متأكداً.

لم أشاهد أي شخص غريب يدخل الفندق."

ملاحظة المحقق: نادر لم يذكر الشخص الذي رآه يدخل من السلم الخلفي. لم يذكر أنه أبلغ المديرة التنفيذية. تضاربت أقواله مع ما صرّح به لاحقاً في التحقيق.`,
      credibility: "أقواله تحتوي على إغفال متعمد لمعلومات جوهرية",
    },
    {
      id: "w04",
      name: "نادين سرحان",
      role: "المديرة التنفيذية — مجموعة عوض القابضة",
      age: 44,
      nationality: "مصرية",
      statement: `أدلت المديرة التنفيذية بالأقوال الآتية:

"أنا نزيلة في الفندق هذه الليلة بسبب اجتماع عمل. كنت في اجتماع فيديو مع شركاء من دبي من الساعة التاسعة مساءً حتى بعد منتصف الليل بقليل. ثم نمت.

علاقتي بالسيد رمزي مهنية بالكامل. كنا نتعاون منذ سنوات طويلة. خبر وفاته صدمني.

لا أعلم بأي سبب يجعل أحداً يريد إيذاءه."

ملاحظة المحقق: نادين لم تذكر خلافها مع رمزي بشأن صفقة الأسهم. لم تذكر أنها تلقت اتصالاً من نادر موظف الأمن. الـ alibi قيد التحقق.`,
      credibility: "متماسكة جداً — تركز على ما يُثبت وجودها وتتجنب ما يُشكّك",
    },
    {
      id: "w05",
      name: "ريم حسن",
      role: "موظفة سابقة — خدمة الغرف",
      age: 31,
      nationality: "مصرية",
      statement: `أدلت بالأقوال الآتية:

"أنا جئت اليوم فقط لاسترداد بعض أغراضي الشخصية من غرفة الموظفين. لم يكن لي أي علاقة بالسيد رمزي منذ أن أنهى عقدي منذ ثلاثة أشهر.

لم أكن في منطقة الجناح على الإطلاق.

أفهم أن وضعي يجعلني مشتبهاً بها لكن ليس لديّ أي صلة بما حدث."

ملاحظة المحقق: لم تذكر ريم ما تعرفه من معلومات عن الحسابات البنكية. لم تذكر الـ USB. أقوالها صحيحة في جوهرها لكنها حذفت كل شيء يتعلق بدوافعها.`,
      credibility: "صادقة في النفي — لكن ما لم تقله أهم مما قالته",
    },
    {
      id: "w06",
      name: "د. لمياء الشريف",
      role: "طبيبة الشركة الخاصة",
      age: 47,
      nationality: "مصرية",
      statement: `أدلت الطبيبة بالأقوال الآتية:

"اتصلت بي السيدة نوال بهجت — زوجة المتوفى — في الساعة الثانية وأربعين دقيقة فجراً. أخبرتني أن زوجها لا يستجيب. توجهت فوراً.

عند وصولي فحصت الجثة. كل المؤشرات أمامي أشارت إلى توقف مفاجئ في القلب. السيد رمزي كان يعاني من ضغط دم مرتفع. كتبت التقرير الأولي بناءً على ما رأيت.

أنا أقف خلف تقييمي الطبي الأولي."

ملاحظة المحقق: الطبيبة لم تذكر أنها وصلت قبل سيارة الإسعاف. لم تذكر أن فحصها استغرق أقل من عشرين دقيقة. تمسّكها بتقريرها رغم نتائج الطب الشرعي يستدعي تدقيقاً.`,
      credibility: "دفاعية — تحمي تقريرها الأولي أكثر من اللازم",
    },
  ],

  conclusion: `بناءً على المعطيات الأولية وأقوال الشهود، وفي انتظار نتائج الطب الشرعي الكاملة، تُصنَّف القضية حالياً كـ"وفاة مشتبه بها تستدعي تحقيقاً موسعاً".

يُلاحَظ تضارب في بعض الأقوال وإغفال لتفاصيل جوهرية من قِبل عدد من الشهود.

القضية محالة إلى وحدة التحقيق الجنائي.

النقيب وليد سامي
قسم شرطة النيل — 22/8/2026`,
};

// ── تقرير الطب الشرعي الأولي ─────────────────────────────────
const FORENSIC_INITIAL_hotel_01 = {
  reportNumber: "FSR-2026-0441",
  date: "22 أغسطس 2026",
  time: "09:15 صباحاً",
  examiner: "د. طارق عبد الحميد — قسم الطب الشرعي",
  deceasedName: "رمزي حسين عوض",
  deceasedAge: 54,
  examinationLocation: "مشرحة مستشفى القاهرة الكبرى",

  externalExamination: `الجثة لرجل في الخمسينات من عمره، بنية جسدية متوسطة، لا آثار إصابات خارجية واضحة تشير إلى اعتداء بالقوة.

يُلاحَظ:
— احمرار خفيف في منطقة الرقبة يستدعي فحصاً دقيقاً
— لا كسور ظاهرة رغم الادعاء بالسقوط من ارتفاع شاهق
— حالة الملابس منتظمة بشكل لافت لمن سقط من الطابق الرابع عشر`,

  internalExamination: `نتائج التشريح:

القلب: لا آثار نوبة قلبية حادة. عضلة القلب في حالة جيدة نسبياً لعمر الضحية.

الرئتان: وجود سوائل serosanguineous غير متسق مع نوبة قلبية طبيعية. هذا المؤشر يستدعي تحليلاً مخبرياً دقيقاً.

منطقة الرقبة: عند الفحص الدقيق تحت الأنسجة — أثر ضغط رفيع على محيط الرقبة لا يتجاوز 2 ملم عرضاً. هذا الأثر غير مرئي بالعين المجردة ولا يُترك إلا بأداة متخصصة.`,

  toxicology: `نتائج التحليل الكيميائي — أولية:

الدم: رُصد وجود مادة Midazolam بتركيز يُشير إلى تعرّض الضحية لجرعة خارجية — لا يُنتج الجسم هذه المادة طبيعياً.

ملاحظة: Midazolam مهدئ سريع الأثر. الجرعة المرصودة كافية لإحداث تخدير جزئي خلال 15-20 دقيقة دون إيقاف القلب مباشرة.

تحليلات إضافية جارية للكشف عن مواد أخرى.`,

  cause_of_death: `السبب المبدئي للوفاة:
خنق ميكانيكي بأداة رفيعة بعد تخدير مسبق بمادة Midazolam.
الوفاة ليست طبيعية — وليست نتيجة سقوط.
المشهد رُتِّب لإيهام المحقق الأول بالسقوط.

درجة اليقين: 87% — في انتظار نتائج التحليل الكاملة.`,

  time_of_death: "يُقدَّر وقت الوفاة بين الساعة 11:15 م و12:00 ص",

  notes: `ملاحظات إضافية:
— الجثة نُقلت من موقع الوفاة الفعلي إلى موقع الاكتشاف
— الدليل على ذلك: انعدام الإصابات المتوقعة من السقوط
— الجاني على دراية بالطب أو استعان بشخص ذي خلفية طبية
— أثر الخيط يشير لتنفيذ من الخلف والضحية كانت شبه فاقدة الوعي`,
};

// ── ReportsPanel Component ────────────────────────────────────
function ReportsPanel({ onClose, forensicReports, caseId }) {
  const [activeTab, setActiveTab] = useState("police");
  const [activeWitness, setActiveWitness] = useState(null);

  const policeReport = caseId === "case_hotel_01" ? POLICE_REPORT_hotel_01 : null;
  const initialForensic = caseId === "case_hotel_01" ? FORENSIC_INITIAL_hotel_01 : null;

  const credibilityColor = (text) => {
    if (text.includes("إغفال متعمد") || text.includes("دفاعية")) return "#dc2626";
    if (text.includes("تفاصيل جوهرية") || text.includes("ما لم تقله")) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .rp-container {
          font-family: 'Cairo', sans-serif;
          background: linear-gradient(180deg,#0a0804 0%,#070503 100%);
        }
        .rp-tab {
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px 6px 0 0;
          border: 1px solid transparent;
          border-bottom: none;
          cursor: pointer;
          transition: all 0.15s;
          color: rgba(201,169,110,0.4);
          background: transparent;
        }
        .rp-tab.active {
          background: rgba(15,10,4,0.95);
          border-color: rgba(201,169,110,0.15);
          color: #c9a96e;
        }
        .rp-tab:not(.active):hover {
          color: rgba(201,169,110,0.65);
        }
        .rp-paper {
          background: #f5f0e4;
          background-image: repeating-linear-gradient(
            transparent, transparent 24px,
            rgba(0,0,50,0.04) 24px, rgba(0,0,50,0.04) 25px
          );
          border-radius: 2px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4), inset 0 0 30px rgba(180,140,80,0.05);
          color: #1a1208;
          font-family: serif;
        }
        .rp-stamp {
          font-family: 'Courier New', monospace;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .rp-section-title {
          font-size: 10px;
          font-weight: 700;
          color: #8B1A1A;
          border-bottom: 1px solid rgba(139,26,26,0.3);
          padding-bottom: 4px;
          margin-bottom: 8px;
          font-family: serif;
          letter-spacing: 0.05em;
        }
        .rp-text {
          font-size: 9.5px;
          line-height: 1.75;
          color: #2c1a0a;
          font-family: serif;
          white-space: pre-line;
        }
        .rp-witness-btn {
          background: rgba(139,26,26,0.06);
          border: 1px solid rgba(139,26,26,0.15);
          border-radius: 6px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: right;
          width: 100%;
        }
        .rp-witness-btn:hover {
          background: rgba(139,26,26,0.12);
          border-color: rgba(139,26,26,0.3);
        }
        .rp-forensic-card {
          background: rgba(139,26,26,0.05);
          border: 1px solid rgba(139,26,26,0.2);
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .rp-finding {
          border-right: 2px solid rgba(139,26,26,0.4);
          padding-right: 10px;
          margin-bottom: 8px;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .rp-slide { animation: slideUp 0.25s ease; }
        .rp-badge {
          display: inline-block;
          font-size: 8px;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="rp-container fixed inset-0 z-[200] flex flex-col" dir="rtl">

        {/* رأس */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{borderBottom:"1px solid rgba(201,169,110,0.1)", background:"rgba(0,0,0,0.5)"}}>
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <div>
              <p className="text-[9px] font-mono tracking-widest text-red-900/50">CASE FILES</p>
              <h2 className="text-sm font-black" style={{color:"#c9a96e"}}>حقيبة التحقيق</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:text-white transition-colors"
            style={{background:"rgba(255,255,255,0.05)", color:"rgba(201,169,110,0.4)"}}>
            ✕
          </button>
        </div>

        {/* تبويبات */}
        <div className="flex gap-1 px-3 pt-3 flex-shrink-0">
          <button
            onClick={() => { setActiveTab("police"); setActiveWitness(null); }}
            className={`rp-tab ${activeTab==="police"?"active":""}`}>
            محضر البوليس
          </button>
          <button
            onClick={() => { setActiveTab("forensic"); setActiveWitness(null); }}
            className={`rp-tab ${activeTab==="forensic"?"active":""}`}>
            الطب الشرعي
            {forensicReports?.length > 0 && (
              <span className="mr-1.5 inline-block w-4 h-4 rounded-full text-[8px] font-black text-center leading-4"
                style={{background:"#dc2626", color:"white"}}>
                {forensicReports.length}
              </span>
            )}
          </button>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto px-3 pb-6"
          style={{borderTop:"1px solid rgba(201,169,110,0.1)"}}>

          {/* ── محضر البوليس ── */}
          {activeTab === "police" && policeReport && (
            <div className="rp-slide">
              {/* لو في شاهد محدد */}
              {activeWitness ? (
                <div className="rp-paper mt-3 p-4">
                  {/* رأس الشاهد */}
                  <button onClick={() => setActiveWitness(null)}
                    className="flex items-center gap-1.5 mb-4 text-[9px] font-bold"
                    style={{color:"rgba(139,26,26,0.6)"}}>
                    → رجوع للمحضر
                  </button>

                  <div className="flex items-start justify-between mb-3 pb-2"
                    style={{borderBottom:"1px solid rgba(139,26,26,0.2)"}}>
                    <div>
                      <p className="rp-stamp text-[9px]" style={{color:"#8B1A1A"}}>
                        أقوال الشاهد — {activeWitness.id}
                      </p>
                      <p className="text-sm font-black mt-0.5" style={{color:"#1a0a0a"}}>{activeWitness.name}</p>
                      <p className="text-[9px]" style={{color:"rgba(139,26,26,0.6)", fontFamily:"serif"}}>
                        {activeWitness.role} — {activeWitness.age} سنة — {activeWitness.nationality}
                      </p>
                    </div>
                    <div className="rp-badge"
                      style={{
                        background:`${credibilityColor(activeWitness.credibility)}18`,
                        color: credibilityColor(activeWitness.credibility),
                        border:`1px solid ${credibilityColor(activeWitness.credibility)}40`,
                      }}>
                      {credibilityColor(activeWitness.credibility) === "#22c55e" ? "موثوق" :
                       credibilityColor(activeWitness.credibility) === "#f59e0b" ? "منقوص" : "مشكوك فيه"}
                    </div>
                  </div>

                  <p className="rp-text mb-4">{activeWitness.statement}</p>

                  {/* تقييم المحقق */}
                  <div className="mt-3 p-2.5 rounded"
                    style={{background:"rgba(139,26,26,0.08)", border:"1px solid rgba(139,26,26,0.2)"}}>
                    <p className="text-[8.5px] font-bold mb-1" style={{color:"#8B1A1A", fontFamily:"serif"}}>
                      تقييم المحقق:
                    </p>
                    <p className="text-[9px] italic leading-relaxed" style={{color:"rgba(139,26,26,0.7)", fontFamily:"serif"}}>
                      {activeWitness.credibility}
                    </p>
                  </div>
                </div>
              ) : (
                /* المحضر الرئيسي */
                <div>
                  {/* رأس رسمي */}
                  <div className="rp-paper mt-3 p-4 mb-3">
                    <div className="flex items-center justify-between mb-3 pb-2"
                      style={{borderBottom:"2px solid rgba(139,26,26,0.3)"}}>
                      <div>
                        <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>
                          وزارة الداخلية — قسم شرطة النيل
                        </p>
                        <p className="text-base font-black mt-0.5" style={{color:"#1a0a0a"}}>محضر رقم {policeReport.caseNumber}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-mono" style={{color:"rgba(139,26,26,0.5)"}}>{policeReport.date}</p>
                        <p className="text-[8px] font-mono" style={{color:"rgba(139,26,26,0.5)"}}>{policeReport.time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-[9px]" style={{fontFamily:"serif"}}>
                      {[
                        ["المحقق المسؤول", policeReport.officer],
                        ["موقع الحادثة", policeReport.location],
                      ].map(([l,v]) => (
                        <div key={l} className="col-span-2 border-b pb-0.5" style={{borderColor:"rgba(139,26,26,0.1)"}}>
                          <span style={{color:"rgba(139,26,26,0.5)"}}>{l}: </span>
                          <span className="font-bold">{v}</span>
                        </div>
                      ))}
                    </div>

                    <p className="rp-section-title">وصف الواقعة</p>
                    <p className="rp-text">{policeReport.incident}</p>
                  </div>

                  {/* أقوال الشهود */}
                  <div className="rp-paper p-4 mb-3">
                    <p className="rp-section-title">أقوال الشهود ({policeReport.witnesses.length} شهود)</p>
                    <p className="text-[8.5px] mb-3 italic" style={{color:"rgba(139,26,26,0.5)", fontFamily:"serif"}}>
                      اضغط على الشاهد لقراءة أقواله كاملة
                    </p>
                    <div className="space-y-2">
                      {policeReport.witnesses.map(w => (
                        <button key={w.id} onClick={() => setActiveWitness(w)}
                          className="rp-witness-btn">
                          <div className="flex items-center justify-between">
                            <div className="text-right">
                              <p className="text-[10px] font-black" style={{color:"#1a0a0a"}}>{w.name}</p>
                              <p className="text-[8.5px]" style={{color:"rgba(139,26,26,0.5)", fontFamily:"serif"}}>
                                {w.role}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rp-badge"
                                style={{
                                  background:`${credibilityColor(w.credibility)}15`,
                                  color: credibilityColor(w.credibility),
                                  border:`1px solid ${credibilityColor(w.credibility)}35`,
                                }}>
                                {credibilityColor(w.credibility)==="#22c55e"?"موثوق":
                                 credibilityColor(w.credibility)==="#f59e0b"?"منقوص":"مشكوك"}
                              </span>
                              <span style={{color:"rgba(139,26,26,0.3)", fontSize:"10px"}}>←</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* خلاصة */}
                  <div className="rp-paper p-4">
                    <p className="rp-section-title">خلاصة المحقق</p>
                    <p className="rp-text">{policeReport.conclusion}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── تقارير الطب الشرعي ── */}
          {activeTab === "forensic" && (
            <div className="rp-slide">

              {/* التقرير الأولي — موجود دايماً */}
              {initialForensic && (
                <div className="rp-paper mt-3 p-4 mb-3">
                  <div className="flex items-start justify-between mb-3 pb-2"
                    style={{borderBottom:"2px solid rgba(139,26,26,0.3)"}}>
                    <div>
                      <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>
                        تقرير طب شرعي — أولي
                      </p>
                      <p className="text-sm font-black mt-0.5" style={{color:"#1a0a0a"}}>
                        رقم {initialForensic.reportNumber}
                      </p>
                    </div>
                    <div className="rp-badge"
                      style={{background:"rgba(245,158,11,0.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.3)"}}>
                      أولي
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-[9px]" style={{fontFamily:"serif"}}>
                    {[
                      ["الطبيب الشرعي", initialForensic.examiner],
                      ["الضحية", initialForensic.deceasedName + " — " + initialForensic.deceasedAge + " سنة"],
                      ["تاريخ الفحص", initialForensic.date + " — " + initialForensic.time],
                      ["وقت الوفاة", initialForensic.time_of_death],
                    ].map(([l,v]) => (
                      <div key={l} className="col-span-2 border-b pb-0.5" style={{borderColor:"rgba(139,26,26,0.1)"}}>
                        <span style={{color:"rgba(139,26,26,0.5)"}}>{l}: </span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>

                  {[
                    {title:"الفحص الخارجي", content: initialForensic.externalExamination},
                    {title:"الفحص الداخلي — التشريح", content: initialForensic.internalExamination},
                    {title:"التحليل الكيميائي والسمي", content: initialForensic.toxicology},
                    {title:"ملاحظات إضافية", content: initialForensic.notes},
                  ].map(section => (
                    <div key={section.title} className="rp-finding mb-3">
                      <p className="rp-section-title">{section.title}</p>
                      <p className="rp-text">{section.content}</p>
                    </div>
                  ))}

                  {/* سبب الوفاة */}
                  <div className="p-3 rounded mt-2"
                    style={{background:"rgba(139,26,26,0.1)",border:"1px solid rgba(139,26,26,0.3)"}}>
                    <p className="rp-section-title" style={{color:"#8B1A1A"}}>سبب الوفاة المبدئي</p>
                    <p className="rp-text font-bold">{initialForensic.cause_of_death}</p>
                  </div>
                </div>
              )}

              {/* تقارير المختبر — بتتضاف لما الأدلة تتحلل */}
              {forensicReports && forensicReports.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[9px] font-mono px-1 pt-1" style={{color:"rgba(201,169,110,0.35)"}}>
                    تقارير تحليل الأدلة ({forensicReports.length})
                  </p>
                  {forensicReports.map((report, i) => (
                    <div key={i} className="rp-paper p-4">
                      <div className="flex items-start justify-between mb-2 pb-2"
                        style={{borderBottom:"1px solid rgba(139,26,26,0.2)"}}>
                        <div>
                          <p className="rp-stamp text-[8px]" style={{color:"#8B1A1A"}}>تقرير مختبر جنائي</p>
                          <p className="text-[11px] font-black mt-0.5" style={{color:"#1a0a0a"}}>{report.title}</p>
                        </div>
                        <div className="rp-badge"
                          style={{background:"rgba(34,197,94,0.12)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)"}}>
                          مكتمل
                        </div>
                      </div>
                      <p className="rp-text mb-3">{report.content}</p>
                      {report.conclusion && (
                        <div className="p-2.5 rounded"
                          style={{background:"rgba(139,26,26,0.08)",border:"1px solid rgba(139,26,26,0.2)"}}>
                          <p className="text-[8.5px] font-bold mb-1" style={{color:"#8B1A1A",fontFamily:"serif"}}>
                            الاستنتاج:
                          </p>
                          <p className="rp-text text-[9px]">{report.conclusion}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[10px]" style={{color:"rgba(201,169,110,0.25)",fontFamily:"serif"}}>
                    لم يُرسل أي دليل للمختبر بعد
                  </p>
                  <p className="text-[9px] mt-1" style={{color:"rgba(201,169,110,0.15)",fontFamily:"serif"}}>
                    أرسل الأدلة من ملف الأدلة للحصول على تقارير تفصيلية
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}