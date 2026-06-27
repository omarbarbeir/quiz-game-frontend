import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBox, FaUser, FaMapPin, FaUsers, FaTimes, FaFileMedical, FaRedo } from 'react-icons/fa';

const MafiosaGame = ({ socket, roomCode, playerId, isAdmin }) => {
  const [caseData, setCaseData] = useState(null);
  const [state, setState] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [points, setPoints] = useState(100);
  const [investigationCost, setInvestigationCost] = useState(10);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [messagesBySuspect, setMessagesBySuspect] = useState({});
  const [currentNodeIdBySuspect, setCurrentNodeIdBySuspect] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [accusationPhase, setAccusationPhase] = useState(false);
  const [vote, setVote] = useState({ suspect: '', weapon: '', motive: '' });
  const [solution, setSolution] = useState(null);
  const [investigationOpen, setInvestigationOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [suspectsModalOpen, setSuspectsModalOpen] = useState(false);
  const [investigatingSuspect, setInvestigatingSuspect] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showNewGameOverlay, setShowNewGameOverlay] = useState(false);

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const getSuspectDialogue = (suspectId) => {
    if (!caseData) return null;
    const suspect = caseData.suspects.find(s => s.id === suspectId);
    return suspect ? suspect.dialogue : null;
  };

  const getInitialNode = (suspectId) => {
    const dialogue = getSuspectDialogue(suspectId);
    if (!dialogue || dialogue.length === 0) return null;
    return dialogue.find(d => d.id === 'start') || dialogue[0];
  };

  const showNpcResponse = (suspectId, node) => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (node) {
        setMessagesBySuspect(prev => ({
          ...prev,
          [suspectId]: [...(prev[suspectId] || []), { type: 'npc', text: node.text }]
        }));
        setCurrentNodeIdBySuspect(prev => ({ ...prev, [suspectId]: node.id }));
      }
      setIsTyping(false);
    }, 1500);
  };

  // مسح كل الحالة المحلية تماماً
  const resetLocalState = () => {
    setCaseData(null);
    setState(null);
    setInventory([]);
    setSearchedLocations([]);
    setPoints(100);
    setInvestigationCost(10);
    setSelectedSuspect(null);
    setMessagesBySuspect({});
    setCurrentNodeIdBySuspect({});
    setNotifications([]);
    setAccusationPhase(false);
    setVote({ suspect: '', weapon: '', motive: '' });
    setSolution(null);
    setInvestigationOpen(false);
    setIsTyping(false);
    setSearchModalOpen(false);
    setSearching(false);
    setSuspectsModalOpen(false);
    setInvestigatingSuspect(null);
    setHasVoted(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => {
    // لما السيرفر يبعت إن قضية جديدة بدأت — بيتنادى لكل اللاعيبة
    socket.on('mafiosa_new_game_starting', () => {
      resetLocalState();
      setShowNewGameOverlay(true);
      // الـ overlay بيختفي لما mafiosa_case_data توصل (مش بـ timeout)
    });

    socket.on('mafiosa_case_data', (data) => {
      setShowNewGameOverlay(false); // اخفي الـ overlay لما البيانات الجديدة توصل
      setCaseData(data);
    });

    socket.on('mafiosa_state', (data) => {
      setState(data);
      if (data) {
        setInventory(data.inventory || []);
        setSearchedLocations(data.searchedLocations || []);
        if (data.playerPoints && data.playerPoints[playerId] !== undefined) {
          setPoints(data.playerPoints[playerId]);
        }
      }
    });

    socket.on('mafiosa_inventory_update', ({ inventory }) => {
      setInventory(inventory);
    });

    socket.on('mafiosa_notification', ({ message, type }) => {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message, type, id }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    });

    socket.on('mafiosa_solution', (data) => {
      setSolution(data);
      if (data.finalPoints && data.finalPoints[playerId] !== undefined) {
        setPoints(data.finalPoints[playerId]);
      }
    });

    socket.on('mafiosa_error', ({ message }) => {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message, type: 'error', id }]);
    });

    socket.on('mafiosa_investigation_started', ({ suspectId, points, cost }) => {
      setPoints(points);
      setInvestigationCost(cost);
      setInvestigatingSuspect(null);
    });

    if (roomCode) {
      socket.emit('mafiosa_start', { roomCode });
    }

    return () => {
      socket.off('mafiosa_new_game_starting');
      socket.off('mafiosa_case_data');
      socket.off('mafiosa_state');
      socket.off('mafiosa_inventory_update');
      socket.off('mafiosa_notification');
      socket.off('mafiosa_solution');
      socket.off('mafiosa_error');
      socket.off('mafiosa_investigation_started');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomCode, playerId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesBySuspect, isTyping]);

  // أي لاعب يقدر يطلب قضية جديدة
  const handleNewGame = () => {
    socket.emit('mafiosa_start', { roomCode });
  };

  const startInvestigation = (suspectId) => {
    if (investigatingSuspect) return;
    setInvestigatingSuspect(suspectId);
    socket.emit('mafiosa_start_investigation', { roomCode, suspectId });
    setSelectedSuspect(suspectId);
    if (!messagesBySuspect[suspectId] || messagesBySuspect[suspectId].length === 0) {
      const startNode = getInitialNode(suspectId);
      if (startNode) {
        setMessagesBySuspect(prev => ({
          ...prev,
          [suspectId]: [{ type: 'npc', text: startNode.text }]
        }));
        setCurrentNodeIdBySuspect(prev => ({ ...prev, [suspectId]: startNode.id }));
      }
    }
    setInvestigationOpen(true);
  };

  const closeInvestigation = () => {
    setInvestigationOpen(false);
    setSelectedSuspect(null);
    setInvestigatingSuspect(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };

  const handleChooseOption = (suspectId, option) => {
    if (isTyping) return;
    const currentDialogue = getSuspectDialogue(suspectId);
    if (!currentDialogue) return;
    const currentNodeId = currentNodeIdBySuspect[suspectId];
    const currentNode = currentDialogue.find(d => d.id === currentNodeId);
    if (!currentNode) return;

    setMessagesBySuspect(prev => ({
      ...prev,
      [suspectId]: [...(prev[suspectId] || []), { type: 'player', text: option.text }]
    }));

    if (option.requiredEvidence && !inventory.includes(option.requiredEvidence)) {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message: 'ليس لديك الدليل المطلوب!', type: 'error', id }]);
      return;
    }

    const nextNode = currentDialogue.find(d => d.id === option.nextNodeId);
    if (nextNode) {
      if (nextNode.unlockedBy) {
        socket.emit('mafiosa_confront', { roomCode, evidenceId: nextNode.unlockedBy });
      }
      if (nextNode.reward) {
        const rewardId = nextNode.reward.split(' ').join('_').toLowerCase();
        if (!inventory.includes(rewardId)) {
          socket.emit('mafiosa_add_evidence', { roomCode, evidenceId: rewardId });
        }
      }
      showNpcResponse(suspectId, nextNode);
    } else {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message: 'انتهى الحوار.', type: 'info', id }]);
    }
  };

  const handleSearch = (location) => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setSearchModalOpen(false);
      socket.emit('mafiosa_search', { roomCode, location });
    }, 2000);
  };

  const handleGetAutopsy = () => {
    socket.emit('mafiosa_get_autopsy', { roomCode });
  };

  const handleAccuse = () => {
    setAccusationPhase(true);
    setVote({ suspect: '', weapon: '', motive: '' });
    setHasVoted(false);
  };

  const handleVoteSubmit = () => {
    if (!vote.suspect || !vote.weapon || !vote.motive) return;
    socket.emit('mafiosa_submit_vote', { roomCode, playerId, vote });
    setHasVoted(true);
    // مش بنمسح حاجة هنا — بس بنسجل التصويت
  };

  // ── الـ OVERLAY — بيظهر لكل اللاعيبة لما حد يدوس قضية جديدة ──────────────
  if (showNewGameOverlay) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <style>{`
          @keyframes criminalGlow {
            0%, 100% {
              text-shadow: 0 0 8px #f59e0b, 0 0 24px #f59e0b, 0 0 48px #d97706;
            }
            50% {
              text-shadow: 0 0 16px #fbbf24, 0 0 48px #fbbf24, 0 0 96px #f59e0b, 0 0 140px #d97706;
            }
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          style={{ textAlign: 'center', padding: '2rem' }}
        >
          <p style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: '#fbbf24',
            animation: 'criminalGlow 1.6s ease-in-out infinite',
            letterSpacing: '0.06em',
            margin: 0,
            lineHeight: 1.3,
          }}>
            جاهزين للجريمة
          </p>
          <motion.p
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ color: '#9ca3af', marginTop: '1.5rem', fontSize: '1rem' }}
          >
            ⏳ جاري تحميل القضية الجديدة...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // شاشة التحميل الأولى
  if (!caseData || !state) {
    return <div className="text-center text-gray-300 p-8">جاري تحميل القضية...</div>;
  }

  const currentMessages = selectedSuspect ? messagesBySuspect[selectedSuspect] || [] : [];
  const currentNodeId = selectedSuspect ? currentNodeIdBySuspect[selectedSuspect] : null;

  return (
    <div className="bg-gray-800/70 rounded-xl p-4 border border-cyan-500/20 relative">

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-2 rounded-lg mb-2 ${
              n.type === 'success' ? 'bg-green-600'
              : n.type === 'error' ? 'bg-red-600'
              : 'bg-cyan-600'
            }`}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* النقاط + زرار قضية جديدة — موجودين دايماً من أول لحظة */}
      <div className="bg-gray-900/50 p-2 rounded-lg mb-4 border border-yellow-500/20 flex justify-between flex-wrap gap-2 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-yellow-300 font-bold">نقاطك: {points}</span>
          <span className="text-gray-400 text-xs">تكلفة التحقيق: {investigationCost}</span>
        </div>
        <button
          onClick={handleNewGame}
          className="bg-cyan-700 hover:bg-cyan-600 px-4 py-1.5 rounded-lg font-bold text-white text-sm flex items-center gap-2"
        >
          <FaRedo className="inline" /> قضية جديدة
        </button>
      </div>

      {/* العنوان والوصف */}
      {caseData.title && (
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-amber-500/20">
          <h2 className="text-2xl font-bold text-yellow-300">{caseData.title}</h2>
          <p className="text-gray-300 text-sm mt-1">{caseData.description}</p>
        </div>
      )}

      {/* ── التقرير الطبي الشرعي ── */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes stampAppear {
          0%   { transform: scale(2.5) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(0.92) rotate(4deg);  opacity: 1; }
          80%  { transform: scale(1.04) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg);     opacity: 1; }
        }
        @keyframes typeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes redPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 6px rgba(239,68,68,0.2); }
        }
      `}</style>

      {caseData.autopsy && (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>

          {/* ── حالة: التقرير مدفوع ولم يُفتح بعد ── */}
          {caseData.autopsy.isKey && !inventory.includes('autopsy_report') && (
            <button
              onClick={handleGetAutopsy}
              disabled={state.ap < 1}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: state.ap < 1 ? '1px solid #374151' : '1px dashed #dc2626',
                background: state.ap < 1 ? 'rgba(31,41,55,0.5)' : 'rgba(127,29,29,0.2)',
                color: state.ap < 1 ? '#6b7280' : '#fca5a5',
                fontWeight: 700,
                cursor: state.ap < 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                animation: state.ap >= 1 ? 'redPulse 2s ease-in-out infinite' : 'none',
                fontSize: '0.95rem',
              }}
            >
              <FaFileMedical style={{ fontSize: '1.1rem' }} />
              {state.ap < 1 ? 'لا تتوفر طاقة كافية لطلب التقرير' : `طلب تقرير الطب الشرعي الكامل (−1 AP)`}
            </button>
          )}

          {/* ── حالة: التقرير متاح (مجاني أو تم فتحه) ── */}
          {(!caseData.autopsy.isKey || inventory.includes('autopsy_report')) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                borderRadius: 14,
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'linear-gradient(160deg, rgba(30,10,10,0.95) 0%, rgba(20,5,5,0.98) 100%)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* scanline animation */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, borderRadius: 14,
              }}>
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: '30%',
                  background: 'linear-gradient(to bottom, transparent, rgba(239,68,68,0.04), transparent)',
                  animation: 'scanline 3s linear infinite',
                }} />
              </div>

              {/* header bar */}
              <div style={{
                background: 'linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative', zIndex: 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaFileMedical style={{ color: '#fca5a5', fontSize: '1rem' }} />
                  <span style={{ color: '#fecaca', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                    تقرير الطب الشرعي — سري
                  </span>
                </div>
                <span style={{ color: '#f87171', fontSize: '0.7rem', opacity: 0.8 }}>CONFIDENTIAL</span>
              </div>

              {/* separator dots */}
              <div style={{
                borderTop: '1px dashed rgba(239,68,68,0.25)',
                margin: '0 14px',
                position: 'relative', zIndex: 1,
              }} />

              {/* body */}
              <div style={{ padding: '14px 16px', position: 'relative', zIndex: 1 }}>

                {/* CLASSIFIED stamp */}
                {caseData.autopsy.isKey && (
                  <motion.div
                    initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: -12, opacity: 0.18 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', top: 12, left: 12,
                      border: '3px solid #ef4444',
                      borderRadius: 6,
                      padding: '2px 8px',
                      color: '#ef4444',
                      fontWeight: 900,
                      fontSize: '1.1rem',
                      letterSpacing: '0.15em',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    مُحرَّر
                  </motion.div>
                )}

                {/* text lines — typewriter feel via staggered animation */}
                {caseData.autopsy.text.split('\n').filter(Boolean).map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                    style={{
                      color: line.startsWith('ملاحظة') || line.startsWith('سبب') ? '#fca5a5' : '#d1d5db',
                      fontSize: '0.82rem',
                      lineHeight: 1.75,
                      margin: '0 0 4px 0',
                      borderRight: line.startsWith('ملاحظة') ? '3px solid #ef4444' : 'none',
                      paddingRight: line.startsWith('ملاحظة') ? 8 : 0,
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              {/* bottom bar */}
              <div style={{
                background: 'rgba(127,29,29,0.3)',
                padding: '5px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative', zIndex: 1,
              }}>
                <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>وحدة التحقيق الجنائي</span>
                <span style={{ color: '#6b7280', fontSize: '0.65rem' }}>🔒 وثيقة سرية</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* AP + بحث */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <span className="text-gray-300">
            نقاط الطاقة: <span className="text-cyan-300 font-bold">{state.ap}</span>
          </span>
          <button onClick={() => setInventory(inventory)} className="text-purple-400 hover:text-purple-300">
            <FaBox className="inline mr-1" /> {inventory.length}
          </button>
        </div>
        <button
          onClick={() => setSearchModalOpen(true)}
          disabled={state.ap < 1}
          className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg disabled:opacity-50"
        >
          <FaSearch className="inline mr-1" /> فحص (-1 AP)
        </button>
      </div>

      <button
        onClick={() => setSuspectsModalOpen(true)}
        className="w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg font-bold mb-4"
      >
        <FaUsers className="inline mr-2" /> عرض المشتبه بهم وعلاقتهم
      </button>

      <button
        onClick={() => setInvestigationOpen(true)}
        className="w-full bg-purple-600 hover:bg-purple-500 p-2 rounded-lg font-bold mb-4"
      >
        <FaUser className="inline mr-2" /> تحقيق مع المشتبهين
      </button>

      <button
        onClick={handleAccuse}
        className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg font-bold"
      >
        توجيه اتهام
      </button>

      {/* ── WINNING MODAL — بيظهر لكل اللاعيبة بعد التصويت ── */}
      {solution && (
        <>
          <style>{`
            @keyframes confettiFall {
              0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            @keyframes stampIn {
              0%   { transform: scale(3) rotate(-15deg); opacity: 0; }
              60%  { transform: scale(0.9) rotate(3deg);  opacity: 1; }
              80%  { transform: scale(1.05) rotate(-1deg); }
              100% { transform: scale(1) rotate(0deg);    opacity: 1; }
            }
            @keyframes pulseGold {
              0%, 100% { box-shadow: 0 0 0px #f59e0b,  0 0 0px #f59e0b; }
              50%       { box-shadow: 0 0 30px #f59e0b, 0 0 60px #d97706; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(30px); }
              to   { opacity: 1; transform: translateY(0);    }
            }
            @keyframes badgeGlow {
              0%, 100% { text-shadow: 0 0 6px #fbbf24,  0 0 12px #f59e0b; }
              50%       { text-shadow: 0 0 16px #fbbf24, 0 0 32px #d97706; }
            }
            .confetti-piece {
              position: fixed;
              width: 10px;
              height: 10px;
              top: -20px;
              border-radius: 2px;
              animation: confettiFall linear forwards;
              pointer-events: none;
              z-index: 10000;
            }
          `}</style>

          {/* confetti pieces */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'][i % 6],
                width:  `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay:    `${Math.random() * 2}s`,
              }}
            />
          ))}

          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 60 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.15 }}
              className="relative bg-gray-900 rounded-3xl max-w-md w-full text-center overflow-hidden"
              style={{
                border: '2px solid #f59e0b',
                animation: 'pulseGold 2.5s ease-in-out infinite',
              }}
            >
              {/* top gradient bar */}
              <div style={{
                background: 'linear-gradient(90deg, #92400e, #f59e0b, #92400e)',
                height: '5px',
              }} />

              <div className="p-6 pb-8">

                {/* trophy icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.35 }}
                  style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '0.5rem' }}
                >
                  🏆
                </motion.div>

                {/* headline */}
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: '#fbbf24',
                    animation: 'badgeGlow 2s ease-in-out infinite',
                    marginBottom: '1rem',
                  }}
                >
                  تم حل القضية!
                </motion.h2>

                {/* avatar */}
                {solution.image && (
                  <motion.img
                    src={solution.image}
                    alt="القاتل"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, animation: 'stampIn 0.6s ease forwards' }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                    style={{
                      width: 130, height: 130,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #f59e0b',
                      margin: '0 auto 1rem',
                      display: 'block',
                      boxShadow: '0 0 20px #f59e0b88',
                    }}
                  />
                )}

                {/* case details */}
                {[
                  { label: '🔪 القاتل',  value: solution.culprit, color: '#f87171' },
                  { label: '⚔️ الأداة',  value: solution.weapon,  color: '#fb923c' },
                  { label: '💡 الدافع',  value: solution.motive,  color: '#facc15' },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.12 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      padding: '8px 14px',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{row.label}</span>
                    <span style={{ color: row.color, fontWeight: 700, fontSize: '1rem' }}>{row.value}</span>
                  </motion.div>
                ))}

                {/* winners */}
                {solution.winners && solution.winners.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.05, type: 'spring' }}
                    style={{
                      margin: '1rem 0 0.5rem',
                      padding: '10px 16px',
                      background: 'rgba(16,185,129,0.15)',
                      border: '1px solid #10b981',
                      borderRadius: 12,
                    }}
                  >
                    <p style={{ color: '#6ee7b7', fontWeight: 700, margin: 0 }}>
                      🎉 الفائزون: {solution.winners.join('، ')}
                    </p>
                  </motion.div>
                )}

                {/* my points */}
                {solution.finalPoints && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ color: '#fbbf24', fontWeight: 700, margin: '0.5rem 0 1.2rem', fontSize: '1rem' }}
                  >
                    ⭐ نقاطك النهائية: {solution.finalPoints[playerId] || 0}
                  </motion.div>
                )}

                {/* new game button */}
                <motion.button
                  onClick={handleNewGame}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.35 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #0e7490, #0891b2)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <FaRedo /> قضية جديدة
                </motion.button>
              </div>

              {/* bottom gradient bar */}
              <div style={{
                background: 'linear-gradient(90deg, #92400e, #f59e0b, #92400e)',
                height: '5px',
              }} />
            </motion.div>
          </motion.div>
        </>
      )}

      {/* ── Suspects Modal ── */}
      {suspectsModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] border border-indigo-500/30 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-indigo-300 font-bold text-xl">المشتبه بهم وعلاقتهم بالضحية</h3>
              <button onClick={() => setSuspectsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {caseData.suspects.map(s => (
                <div key={s.id} className="bg-gray-800 p-3 rounded-lg border border-indigo-500/20">
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-gray-300 text-sm">العلاقة: {s.relationship}</p>
                  <p className="text-gray-400 text-xs mt-1">"{s.statement}"</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSuspectsModalOpen(false)}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg font-bold"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Investigation Modal ── */}
      {investigationOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] border border-purple-500/30 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-purple-300 font-bold text-xl">تحقيق مع المشتبهين</h3>
              <button onClick={closeInvestigation} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {!selectedSuspect ? (
              <div className="grid grid-cols-2 gap-2">
                {caseData.suspects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => startInvestigation(s.id)}
                    disabled={investigatingSuspect !== null}
                    className={`bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-white text-right ${
                      investigatingSuspect ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {s.name} ({points >= investigationCost ? investigationCost + ' نقاط' : 'نقاط غير كافية'})
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-96">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => {
                      setSelectedSuspect(null);
                      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                      setIsTyping(false);
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    ← العودة للقائمة
                  </button>
                  <span className="text-purple-300 font-bold">
                    {caseData.suspects.find(s => s.id === selectedSuspect)?.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    العلاقة: {caseData.suspects.find(s => s.id === selectedSuspect)?.relationship}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-gray-800/50 rounded-lg">
                  {currentMessages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: msg.type === 'player' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.type === 'player' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-2 rounded-lg ${
                        msg.type === 'player' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="bg-gray-700 text-gray-200 p-2 rounded-lg flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {currentNodeId && !isTyping && (
                  <div className="mt-2 space-y-1">
                    {(() => {
                      const currentDialogue = getSuspectDialogue(selectedSuspect);
                      if (!currentDialogue) return null;
                      const currentNode = currentDialogue.find(d => d.id === currentNodeId);

                      // لو مفيش node أو options فاضية = نهاية حوار طبيعية
                      if (!currentNode || !currentNode.options || currentNode.options.length === 0) {
                        return (
                          <div className="text-center py-2">
                            <p className="text-gray-500 text-sm mb-2">— انتهى الحوار مع هذا المشتبه به —</p>
                            <button
                              onClick={() => setSelectedSuspect(null)}
                              className="bg-purple-700 hover:bg-purple-600 px-4 py-1.5 rounded-lg text-sm text-white"
                            >
                              العودة لقائمة المشتبهين
                            </button>
                          </div>
                        );
                      }

                      // كل الاختيارات — المحجوبة بدليل + المتاحة
                      const allOptions = currentNode.options;

                      // الاختيارات المتاحة بدون شرط دليل
                      const freeOptions = allOptions.filter(opt => !opt.requiredEvidence);

                      // الاختيارات اللي محتاجة دليل
                      const lockedOptions = allOptions.filter(opt => opt.requiredEvidence);

                      // الاختيارات اللي عندي دليلها فعلاً
                      const unlockedOptions = lockedOptions.filter(opt => inventory.includes(opt.requiredEvidence));

                      // الاختيارات اللي دليلها مش عندي — بنعرضها بشكل مقفول
                      const stillLockedOptions = lockedOptions.filter(opt => !inventory.includes(opt.requiredEvidence));

                      const hasAnyOption = freeOptions.length > 0 || unlockedOptions.length > 0;

                      return (
                        <>
                          {/* الاختيارات المتاحة */}
                          {[...freeOptions, ...unlockedOptions].map((opt, idx) => (
                            <motion.button
                              key={`available-${idx}`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleChooseOption(selectedSuspect, opt)}
                              className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-sm text-right text-white"
                            >
                              {opt.text}
                            </motion.button>
                          ))}

                          {/* الاختيارات المقفولة — بتظهر باهتة مع أيقونة قفل */}
                          {stillLockedOptions.map((opt, idx) => {
                            const evidenceName = caseData?.evidence?.find(e => e.id === opt.requiredEvidence)?.name;
                            return (
                              <div
                                key={`locked-${idx}`}
                                className="w-full bg-gray-800/50 border border-gray-700 p-2 rounded-lg text-sm text-right text-gray-500 flex items-center gap-2 cursor-not-allowed"
                                title={`تحتاج دليل: ${evidenceName || opt.requiredEvidence}`}
                              >
                                <span className="text-gray-600 flex-shrink-0">🔒</span>
                                <span>{opt.text}</span>
                                {evidenceName && (
                                  <span className="text-xs text-gray-600 mr-auto flex-shrink-0">
                                    ({evidenceName})
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {/* لو كل الاختيارات مقفولة */}
                          {!hasAnyOption && stillLockedOptions.length > 0 && (
                            <p className="text-gray-500 text-xs text-center pt-1">
                              ابحث عن أدلة أولاً لفتح المزيد من الأسئلة
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Search Modal ── */}
      {searchModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold text-xl mb-4 text-center">اختر مكان البحث</h3>
            {searching ? (
              <div className="flex flex-col items-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl text-emerald-400"
                >
                  <FaSearch />
                </motion.div>
                <p className="text-gray-300 mt-4">جاري البحث...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {caseData.locations && Object.entries(caseData.locations).map(([key, loc]) => (
                  <button
                    key={key}
                    onClick={() => handleSearch(key)}
                    disabled={searchedLocations.includes(key)}
                    className={`w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-right text-white flex items-center gap-2 ${
                      searchedLocations.includes(key) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FaMapPin /> {loc.name}
                  </button>
                ))}
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg font-bold mt-2"
                >
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Accusation Modal ── */}
      {accusationPhase && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">⚖️ توجيه الاتهام</h2>
              <button onClick={() => setAccusationPhase(false)} className="text-gray-400 hover:text-white">
                <FaTimes size={24} />
              </button>
            </div>

            {hasVoted ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl mb-4"
                >
                  ⏳
                </motion.div>
                <h3 className="text-xl text-green-400 font-bold mb-2">تم تسجيل تصويتك!</h3>
                <p className="text-gray-300">في انتظار باقي المحققين لإنهاء التصويت...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                  value={vote.suspect}
                  onChange={e => setVote({ ...vote, suspect: e.target.value })}
                >
                  <option value="">القاتل</option>
                  {caseData.suspects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <select
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                  value={vote.weapon}
                  onChange={e => setVote({ ...vote, weapon: e.target.value })}
                >
                  <option value="">الأداة</option>
                  <option value="سكين">سكين</option>
                  <option value="سم">سم</option>
                  <option value="خنق">خنق</option>
                </select>
                <select
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                  value={vote.motive}
                  onChange={e => setVote({ ...vote, motive: e.target.value })}
                >
                  <option value="">الدافع</option>
                  <option value="مالي">مالي</option>
                  <option value="غيرة">غيرة</option>
                  <option value="انتقام">انتقام</option>
                </select>
                <button
                  onClick={handleVoteSubmit}
                  disabled={!vote.suspect || !vote.weapon || !vote.motive}
                  className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg font-bold disabled:opacity-50"
                >
                  تأكيد
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MafiosaGame;