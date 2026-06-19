import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUser, FaVoteYea, FaLightbulb, FaStepForward, FaSearch, FaEye } from 'react-icons/fa';

const SOLUTION_IMAGE = '/CRIME PHOTO/photo.png';
const INVESTIGATION_IMAGE = '/CRIME PHOTO/investigation.png';
const PUZZLE_IMAGE = '/CRIME PHOTO/puzzle.png';
const CLUES_IMAGE = '/CRIME PHOTO/clues.png';

const CrimeGamePlayer = ({ socket, roomCode, playerId, onScoreUpdate }) => {
  const [horror, setHorror] = useState(false);
  const [headline, setHeadline] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [statements, setStatements] = useState([]);
  const [statementsVisible, setStatementsVisible] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingSuspects, setVotingSuspects] = useState([]);
  const [vote, setVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votingComplete, setVotingComplete] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [suspectsBrief, setSuspectsBrief] = useState([]);
  const [briefVisible, setBriefVisible] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [allSuspects, setAllSuspects] = useState([]);
  
  // 🧭 العداد اللي بيتحكم في التسلسل
  const [currentStep, setCurrentStep] = useState(0);

  const hasPart = (part) => {
    if (!solution) return false;
    const content = solution[part];
    if (Array.isArray(content)) return content.length > 0 && content.some(item => item.trim() !== '');
    if (typeof content === 'string') return content.trim().length > 0;
    return false;
  };

  const resetAll = () => {
    setHeadline(null);
    setInspection(null);
    setStatements([]);
    setStatementsVisible(false);
    setVotingOpen(false);
    setVotingSuspects([]);
    setVote(null);
    setHasVoted(false);
    setVotingComplete(false);
    setSolution(null);
    setSolutionModalOpen(false);
    setSuspectsBrief([]);
    setBriefVisible(false);
    setEvidence([]);
    setEvidenceVisible(false);
    setSelectedPart(null);
    setInvestigationModalOpen(false);
    setSelectedSuspect(null);
    setAllSuspects([]);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (roomCode && allSuspects.length === 0) {
      socket.emit('crime_request_data', { roomCode });
    }
  }, [roomCode, allSuspects.length, socket]);

  useEffect(() => {
    socket.on('crime_horror_message', () => {
      resetAll();
      setHorror(true);
      setTimeout(() => setHorror(false), 4000);
    });

    // 1️⃣ الخطوة 1: عرض الجريمة -> تفتح المشتبه بيهم
    socket.on('crime_headline', ({ headline, description }) => {
      console.log("✅ وصلت بيانات الجريمة من السيرفر:", headline);
      setHeadline({ headline, description });
      setCurrentStep(prev => Math.max(prev, 1));
    });

    // 2️⃣ الخطوة 2: عرض المشتبه بيهم -> تفتح الأقوال
    socket.on('crime_suspects_brief', ({ suspects }) => {
      setSuspectsBrief(suspects);
      setBriefVisible(true);
      setCurrentStep(prev => Math.max(prev, 2));
    });

    // 3️⃣ الخطوة 3: عرض الأقوال -> تفتح الأدلة
    socket.on('crime_statements_all', ({ suspects }) => {
      setStatements(suspects);
      setStatementsVisible(true);
      setCurrentStep(prev => Math.max(prev, 3));
    });

    // 4️⃣ الخطوة 4: عرض الأدلة -> تفتح المعاينة
    socket.on('crime_evidence', ({ evidence }) => {
      setEvidence(evidence);
      setEvidenceVisible(true);
      setCurrentStep(prev => Math.max(prev, 4));
    });

    // 5️⃣ الخطوة 5: المعاينة -> تفتح التحقيق والتصويت
    socket.on('crime_inspection', ({ inspectionData }) => {
      setInspection(inspectionData);
      setCurrentStep(prev => Math.max(prev, 5));
    });

    socket.on('crime_voting_open', ({ suspects }) => {
      setVotingSuspects(suspects);
      setVotingOpen(true);
      setVote(null);
      setHasVoted(false);
      setVotingComplete(false);
    });

    socket.on('crime_voting_complete', () => {
      setVotingOpen(false);
      setVotingComplete(true);
    });

    socket.on('crime_solution_part', ({ part, content }) => {
      setSelectedPart(part);
      setSolution(prev => ({ ...prev, [part]: content }));
      setSolutionModalOpen(true);
    });

    socket.on('crime_suspects_data', ({ suspects }) => {
      setAllSuspects(suspects);
    });

    socket.on('crime_solution_data', ({ solution }) => {
      setSolution(solution);
    });

    socket.on('crime_case_reset', () => {
      resetAll();
    });

    socket.on('crime_scores_update', ({ scores }) => {
      if (onScoreUpdate) onScoreUpdate(scores);
    });

    return () => {
      socket.off('crime_horror_message');
      socket.off('crime_headline');
      socket.off('crime_suspects_brief');
      socket.off('crime_statements_all');
      socket.off('crime_evidence');
      socket.off('crime_inspection'); 
      socket.off('crime_voting_open');
      socket.off('crime_voting_complete');
      socket.off('crime_solution_part');
      socket.off('crime_case_reset');
      socket.off('crime_suspects_data');
      socket.off('crime_solution_data');
      socket.off('crime_scores_update');
    };
  }, [socket, onScoreUpdate]);

  const handleShowStatements = () => {
    if (currentStep < 2) return; 
    socket.emit('crime_show_statements', { roomCode });
  };

  const openInvestigation = () => {
    if (currentStep < 5) return; 
    if (allSuspects.length === 0) {
      socket.emit('crime_request_data', { roomCode });
    }
    setInvestigationModalOpen(true);
    setSelectedSuspect(null);
  };

  const openSolutionPart = (part) => {
    if (!votingComplete || !hasPart(part)) return;
    socket.emit(`crime_show_${part}`, { roomCode });
  };

  const partLabels = {
    clues: '🔍 كشف الخيوط',
    puzzle: '🧩 تفكيك اللغز',
    culprit: '🕵️ الجاني هو'
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 rounded-xl p-6 shadow-2xl border-2 border-red-700 shadow-red-900/50">
      {horror && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="blood-drip text-7xl font-extrabold">جاهزين للجرائم</h1>
          </div>
        </div>
      )}

      {/* 🛠️ لوحة التحكم بالتسلسل الجديد */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10 p-4 bg-black/40 rounded-xl border border-red-900">
        
        {/* 🟢 Step 0: متاح دائماً */}
        <button
          onClick={() => {
            console.log("🔘 تم الضغط على الزرار!");
            console.log("🔌 حالة الاتصال بالسيرفر:", socket.connected);
            console.log("🏠 كود الغرفة:", roomCode);
            socket.emit('crime_show_headline', { roomCode });
          }}
          className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition duration-200"
        >
          <FaFileAlt /> عرض الجريمة
        </button>

        {/* 🟡 Step 1: يفتح بعد الجريمة */}
        <button
          onClick={() => socket.emit('crime_show_suspects_brief', { roomCode })}
          disabled={currentStep < 1}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            currentStep < 1 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/50'
          }`}
        >
          <FaUser /> عرض المشتبه بيهم
        </button>

        {/* 🟣 Step 2: يفتح بعد المشتبه بيهم */}
        <button
          onClick={handleShowStatements}
          disabled={currentStep < 2}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            currentStep < 2 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/50'
          }`}
        >
          <FaUser /> عرض أقوال المشتبهين
        </button>

        {/* 🔵 Step 3: يفتح بعد الأقوال */}
        <button
          onClick={() => socket.emit('crime_show_evidence', { roomCode })}
          disabled={currentStep < 3}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            currentStep < 3 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/50'
          }`}
        >
          <FaFileAlt /> عرض الأدلة
        </button>

        {/* 🟢 Step 4: زرار المعاينة - يفتح بعد الأدلة */}
        <button
          onClick={() => socket.emit('crime_show_inspection', { roomCode })}
          disabled={currentStep < 4}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            currentStep < 4 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/50'
          }`}
        >
          <FaEye /> معاينة مسرح الجريمة
        </button>

        {/* 🟠 Step 5: التحقيق يفتح بعد المعاينة */}
        <button
          onClick={openInvestigation}
          disabled={currentStep < 5}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            currentStep < 5 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-900/50'
          }`}
        >
          <FaSearch /> تحقيق مع المشتبهين
        </button>

        {/* 🔴 Step 5: التصويت يفتح بعد المعاينة ويقفل لو التصويت بدأ */}
        <button
          onClick={() => socket.emit('crime_open_voting', { roomCode })}
          disabled={currentStep < 5 || votingOpen || votingComplete}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition duration-200 ${
            (currentStep < 5 || votingOpen || votingComplete)
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700' 
              : 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-md shadow-yellow-900/50'
          }`}
        >
          <FaVoteYea /> {votingComplete ? 'انتهى التصويت' : votingOpen ? 'التصويت مفتوح حالياً' : 'فتح التصويت'}
        </button>

        {/* 🟢 أزرار الحلول: بتفتح دايماً بعد انتهاء التصويت (تم تبديل الترتيب هنا) */}
        <button
          onClick={() => openSolutionPart('clues')}
          disabled={!votingComplete || !hasPart('clues')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            votingComplete && hasPart('clues') 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-900/50' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700'
          }`}
        >
          <FaLightbulb /> عرض كشف الخيوط
        </button>

        <button
          onClick={() => openSolutionPart('puzzle')}
          disabled={!votingComplete || !hasPart('puzzle')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            votingComplete && hasPart('puzzle') 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-900/50' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700'
          }`}
        >
          <FaLightbulb /> عرض تفكيك اللغز
        </button>

        <button
          onClick={() => openSolutionPart('culprit')}
          disabled={!votingComplete || !hasPart('culprit')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            votingComplete && hasPart('culprit') 
              ? 'bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-900/50' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40 border border-gray-700'
          }`}
        >
          <FaLightbulb /> عرض الجاني
        </button>

        <button 
          onClick={() => socket.emit('crime_next_case', { roomCode })} 
          className="bg-red-700 hover:bg-red-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold col-span-full text-white shadow-md transition duration-200"
        >
          <FaStepForward /> القضية التالية
        </button>
      </div>

      {/* 📺 شاشات عرض البيانات */}
      
      {headline && (
        <div className="mb-4 p-4 bg-gray-800/80 rounded-xl border-l-4 border-r-4 border-red-600 shadow-inner shadow-red-900/30">
          <h3 className="text-2xl font-bold text-yellow-300">{headline.headline}</h3>
          <p className="text-gray-300 mt-2 whitespace-pre-wrap">{headline.description}</p>
        </div>
      )}

      {briefVisible && suspectsBrief.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-lg font-bold text-cyan-300 border-b-2 border-red-600 pb-2">المشتبه بهم وعلاقتهم بالضحية:</h3>
          {suspectsBrief.map((s, idx) => (
            <div key={idx} className="bg-blue-950/40 p-4 rounded-xl border-l-4 border-r-4 border-blue-600 shadow-md shadow-blue-900/20">
              <p className="text-white font-bold text-lg">{s.name}</p>
              <p className="text-gray-300">العلاقة: {s.relationship}</p>
            </div>
          ))}
        </div>
      )}

      {statementsVisible && statements.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-lg font-bold text-cyan-300">أقوال المشتبهين:</h3>
          {statements.map((s, idx) => (
            <div key={idx} className="bg-purple-900/50 p-4 rounded-xl border border-purple-500">
              <p className="text-white font-bold">{s.name}</p>
              <p className="text-gray-300 italic">"{s.statement}"</p>
              {s.observation && <p className="text-yellow-300 text-sm mt-1">🔍 ملاحظة: {s.observation}</p>}
            </div>
          ))}
        </div>
      )}

      {evidenceVisible && evidence.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-bold text-cyan-300 border-b-2 border-cyan-600 pb-2">📌 الأدلة من مسرح الجريمة:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            {evidence.map((item, idx) => (
              <li key={idx} className="bg-gray-800/50 p-2 rounded-lg border-l-2 border-cyan-500">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 👁️ جزء المعاينة */}
      {inspection && (
        <div className="mt-4 p-4 bg-gray-800/80 rounded-xl border-l-4 border-r-4 border-emerald-500 shadow-inner shadow-emerald-900/30">
          <h3 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <FaEye /> تقرير معاينة مسرح الجريمة:
          </h3>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{inspection}</p>
        </div>
      )}

      {/* Modal التصويت */}
      {votingOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-red-500 shadow-2xl shadow-red-600/50 w-full max-w-md">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center" style={{ fontFamily: 'Creepster, cursive' }}>
              صوّت على الجاني
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {votingSuspects.map((suspect, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    if (hasVoted) {
                      e.preventDefault();
                      return;
                    }
                    setHasVoted(true);
                    setVote(suspect);
                    socket.emit('crime_submit_vote', { roomCode, voterId: playerId, vote: suspect });
                  }}
                  disabled={hasVoted}
                  className={`p-3 rounded-lg font-bold transition border-2 ${
                    hasVoted
                      ? (vote === suspect 
                          ? 'bg-green-700 border-green-400 opacity-100 pointer-events-none' 
                          : 'bg-gray-700 cursor-not-allowed border-gray-600 opacity-50 pointer-events-none')
                      : 'bg-gray-800 hover:bg-red-800 border-red-700'
                  }`}
                >
                  {suspect}
                </button>
              ))}
            </div>
            {hasVoted && (
              <p className="text-green-400 text-center mt-4">✅ تم تسجيل تصويتك – لا يمكنك التصويت مجدداً</p>
            )}
            <button
              onClick={() => setVotingOpen(false)}
              className="mt-6 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-xl font-bold border border-gray-500 text-white"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {votingComplete && !solution && (
        <div className="mt-4 p-4 bg-yellow-900/50 border-2 border-yellow-500 rounded-xl text-center">
          <p className="text-yellow-300">تم التصويت بنجاح! يمكنكم الآن الاطلاع على حل اللغز والجاني.</p>
        </div>
      )}

      {/* Solution Modal */}
      {solutionModalOpen && selectedPart && solution && solution[selectedPart] && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full text-center border-4 border-red-600 shadow-2xl shadow-red-700/70 max-h-[90vh] overflow-y-auto">
            <img 
              src={selectedPart === 'puzzle' ? PUZZLE_IMAGE : selectedPart === 'clues' ? CLUES_IMAGE : SOLUTION_IMAGE} 
              alt="صورة" 
              className="w-[330px] mx-auto mb-4 object-contain drop-shadow-lg rounded-xl" 
            />
            <h3 className="text-3xl font-bold text-red-400 mb-4" style={{ fontFamily: 'Creepster, cursive', textShadow: '0 0 20px #ff0000' }}>
              {partLabels[selectedPart]}
            </h3>
            <div className="text-right">
              {Array.isArray(solution[selectedPart]) ? (
                <ul className="list-decimal list-inside space-y-2 text-gray-300">
                  {solution[selectedPart].map((point, idx) => (
                    <li key={idx} className="bg-gray-800/30 p-2 rounded-lg border-l-2 border-red-500">
                      {point}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300 whitespace-pre-wrap">{solution[selectedPart]}</p>
              )}
            </div>
            <button
              onClick={() => {
                setSolutionModalOpen(false);
                setSelectedPart(null);
              }}
              className="mt-6 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-bold border-2 border-red-500 shadow-lg shadow-red-600/50 text-white"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Investigation Modal */}
      {investigationModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full border-2 border-orange-500 shadow-2xl shadow-orange-500/30 max-h-[85vh] overflow-y-auto">
            <img src={INVESTIGATION_IMAGE} alt="تحقيق" className="w-[330px] mx-auto mb-4 object-contain drop-shadow-lg rounded-xl" />
            <h3 className="text-2xl font-bold text-orange-400 mb-4 text-center">🔍 تحقيق مع المشتبهين</h3>
            {!selectedSuspect ? (
              <div className="grid grid-cols-2 gap-3">
                {allSuspects.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSuspect(s)}
                    className="bg-gray-700 hover:bg-orange-600 p-3 rounded-lg text-white font-bold transition-colors"
                  >
                    {s.name}
                  </button>
                ))}
                {allSuspects.length === 0 && <p className="col-span-2 text-gray-400 text-center">جاري تحميل المشتبهين...</p>}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedSuspect(null)}
                  className="text-orange-400 hover:text-orange-300 mb-3 flex items-center gap-1"
                >
                  ← العودة للقائمة
                </button>
                <div className="bg-gray-800 p-4 rounded-xl border border-orange-500/30 max-h-[55vh] overflow-y-auto">
                  <p className="text-white font-bold text-xl mb-2">{selectedSuspect.name}</p>
                  <p className="text-yellow-300 text-sm">العلاقة: {selectedSuspect.relationship}</p>
                  <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-600 whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                    {selectedSuspect.interrogation || 'لا يوجد تحقيق مسجل لهذا المشتبه.'}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setInvestigationModalOpen(false);
                setSelectedSuspect(null);
              }}
              className="mt-6 bg-orange-700 hover:bg-orange-600 px-6 py-2 rounded-xl font-bold border-2 border-orange-500 shadow-lg shadow-orange-600/50 w-full text-white"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeGamePlayer;