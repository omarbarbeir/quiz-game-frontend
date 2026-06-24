import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBox, FaUser, FaClock, FaMapPin, FaUsers, FaTimes, FaStar, FaFileMedical } from 'react-icons/fa';

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
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Helpers
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
      setIsTyping(false);
      if (node) {
        setMessagesBySuspect(prev => ({
          ...prev,
          [suspectId]: [...(prev[suspectId] || []), { type: 'npc', text: node.text }]
        }));
        setCurrentNodeIdBySuspect(prev => ({ ...prev, [suspectId]: node.id }));
      }
    }, 1500);
  };

  // Socket listeners
// Socket listeners with Debug Logs
  useEffect(() => {
    console.log("=== [Mafiosa] Component Mounted ===");
    console.log("RoomCode sent from props:", roomCode);
    console.log("PlayerId sent from props:", playerId);

    socket.on('mafiosa_case_data', (data) => {
      console.log("🎯 [FRONTEND] Received mafiosa_case_data from server:", data);
      setCaseData(data);
    });

    socket.on('mafiosa_state', (data) => {
      console.log("🎯 [FRONTEND] Received mafiosa_state from server:", data);
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
      console.log("[FRONTEND] Inventory Update:", inventory);
      setInventory(inventory);
    });

    socket.on('mafiosa_notification', ({ message, type }) => {
      console.log("[FRONTEND] Notification:", message, type);
      setNotifications(prev => [...prev, { message, type, id: Date.now() }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== Date.now())), 5000);
    });

    socket.on('mafiosa_solution', (data) => {
      console.log("[FRONTEND] Solution Received:", data);
      setSolution(data);
      if (data.finalPoints && data.finalPoints[playerId] !== undefined) {
        setPoints(data.finalPoints[playerId]);
      }
    });

    socket.on('mafiosa_error', ({ message }) => {
      console.error("❌ [FRONTEND] Error from server:", message);
      setNotifications(prev => [...prev, { message, type: 'error', id: Date.now() }]);
    });

    socket.on('mafiosa_investigation_started', ({ suspectId, points, cost }) => {
      console.log("[FRONTEND] Investigation Started for:", suspectId);
      setPoints(points);
      setInvestigationCost(cost);
      setInvestigatingSuspect(null);
    });

    // إرسال طلب بدء اللعبة للسيرفر
    if (roomCode) {
      console.log("🚀 [FRONTEND] Emitting mafiosa_start to server for room:", roomCode);
      socket.emit('mafiosa_start', { roomCode });
    } else {
      console.error("⚠️ [FRONTEND] Cannot emit mafiosa_start because roomCode is missing/undefined!");
    }

    return () => {
      console.log("=== [Mafiosa] Component Unmounted ===");
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

  // Start investigation (deduct points)
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
    setNotifications(prev => [...prev, { message: 'ليس لديك الدليل المطلوب!', type: 'error', id: Date.now() }]);
    return;
  }

  const nextNode = currentDialogue.find(d => d.id === option.nextNodeId);
  if (nextNode) {
    // لو الخيار بيفتح مواجهة، بنبلغ السيرفر فوراً عشان يحدث الـ AP والنوتفكيشن
    if (nextNode.unlockedBy) {
      socket.emit('mafiosa_confront', { roomCode, evidenceId: nextNode.unlockedBy });
    }
    // لو الخيار بيدي دليل مكافأة
    if (nextNode.reward) {
      const rewardId = nextNode.reward.split(' ').join('_').toLowerCase();
      if (!inventory.includes(rewardId)) {
        socket.emit('mafiosa_add_evidence', { roomCode, evidenceId: rewardId });
      }
    }
    showNpcResponse(suspectId, nextNode);
  } else {
    setNotifications(prev => [...prev, { message: 'انتهى الحوار.', type: 'info', id: Date.now() }]);
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

  // Open accusation modal ONLY for this player
  const handleAccuse = () => {
    setAccusationPhase(true);
    setVote({ suspect: '', weapon: '', motive: '' });
    setHasVoted(false);
  };

  const handleVoteSubmit = () => {
    if (!vote.suspect || !vote.weapon || !vote.motive) return;
    socket.emit('mafiosa_submit_vote', { roomCode, playerId, vote });
    setHasVoted(true);
  };

  if (!caseData || !state) {
    return <div className="text-center text-gray-300 p-8">جاري تحميل القضية...</div>;
  }

  if (solution) {
    const isWinner = solution.winners && solution.winners.includes(playerId);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/70 rounded-xl p-6 border border-cyan-500/20 text-center">
        {solution.image && (
          <img src={solution.image} alt="الفائز" className="w-[220px] h-[220px] mx-auto mb-4 object-fill rounded-full border-2 border-yellow-400" />
        )}
        <h2 className="text-2xl font-bold text-green-400">تم حل القضية!</h2>
        <p>القاتل: {solution.culprit}</p>
        <p>الأداة: {solution.weapon}</p>
        <p>الدافع: {solution.motive}</p>
        {solution.winners && solution.winners.length > 0 && (
          <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300 font-bold">الفائزون: {solution.winners.join('، ')}</p>
          </div>
        )}
        {solution.finalPoints && (
          <div className="mt-2 text-yellow-300">نقاطك النهائية: {solution.finalPoints[playerId] || 0}</div>
        )}
        <button onClick={() => socket.emit('mafiosa_start', { roomCode })} className="mt-4 bg-cyan-600 px-4 py-2 rounded-lg">قضية جديدة</button>
      </motion.div>
    );
  }

  const currentMessages = selectedSuspect ? messagesBySuspect[selectedSuspect] || [] : [];
  const currentNodeId = selectedSuspect ? currentNodeIdBySuspect[selectedSuspect] : null;

  return (
    <div className="bg-gray-800/70 rounded-xl p-4 border border-cyan-500/20 relative">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-2 rounded-lg mb-2 ${n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-cyan-600'}`}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Points & Cost */}
      <div className="bg-gray-900/50 p-2 rounded-lg mb-4 border border-yellow-500/20 flex justify-between flex-wrap gap-2">
        <span className="text-yellow-300 font-bold">نقاطك: {points}</span>
        <span className="text-gray-400 text-sm">تكلفة التحقيق الحالية: {investigationCost}</span>
      </div>

      {/* Title and Description */}
      {caseData.title && (
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-amber-500/20">
          <h2 className="text-2xl font-bold text-yellow-300">{caseData.title}</h2>
          <p className="text-gray-300 text-sm mt-1">{caseData.description}</p>
        </div>
      )}

      {/* Autopsy Report – show only if NOT key (given for free) */}
      {caseData.autopsy && !caseData.autopsy.isKey && (
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-amber-500/20">
          <h3 className="text-amber-400 font-bold">📋 التقرير الطبي</h3>
          <p className="text-gray-300 text-sm">{caseData.autopsy.text}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <span className="text-gray-300">نقاط الطاقة: <span className="text-cyan-300 font-bold">{state.ap}</span></span>
          <button onClick={() => setInventory(inventory)} className="text-purple-400 hover:text-purple-300">
            <FaBox className="inline mr-1" /> {inventory.length}
          </button>
        </div>
        <button onClick={() => setSearchModalOpen(true)} disabled={state.ap < 1} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg disabled:opacity-50">
          <FaSearch /> فحص (-1 AP)
        </button>
      </div>

      {/* Key Autopsy Button – separate */}
      {caseData.autopsy && caseData.autopsy.isKey && (
        <button
          onClick={handleGetAutopsy}
          disabled={state.ap < 1 || inventory.includes('autopsy_report')}
          className={`w-full mb-4 p-2 rounded-lg font-bold flex items-center justify-center gap-2 ${
            state.ap < 1 || inventory.includes('autopsy_report')
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          <FaFileMedical /> {inventory.includes('autopsy_report') ? 'تم الحصول على التقرير' : 'طلب التقرير الطبي الكامل (-1 AP)'}
        </button>
      )}

      <button onClick={() => setSuspectsModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg font-bold mb-4">
        <FaUsers className="inline mr-2" /> عرض المشتبه بهم وعلاقتهم
      </button>

      <button onClick={() => setInvestigationOpen(true)} className="w-full bg-purple-600 hover:bg-purple-500 p-2 rounded-lg font-bold mb-4">
        <FaUser className="inline mr-2" /> تحقيق مع المشتبهين
      </button>

      <button onClick={handleAccuse} className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg font-bold">
        توجيه اتهام
      </button>

      {/* Suspects Modal */}
      {suspectsModalOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
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
            <button onClick={() => setSuspectsModalOpen(false)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg font-bold">
              إغلاق
            </button>
          </div>
        </motion.div>
      )}

      {/* Investigation Modal */}
      {investigationOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
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
                    className={`bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-white text-right ${investigatingSuspect ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {s.name} ({points >= investigationCost ? investigationCost + ' نقاط' : 'نقاط غير كافية'})
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-96">
                <div className="flex justify-between items-center mb-2">
                  <button onClick={() => { setSelectedSuspect(null); if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); setIsTyping(false); }} className="text-purple-400 hover:text-purple-300 text-sm">
                    ← العودة للقائمة
                  </button>
                  <span className="text-purple-300 font-bold">{caseData.suspects.find(s => s.id === selectedSuspect)?.name}</span>
                  <span className="text-gray-500 text-xs">العلاقة: {caseData.suspects.find(s => s.id === selectedSuspect)?.relationship}</span>
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
                      <div className={`max-w-[80%] p-2 rounded-lg ${msg.type === 'player' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-700 text-gray-200 p-2 rounded-lg flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></span>
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
                      if (!currentNode || !currentNode.options) return null;
                      const validOptions = currentNode.options.filter(opt => {
                        if (opt.requiredEvidence) {
                          return inventory.includes(opt.requiredEvidence);
                        }
                        return true;
                      });
                      if (validOptions.length === 0) {
                        return <div className="text-gray-400 text-center">لا توجد خيارات متاحة</div>;
                      }
                      return validOptions.map((opt, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChooseOption(selectedSuspect, opt)}
                          className="w-full bg-gray-700 hover:bg-gray-600 p-2 rounded-lg text-sm text-right"
                        >
                          {opt.text}
                        </motion.button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Search Modal */}
      {searchModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
                <button onClick={() => setSearchModalOpen(false)} className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg font-bold mt-2">
                  إلغاء
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Accusation Modal – opens only for this player */}
      {accusationPhase && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-red-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">⚖️ توجيه الاتهام</h2>
              <button
                onClick={() => setAccusationPhase(false)}
                className="text-gray-400 hover:text-white"
              >
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
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white" value={vote.suspect} onChange={e => setVote({...vote, suspect: e.target.value})}>
                  <option value="">القاتل</option>
                  {caseData.suspects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white" value={vote.weapon} onChange={e => setVote({...vote, weapon: e.target.value})}>
                  <option value="">الأداة</option>
                  <option value="سكين">سكين</option>
                  <option value="سم">سم</option>
                  <option value="خنق">خنق</option>
                </select>
                <select className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white" value={vote.motive} onChange={e => setVote({...vote, motive: e.target.value})}>
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