import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesModal from './RulesModal';
const C = {
  bg0: '#050510', border: '#1e1e35',
  red: '#dc2626', green: '#10b981',
  amber: '#f59e0b', purple: '#a855f7',
  text: '#e5e7eb', textDim: '#94a3b8', textMuted: '#64748b',
};

const SUIT_SYMBOL = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const SUIT_CODE = { hearts: 'H', diamonds: 'D', clubs: 'C', spades: 'S' };
const LOAN_VALUE = { Q: 5, K: 15, J: 25 };
const LOAN_LABEL = { Q: 'بنت', K: 'شايب', J: 'ولد' };
const USE_FACE_IMAGES = true;

// =====================================================
// 🎴 PlayingCard
// =====================================================
// ✅ عرض A كـ 1
const displayRank = (rank) => rank === 'A' ? '1' : rank;
const PlayingCard = ({ card, size = 'md', faceDown = false, selected = false, glowing = false, onClick, disabled = false }) => {
  const sizes = {
    xs: { w: 46, h: 64, rankSize: 15, suitSize: 12, centerSize: 30, bigWordSize: 18 },
    sm: { w: 58, h: 82, rankSize: 18, suitSize: 14, centerSize: 38, bigWordSize: 22 },
    md: { w: 78, h: 110, rankSize: 24, suitSize: 18, centerSize: 52, bigWordSize: 28 },
    lg: { w: 98, h: 138, rankSize: 30, suitSize: 22, centerSize: 66, bigWordSize: 34 },
    xl: { w: 118, h: 166, rankSize: 36, suitSize: 26, centerSize: 80, bigWordSize: 40 },
  };
  const s = sizes[size] || sizes.md;

  if (faceDown || !card || !card.rank) {
    return (
      <div onClick={!disabled ? onClick : undefined}
        style={{
          width: s.w, height: s.h, borderRadius: 8,
          background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #312e81 100%)',
          border: '2px solid #a855f7',
          boxShadow: 'inset 0 0 20px rgba(168,85,247,0.4), 0 4px 10px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          userSelect: 'none', position: 'relative', overflow: 'hidden',
        }}>
        <span style={{ fontSize: s.centerSize * 0.85, color: '#e9d5ff', fontWeight: 900 }}>♠</span>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = isRed ? '#dc2626' : '#0f172a';
  const symbol = SUIT_SYMBOL[card.suit];
  const arabicNames = { J: 'ولد', Q: 'بنت', K: 'شايب' };
  const isFace = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
  const displayText = isFace ? arabicNames[card.rank] : displayRank(card.rank);
  const faceImg = isFace && USE_FACE_IMAGES
    ? `https://deckofcardsapi.com/static/img/${card.rank}${SUIT_CODE[card.suit]}.png`
    : null;

  return (
    <div onClick={!disabled ? onClick : undefined}
      style={{
        width: s.w, height: s.h, borderRadius: 8,
        background: 'linear-gradient(145deg, #fefefe, #e8e8f0)',
        border: '1.5px solid #cbd5e1', position: 'relative',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        filter: selected
          ? 'drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 24px #fbbf24)'
          : glowing ? 'drop-shadow(0 0 12px #10b981) drop-shadow(0 0 22px #10b981)'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))',
        transition: 'filter 0.2s, transform 0.2s',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        userSelect: 'none', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', top: 4, left: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color }}>
        <span style={{ fontSize: s.rankSize, fontWeight: 900, letterSpacing: '-0.5px' }}>
          {displayRank(card.rank)}
        </span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {isFace ? <span style={{ fontSize: s.bigWordSize, fontWeight: 900 }}>{displayText}</span>
                 : <span style={{ fontSize: s.centerSize }}>{symbol}</span>}
      </div>
      <div style={{ position: 'absolute', bottom: 4, right: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color, transform: 'rotate(180deg)' }}>
        <span style={{ fontSize: s.rankSize, fontWeight: 900, letterSpacing: '-0.5px' }}>
          {displayRank(card.rank)}
        </span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>
      {faceImg && (
        <img src={faceImg} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 3, pointerEvents: 'none' }} />
      )}
    </div>
  );
};

