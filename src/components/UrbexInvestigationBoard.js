import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// ألوان الدبابيس
// ═══════════════════════════════════════════════════════════════
const PIN_COLORS = ["#dc2626","#2563eb","#16a34a","#d97706","#7c3aed","#db2777"];

const CARD_TYPES = {
  evidence: { icon:"🔍", labelAr:"دليل",    labelEn:"Evidence",  bg:"#fef9e7", border:"#d4a017" },
  document: { icon:"📄", labelAr:"وثيقة",   labelEn:"Document",  bg:"#fdf2f8", border:"#9b59b6" },
  photo:    { icon:"📸", labelAr:"صورة",    labelEn:"Photo",     bg:"#eafaf1", border:"#27ae60" },
  note:     { icon:"📝", labelAr:"ملاحظة",  labelEn:"Note",      bg:"#fdebd0", border:"#e67e22" },
  theory:   { icon:"💡", labelAr:"نظرية",   labelEn:"Theory",    bg:"#eaf4fb", border:"#2980b9" },
  suspect:  { icon:"👤", labelAr:"مشتبه به",labelEn:"Suspect",   bg:"#fdedec", border:"#e74c3c" },
};

// ═══════════════════════════════════════════════════════════════
// دبوس الخشبة
// ═══════════════════════════════════════════════════════════════
function Thumbtack({ color = "#dc2626", x, y }) {
  return (
    <div className="absolute z-20 pointer-events-none"
      style={{ left: x - 8, top: y - 8, transform:"translate(-50%,-50%)" }}>
      <svg width="16" height="20" viewBox="0 0 16 20">
        <circle cx="8" cy="7" r="6" fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="1"/>
        <circle cx="8" cy="7" r="3" fill="rgba(255,255,255,0.35)"/>
        <line x1="8" y1="12" x2="8" y2="20" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5"/>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// بطاقة الدليل
// ═══════════════════════════════════════════════════════════════
function ClueCard({ card, isSelected, onSelect, onDragStart, onDrag, onDragEnd, isRtl, playerColor, isBeingDragged }) {
  const ref = useRef(null);
  const type = CARD_TYPES[card.type] || CARD_TYPES.evidence;

  const handleMouseDown = (e) => {
    e.preventDefault();
    onSelect(card.id);
    onDragStart(card.id, e.clientX, e.clientY);
  };
  const handleTouchStart = (e) => {
    onSelect(card.id);
    onDragStart(card.id, e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div
      ref={ref}
      className="absolute select-none"
      style={{
        left:  card.x,
        top:   card.y,
        width: 160,
        transform: `rotate(${card.rotation || 0}deg)`,
        zIndex: isSelected || isBeingDragged ? 100 : card.zIndex || 1,
        cursor: isBeingDragged ? "grabbing" : "grab",
        filter: isBeingDragged ? "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
        transition: isBeingDragged ? "none" : "filter 0.2s",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* الدبوس */}
      <Thumbtack color={playerColor || PIN_COLORS[0]} x={80} y={0} />

      {/* الورقة */}
      <div className="mt-2 p-3 rounded-sm border-l-4"
        style={{
          background: type.bg,
          borderColor: type.border,
          boxShadow: isSelected
            ? `0 0 0 2px ${playerColor || "#c9a84c"}, 0 4px 12px rgba(0,0,0,0.3)`
            : "0 2px 8px rgba(0,0,0,0.2)",
        }}>

        {/* نوع البطاقة */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm">{type.icon}</span>
          <span className="text-xs font-bold tracking-wide" style={{ color: type.border }}>
            {isRtl ? type.labelAr : type.labelEn}
          </span>
        </div>

        {/* العنوان */}
        <p className="text-xs font-semibold text-gray-800 leading-snug mb-1"
          style={{ fontFamily: isRtl ? "'Amiri',Georgia,serif" : "Georgia,serif" }}
          dir={isRtl ? "rtl" : "ltr"}>
          {isRtl ? card.nameAr : card.nameEn}
        </p>

        {/* ملاحظة */}
        {card.note && (
          <p className="text-xs text-gray-500 italic leading-snug mt-1 border-t border-gray-200 pt-1"
            dir={isRtl ? "rtl" : "ltr"}>
            {card.note}
          </p>
        )}

        {/* من أضافها */}
        {card.addedBy && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full" style={{ background: card.addedByColor || "#888" }}/>
            <span className="text-xs text-gray-400">{card.addedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// خيط ربط
// ═══════════════════════════════════════════════════════════════
function StringLine({ from, to, cards, color = "#dc2626", opacity = 0.7 }) {
  const fromCard = cards.find(c => c.id === from);
  const toCard   = cards.find(c => c.id === to);
  if (!fromCard || !toCard) return null;

  // نقطة المركز لكل بطاقة
  const x1 = fromCard.x + 80;
  const y1 = fromCard.y + 50;
  const x2 = toCard.x + 80;
  const y2 = toCard.y + 50;

  // خط متعرج قليلاً يشبه الخيط الحقيقي
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + 15;

  return (
    <path
      d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
      stroke={color}
      strokeWidth="1.8"
      fill="none"
      opacity={opacity}
      strokeDasharray="0"
      style={{ filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// ملاحظة ستيكي
// ═══════════════════════════════════════════════════════════════
function StickyNote({ note, onDelete, isRtl }) {
  const colors = ["#fef08a","#86efac","#93c5fd","#f9a8d4","#fca5a5"];
  const bg     = colors[note.colorIdx || 0];

  return (
    <div className="absolute select-none"
      style={{
        left: note.x, top: note.y, width: 150,
        transform: `rotate(${note.rotation || 0}deg)`,
        zIndex: note.zIndex || 2,
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))",
      }}>
      <div className="p-3 rounded-sm relative" style={{ background: bg, minHeight: 100 }}>
        {/* خط العنوان */}
        <div className="w-full h-px bg-gray-400/30 mb-2"/>
        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: isRtl ? "'Amiri',Georgia,serif" : "'Caveat',cursive" }}
          dir={isRtl ? "rtl" : "ltr"}>
          {note.text}
        </p>
        {note.author && (
          <p className="text-xs text-gray-400 mt-2 italic">— {note.author}</p>
        )}
        {onDelete && (
          <button onClick={() => onDelete(note.id)}
            className="absolute top-1 right-1 text-gray-400 hover:text-red-500 text-xs transition-colors">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// نظرية للتصويت
// ═══════════════════════════════════════════════════════════════
function TheoryVote({ theory, players, lang, onVote, myPlayerId }) {
  const isRtl  = lang === "ar";
  const votes  = theory.votes || {};
  const total  = Object.keys(votes).length;
  const agree  = Object.values(votes).filter(v => v === "agree").length;
  const myVote = votes[myPlayerId];

  return (
    <div className="border border-[#2a1f14] bg-[#0d0a06]/90 p-4 rounded-sm"
      dir={isRtl ? "rtl" : "ltr"}>

      {/* النظرية */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-lg">💡</span>
        <div className="flex-1">
          <p className="text-xs text-[#c9a84c]/60 tracking-wider mb-1">
            {theory.author} {isRtl ? "يقترح:" : "suggests:"}
          </p>
          <p className="text-[#e8d9b0] text-sm leading-relaxed">{theory.text}</p>
        </div>
      </div>

      {/* شريط التصويت */}
      <div className="h-1.5 bg-[#1a1208] rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-[#4caf50] transition-all duration-500 rounded-full"
          style={{ width: total ? `${(agree/total)*100}%` : "0%" }}/>
      </div>

      {/* الأصوات */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[#4caf50] text-xs">{agree} {isRtl ? "موافق" : "agree"}</span>
        <span className="text-[#5a4a3a] text-xs">{total} {isRtl ? "صوت" : "votes"}</span>
        <span className="text-[#ef4444] text-xs">{total - agree} {isRtl ? "رافض" : "disagree"}</span>
      </div>

      {/* أزرار التصويت */}
      {!myVote ? (
        <div className="flex gap-2">
          <button onClick={() => onVote(theory.id, "agree")}
            className="flex-1 py-1.5 border border-[#4caf50]/40 text-[#4caf50] text-xs hover:bg-[#4caf50]/10 transition-all">
            {isRtl ? "✓ أوافق" : "✓ Agree"}
          </button>
          <button onClick={() => onVote(theory.id, "disagree")}
            className="flex-1 py-1.5 border border-[#ef4444]/40 text-[#ef4444] text-xs hover:bg-[#ef4444]/10 transition-all">
            {isRtl ? "✗ أرفض" : "✗ Disagree"}
          </button>
        </div>
      ) : (
        <p className="text-center text-[#5a4a3a] text-xs tracking-wider">
          {isRtl ? `صوّتت: ${myVote === "agree" ? "موافق" : "رافض"}` : `Voted: ${myVote}`}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UrbexInvestigationBoard — Main Component
// ═══════════════════════════════════════════════════════════════
export default function UrbexInvestigationBoard({
  socket, roomId, playerId, playerName, playerColor,
  lang = "ar", collectedItems = [], chapterItems = {},
  onClose,
}) {
  const isRtl   = lang === "ar";
  const boardRef = useRef(null);

  // ── State ─────────────────────────────────────────────────
  const [cards,       setCards]       = useState([]);      // البطاقات على اللوحة
  const [strings,     setStrings]     = useState([]);      // الخيوط
  const [notes,       setNotes]       = useState([]);      // الملاحظات
  const [theories,    setTheories]    = useState([]);      // النظريات
  const [cursors,     setCursors]     = useState({});      // مؤشرات اللاعبين
  const [selectedId,  setSelectedId]  = useState(null);   // البطاقة المختارة
  const [connectMode, setConnectMode] = useState(false);  // وضع الربط
  const [connectFrom, setConnectFrom] = useState(null);   // بداية الخيط
  const [dragging,    setDragging]    = useState(null);   // { id, offsetX, offsetY }
  const [panel,       setPanel]       = useState("items"); // items | notes | theories
  const [newNote,     setNewNote]     = useState("");
  const [newTheory,   setNewTheory]   = useState("");
  const [noteColorIdx,setNoteColorIdx]= useState(0);

  const dragRef = useRef(null);

  // ── تحويل الأغراض المجموعة لبطاقات ──────────────────────
  const availableCards = collectedItems
    .map(id => chapterItems[id])
    .filter(Boolean)
    .map(item => ({
      id:       item.id,
      nameAr:   item.nameAr,
      nameEn:   item.nameEn,
      type:     item.type || "evidence",
      onBoard:  cards.some(c => c.id === item.id),
    }));

  // ── WebSocket ─────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // استقبال حالة اللوحة الكاملة
    socket.on("board_state", (state) => {
      if (state.cards)    setCards(state.cards);
      if (state.strings)  setStrings(state.strings);
      if (state.notes)    setNotes(state.notes);
      if (state.theories) setTheories(state.theories);
    });

    // بطاقة اتحركت
    socket.on("board_card_moved", ({ cardId, x, y, movedBy }) => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, x, y } : c));
    });

    // بطاقة اتضافت
    socket.on("board_card_added", (card) => {
      setCards(prev => [...prev.filter(c => c.id !== card.id), card]);
    });

    // خيط اتضاف
    socket.on("board_string_added", (str) => {
      setStrings(prev => [...prev, str]);
    });

    // خيط اتشال
    socket.on("board_string_removed", ({ stringId }) => {
      setStrings(prev => prev.filter(s => s.id !== stringId));
    });

    // ملاحظة اتضافت
    socket.on("board_note_added", (note) => {
      setNotes(prev => [...prev, note]);
    });

    // ملاحظة اتشالت
    socket.on("board_note_removed", ({ noteId }) => {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    });

    // نظرية اتضافت
    socket.on("board_theory_added", (theory) => {
      setTheories(prev => [...prev, theory]);
    });

    // تصويت على نظرية
    socket.on("board_theory_voted", ({ theoryId, voterId, vote }) => {
      setTheories(prev => prev.map(t =>
        t.id === theoryId
          ? { ...t, votes: { ...t.votes, [voterId]: vote } }
          : t
      ));
    });

    // مؤشر لاعب
    socket.on("board_cursor", ({ playerId: pid, name, color, x, y }) => {
      setCursors(prev => ({ ...prev, [pid]: { name, color, x, y, ts: Date.now() } }));
    });

    // طلب الحالة الحالية
    socket.emit("board_request_state", { roomId });

    return () => {
      socket.off("board_state");
      socket.off("board_card_moved");
      socket.off("board_card_added");
      socket.off("board_string_added");
      socket.off("board_string_removed");
      socket.off("board_note_added");
      socket.off("board_note_removed");
      socket.off("board_theory_added");
      socket.off("board_theory_voted");
      socket.off("board_cursor");
    };
  }, [socket, roomId]);

  // ── حذف مؤشرات قديمة ──────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const next = {};
        Object.entries(prev).forEach(([k, v]) => {
          if (now - v.ts < 5000 && k !== playerId) next[k] = v;
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [playerId]);

  // ── إضافة بطاقة للوحة ────────────────────────────────────
  const addCardToBoard = useCallback((item) => {
    if (cards.some(c => c.id === item.id)) return;

    // موضع عشوائي في وسط اللوحة
    const x = 150 + Math.random() * 400;
    const y = 100 + Math.random() * 250;
    const rotation = (Math.random() - 0.5) * 6;

    const card = {
      id:           item.id,
      nameAr:       item.nameAr,
      nameEn:       item.nameEn,
      type:         item.type || "evidence",
      x, y, rotation,
      zIndex:       cards.length + 1,
      addedBy:      playerName,
      addedByColor: playerColor,
      note:         "",
    };

    setCards(prev => [...prev, card]);
    socket?.emit("board_add_card", { roomId, card });
  }, [cards, playerName, playerColor, socket, roomId]);

  // ── سحب البطاقات ─────────────────────────────────────────
  const handleDragStart = useCallback((cardId, clientX, clientY) => {
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    dragRef.current = {
      id: cardId,
      offsetX: clientX - board.left - card.x,
      offsetY: clientY - board.top  - card.y,
    };
    setDragging(cardId);
  }, [cards]);

  const handleBoardMouseMove = useCallback((e) => {
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const bx = clientX - board.left;
    const by = clientY - board.top;

    // تحديث مؤشر اللاعب
    socket?.emit("board_cursor", { roomId, playerId, name: playerName, color: playerColor, x: bx, y: by });

    if (!dragRef.current) return;
    const { id, offsetX, offsetY } = dragRef.current;
    const x = bx - offsetX;
    const y = by - offsetY;
    setCards(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  }, [socket, roomId, playerId, playerName, playerColor]);

  const handleBoardMouseUp = useCallback((e) => {
    if (!dragRef.current) return;
    const { id } = dragRef.current;
    const card = cards.find(c => c.id === id);
    if (card) {
      socket?.emit("board_move_card", { roomId, cardId: id, x: card.x, y: card.y });
    }
    dragRef.current = null;
    setDragging(null);
  }, [cards, socket, roomId]);

  // ── وضع الربط بالخيط ─────────────────────────────────────
  const handleCardSelect = useCallback((cardId) => {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(cardId);
      } else if (connectFrom !== cardId) {
        // إضافة خيط
        const strId  = `str_${Date.now()}`;
        const str    = { id: strId, from: connectFrom, to: cardId, color: playerColor || "#dc2626" };
        setStrings(prev => [...prev, str]);
        socket?.emit("board_add_string", { roomId, string: str });
        setConnectFrom(null);
        setConnectMode(false);
      }
    } else {
      setSelectedId(cardId === selectedId ? null : cardId);
    }
  }, [connectMode, connectFrom, playerColor, socket, roomId, selectedId]);

  // ── حذف خيط ──────────────────────────────────────────────
  const removeString = useCallback((strId) => {
    setStrings(prev => prev.filter(s => s.id !== strId));
    socket?.emit("board_remove_string", { roomId, stringId: strId });
  }, [socket, roomId]);

  // ── إضافة ملاحظة ─────────────────────────────────────────
  const addNote = useCallback(() => {
    if (!newNote.trim()) return;
    const note = {
      id:        `note_${Date.now()}`,
      text:      newNote.trim(),
      author:    playerName,
      colorIdx:  noteColorIdx,
      x:         150 + Math.random() * 350,
      y:         120 + Math.random() * 200,
      rotation:  (Math.random() - 0.5) * 8,
      zIndex:    50,
    };
    setNotes(prev => [...prev, note]);
    socket?.emit("board_add_note", { roomId, note });
    setNewNote("");
  }, [newNote, noteColorIdx, playerName, socket, roomId]);

  // ── إضافة نظرية ──────────────────────────────────────────
  const addTheory = useCallback(() => {
    if (!newTheory.trim()) return;
    const theory = {
      id:     `theory_${Date.now()}`,
      text:   newTheory.trim(),
      author: playerName,
      votes:  {},
      ts:     Date.now(),
    };
    setTheories(prev => [...prev, theory]);
    socket?.emit("board_add_theory", { roomId, theory });
    setNewTheory("");
  }, [newTheory, playerName, socket, roomId]);

  // ── التصويت ──────────────────────────────────────────────
  const handleVote = useCallback((theoryId, vote) => {
    setTheories(prev => prev.map(t =>
      t.id === theoryId ? { ...t, votes: { ...t.votes, [playerId]: vote } } : t
    ));
    socket?.emit("board_vote_theory", { roomId, theoryId, voterId: playerId, vote });
  }, [socket, roomId, playerId]);

  // ── حذف ملاحظة ────────────────────────────────────────────
  const removeNote = useCallback((noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    socket?.emit("board_remove_note", { roomId, noteId });
  }, [socket, roomId]);

  // ══════════════════════════════════════════════════════════
  // الرندر
  // ══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex" dir={isRtl ? "rtl" : "ltr"}
      style={{ background: "#0a0704" }}>

      {/* ══ لوحة الفلين ══ */}
      <div className="relative flex-1 overflow-hidden"
        ref={boardRef}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
        onTouchMove={handleBoardMouseMove}
        onTouchEnd={handleBoardMouseUp}
        style={{
          // نسيج الفلين
          background: `
            radial-gradient(ellipse at 20% 30%, #4a2e1a 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, #3d2410 0%, transparent 50%),
            repeating-linear-gradient(
              45deg,
              #2d1a0e 0px, #2d1a0e 1px,
              transparent 1px, transparent 8px
            ),
            repeating-linear-gradient(
              -45deg,
              #1a0d06 0px, #1a0d06 1px,
              transparent 1px, transparent 8px
            ),
            #3a200e
          `,
          cursor: connectMode ? "crosshair" : "default",
        }}
      >
        {/* ── الخيوط — SVG فوق كل شيء ── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {strings.map(str => (
            <StringLine key={str.id} from={str.from} to={str.to} cards={cards} color={str.color}/>
          ))}
          {/* خيط جاري الرسم */}
          {connectFrom && connectMode && (
            <circle
              cx={(cards.find(c => c.id === connectFrom)?.x || 0) + 80}
              cy={(cards.find(c => c.id === connectFrom)?.y || 0) + 50}
              r="8" fill="none" stroke="#dc2626" strokeWidth="2"
              strokeDasharray="4" opacity="0.8"
            >
              <animate attributeName="stroke-dashoffset" values="0;8" dur="0.5s" repeatCount="indefinite"/>
            </circle>
          )}
        </svg>

        {/* ── الملاحظات الستيكي ── */}
        {notes.map(note => (
          <StickyNote
            key={note.id} note={note} isRtl={isRtl}
            onDelete={removeNote}
          />
        ))}

        {/* ── بطاقات الأدلة ── */}
        {cards.map(card => (
          <ClueCard
            key={card.id} card={card}
            isSelected={selectedId === card.id}
            isBeingDragged={dragging === card.id}
            onSelect={handleCardSelect}
            onDragStart={handleDragStart}
            onDrag={() => {}}
            onDragEnd={handleBoardMouseUp}
            isRtl={isRtl}
            playerColor={playerColor}
          />
        ))}

        {/* ── مؤشرات اللاعبين ── */}
        {Object.entries(cursors).map(([pid, cur]) => (
          <div key={pid} className="absolute pointer-events-none z-50 transition-all duration-100"
            style={{ left: cur.x, top: cur.y }}>
            <div className="w-3 h-3 rounded-full border-2 border-white"
              style={{ background: cur.color, transform:"translate(-50%,-50%)" }}/>
            <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
              {cur.name}
            </div>
          </div>
        ))}

        {/* ── إرشادات في الوسط لو اللوحة فاضية ── */}
        {cards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[#4a2e1a] text-4xl mb-3">📌</p>
              <p className="text-[#4a2e1a] text-sm tracking-wider">
                {isRtl ? "أضف الأدلة من القائمة الجانبية" : "Add clues from the side panel"}
              </p>
            </div>
          </div>
        )}

        {/* ── وضع الربط — مؤشر ── */}
        {connectMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 border border-[#dc2626]/60 bg-[#0d0a06]/90 px-4 py-2 z-40">
            <p className="text-[#dc2626] text-xs tracking-wider">
              {isRtl
                ? connectFrom ? "اختر البطاقة الثانية" : "اختر البطاقة الأولى"
                : connectFrom ? "Select second card" : "Select first card"
              }
            </p>
          </div>
        )}
      </div>

      {/* ══ الشريط الجانبي ══ */}
      <div className="w-72 shrink-0 border-l border-[#1a1208] bg-[#0d0a06] flex flex-col"
        style={{ boxShadow: "-4px 0 20px rgba(0,0,0,0.5)" }}>

        {/* الرأس */}
        <div className="border-b border-[#1a1208] p-4 flex items-center justify-between">
          <div>
            <h2 className="text-[#c9a84c] text-sm font-bold tracking-[0.2em] uppercase">
              {isRtl ? "لوحة التحقيق" : "Investigation Board"}
            </h2>
            <p className="text-[#5a4a3a] text-xs mt-0.5">
              {cards.length} {isRtl ? "دليل" : "clues"} · {strings.length} {isRtl ? "ربط" : "links"}
            </p>
          </div>
          <button onClick={onClose}
            className="text-[#3a2812] hover:text-[#c97070] text-xl transition-colors">
            ✕
          </button>
        </div>

        {/* أدوات اللوحة */}
        <div className="border-b border-[#1a1208] p-3 flex gap-2">
          <button
            onClick={() => { setConnectMode(m => !m); setConnectFrom(null); }}
            className={`flex-1 py-2 text-xs tracking-wider border transition-all ${
              connectMode
                ? "border-[#dc2626]/60 text-[#dc2626] bg-[#dc2626]/10"
                : "border-[#2a1f14] text-[#5a4a3a] hover:border-[#dc2626]/30 hover:text-[#dc2626]"
            }`}>
            🔴 {isRtl ? "ربط" : "Link"}
          </button>
          <button
            onClick={() => setStrings([])}
            className="flex-1 py-2 text-xs tracking-wider border border-[#2a1f14] text-[#5a4a3a] hover:border-[#c97070]/30 hover:text-[#c97070] transition-all">
            ✂️ {isRtl ? "شيل الخيوط" : "Clear Links"}
          </button>
        </div>

        {/* التبويبات */}
        <div className="flex border-b border-[#1a1208]">
          {[
            { key:"items",    labelAr:"الأدلة",     labelEn:"Clues",    icon:"🔍" },
            { key:"notes",    labelAr:"ملاحظات",    labelEn:"Notes",    icon:"📝" },
            { key:"theories", labelAr:"النظريات",   labelEn:"Theories", icon:"💡" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setPanel(tab.key)}
              className={`flex-1 py-2.5 text-xs transition-all ${
                panel === tab.key
                  ? "text-[#c9a84c] border-b border-[#c9a84c]"
                  : "text-[#5a4a3a] hover:text-[#8a7a6a]"
              }`}>
              {tab.icon} {isRtl ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto">

          {/* ── الأدلة ── */}
          {panel === "items" && (
            <div className="p-3 flex flex-col gap-2">
              {availableCards.length === 0 ? (
                <p className="text-[#3a2812] text-xs text-center py-8 tracking-wider">
                  {isRtl ? "لم تجمع أدلة بعد" : "No clues collected yet"}
                </p>
              ) : availableCards.map(item => {
                const type = CARD_TYPES[item.type] || CARD_TYPES.evidence;
                return (
                  <button key={item.id}
                    onClick={() => !item.onBoard && addCardToBoard(item)}
                    className={`flex items-center gap-3 p-3 border text-left transition-all ${
                      item.onBoard
                        ? "border-[#c9a84c]/30 bg-[#c9a84c]/5 opacity-60 cursor-default"
                        : "border-[#2a1f14] bg-[#0d0a06]/60 hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/5 cursor-pointer"
                    }`}>
                    <span className="text-lg">{type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e8d9b0] text-xs truncate">
                        {isRtl ? item.nameAr : item.nameEn}
                      </p>
                      <p className="text-[#5a4a3a] text-xs" style={{ color: type.border }}>
                        {isRtl ? type.labelAr : type.labelEn}
                      </p>
                    </div>
                    {item.onBoard
                      ? <span className="text-[#c9a84c]/40 text-xs">✓</span>
                      : <span className="text-[#3a2812] text-xs">+</span>
                    }
                  </button>
                );
              })}
            </div>
          )}

          {/* ── الملاحظات ── */}
          {panel === "notes" && (
            <div className="p-3 flex flex-col gap-3">
              {/* كتابة ملاحظة */}
              <div className="border border-[#1a1208] bg-[#080603]/60 p-3">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder={isRtl ? "اكتب ملاحظتك..." : "Write your note..."}
                  className="w-full bg-transparent text-[#e8d9b0] text-xs resize-none outline-none placeholder-[#3a2812] leading-relaxed"
                  dir={isRtl ? "rtl" : "ltr"}
                  rows={3}
                />
                {/* ألوان الستيكي */}
                <div className="flex items-center gap-2 mt-2">
                  {["#fef08a","#86efac","#93c5fd","#f9a8d4","#fca5a5"].map((c,i) => (
                    <button key={i} onClick={() => setNoteColorIdx(i)}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${noteColorIdx===i ? "border-white scale-110" : "border-transparent"}`}
                      style={{ background: c }}/>
                  ))}
                  <button onClick={addNote}
                    className="mr-auto border border-[#c9a84c]/40 text-[#c9a84c] text-xs px-3 py-1 hover:bg-[#c9a84c]/10 transition-all">
                    {isRtl ? "أضف" : "Add"}
                  </button>
                </div>
              </div>

              {/* الملاحظات الموجودة */}
              {notes.map(note => (
                <div key={note.id} className="border border-[#1a1208] p-2 text-xs"
                  style={{ borderRight: `3px solid ${["#fef08a","#86efac","#93c5fd","#f9a8d4","#fca5a5"][note.colorIdx||0]}` }}>
                  <p className="text-[#b8a88a] leading-relaxed" dir={isRtl?"rtl":"ltr"}>{note.text}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[#5a4a3a]">— {note.author}</span>
                    <button onClick={() => removeNote(note.id)}
                      className="text-[#3a2812] hover:text-[#c97070] transition-colors">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── النظريات ── */}
          {panel === "theories" && (
            <div className="p-3 flex flex-col gap-3">
              {/* إضافة نظرية */}
              <div className="border border-[#1a1208] bg-[#080603]/60 p-3">
                <textarea
                  value={newTheory}
                  onChange={e => setNewTheory(e.target.value)}
                  placeholder={isRtl ? "اقترح نظريتك عن القضية..." : "Propose your theory about the case..."}
                  className="w-full bg-transparent text-[#e8d9b0] text-xs resize-none outline-none placeholder-[#3a2812] leading-relaxed"
                  dir={isRtl ? "rtl" : "ltr"}
                  rows={3}
                />
                <button onClick={addTheory}
                  className="mt-2 w-full border border-[#c9a84c]/40 text-[#c9a84c] text-xs py-1.5 hover:bg-[#c9a84c]/10 transition-all">
                  {isRtl ? "اقترح النظرية" : "Submit Theory"}
                </button>
              </div>

              {/* النظريات */}
              {theories.length === 0 ? (
                <p className="text-[#3a2812] text-xs text-center py-6 tracking-wider">
                  {isRtl ? "لا توجد نظريات بعد" : "No theories yet"}
                </p>
              ) : theories.map(theory => (
                <TheoryVote
                  key={theory.id} theory={theory}
                  lang={lang} onVote={handleVote}
                  myPlayerId={playerId} players={[]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1a1208] p-3 text-center">
          <p className="text-[#2a1f14] text-xs tracking-widest">
            {isRtl ? "التحقيق مشترك — الكل يرى" : "Shared investigation — all see"}
          </p>
        </div>
      </div>
    </div>
  );
}