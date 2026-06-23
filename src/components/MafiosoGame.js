import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBox, FaUser, FaMapPin, FaUsers, FaTimes, FaFileMedical } from 'react-icons/fa';

const MafiosaGame = ({ socket, roomCode, playerId, isAdmin }) => {
  const [caseData, setCaseData] = useState(null);
  const [state, setState] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [searchedLocations, setSearchedLocations] = useState([]);
  const [points, setPoints] = useState(100);
  const [investigationCost, setInvestigationCost] = useState(10);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [messagesBySuspect, setMessagesBySuspect] = useState({});
  const [currentOptions, setCurrentOptions] = useState([]);
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

  // السماع للأحداث القادمة من السيرفر
useEffect(() => {
    console.log("🟢 [Client Debug] Mafiosa Component Mounted! Room:", roomCode);

    if (!socket) {
      console.error("🔴 [Client Debug] Socket object is NULL!");
      return;
    }

    // دالة إرسال الطلب للسيرفر
    const requestCaseData = () => {
      console.log(`🚀 [Client Debug] Emitting 'mafiosa_start' for room: "${roomCode}"`);
      socket.emit('mafiosa_start', { roomCode });
    };

    // 1. لو السوكيت واصل وجاهز حالاً -> ابعت فوراً
    if (socket.connected) {
      console.log("⚡ [Client Debug] Socket is already connected. Firing request...");
      requestCaseData();
    } else {
      // 2. لو لسه بيعمل Handshake -> استناه أول ما ينطق وقوله ابعت!
      console.warn("⚠️ [Client Debug] Socket not connected yet! Queuing request on 'connect'...");
      socket.on('connect', () => {
        console.log("⚡ [Client Debug] Socket JUST connected! Firing queued request...");
        requestCaseData();
      });
    }

    // --- استقبال الردود من السيرفر ---
    socket.on('mafiosa_case_data', (data) => {
      console.log("📥 [Client Debug] WOW! Received case_data:", data);
      setCaseData(data);
    });

    socket.on('mafiosa_state', (data) => {
      console.log("📥 [Client Debug] Received state:", data);
      setState(data);
      if (data) {
        setInventory(data.inventory || []);
        setSearchedLocations(data.searchedLocations || []);
        if (data.playerPoints && data.playerPoints[playerId] !== undefined) {
          setPoints(data.playerPoints[playerId]);
        }
      }
    });

    socket.on('mafiosa_inventory_update', ({ inventory }) => setInventory(inventory));
    socket.on('mafiosa_notification', ({ message, type }) => {
      setNotifications(prev => [...prev, { message, type, id: Date.now() }]);
    });
    socket.on('mafiosa_solution', (data) => {
      setSolution(data);
    });
    socket.on('mafiosa_error', ({ message }) => {
      console.error("❌ [Client Error from Server]:", message);
      setNotifications(prev => [...prev, { message, type: 'error', id: Date.now() }]);
    });

    return () => {
      socket.off('connect');
      socket.off('mafiosa_case_data');
      socket.off('mafiosa_state');
      socket.off('mafiosa_inventory_update');
      socket.off('mafiosa_notification');
      socket.off('mafiosa_solution');
      socket.off('mafiosa_error');
    };
  }, [socket, roomCode, playerId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesBySuspect, isTyping]);

  const startInvestigation = (suspectId) => {
    if (investigatingSuspect) return;
    setInvestigatingSuspect(suspectId);
    socket.emit('mafiosa_start_investigation', { roomCode, suspectId, playerId });
    setInvestigationOpen(true);
  };

  const closeInvestigation = () => {
    setInvestigationOpen(false);
    setSelectedSuspect(null);
    setInvestigatingSuspect(null);
    setCurrentOptions([]);
    setIsTyping(false);
  };

  const handleChooseOption = (suspectId, option, index) => {
    if (isTyping) return;

    if (option.requiredEvidence && !inventory.includes(option.requiredEvidence)) {
      const id = Date.now();
      setNotifications(prev => [...prev, { message: 'ليس لديك الدليل المطلوب لمواجهته!', type: 'error', id }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
      return;
    }

    setMessagesBySuspect(prev => ({
      ...prev,
      [suspectId]: [...(prev[suspectId] || []), { type: 'player', text: option.text }]
    }));

    socket.emit('mafiosa_choose_option', { roomCode, suspectId, optionIndex: index });
  };

  const handleSearch = (location) => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setSearchModalOpen(false);
      socket.emit('mafiosa_search', { roomCode, location });
    }, 1500);
  };

  const handleGetAutopsy = () => {
    socket.emit('mafiosa_get_autopsy', { roomCode });
  };

  const handleAccuseClick = () => {
    socket.emit('mafiosa_accuse', { roomCode });
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
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/70 rounded-xl p-6 border border-cyan-500/20 text-center text-white">
        {solution.image && (
          <img src={solution.image} alt="الحل" className="w-[220px] h-[220px] mx-auto mb-4 object-cover rounded-full border-2 border-yellow-400" />
        )}
        <h2 className="text-2xl font-bold text-green-400 mb-2">تم فك طلاسم القضية!</h2>
        <div className="bg-gray-900/60 p-4 rounded-xl text-right inline-block max-w-md space-y-2">
          <p><span className="text-yellow-400 font-bold">القاتل الحقيقي:</span> {solution.culprit}</p>
          <p><span className="text-cyan-400 font-bold">الأسلوب والأداة:</span> {solution.weapon}</p>
          <p><span className="text-purple-400 font-bold">الدافع الخلفي:</span> {solution.motive}</p>
        </div>
        {solution.winners && solution.winners.length > 0 && (
          <div className="mt-4 p-3 bg-green-900/40 border border-green-500 rounded-lg max-w-sm mx-auto">
            <p className="text-green-300 font-bold">المحققون الفائزون: {solution.winners.join('، ')}</p>
          </div>
        )}
        <button onClick={() => window.location.reload()} className="mt-6 bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-bold">قضية جديدة 🔄</button>
      </motion.div>
    );
  }

  return (
    <div className="bg-gray-800/70 rounded-xl p-4 border border-cyan-500/20 relative text-white text-right" dir="rtl">
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-3 rounded-lg mb-2 text-center text-sm font-bold shadow-lg ${n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-cyan-600'}`}
          >
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-yellow-500/20 flex justify-between items-center">
        <span className="text-yellow-300 font-bold">رصيدك: {points} نقطة</span>
        <span className="text-gray-400 text-xs">تكلفة بدء التحقيق: {investigationCost} ن</span>
      </div>

      {caseData.title && (
        <div className="bg-gray-900/50 p-4 rounded-lg mb-4 border border-amber-500/20">
          <h2 className="text-xl font-bold text-yellow-300 mb-2">{caseData.title}</h2>
          <p className="text-gray-300 text-sm leading-relaxed">{caseData.description}</p>
        </div>
      )}

      {caseData.autopsy && !caseData.autopsy.isKey && (
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-blue-500/20">
          <h3 className="text-blue-400 font-bold mb-1">📋 التقرير الطبي الأولي:</h3>
          <p className="text-gray-300 text-xs leading-relaxed">{caseData.autopsy.text}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-300">نقاط الـ AP: <span className="text-cyan-300 font-bold">{state.ap}</span></span>
          <span className="text-sm text-purple-300"><FaBox className="inline ml-1" /> الأدلة المكتشفة: {inventory.length}</span>
        </div>
        <button onClick={() => setSearchModalOpen(true)} disabled={state.ap < 1} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-lg font-bold flex items-center gap-1 text-sm disabled:opacity-50">
          <FaSearch size={12} /> فحص موقع (-1 AP)
        </button>
      </div>

      {caseData.autopsy && caseData.autopsy.isKey && (
        <button
          onClick={handleGetAutopsy}
          disabled={state.ap < 1 || inventory.includes('autopsy_report')}
          className={`w-full mb-4 p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition-all ${
            state.ap < 1 || inventory.includes('autopsy_report') ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          <FaFileMedical /> {inventory.includes('autopsy_report') ? 'تمت إضافة تقرير المشرحة المتقدم للأدلة' : 'شراء التقرير الطبي التشريحي المغلق (-1 AP)'}
        </button>
      )}

      <div className="space-y-2">
        <button onClick={() => setSuspectsModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
          <FaUsers /> ملفات المشتبه بهم وإفادتهم الأولية
        </button>

        <button onClick={() => setInvestigationOpen(true)} className="w-full bg-purple-600 hover:bg-purple-500 p-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
          <FaUser /> غرف استجواب المشتبه بهم
        </button>

        <button onClick={handleAccuseClick} className="w-full bg-red-600 hover:bg-red-500 p-2.5 rounded-lg font-bold text-sm">
          ⚖️ تقديم لائحة الاتهام النهائية
        </button>
      </div>

      {/* مودال المشتبه بهم */}
      {suspectsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-5 max-w-2xl w-full max-h-[80vh] border border-indigo-500/30 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-indigo-400 font-bold text-lg">سجلات المشتبه بهم</h3>
              <button onClick={() => setSuspectsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {caseData.suspects.map(s => (
                <div key={s.id} className="bg-gray-800 p-3 rounded-lg border border-indigo-500/10">
                  <p className="text-yellow-400 font-bold text-sm">{s.name}</p>
                  <p className="text-gray-300 text-xs mt-1"><span className="text-indigo-300">صلته بالضحية:</span> {s.relationship}</p>
                  <p className="text-gray-400 text-xs italic mt-1">" {s.statement} "</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال الاستجواب والدردشة */}
      {investigationOpen && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-5 max-w-2xl w-full h-[85vh] border border-purple-500/30 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-purple-400 font-bold text-lg">غرفة الاستجواب وعرض الأدلة</h3>
              <button onClick={closeInvestigation} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {!selectedSuspect ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto p-1">
                {caseData.suspects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => startInvestigation(s.id)}
                    disabled={investigatingSuspect !== null}
                    className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-right border border-gray-700/50 transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-white text-sm">{s.name}</span>
                    <span className="text-xs text-purple-300 mt-2">فتح الاستجواب: {investigationCost} نقطة</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col flex-1 h-full overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800 mb-2">
                  <button onClick={() => { setSelectedSuspect(null); setCurrentOptions([]); }} className="text-purple-400 hover:text-purple-300 text-xs font-bold">
                    ← قائمة المتهمين
                  </button>
                  <span className="text-yellow-400 font-bold text-sm">{caseData.suspects.find(s => s.id === selectedSuspect)?.name}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-950/40 rounded-xl border border-gray-800/60">
                  {(messagesBySuspect[selectedSuspect] || []).map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.type === 'player' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${msg.type === 'player' ? 'bg-cyan-700 text-white rounded-bl-none' : 'bg-gray-800 text-gray-200 rounded-br-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-end">
                      <div className="bg-gray-800 p-3 rounded-xl flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {!isTyping && currentOptions.length > 0 && (
                  <div className="mt-3 space-y-1.5 max-h-[40%] overflow-y-auto p-1">
                    {currentOptions.map((opt, idx) => {
                      const hasClue = opt.requiredEvidence ? inventory.includes(opt.requiredEvidence) : true;
                      return (
                        <button
                          key={idx}
                          disabled={!hasClue}
                          onClick={() => handleChooseOption(selectedSuspect, opt, idx)}
                          className={`w-full p-2.5 rounded-xl text-xs text-right border transition-all flex justify-between items-center ${
                            hasClue 
                              ? 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700' 
                              : 'bg-gray-900 text-gray-500 border-gray-800 cursor-not-allowed opacity-40'
                          }`}
                        >
                          <span>{opt.text}</span>
                          {opt.requiredEvidence && !hasClue && <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-md">مغلق: يتطلب دليل</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* مودال البحث عن الأدلة */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-5 max-w-md w-full border border-emerald-500/30">
            <h3 className="text-emerald-400 font-bold text-base mb-4 text-center">انقر على الموقع لإرسال فريق البحث والرفع</h3>
            {searching ? (
              <div className="flex flex-col items-center py-6">
                <div className="text-4xl text-emerald-400 animate-spin">⏳</div>
                <p className="text-gray-300 text-sm mt-3">جاري تمشيط ورفع البصمات من الموقع...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {caseData.locations && Object.entries(caseData.locations).map(([key, loc]) => (
                  <button
                    key={key}
                    onClick={() => handleSearch(key)}
                    disabled={searchedLocations.includes(key)}
                    className={`w-full bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-right text-xs text-white flex items-center justify-between ${
                      searchedLocations.includes(key) ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>📍 {loc.name}</span>
                    {searchedLocations.includes(key) && <span className="text-[10px] text-gray-500">تم فحصها</span>}
                  </button>
                ))}
                <button onClick={() => setSearchModalOpen(false)} className="w-full bg-red-900/50 text-red-300 p-2 rounded-lg font-bold text-xs mt-2">إلغاء</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* مودال لستة توجيه الاتهامات النهائي */}
      {accusationPhase && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-5 max-w-md w-full border-2 border-red-600 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-500">⚖️ صياغة التقرير الجنائي والنيابة</h2>
              <button onClick={() => setAccusationPhase(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {hasVoted ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-3 animate-pulse">⏳</div>
                <h3 className="text-base text-green-400 font-bold mb-1">تم إرسال اتهامك للمحكمة بنجاح!</h3>
                <p className="text-gray-400 text-xs">ننتظر اكتمال تقارير بقية المحققين في الغرفة لإغلاق ملف القضية وصرف النقاط...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">المتهم الرئيسي:</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xs" value={vote.suspect} onChange={e => setVote({...vote, suspect: e.target.value})}>
                    <option value="">اختر القاتل</option>
                    {caseData.suspects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">أداة/أسلوب الجريمة الفيزيائي والكيميائي:</label>
                  <input 
                    type="text" 
                    placeholder="مثال: سكين جليد جاف، موجات صوتية، سم" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xs text-right"
                    value={vote.weapon} 
                    onChange={e => setVote({...vote, weapon: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">الدافع والسبب وراء التصفية:</label>
                  <input 
                    type="text" 
                    placeholder="مثال: حماية الذات، منع المعاهدة، السرقة" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xs text-right"
                    value={vote.motive} 
                    onChange={e => setVote({...vote, motive: e.target.value})}
                  />
                </div>

                <button
                  onClick={handleVoteSubmit}
                  disabled={!vote.suspect || !vote.weapon || !vote.motive}
                  className="w-full bg-red-600 hover:bg-red-500 p-2.5 rounded-lg font-bold text-xs mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  إرسال التقارير ورفع الجلسة ⚖️
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MafiosaGame;