// =====================================================
// 🎮 ModesModal (نفس اللي في Basra — عشان نقدر نرجع للبصرة)
// =====================================================
const MODES = [
  { id: 'basra', name: 'بصرة', emoji: '🃏', available: true, desc: 'أكتر كروت تفوز' },
  { id: 'bank', name: 'بنك', emoji: '🏦', available: true, desc: 'الأكثر ورق يفوز' },
  { id: 'shayeb', name: 'الشايب', emoji: '👑', available: true, desc: 'آخر واحد معاه الشايب' },
  { id: 'crazy8', name: 'Crazy 8', emoji: '🎴', available: true, desc: 'اللي يخلّص إيده الأول' },
  { id: 'solitaire', name: 'سوليتير', emoji: '🃏', available: true, desc: 'لعبة فردية' },
  { id: 'spider', name: 'سبايدر', emoji: '🕷️', available: true, desc: 'التحدي الأصعب' },
];

const ModesModal = ({ open, onClose, onSelect, currentMode }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.purple}40`, boxShadow: `0 20px 60px -10px ${C.purple}55` }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <h2 className="text-xl font-black flex items-center gap-2"><span>🎮</span><span>اختر الطور</span></h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-3 space-y-2">
              {MODES.map((m) => {
                const isCurrent = m.id === currentMode;
                const canClick = m.available && !isCurrent;
                return (
                  <motion.button key={m.id} disabled={!canClick}
                    onClick={() => { if (canClick) { onSelect(m.id); onClose(); } }}
                    whileHover={canClick ? { scale: 1.02 } : {}} whileTap={canClick ? { scale: 0.98 } : {}}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right disabled:cursor-default"
                    style={{
                      background: isCurrent ? `${C.amber}20` : m.available ? `${C.purple}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? C.amber + '80' : m.available ? C.purple + '60' : C.border}`,
                      opacity: m.available ? 1 : 0.5,
                      boxShadow: isCurrent ? `0 0 20px -6px ${C.amber}` : 'none',
                    }}>
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="flex-1">
                      <p className="font-black text-white text-lg">{m.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{m.desc}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.amber}30`, color: C.amber, border: `1px solid ${C.amber}80` }}>▶ الحالي</span>
                    )}
                    {m.available && !isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}60` }}>✓ مفعّل</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t text-center" style={{ borderColor: C.border, background: C.bg0 }}>
              <p className="text-[10px]" style={{ color: C.textMuted }}>تنبيه: تبديل الطور هيمسح اللعبة الحالية</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 🎯 BorrowPopup
// =====================================================
const BorrowPopup = ({ open, onClose, me, players, tableCount, onBorrowFromTable, onRequestBorrow, waiting, waitingTargetName }) => {
  const [loanCardId, setLoanCardId] = useState(null);
  useEffect(() => { if (!open) setLoanCardId(null); }, [open]);
  if (!open) return null;

  const selectedLoan = me?.loanCards.find(c => c.id === loanCardId);
  const amount = selectedLoan ? LOAN_VALUE[selectedLoan.rank] : 0;

  const groupedLoans = {};
  (me?.loanCards || []).forEach(c => {
    if (!groupedLoans[c.rank]) groupedLoans[c.rank] = [];
    groupedLoans[c.rank].push(c);
  });

  const eligiblePlayers = (players || []).filter(p => !p.isMe && !p.isOut && p.handCount > 0);

  if (waiting) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.amber}60` }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 mx-auto mb-4 rounded-full"
            style={{ border: '3px solid transparent', borderTopColor: C.amber, borderRightColor: C.amber }} />
          <p className="text-lg font-black" style={{ color: C.amber }}>في انتظار موافقة {waitingTargetName}...</p>
          <p className="text-xs mt-2" style={{ color: C.textMuted }}>بيطلب منك {amount} كارت</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-5"
        style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.amber}60` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2" style={{ color: C.amber }}>
            <span>💰</span><span>استلاف</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>1) اختار كارت الاستلاف</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {['Q', 'K', 'J'].map(rank => {
            const cards = groupedLoans[rank] || [];
            if (cards.length === 0) return null;
            const isSelected = cards.some(c => c.id === loanCardId);
            return (
              <motion.button key={rank} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setLoanCardId(cards[0].id)}
                className="rounded-xl px-4 py-3 flex flex-col items-center gap-1"
                style={{
                  background: isSelected ? `${C.amber}30` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSelected ? C.amber : C.border}`,
                  boxShadow: isSelected ? `0 0 20px -6px ${C.amber}` : 'none',
                }}>
                <span className="text-lg font-black">{LOAN_LABEL[rank]} ×{cards.length}</span>
                <span className="text-xs" style={{ color: C.amber }}>ياخد {LOAN_VALUE[rank]} كارت</span>
              </motion.button>
            );
          })}
        </div>

        {selectedLoan && (
          <>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
              2) اختار مين تستلف منه ({amount} كارت)
            </p>
            <div className="space-y-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => onBorrowFromTable(selectedLoan.id)}
                disabled={tableCount === 0}
                className="w-full rounded-xl p-3 text-right flex items-center justify-between disabled:opacity-40"
                style={{ background: `${C.green}15`, border: `1.5px solid ${C.green}60` }}>
                <div>
                  <p className="font-black" style={{ color: C.green }}>🏔️ الأرض</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>عندها {tableCount} كارت (تفنيد عشوائي)</p>
                </div>
                <span className="text-xs font-black px-2 py-1 rounded-lg"
                  style={{ background: `${C.green}25`, color: C.green }}>
                  ← هياخد {Math.min(amount, Math.max(0, tableCount - 1))}
                </span>
              </motion.button>

              {eligiblePlayers.map(p => {
                const willGet = Math.min(amount, p.handCount);
                return (
                  <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onRequestBorrow(selectedLoan.id, p.id)}
                    className="w-full rounded-xl p-3 text-right flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${C.purple}60` }}>
                    <div>
                      <p className="font-black">{p.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>عنده {p.handCount} كارت</p>
                    </div>
                    <span className="text-xs font-black px-2 py-1 rounded-lg"
                      style={{ background: `${C.purple}25`, color: C.purple }}>
                      ← هياخد {willGet}
                    </span>
                  </motion.button>
                );
              })}

              {eligiblePlayers.length === 0 && tableCount === 0 && (
                <p className="text-center py-4 text-sm" style={{ color: C.textMuted }}>مفيش حد تقدر تستلف منه</p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// 🎯 BorrowRequestPopup
// =====================================================
const BorrowRequestPopup = ({ request, onRespond }) => {
  if (!request) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[97] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl p-6 text-center"
        style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.amber}80` }}>
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-5xl mb-4">💰</motion.div>
        <h3 className="text-xl font-black mb-2" style={{ color: C.amber }}>طلب استلاف</h3>
        <p className="text-sm mb-6" style={{ color: C.text }}>
          <span className="font-black" style={{ color: C.purple }}>{request.borrowerName}</span>
          {' '}عايز يستلف منك{' '}
          <span className="font-black" style={{ color: C.amber }}>{request.amount}</span>
          {' '}كارت
        </p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onRespond(request.requestId, true)}
            className="rounded-xl py-3 font-black text-white"
            style={{ background: `linear-gradient(135deg, ${C.green}50, ${C.green}25)`, border: `1.5px solid ${C.green}` }}>
            ✓ موافق
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onRespond(request.requestId, false)}
            className="rounded-xl py-3 font-black text-white"
            style={{ background: `linear-gradient(135deg, ${C.red}50, ${C.red}25)`, border: `1.5px solid ${C.red}` }}>
            ✖ رفض
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// 🎉 CapturePopup — لما حد ياخد الأرض
// =====================================================
const CapturePopup = ({ event }) => (
  <AnimatePresence>
    {event && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[96] flex items-center justify-center pointer-events-none"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="rounded-3xl px-12 py-10 text-center"
          style={{
            background: `linear-gradient(135deg, ${C.green}40, ${C.green}10)`,
            border: `3px solid ${C.green}`,
            boxShadow: `0 0 80px ${C.green}, 0 0 120px ${C.green}80`,
          }}>
          <motion.div className="text-8xl mb-4"
            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}>
            🎉
          </motion.div>
          <motion.h2 className="text-4xl font-black mb-2 text-white"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
            {event.playerName}
          </motion.h2>
          <motion.p className="text-2xl font-black mb-1"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
            style={{ color: C.green }}>
            خد الأرض! 🔥
          </motion.p>
          <motion.p className="text-base font-bold"
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ color: C.textDim }}>
            ({event.count} كارت)
          </motion.p>
          <motion.p className="text-xs mt-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ color: C.textMuted }}>
            الكارت طابق اللي على الأرض
          </motion.p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 🎮 Main Component
// =====================================================
export default function Bank({ socket, roomCode, playerId, playerName, isAdmin = false, onExit, players: roomPlayers = [] }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showBorrow, setShowBorrow] = useState(false);
  const [borrowWaiting, setBorrowWaiting] = useState(false);
  const [waitingTargetName, setWaitingTargetName] = useState('');
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [lastBorrowResult, setLastBorrowResult] = useState(null);
  const [showModes, setShowModes] = useState(false);
  const [captureEvent, setCaptureEvent] = useState(null);
  const prevStateRef = React.useRef(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const onState = (s) => {
      // ✅ كشف capture
      const prev = prevStateRef.current;
      if (prev && prev.tableCards && prev.tableCards.length > 0 && s.tableCards.length === 0) {
        const lastTurn = prev.currentTurn;
        const capturer = prev.players?.find(p => p.id === lastTurn);
        if (capturer) {
          // نعرض الـ popup لمدة 2.5 ثانية
          setCaptureEvent({ playerName: capturer.name, count: prev.tableCards.length });
          setTimeout(() => setCaptureEvent(null), 2500);
        }
      }
      prevStateRef.current = s;
      setState(s);
    };

    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3500);
    };
    const onBorrowReq = (req) => setIncomingRequest(req);
    const onBorrowRes = (res) => {
      setBorrowWaiting(false);
      setLastBorrowResult(res);
      if (res.status === 'accepted') setShowBorrow(false);
      setTimeout(() => setLastBorrowResult(null), 3500);
    };
    // ✅ استقبال حدث الـ capture (بس للـ popup نفسه)
    const onTableCaptured = (data) => {
      setCaptureEvent({ playerName: data.playerName, count: data.count });
      setTimeout(() => setCaptureEvent(null), 2500);
    };

    socket.on('bank_state', onState);
    socket.on('bank_error', onError);
    socket.on('bank_borrow_request', onBorrowReq);
    socket.on('bank_borrow_response', onBorrowRes);
    socket.on('bank_table_captured', onTableCaptured);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('bank_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('bank_state', onState);
      socket.off('bank_error', onError);
      socket.off('bank_borrow_request', onBorrowReq);
      socket.off('bank_borrow_response', onBorrowRes);
      socket.off('bank_table_captured', onTableCaptured);
      socket.emit('bank_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // ✅ الأدمن يبعت ترتيب اللاعبين من الغرفة الأصلية
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!roomPlayers || roomPlayers.length === 0) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const playerIds = roomPlayers.map(p => p.id);
    
    const t1 = setTimeout(() => socket.emit('bank_set_order', { roomCode, playerIds }), 300);
    const t2 = setTimeout(() => socket.emit('bank_set_order', { roomCode, playerIds }), 1000);
    const t3 = setTimeout(() => socket.emit('bank_set_order', { roomCode, playerIds }), 2500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, roomPlayers]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.purple, borderRightColor: C.amber }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const { me, phase, isAdmin: iAmAdmin, players } = state;
  const myTurn = me?.isTurn;
  const iAmOut = me?.isOut;
  const mustBorrow = myTurn && me && me.hand.length === 0 && me.loanCards.length > 0 && !iAmOut;
  const canPlay = myTurn && me && me.hand.length > 0;
  const others = (players || []).filter(p => !p.isMe);
  const topCardId = state.tableCards.length > 0 ? state.tableCards[state.tableCards.length - 1].id : null;

  // =====================================================
  // Renderers
  // =====================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', backdropFilter: 'blur(16px)', border: `1.5px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <span>←</span><span>خروج</span>
          </button>

            {/* ✅ زرار القواعد — بس في اللوبي */}
            {phase === 'waiting' && (
              <motion.button
                onClick={() => setShowRules(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${C.blue}40, ${C.blue}15)`,
                  border: `2px solid ${C.blue}`,
                  color: 'white',
                  boxShadow: `0 0 20px -5px ${C.blue}`,
                }}>
                <span>📜</span>
                <span className="hidden sm:inline">القواعد</span>
              </motion.button>
            )}


          <motion.button onClick={() => setShowModes(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
            style={{ background: `${C.purple}15`, border: `1px solid ${C.purple}40`, color: C.purple }}>
            <span>🎮</span><span className="hidden sm:inline">الأطوار</span>
          </motion.button>
          <span className="rounded-xl px-3 py-2 text-sm font-black flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${C.amber}40, ${C.amber}15)`,
              border: `2px solid ${C.amber}`,
              color: 'white',
              boxShadow: `0 0 20px -5px ${C.amber}`,
            }}>
            🏦 بنك
          </span>
        </div>
        <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الأرض</p>
          <p className="text-sm font-black text-white">
            {state.tableCards.length}
            {state.deckMultiplier === 2 && (
              <span className="text-[9px] ml-1 px-1 rounded" style={{ background: `${C.purple}30`, color: C.purple }}>
                ×2
              </span>
            )}
          </p>
        </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
            <p className="text-sm font-black" style={{ color: C.amber }}>{state.currentTurnName || '—'}</p>
          </div>
        </div>
        <div className="text-xs font-mono hidden sm:block" style={{ color: C.textMuted }}>{roomCode}</div>
      </div>
    </div>
  );

  const renderAdminControls = () => (
    <div className="mt-6 rounded-2xl p-4 sm:p-5"
      style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))', border: `1.5px solid ${C.purple}40` }}>
      <h3 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: C.purple }}>
        <span>🎩</span><span>لوحة الأدمن</span>
      </h3>

      {/* ✅ اختيار حجم الديل */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
          حجم الديل
        </p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => emit('bank_set_deck_multiplier', { multiplier: 1 })}
            disabled={state.phase !== 'waiting'}
            whileHover={state.phase === 'waiting' ? { scale: 1.02 } : {}}
            whileTap={state.phase === 'waiting' ? { scale: 0.98 } : {}}
            className="rounded-xl py-3 px-3 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: state.deckMultiplier === 1
                ? `linear-gradient(135deg, ${C.green}40, ${C.green}15)`
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${state.deckMultiplier === 1 ? C.green : C.border}`,
              color: state.deckMultiplier === 1 ? 'white' : C.textDim,
              boxShadow: state.deckMultiplier === 1 ? `0 0 20px -8px ${C.green}` : 'none',
            }}
          >
            <span className="text-lg">🃏</span>
            <span>عادي (52)</span>
            {state.deckMultiplier === 1 && <span className="text-xs">✓</span>}
          </motion.button>

          <motion.button
            onClick={() => emit('bank_set_deck_multiplier', { multiplier: 2 })}
            disabled={state.phase !== 'waiting'}
            whileHover={state.phase === 'waiting' ? { scale: 1.02 } : {}}
            whileTap={state.phase === 'waiting' ? { scale: 0.98 } : {}}
            className="rounded-xl py-3 px-3 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: state.deckMultiplier === 2
                ? `linear-gradient(135deg, ${C.purple}40, ${C.purple}15)`
                : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${state.deckMultiplier === 2 ? C.purple : C.border}`,
              color: state.deckMultiplier === 2 ? 'white' : C.textDim,
              boxShadow: state.deckMultiplier === 2 ? `0 0 20px -8px ${C.purple}` : 'none',
            }}
          >
            <span className="text-lg">🎴</span>
            <span>دوبل (104)</span>
            {state.deckMultiplier === 2 && <span className="text-xs">✓</span>}
          </motion.button>
        </div>
        {state.phase !== 'waiting' && (
          <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>
            💡 لازم تعمل Reset الأول لو عايز تغير الحجم
          </p>
        )}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={state.dealt}
          onClick={() => emit('bank_start')}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
          <span className="text-2xl">🎬</span><span>ابدأ اللعب ووزّع</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={phase !== 'playing'}
          onClick={() => { if (window.confirm('إنهاء اللعبة؟')) emit('bank_end_game'); }}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.amber}30, ${C.amber}15)`, border: `1.5px solid ${C.amber}60`, color: C.amber }}>
          <span className="text-2xl">🏁</span><span>إنهاء اللعبة</span>
        </motion.button>
      </div>
      <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="text-xs" style={{ color: C.textDim }}>
          عدد اللاعبين: <span className="font-black text-white">{state.players.length}</span>
        </div>
        {phase !== 'waiting' && (
          <button onClick={() => { if (window.confirm('إعادة تعيين؟')) emit('bank_reset'); }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}>
            🔄 إعادة تعيين
          </button>
        )}
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="mt-6 rounded-2xl p-4"
      style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))', border: `1.5px solid ${C.border}` }}>
      <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.textDim }}>
        <span>👥</span><span>اللاعبين ({state.players.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {state.players.map(p => (
          <div key={p.id} className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
            style={{
              background: p.isMe ? `${C.purple}25` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${p.isMe ? C.purple + '60' : C.border}`,
              color: p.isMe ? C.purple : C.text,
            }}>
            <span>{p.name}</span>
            {p.isMe && <span className="text-[10px]">(أنت)</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTurnBanner = () => {
    if (!myTurn && !state.currentTurnName) return null;
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: myTurn ? `linear-gradient(135deg, ${C.green}30, ${C.green}10)` : `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`,
          border: `1.5px solid ${myTurn ? C.green : C.amber}`,
          boxShadow: myTurn ? `0 0 30px -8px ${C.green}` : `0 0 20px -8px ${C.amber}`,
        }}>
        <div className="flex items-center gap-3">
          <motion.div className="w-3 h-3 rounded-full shrink-0"
            style={{ background: myTurn ? C.green : C.amber, boxShadow: `0 0 12px ${myTurn ? C.green : C.amber}` }}
            animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <div>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: myTurn ? C.green : C.amber }}>
              {myTurn ? (iAmOut ? 'أنت خارج' : 'دورك الآن') : 'دور'}
            </p>
            <p className="text-xl font-black text-white">
              {myTurn ? (iAmOut ? '😢 خارج' : '🎯 العب!') : state.currentTurnName}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderOpponents = () => {
    if (others.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: C.textMuted }}>الخصوم</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {others.map(p => (
            <motion.div key={p.id}
              className="shrink-0 rounded-xl p-2 flex flex-col items-center gap-1 min-w-[120px]"
              style={{
                background: p.isTurn ? `linear-gradient(145deg, ${C.amber}25, ${C.amber}08)` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${p.isTurn ? C.amber + '80' : p.isOut ? C.red + '40' : C.border}`,
                opacity: p.isOut ? 0.5 : 1,
              }}>
              <p className="text-xs font-black truncate max-w-full" style={{ color: p.isTurn ? C.amber : 'white' }}>
                {p.isTurn && '🎯 '}{p.name}
              </p>
              {p.isOut ? (
                <span className="text-[10px] font-black px-2 py-1 rounded"
                  style={{ background: `${C.red}25`, color: C.red }}>خارج</span>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-black"
                    style={{ background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}50` }}>
                    🃏 {p.handCount}
                  </span>
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-black"
                    style={{ background: `${C.amber}20`, color: C.amber, border: `1px solid ${C.amber}50` }}>
                    💰 {p.loanCount}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // =====================================================
  // 🃏 Table — الكروت متراكبة فوق بعض
  // =====================================================
  const renderTable = () => {
    const count = state.tableCards.length;
    const overlap = count > 10 ? 22 : count > 6 ? 28 : 34;
    const cardW = 78;
    const totalW = cardW + (count - 1) * overlap;
    const containerW = Math.max(totalW + 20, 200);

    return (
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: C.textMuted }}>
          الأرض ({count}) {topCardId && <span style={{ color: C.green }}>— آخر كارت مميز</span>}
        </p>
        <div className="rounded-2xl p-4 flex justify-center items-center overflow-x-auto"
          style={{
            background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(0,0,0,0.25))',
            border: `1.5px solid ${C.green}40`,
            minHeight: 170,
          }}>
          {count === 0 ? (
            <p className="text-sm" style={{ color: C.textMuted }}>الأرض فاضية</p>
          ) : (
            <div style={{ position: 'relative', width: containerW, height: 150 }}>
              {state.tableCards.map((card, idx) => {
                const isTop = idx === count - 1;
                return (
                  <motion.div key={card.id} layout
                    initial={{ scale: 0.4, opacity: 0, y: -40 }}
                    animate={{ scale: 1, opacity: 1, y: 0, x: idx * overlap }}
                    transition={{ type: 'spring', stiffness: 220, damping: 20, delay: Math.min(idx * 0.02, 0.3) }}
                    style={{
                      position: 'absolute',
                      top: isTop ? 0 : 6,
                      left: 0,
                      zIndex: idx + 1,
                    }}>
                    <PlayingCard card={card} size="md" glowing={card.id === topCardId} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHand = () => {
    if (!me) return null;
    const grouped = { Q: 0, K: 0, J: 0 };
    me.loanCards.forEach(c => { grouped[c.rank] = (grouped[c.rank] || 0) + 1; });

    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1 flex items-center justify-between" style={{ color: C.textMuted }}>
          <span>كروتك المقلوبة ({me.hand.length})</span>
          {mustBorrow && (
            <motion.span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${C.amber}25`, color: C.amber, border: `1px solid ${C.amber}60` }}
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}>
              💰 لازم تستلف
            </motion.span>
          )}
        </p>

        <div
          className="rounded-2xl p-4"
          style={{
            background: mustBorrow ? 'linear-gradient(145deg, rgba(245,158,11,0.1), rgba(0,0,0,0.25))'
                                   : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
            border: `1.5px solid ${mustBorrow ? C.amber + '60' : C.border}`,
            minHeight: 200,
            overflow: 'hidden',
          }}>
          {me.hand.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>
              {iAmOut ? 'أنت خارج اللعبة' : 'إيدك فاضية — استلف'}
            </p>
          ) : (
            <div
              className="flex justify-center items-center"
              style={{
                position: 'relative',
                minHeight: 180,
                paddingRight: Math.max(0, (me.hand.length - 1) * 35) / 2 + 'px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: me.hand.length > 0
                    ? 118 + (me.hand.length - 1) * 35
                    : 118,
                  height: 166,
                  transform: `translateX(${((me.hand.length - 1) * 35) / 2}px)`,
                }}
              >
                {me.hand.map((card, idx) => {
                  // ✅ الترتيب من اليمين للشمال (RTL) — أول كارت على اليمين
                  const xPos = (me.hand.length - 1 - idx) * 35;
                  // ✅ بس الكارت اللي على الوش (آخر واحد في المصفوفة) هو اللي ينفع يتداس عليه
                  const isTopCard = idx === me.hand.length - 1;
                  const canClickThis = canPlay && isTopCard;

                  return (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, x: xPos }}
                      whileHover={canClickThis ? { y: -14, zIndex: 999 } : {}}
                      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: idx * 0.03 }}
                      onClick={() => { if (canClickThis) emit('bank_play_card', { cardId: card.id }); }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: idx + 1,
                        cursor: canClickThis ? 'pointer' : 'default',
                      }}
                    >
                      <PlayingCard faceDown size="xl" disabled={!canClickThis} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl p-3 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${C.border}` }}>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: C.amber }}>💰 كروت الاستلاف</p>
              <div className="flex gap-2 mt-1 text-sm font-black">
                {['Q', 'K', 'J'].map(r => (
                  <span key={r} style={{ color: grouped[r] > 0 ? 'white' : C.textMuted }}>
                    {LOAN_LABEL[r]}: {grouped[r] || 0}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {mustBorrow && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowBorrow(true)}
              className="rounded-xl p-3 font-black text-base flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${C.amber}50, ${C.amber}25)`, border: `1.5px solid ${C.amber}`, color: 'white', boxShadow: `0 0 30px -8px ${C.amber}` }}>
              <span className="text-xl">💰</span><span>استلف</span>
            </motion.button>
          )}
          {canPlay && !mustBorrow && (
            <div className="rounded-xl p-3 flex items-center justify-center"
              style={{ background: `${C.green}15`, border: `1.5px solid ${C.green}40` }}>
              <p className="text-xs font-black" style={{ color: C.green }}>اضغط على أي كارت للعب</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGameEnd = () => {
    const sorted = Object.entries(state.scores).map(([id, s]) => ({ id, ...s })).sort((a, b) => b.total - a.total);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <motion.div className="text-7xl mb-4 inline-block"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            🏆
          </motion.div>
          <h2 className="text-3xl font-black mb-2">
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              خلصت اللعبة!
            </span>
          </h2>
          <p className="text-sm" style={{ color: C.textDim }}>الترتيب النهائي (عدد الكروت)</p>
        </div>
        <div className="space-y-2">
          {sorted.map((s, i) => {
            const isMe = s.id === me?.id;
            const isWinner = i === 0;
            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isWinner ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`
                            : isMe ? `${C.purple}15` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isWinner ? C.amber + '80' : isMe ? C.purple + '60' : C.border}`,
                }}>
                <span className="text-2xl shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white truncate">
                    {s.name} {isMe && <span className="text-[10px]" style={{ color: C.purple }}>(أنت)</span>}
                  </p>
                </div>
                <div className="text-2xl font-black shrink-0" style={{ color: isWinner ? C.amber : 'white' }}>{s.total}</div>
              </motion.div>
            );
          })}
        </div>
        {iAmAdmin && (
          <button onClick={() => emit('bank_reset')}
            className="w-full mt-6 rounded-xl py-4 font-black text-lg"
            style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}20)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
            🔄 العب تاني
          </button>
        )}
      </motion.div>
    );
  };

  // =====================================================
  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050510]" />
        <motion.div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)' }}
          animate={{ x: [0, 60, 0], y: [0, 50, 0] }} transition={{ duration: 24, repeat: Infinity }} />
        <motion.div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 65%)' }}
          animate={{ x: [0, -60, 0], y: [0, -50, 0] }} transition={{ duration: 28, repeat: Infinity }} />
      </div>

      {renderHUD()}

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center py-6">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-3">🏦</motion.div>
                <h2 className="text-3xl font-black mb-1">
                  <span style={{ background: 'linear-gradient(135deg, #a855f7, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    بنك
                  </span>
                </h2>
                <p className="text-sm" style={{ color: C.textDim }}>الأكثر ورق يفوز</p>
              </div>
              {iAmAdmin && renderAdminControls()}
              {renderLobby()}
              {!iAmAdmin && <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>}
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderTurnBanner()}
              {renderOpponents()}
              {renderTable()}
              {renderHand()}
            </motion.div>
          )}

          {phase === 'gameEnd' && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderGameEnd()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popups */}
      <ModesModal
        open={showModes}
        onClose={() => setShowModes(false)}
        currentMode="bank"
        onSelect={(mode) => {
          socket.emit('kotshina_switch_mode', { roomCode, mode, fromMode: 'bank' });
        }}
      />

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="bank"
      />

      <BorrowPopup
        open={showBorrow}
        onClose={() => !borrowWaiting && setShowBorrow(false)}
        me={me} players={players} tableCount={state.tableCards.length}
        waiting={borrowWaiting} waitingTargetName={waitingTargetName}
        onBorrowFromTable={(loanCardId) => {
          emit('bank_borrow_from_table', { loanCardId });
          setShowBorrow(false);
        }}
        onRequestBorrow={(loanCardId, targetId) => {
          const target = players.find(p => p.id === targetId);
          setWaitingTargetName(target?.name || '');
          setBorrowWaiting(true);
          emit('bank_request_borrow', { loanCardId, targetId });
        }}
      />

      <BorrowRequestPopup
        request={incomingRequest}
        onRespond={(requestId, accept) => {
          emit('bank_respond_borrow', { requestId, accept });
          setIncomingRequest(null);
        }}
      />

      <CapturePopup event={captureEvent} />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${C.red}, ${C.red}cc)`, color: 'white' }}>
            ⚠️ {error}
          </motion.div>
        )}
        {lastBorrowResult && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl font-bold text-sm"
            style={{
              background: lastBorrowResult.status === 'accepted'
                ? `linear-gradient(135deg, ${C.green}, ${C.green}cc)`
                : `linear-gradient(135deg, ${C.amber}, ${C.amber}cc)`,
              color: 'white',
            }}>
            {lastBorrowResult.status === 'accepted'
              ? `✅ خدت ${lastBorrowResult.amount} كارت من ${lastBorrowResult.fromPlayerName}`
              : `❌ ${lastBorrowResult.fromPlayerName} رفض الاستلاف`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}