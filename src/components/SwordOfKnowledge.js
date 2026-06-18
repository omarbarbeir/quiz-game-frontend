import React, { useState, useEffect, useRef } from 'react';
import { FaShip, FaClock, FaTrophy } from 'react-icons/fa';
import swordOfKnowledgeQuestions from '../data/swordOfKnowledgeQuestions';

const playerColors = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#06b6d4', '#84cc16', '#d946ef', '#f43f5e',
];

const continentsData = [
  {
    id: 'africa', name: 'أفريقيا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'africa1', name: 'مصر',            cx: 30,  cy: 30 },
      { id: 'africa2', name: 'نيجيريا',        cx: 170, cy: 30 },
      { id: 'africa3', name: 'جنوب أفريقيا',   cx: 170, cy: 170 },
      { id: 'africa4', name: 'تونس',          cx: 30,  cy: 170 },
      { id: 'africa5', name: 'الجزائر',        cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'asia', name: 'آسيا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'asia1', name: 'السعودية', cx: 30,  cy: 30 },
      { id: 'asia2', name: 'الهند',     cx: 170, cy: 30 },
      { id: 'asia3', name: 'اليابان',   cx: 170, cy: 170 },
      { id: 'asia4', name: 'الصين',     cx: 30,  cy: 170 },
      { id: 'asia5', name: 'تايلاند',     cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'europe', name: 'أوروبا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'europe1', name: 'فرنسا',    cx: 30,  cy: 30 },
      { id: 'europe2', name: 'ألمانيا',  cx: 170, cy: 30 },
      { id: 'europe3', name: 'إيطاليا',  cx: 170, cy: 170 },
      { id: 'europe4', name: 'إسبانيا',  cx: 30,  cy: 170 },
      { id: 'europe5', name: 'البرتغال', cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'americas', name: 'الأمريكيتين',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'americas1', name: 'أمريكا', cx: 30,  cy: 30 },
      { id: 'americas2', name: 'البرازيل',        cx: 170, cy: 30 },
      { id: 'americas3', name: 'كندا',            cx: 170, cy: 170 },
      { id: 'americas4', name: 'الأرجنتين',       cx: 30,  cy: 170 },
      { id: 'americas5', name: 'المكسيك',         cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'australia', name: 'أستراليا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'aus1', name: 'سيدني',      cx: 30,  cy: 30 },
      { id: 'aus2', name: 'ملبورن',     cx: 170, cy: 30 },
      { id: 'aus3', name: 'بريزبن',     cx: 170, cy: 170 },
      { id: 'aus4', name: 'برث',        cx: 30,  cy: 170 },
      { id: 'aus5', name: 'كانبيرا',     cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'middleeast', name: 'الشرق الأوسط',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'me1', name: 'الإمارات',    cx: 30,  cy: 30 },
      { id: 'me2', name: 'قطر',        cx: 170, cy: 30 },
      { id: 'me3', name: 'الكويت',     cx: 170, cy: 170 },
      { id: 'me4', name: 'عُمان',      cx: 30,  cy: 170 },
      { id: 'me5', name: 'البحرين',    cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'northasia', name: 'شمال آسيا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'na1', name: 'روسيا',      cx: 30,  cy: 30 },
      { id: 'na2', name: 'كازاخستان',  cx: 170, cy: 30 },
      { id: 'na3', name: 'منغوليا',    cx: 170, cy: 170 },
      { id: 'na4', name: 'كوريا',      cx: 30,  cy: 170 },
      { id: 'na5', name: 'تركيا',    cx: 30,  cy: 30 },
    ],
  },
  {
    id: 'southasia', name: 'جنوب آسيا',
    base: { cx: 100, cy: 100 },
    regions: [
      { id: 'sa1', name: 'باكستان',    cx: 30,  cy: 30 },
      { id: 'sa2', name: 'بنغلاديش',   cx: 170, cy: 30 },
      { id: 'sa3', name: 'سريلانكا',   cx: 170, cy: 170 },
      { id: 'sa4', name: 'نيبال',      cx: 30,  cy: 170 },
      { id: 'sa5', name: 'أفغانستان',    cx: 30,  cy: 30 },
    ],
  },
];

const SwordOfKnowledge = ({ socket, roomCode, currentPlayer, isAdmin, onExit }) => {
  const [gameState, setGameState] = useState(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timer, setTimer] = useState(20);
  const [duelQuestion, setDuelQuestion] = useState(null);
  const [duelScores, setDuelScores] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [showClaimingMsg, setShowClaimingMsg] = useState(false);
  const [showAttackingMsg, setShowAttackingMsg] = useState(false);
  const [attackingMsgVisible, setAttackingMsgVisible] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showClaimMsg, setShowClaimMsg] = useState(null);
  const [showDuelMsg, setShowDuelMsg] = useState(null);
  const [showAttackStageModal, setShowAttackStageModal] = useState(false);
  const attackStageModalShown = useRef(false);
  const [duelRoundResult, setDuelRoundResult] = useState(null);

  const claimingMsgShown = useRef(false);
  const prevPhaseRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit('sok_init', { roomCode });

    socket.on('sok_state', (state) => {
      // One‑time claiming message
      if (state.phase === 'claiming' && !claimingMsgShown.current && !showClaimingMsg) {
        claimingMsgShown.current = true;
        setShowClaimingMsg(true);
        setTimeout(() => setShowClaimingMsg(false), 5000);
      }
      // Attacking message – only when phase actually changes to attacking
      if (prevPhaseRef.current !== 'attacking' && state.phase === 'attacking') {
        setAttackingMsgVisible(true);
        setTimeout(() => setAttackingMsgVisible(false), 5000);
      }
      prevPhaseRef.current = state.phase;
      setGameState(state);
      setDuelQuestion(null);
    });

    socket.on('sok_question', (q) => {
      setCurrentQuestion(q);
      setTimer(20);
      setHasAnswered(false);
      setMyAnswer('');
      setResults(null);
      setLastQuestion(null);
    });

    socket.on('sok_clear_question', () => setCurrentQuestion(null));

    socket.on('sok_duel_question', (q) => {
      setDuelQuestion(q);
      setCurrentQuestion(null);
      setTimer(20);
      setHasAnswered(false);
      setMyAnswer('');
    });

    socket.on('sok_duel_status', (s) => setDuelScores(s.scores));
    socket.on('sok_duel_round_result', (data) => {
      setDuelScores(data.scores);
      // Find winner name
      let winnerName = null;
      if (data.winner) {
        const winnerPlayer = gameState?.players.find(p => p.id === data.winner);
        winnerName = winnerPlayer?.name;
      }
      setDuelRoundResult({
        round: data.round,
        correctAnswer: data.correctAnswer,
        winnerName: winnerName,
      });
      // Auto-hide after 4 seconds
      setTimeout(() => setDuelRoundResult(null), 4000);
    });
    socket.on('sok_game_over', (d) => alert(`اللاعب ${d.name} فاز!`));

    // Attacker provides question for subsequent duel rounds
    socket.on('sok_request_duel_question', () => {
      const qs = swordOfKnowledgeQuestions;
      if (!qs?.length) return;
      socket.emit('sok_provide_duel_question', { roomCode, question: qs[Math.floor(Math.random() * qs.length)] });
    });

    socket.on('sok_results', (res) => {
      setResults(res);
      setLastQuestion(currentQuestion);
      setTimeout(() => {
        setResults(null);
        setLastQuestion(null);
        // Show attacking message if it was pending
        if (showAttackingMsg) {
          setAttackingMsgVisible(true);
          setTimeout(() => {
            setAttackingMsgVisible(false);
            setShowAttackingMsg(false);
          }, 5000);
        }
      }, 10000);
    });

    // Claim announcement
    socket.on('sok_claim_start', (data) => {
      setShowClaimMsg(data);
      setTimeout(() => setShowClaimMsg(null), 5000);
    });

    // Duel announcement
    socket.on('sok_duel_start', (data) => {
      setShowDuelMsg(data);
      setTimeout(() => setShowDuelMsg(null), 5000);
    });

    socket.on('sok_stage_changed', ({ stage }) => {
    if (stage === 'attacking' && !attackStageModalShown.current) {
        attackStageModalShown.current = true;
        // Wait for the results modal to disappear (10 seconds)
        setTimeout(() => {
          setShowAttackStageModal(true);
          setTimeout(() => setShowAttackStageModal(false), 4000);
        }, 10000);
      }
    });

    return () => {
      socket.off('sok_state'); socket.off('sok_question'); socket.off('sok_clear_question');
      socket.off('sok_duel_question'); socket.off('sok_duel_status'); socket.off('sok_duel_round_result');
      socket.off('sok_game_over'); socket.off('sok_request_duel_question'); socket.off('sok_results');
      socket.off('sok_claim_start'); socket.off('sok_duel_start');
    };
  }, [socket, roomCode, currentQuestion, showAttackingMsg]);

  useEffect(() => {
    if (!currentQuestion && !duelQuestion) return;
    if (hasAnswered) return;
    const id = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [currentQuestion, duelQuestion, hasAnswered]);

  const realPlayers = (gameState?.players || []).filter(p => !p.isAdmin);
  const amIEliminated = realPlayers.find(p => p.id === currentPlayer?.id)?.eliminated;
  const myTurn = gameState?.turn === currentPlayer?.id && !isAdmin;
  const getPlayerColor = (id) => realPlayers.find(p => p.id === id)?.color || '#ccc';

  const claimRegion = (continentId, regionId) => {
    if (isAdmin || amIEliminated) return;
    if (gameState?.phase === 'claiming' && !myTurn) return;
    if (gameState?.phase === 'attacking' && !myTurn) return;
    const qs = swordOfKnowledgeQuestions;
    if (!qs?.length) return;
    socket.emit('sok_claim', {
      roomCode, continentId, regionName: regionId,
      playerId: currentPlayer.id,
      question: qs[Math.floor(Math.random() * qs.length)]
    });
  };

  const attackHub = (continentId, regionId) => {
    if (!myTurn || gameState?.phase !== 'attacking') return;
    const qs = swordOfKnowledgeQuestions;
    if (!qs?.length) return;
    socket.emit('sok_attack_hub', {
      roomCode, continentId, regionName: regionId,
      attackerId: currentPlayer.id,
      question: qs[Math.floor(Math.random() * qs.length)]
    });
  };

  const attackBase = (continentId) => {
    if (!myTurn || gameState?.phase !== 'attacking') return;
    const qs = swordOfKnowledgeQuestions;
    if (!qs?.length) return;
    socket.emit('sok_attack_base', {
      roomCode, continentId,
      attackerId: currentPlayer.id,
      question: qs[Math.floor(Math.random() * qs.length)]
    });
  };

  const sendClaimAnswer = () => {
    if (!currentQuestion || hasAnswered || !myAnswer.trim()) return;
    socket.emit('sok_claim_answer', { roomCode, playerId: currentPlayer.id, answer: myAnswer.trim() });
    setHasAnswered(true);
  };

  const sendDuelAnswer = () => {
    if (!duelQuestion || hasAnswered || !myAnswer.trim()) return;
    socket.emit('sok_duel_answer', { roomCode, playerId: currentPlayer.id, answer: myAnswer.trim() });
    setHasAnswered(true);
  };

  if (!gameState) return <div className="text-white text-center p-6">جاري تحميل سيف المعرفة...</div>;

  const { phase, ownership, turn, scores } = gameState;
  const turnPlayer = realPlayers.find(p => p.id === turn);

  const myContinent = continentsData.find(c => ownership[c.id]?.[c.regions[0]?.id] === currentPlayer.id);

  const continentBorders = {};
  continentsData.forEach(cont => {
    const baseRegion = cont.regions[0];
    const baseOwner = ownership[cont.id]?.[baseRegion.id];
    if (!baseOwner) return;
    const surroundingRegions = cont.regions.slice(1, 5);
    const ownsAll = surroundingRegions.every(r => ownership[cont.id]?.[r.id] === baseOwner);
    if (ownsAll) {
      continentBorders[cont.id] = baseOwner;
    }
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-4 sm:p-6 shadow-2xl w-full border border-cyan-500/20">
      {/* Phase announcements */}
      {showClaimingMsg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-10 text-center border-2 border-yellow-500 shadow-2xl animate-scale-in">
            <h2 className="text-4xl font-extrabold text-yellow-400">مرحلة السيطرة</h2>
          </div>
        </div>
      )}

      {attackingMsgVisible && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative p-[3px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-2xl" />
            <div className="relative bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-10 text-center">
              <span className="text-6xl">⚔️</span>
              <h2 className="text-4xl font-extrabold mt-4 text-yellow-400">مرحلة الهجوم</h2>
            </div>
          </div>
        </div>
      )}

      {/* Claim announcement */}
      {showClaimMsg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative p-[3px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 animate-shimmer rounded-2xl" />
            <div className="relative bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-10 text-center">
              <span className="text-5xl">🗺️</span>
              <h2 className="text-3xl font-extrabold mt-4 text-green-400">
                {showClaimMsg.playerName} يحاول السيطرة على
              </h2>
              <p className="text-2xl text-yellow-300 mt-2">{showClaimMsg.regionName}</p>
              <p className="text-lg text-gray-300 mt-1">({showClaimMsg.continentName})</p>
            </div>
          </div>
        </div>
      )}

      {/* Duel announcement */}
      {showDuelMsg && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative p-[3px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-500 to-red-400 animate-shimmer rounded-2xl" />
            <div className="relative bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-10 text-center">
              <span className="text-6xl">⚔️</span>
              <h2 className="text-3xl font-extrabold mt-4 text-red-400">
                {showDuelMsg.attackerName} يهاجم {showDuelMsg.defenderName}
              </h2>
              <p className="text-xl text-yellow-300 mt-2">على {showDuelMsg.regionName}</p>
              <p className="text-lg text-gray-300 mt-1">({showDuelMsg.continentName} – ملك {showDuelMsg.ownerName})</p>
            </div>
          </div>
        </div>
      )}

      {showAttackStageModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-10 text-center border-2 border-cyan-500">
            <span className="text-6xl">⚔️</span>
            <h2 className="text-4xl font-extrabold mt-4 text-yellow-400">مرحلة الهجوم</h2>
            <p className="text-gray-300 mt-2">استعد لمهاجمة خصومك!</p>
          </div>
        </div>
      )}


      {duelRoundResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-8 max-w-md w-full mx-4 text-center border-2 border-cyan-500 shadow-2xl">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">نتيجة الجولة {duelRoundResult.round}</h3>
              {duelRoundResult.winnerName ? (
                <p className="text-xl text-green-400 mb-2">الفائز: {duelRoundResult.winnerName}</p>
              ) : (
                <p className="text-xl text-red-400 mb-2">لا فائز في هذه الجولة</p>
              )}
              <div className="bg-gray-800 rounded-xl p-4 mt-2">
                <p className="text-gray-300 text-sm mb-1">الإجابة الصحيحة:</p>
                <p className="text-white text-lg font-bold">{duelRoundResult.correctAnswer}</p>
              </div>
              <button
                onClick={() => setDuelRoundResult(null)}
                className="mt-6 bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-xl font-bold"
              >
                متابعة
              </button>
            </div>
          </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">🗡️ سيف المعرفة</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setShowRules(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm">
            📜 القواعد
          </button>
          {isAdmin && onExit && <button onClick={onExit} className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-sm font-bold">خروج</button>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 justify-center">
        {realPlayers.map(p => (
          <div key={p.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${p.eliminated ? 'bg-gray-700 border-gray-500 opacity-50' : 'bg-gray-800/70 border-gray-600'}`}>
            <FaShip style={{ color: p.color || '#fff' }} />
            <span className="text-white text-sm">{p.name}</span>
            <span className="text-gray-400 text-xs">({scores?.[p.id] || 0})</span>
            {turn === p.id && !p.eliminated && <span className="text-yellow-400 text-xs">● دورك</span>}
            {gameState?.skippedPlayers?.[p.id] && <span className="text-red-400 text-xs ml-1">⏭️</span>}
            {p.eliminated && <span className="text-red-400 text-xs">💀</span>}
          </div>
        ))}
      </div>

      <div className="text-center text-gray-300 mb-4 text-sm">
        {phase === 'claiming' && <p>🗺️ مرحلة السيطرة – الدور: <span className="font-bold text-white">{turnPlayer?.name}</span></p>}
        {phase === 'attacking' && <p>⚔️ مرحلة الهجوم – الدور: <span className="font-bold text-white">{turnPlayer?.name}</span></p>}
        {phase === 'duel' && <p>⚡ مبارزة بين لاعبين</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {continentsData.map(cont => {
          const baseRegion = cont.regions[0];
          const baseOwner = ownership[cont.id]?.[baseRegion.id];
          const borderOwner = continentBorders[cont.id];
          const borderStyle = borderOwner ? { borderColor: getPlayerColor(borderOwner), borderWidth: '4px' } : {};
          const canAttackBase = myTurn && phase === 'attacking' && borderOwner && borderOwner !== currentPlayer.id &&
            !Object.keys(ownership).some(cid => {
              if (cid === cont.id) return false;
              return Object.values(ownership[cid]).some(owner => owner === baseOwner);
            }) &&
            cont.regions.slice(1, 5).filter(r => ownership[cont.id]?.[r.id] === currentPlayer.id).length >= 3;

          return (
            <div key={cont.id} className={`bg-gray-800/70 rounded-xl p-3 border ${borderOwner ? 'border-4' : 'border-purple-500/20'}`} style={borderStyle}>
              <h3 className="text-lg font-bold text-cyan-300 mb-2 text-center">{cont.name}</h3>
              <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[200px] mx-auto">
                {cont.regions.slice(1, 5).map(r => {
                  const owner = ownership[cont.id]?.[r.id];
                  const lineColor = (owner && baseOwner && owner === baseOwner) ? getPlayerColor(owner) : '#555';
                  return (
                    <line key={`line-${r.id}`} x1={cont.base.cx} y1={cont.base.cy} x2={r.cx} y2={r.cy}
                      stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
                  );
                })}

                <circle cx={cont.base.cx} cy={cont.base.cy} r="37"
                  fill={baseOwner ? getPlayerColor(baseOwner) : '#374151'}
                  stroke={canAttackBase ? '#facc15' : '#4b5563'} strokeWidth="2"
                  className={canAttackBase ? 'cursor-pointer' : ''}
                  onClick={() => { if (canAttackBase) attackBase(cont.id); }} />
                <text x={cont.base.cx} y={cont.base.cy - 8} textAnchor="middle" fill="white" fontSize="14">🏰</text>
                <text x={cont.base.cx} y={cont.base.cy + 12} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{baseRegion.name}</text>

                {cont.regions.slice(1, 5).map(r => {
                  const owner = ownership[cont.id]?.[r.id];
                  const isClaimable = (phase === 'claiming' || phase === 'attacking') && myTurn && !owner;
                  const isAttackable = phase === 'attacking' && myTurn && owner && owner !== currentPlayer.id;
                  return (
                    <g key={r.id}>
                      <circle cx={r.cx} cy={r.cy} r="30"
                        fill={owner ? getPlayerColor(owner) : '#1f2937'}
                        stroke={isClaimable ? '#10b981' : (isAttackable ? '#facc15' : '#4b5563')}
                        strokeWidth={(isClaimable || isAttackable) ? '2' : '1'}
                        strokeDasharray={isClaimable ? '4' : '0'}
                        className={(isClaimable || isAttackable) ? 'cursor-pointer' : ''}
                        onClick={() => {
                          if (isClaimable) claimRegion(cont.id, r.id);
                          else if (isAttackable) attackHub(cont.id, r.id);
                        }} />
                      <text x={r.cx} y={r.cy} dy=".35em" textAnchor="middle" fill="white" fontSize="13">{r.name}</text>
                    </g>
                  );
                })}

                {cont.regions[5] && (
                  (() => {
                    const r = cont.regions[5];
                    const owner = ownership[cont.id]?.[r.id];
                    const isClaimable = (phase === 'claiming' || phase === 'attacking') && myTurn && !owner;
                    const isAttackable = phase === 'attacking' && myTurn && owner && owner !== currentPlayer.id;
                    return (
                      <g key={r.id}>
                        <circle cx={r.cx} cy={r.cy} r="14"
                          fill={owner ? getPlayerColor(owner) : '#1f2937'}
                          stroke={isClaimable ? '#10b981' : (isAttackable ? '#facc15' : '#4b5563')}
                          strokeWidth={(isClaimable || isAttackable) ? '2' : '1'}
                          strokeDasharray={isClaimable ? '4' : '0'}
                          className={(isClaimable || isAttackable) ? 'cursor-pointer' : ''}
                          onClick={() => {
                            if (isClaimable) claimRegion(cont.id, r.id);
                            else if (isAttackable) attackHub(cont.id, r.id);
                          }} />
                        <text x={r.cx} y={r.cy} dy=".35em" textAnchor="middle" fill="white" fontSize="8">{r.name}</text>
                      </g>
                    );
                  })()
                )}
              </svg>
            </div>
          );
        })}
      </div>

      {/* Claim question popup */}
      {(currentQuestion || results) && (phase === 'claiming' || phase === 'attacking') && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 max-w-lg w-full border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className={timer <= 5 ? 'text-red-400' : 'text-cyan-400'} />
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${timer <= 5 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{ width: `${(timer/20)*100}%` }} />
              </div>
              <span className={`font-bold ${timer <= 5 ? 'text-red-400' : 'text-white'}`}>{timer}s</span>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-4 text-center">{(currentQuestion || lastQuestion)?.text}</h3>
            {results && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded-xl">
                <p className="text-green-300 text-center font-bold">الإجابة الصحيحة: {results.correctAnswer}</p>
                {/* {results.correctIndex !== null && lastQuestion?.options && (
                  <div className="mt-2 space-y-1">
                    {lastQuestion.options.map((opt, idx) => (
                      <div key={idx} className={`py-1 px-3 rounded-lg text-sm ${idx === results.correctIndex ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{opt}</div>
                    ))}
                  </div>
                )} */}
                <div className="mt-3 pt-3 border-t border-green-700">
                  <p className="text-green-300 text-sm font-semibold mb-2">إجابات اللاعبين:</p>
                  <div className="space-y-1">
                    {results.answers.map((entry, idx) => {
                      const isCorrect = entry.playerId === results.winner;
                      const displayAnswer = lastQuestion?.type === 'mcq' && lastQuestion?.options
                        ? lastQuestion.options[parseInt(entry.answer, 10)]
                        : entry.answer;
                      return (
                        <div key={idx} className={`flex justify-between items-center py-1 px-2 rounded text-sm ${isCorrect ? 'bg-green-600 text-white' : 'text-gray-300'}`}>
                          <span>{entry.playerName}</span>
                          <span className="font-mono">{displayAnswer}</span>
                          {isCorrect && <FaTrophy className="text-yellow-400 ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {!results && currentQuestion && (
              <>
                {currentQuestion.type === 'numeric' ? (
                  <div className="flex gap-2">
                    <input type="number" value={myAnswer} onChange={e => setMyAnswer(e.target.value)} className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-center text-lg outline-none" disabled={hasAnswered} onKeyDown={e => e.key === 'Enter' && sendClaimAnswer()} />
                    <button onClick={sendClaimAnswer} disabled={hasAnswered || !myAnswer.trim()} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-6 py-3 rounded-xl font-bold disabled:opacity-50 whitespace-nowrap flex-shrink-0">إرسال</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, idx) => (
                      <button key={idx} onClick={() => { if (hasAnswered) return; socket.emit('sok_claim_answer', { roomCode, playerId: currentPlayer.id, answer: String(idx) }); setHasAnswered(true); }} disabled={hasAnswered} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl text-right disabled:opacity-50">{opt}</button>
                    ))}
                  </div>
                )}
                {hasAnswered && <p className="text-green-400 text-center mt-3">✓ تم – بانتظار النتيجة</p>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Duel popup */}
      {duelQuestion && phase === 'duel' && !isAdmin && !amIEliminated && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 max-w-lg w-full border border-red-500/30">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className={timer <= 5 ? 'text-red-400' : 'text-cyan-400'} />
              <div className="flex-1 bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${timer <= 5 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{ width: `${(timer/20)*100}%` }} /></div>
              <span className={`font-bold ${timer <= 5 ? 'text-red-400' : 'text-white'}`}>{timer}s</span>
            </div>
            <h3 className="text-xl font-bold text-yellow-300 mb-4 text-center">{duelQuestion.text}</h3>
            {duelScores && (
              <div className="flex justify-center gap-4 mb-4 text-white">
                <span>⚔️ {realPlayers.find(p => p.id === gameState.duel?.attackerId)?.name}: {duelScores[gameState.duel?.attackerId]}</span>
                <span>🛡️ {realPlayers.find(p => p.id === gameState.duel?.defenderId)?.name}: {duelScores[gameState.duel?.defenderId]}</span>
              </div>
            )}
            {duelQuestion.type === 'numeric' ? (
              <div className="flex gap-2">
                <input type="number" value={myAnswer} onChange={e => setMyAnswer(e.target.value)} className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white text-center text-lg outline-none" disabled={hasAnswered} onKeyDown={e => e.key === 'Enter' && sendDuelAnswer()} />
                <button onClick={sendDuelAnswer} disabled={hasAnswered || !myAnswer.trim()} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 px-6 py-3 rounded-xl font-bold disabled:opacity-50 whitespace-nowrap flex-shrink-0">إرسال</button>
              </div>
            ) : (
              <div className="space-y-2">
                {duelQuestion.options.map((opt, idx) => (
                  <button key={idx} onClick={() => { if (hasAnswered) return; socket.emit('sok_duel_answer', { roomCode, playerId: currentPlayer.id, answer: String(idx) }); setHasAnswered(true); }} disabled={hasAnswered} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl text-right disabled:opacity-50">{opt}</button>
                ))}
              </div>
            )}
            {hasAnswered && <p className="text-green-400 text-center mt-3">✓ تم – بانتظار الخصم</p>}
          </div>
        </div>
      )}

      {phase === 'duel' && (isAdmin || amIEliminated || (currentPlayer.id !== gameState.duel?.attackerId && currentPlayer.id !== gameState.duel?.defenderId)) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-800 rounded-xl p-6 text-center text-white">
            <h3 className="text-xl font-bold">⚡ مبارزة جارية</h3>
            <p>{realPlayers.find(p => p.id === gameState.duel?.attackerId)?.name} vs {realPlayers.find(p => p.id === gameState.duel?.defenderId)?.name}</p>
          </div>
        </div>
      )}

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30 shadow-2xl relative">
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"><FaTrophy className="text-gray-400" /></button>
            <h2 className="text-3xl font-extrabold text-center mb-6"><span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">📜 قواعد لعبة سيف المعرفة</span></h2>
            <div className="space-y-6 text-gray-300 text-right leading-relaxed">
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">🗺️ مرحلة السيطرة (البداية)</h3>
                <p>• تبدأ اللعبة باختيار قاعدة عشوائية لكل لاعب (الدائرة الكبيرة التي تحمل 🏰).</p>
                <p>• الدوائر الأربعة (أو الخمسة) المحيطة بكل قاعدة تبدأ فارغة.</p>
                <p>• في دورك، اضغط على دائرة فارغة لتحاول السيطرة عليها. يظهر سؤال للجميع، وأفضل إجابة (أو الأسرع في الأسئلة الاختيارية) يفوز بالدائرة.</p>
                <p>• إذا أخطأت، يمكن لأي لاعب آخر الفوز بالدائرة.</p>
                <p>• تنتهي مرحلة السيطرة بعد 4 جولات (كل لاعب يلعب 4 مرات) أو عند امتلاء جميع الدوائر.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">⚔️ مرحلة الهجوم</h3>
                <p>• بعد انتهاء مرحلة السيطرة، تبدأ مرحلة الهجوم. يمكن لأي لاعب في دوره مهاجمة دوائر الخصم.</p>
                <p>• اضغط على دائرة يملكها خصم لبدء مبارزة (best‑of‑3). إذا فاز المهاجم يأخذ الدائرة، وإذا فاز المدافع تبقى الدائرة معه.</p>
                <p>• الدوائر الفارغة يمكن السيطرة عليها بنفس طريقة مرحلة السيطرة (سؤال للجميع).</p>
                <p>• إذا حاولت السيطرة على دائرة فارغة وأجبت خطأ، يتم تخطي دورك القادم (⏭️).</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">🏰 مهاجمة القاعدة</h3>
                <p>• لا يمكن مهاجمة قاعدة لاعب إلا بعد:</p>
                <ul className="list-disc list-inside mr-4 mt-1 space-y-1">
                  <li>أن يكون اللاعب المُدافِع لا يملك أي دوائر خارج قارة قاعدته (يجب انتزاع كل الدوائر الأجنبية أولاً).</li>
                  <li>أن تمتلك أنت (المهاجم) ٣ على الأقل من الدوائر الأربعة المحيطة بقاعدة المُدافِع.</li>
                </ul>
                <p>• عند تحقق الشرطين، تظهر القاعدة بإطار أصفر. اضغط عليها لبدء مبارزة (best‑of‑3).</p>
                <p>• إذا فزت بالمبارزة، تنتقل جميع دوائر اللاعب الخاسر (وقاعدته) إليك، ويصبح اللاعب الخاسر مشاهداً (💀) حتى نهاية اللعبة.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">🏆 الفوز</h3>
                <p>• آخر لاعب يبقى دون أن يُقصى هو الفائز.</p>
                <p>• يمكن للمسؤول إعادة تشغيل اللعبة في أي وقت باستخدام زر "إعادة اللعبة".</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">📋 ملاحظات</h3>
                <p>• الأسئلة نوعان: رقمية (الأقرب للإجابة الصحيحة يفوز) واختيار من متعدد (أول إجابة صحيحة تفوز).</p>
                <p>• بعد كل سؤال، تظهر نتيجة السؤال (الإجابة الصحيحة وإجابات اللاعبين) لمدة ١٠ ثوانٍ.</p>
                <p>• الدوائر المحيطة بقاعدتك إذا امتلكتها كلها يظهر حولها إطار بلونك.</p>
              </div>
            </div>
            <button onClick={() => setShowRules(false)} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold text-lg">حسناً، فهمت</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwordOfKnowledge;