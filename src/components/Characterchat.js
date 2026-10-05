import { useState, useRef, useEffect } from "react";

const CHARACTER_META = {
  accused:     { icon: "🔗", color: "#6b7280", bgColor: "#1f2937" },
  defense:     { icon: "🛡️", color: "#3b82f6", bgColor: "#1e3a5f" },
  prosecution: { icon: "📋", color: "#ef4444", bgColor: "#4c1d1d" },
  judge:       { icon: "⚖️", color: "#f59e0b", bgColor: "#451a03" },
  jury:        { icon: "👥", color: "#10b981", bgColor: "#064e3b" },
};

function getInterrogateLabel(myRole, characterId) {
  if (myRole === "judge") {
    if (characterId === "accused")     return "🔎 بدء الاستجواب";
    if (characterId === "prosecution") return "📋 استماع لوكيل النيابة";
    if (characterId === "defense")     return "🛡️ استماع للمحامي";
    if (characterId === "jury")        return "👥 استفسار من المحلفين";
  }
  if (myRole === "prosecution" && characterId === "accused") return "📋 بدء الاستجواب الاتهامي";
  if (myRole === "defense"     && characterId === "accused") return "🛡️ التنسيق مع موكّلك";
  return "💬 بدء الحوار";
}

export default function CharacterChat({ characterId, caseData, myRole, onClose }) {
  const [phase, setPhase]           = useState("opening");
  const [messages, setMessages]     = useState([]);
  const [hasOpened, setHasOpened]   = useState(false);
  const [visible, setVisible]       = useState(false);
  const [typing, setTyping]         = useState(false);
  // شجرة الأسئلة — الأسئلة المتاحة دلوقتي
  const [availableIds, setAvailableIds] = useState([]);
  const [askedIds, setAskedIds]         = useState(new Set());
  const chatEndRef = useRef(null);

  const meta     = CHARACTER_META[characterId] || CHARACTER_META.accused;
  const charData = getCharacterData(characterId, caseData, myRole);
  // هل في شجرة ديناميكية؟
  const tree     = characterId === "accused" && myRole === "judge"
    ? caseData?.interrogationDialogues?.accused?.questionTree
    : null;

  // ── Entrance animation ──
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // ── رسالة الافتتاح ──
  useEffect(() => {
    if (!hasOpened && charData && visible) {
      setHasOpened(true);
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMessages([{
          id: Date.now(), from: "character",
          text: charData.openingStatement, isOpening: true,
        }]);
        // تهيئة الأسئلة الأولى
        if (tree) {
          setAvailableIds(tree.root || []);
        }
      }, 900);
    }
  }, [hasOpened, charData, visible, tree]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };

  // ── اختيار سؤال من الشجرة ──
  const handleTreeQuestion = (nodeId) => {
    if (!tree) return;
    const node = tree.nodes[nodeId];
    if (!node) return;

    // أضيف السؤال
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: node.text }]);
    setAskedIds(prev => new Set([...prev, nodeId]));
    setAvailableIds([]);
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: "character",
        text: node.response,
      }]);
      // الأسئلة الجديدة — من next[] فلترة اللي اتسألت
      if (node.next && node.next.length > 0) {
        const nextIds = node.next.filter(id => !askedIds.has(id) && id !== nodeId);
        setAvailableIds(nextIds);
      }
    }, 700 + Math.random() * 400);
  };

  // ── اختيار سؤال عادي (غير شجرة) ──
  const handleQuestion = (question) => {
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: question.text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: "character",
        text: question.response,
      }]);
    }, 700 + Math.random() * 400);
  };

  if (!charData) return null;

  // الأسئلة العادية (غير الشجرة)
  const usedTexts   = messages.filter(m => m.from === "me").map(m => m.text);
  const availableQs = tree ? [] : (charData.questions || []).filter(q => !usedTexts.includes(q.text));

  // الأسئلة المتاحة من الشجرة
  const treeQuestions = tree
    ? availableIds.map(id => tree.nodes[id]).filter(Boolean)
    : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background:    visible ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
          backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          maxHeight: "82vh",
          borderRadius: "24px 24px 0 0",
          background: "#0c0c10",
          border: `1px solid ${meta.color}28`,
          borderBottom: "none",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: `0 -8px 40px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-700" />
        </div>

        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: meta.bgColor, borderBottom: `1px solid ${meta.color}22` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="rounded-full flex items-center justify-center text-2xl"
              style={{
                width: 52, height: 52,
                background: `radial-gradient(circle, ${meta.color}33 0%, ${meta.color}11 100%)`,
                border: `2px solid ${meta.color}55`,
                boxShadow: `0 0 16px ${meta.color}33`,
              }}
            >
              {charData.image
                ? <img src={charData.image} alt={charData.name} className="w-full h-full rounded-full object-cover" />
                : meta.icon}
            </div>
            <div>
              <p className="font-black text-white text-sm leading-none mb-0.5">{charData.name}</p>
              <p className="text-xs font-bold" style={{ color: meta.color }}>{charData.role}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: meta.color }} />
                <span className="text-xs text-gray-500">في قاعة المحكمة</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
          >✕</button>
        </div>

        {/* المحادثة */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" dir="rtl">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex"
              style={{
                justifyContent: msg.from === "me" ? "flex-start" : "flex-end",
                animation: "slideUp 0.25s ease-out",
              }}
            >
              <div
                className="max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={msg.from === "character" ? {
                  background: `linear-gradient(135deg, ${meta.bgColor} 0%, ${meta.bgColor}cc 100%)`,
                  border: `1px solid ${meta.color}28`,
                  color: "white",
                  borderTopRightRadius: 6,
                } : {
                  background: "#1e2433",
                  border: "1px solid #2d3748",
                  color: "#94a3b8",
                  borderTopLeftRadius: 6,
                }}
              >
                {msg.isOpening && (
                  <p className="text-xs mb-2 font-bold" style={{ color: meta.color }}>
                    {meta.icon} {charData.name}
                  </p>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-end" style={{ animation: "slideUp 0.2s ease-out" }}>
              <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                style={{ background: meta.bgColor, border: `1px solid ${meta.color}28`, borderTopRightRadius: 6 }}>
                {[0,1,2].map(i => (
                  <div key={i} className="rounded-full"
                    style={{ width:7, height:7, background: meta.color,
                      animation:`bounce 0.9s ${i*0.18}s infinite`, opacity:0.7 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* زر بدء الاستجواب */}
        {phase === "opening" && messages.length > 0 && !typing && (
          <div className="px-4 py-3 border-t border-gray-800/60">
            <button
              onClick={() => setPhase("questions")}
              className="w-full py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)`,
                color: meta.color === "#f59e0b" ? "#000" : "#fff",
                boxShadow: `0 4px 20px ${meta.color}44`,
              }}
            >
              {getInterrogateLabel(myRole, characterId)}
            </button>
          </div>
        )}

        {/* الأسئلة */}
        {phase === "questions" && !typing && (
          <div className="border-t border-gray-800/60" style={{ background: "#09090d" }}>
            {/* شجرة الأسئلة الديناميكية */}
            {tree && treeQuestions.length > 0 && (
              <>
                <p className="text-gray-600 text-xs px-4 pt-3 pb-1 font-bold tracking-wide">
                  اختر سؤالك:
                </p>
                <div className="px-3 pb-3 space-y-1.5 max-h-52 overflow-y-auto">
                  {treeQuestions.map(node => (
                    <button
                      key={node.id}
                      onClick={() => handleTreeQuestion(node.id)}
                      className="w-full text-right px-4 py-3 rounded-xl text-sm text-white transition-all"
                      style={{ background: "#14141c", border: `1px solid ${meta.color}22` }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = meta.color + "18";
                        e.currentTarget.style.borderColor = meta.color + "55";
                        e.currentTarget.style.transform = "translateX(-2px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#14141c";
                        e.currentTarget.style.borderColor = meta.color + "22";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <span className="text-gray-500 ml-2">◀</span>
                      {node.text}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* أسئلة عادية (غير شجرة) */}
            {!tree && availableQs.length > 0 && (
              <>
                <p className="text-gray-600 text-xs px-4 pt-3 pb-1 font-bold tracking-wide">
                  اختر سؤالك:
                </p>
                <div className="px-3 pb-3 space-y-1.5 max-h-52 overflow-y-auto">
                  {availableQs.map(q => (
                    <button
                      key={q.id}
                      onClick={() => handleQuestion(q)}
                      className="w-full text-right px-4 py-3 rounded-xl text-sm text-white transition-all"
                      style={{ background: "#14141c", border: `1px solid ${meta.color}22` }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = meta.color + "18";
                        e.currentTarget.style.borderColor = meta.color + "55";
                        e.currentTarget.style.transform = "translateX(-2px)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "#14141c";
                        e.currentTarget.style.borderColor = meta.color + "22";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <span className="text-gray-500 ml-2">◀</span>
                      {q.text}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* انتهت الأسئلة */}
            {(tree ? treeQuestions.length === 0 : availableQs.length === 0) && !typing && (
              <div className="px-4 py-5 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-gray-500 text-sm font-bold">انتهى الاستجواب</p>
                <p className="text-gray-600 text-xs mt-1">
                  {tree ? "وصلت لنهاية مسار الأسئلة" : "استخدمت كل الأسئلة المتاحة"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Typing — إخفاء الأسئلة أثناء الرد */}
        {phase === "questions" && typing && (
          <div className="border-t border-gray-800/60 px-4 py-3 text-center">
            <p className="text-gray-600 text-xs">يفكّر في إجابته...</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-5px); } }
      `}</style>
    </>
  );
}

function getCharacterData(characterId, caseData, myRole) {
  if (!caseData) return null;
  switch (characterId) {
    case "accused":
      return {
        name: caseData.interrogationDialogues?.accused?.name || "المتهم",
        role: "المتهم",
        image: caseData.accusedImage || null,
        openingStatement:
          myRole === "defense"
            ? "موكّلي، أنا هنا عشانك. قولي كل حاجة عشان أقدر أدافع عنك صح."
            : caseData.interrogationDialogues?.accused?.openingStatement || "",
        questions:
          myRole === "defense"     ? caseData.defenseFile?.questions || [] :
          myRole === "prosecution" ? caseData.prosecutionFile?.questions || [] :
          [],
      };
    case "defense":
      return {
        name: caseData.defenseFile?.lawyerName || "محامي الدفاع",
        role: "محامي الدفاع",
        image: null,
        openingStatement: caseData.defenseFile?.openingStatement || "",
        questions: caseData.defenseFile?.questions || [],
      };
    case "prosecution":
      return {
        name: caseData.prosecutionFile?.prosecutorName || "وكيل النيابة",
        role: "وكيل النيابة",
        image: null,
        openingStatement: caseData.prosecutionFile?.openingStatement || "",
        questions: caseData.prosecutionFile?.questions || [],
      };
    case "jury":
      return {
        name: "هيئة المحلفين",
        role: "المحلفون",
        image: null,
        openingStatement: "نحن هنا للاستماع والحكم بضمير.",
        questions: caseData.juryFile?.questions || [],
      };
    case "judge":
      return {
        name: "سعادة القاضي",
        role: "رئيس المحكمة",
        image: null,
        openingStatement: "الجلسة منعقدة. يُرجى الالتزام بآداب المحكمة.",
        questions: [],
      };
    default:
      return null;
  }
}