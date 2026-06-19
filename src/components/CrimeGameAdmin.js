import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUser, FaVoteYea, FaLightbulb, FaStepForward, FaSearch } from 'react-icons/fa';

const SOLUTION_IMAGE = '/CRIME PHOTO/photo.png';
const INVESTIGATION_IMAGE = '/CRIME PHOTO/investigation.png';
const PUZZLE_IMAGE = '/CRIME PHOTO/puzzle.png';
const CLUES_IMAGE = '/CRIME PHOTO/clues.png';

const CrimeGameAdmin = ({ socket, roomCode, onScoreUpdate }) => {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [suspects, setSuspects] = useState([]);
  const [solution, setSolution] = useState(null);
  const [image, setImage] = useState(null);
  const [statementsVisible, setStatementsVisible] = useState(false);
  const [votes, setVotes] = useState(null);
  const [votingComplete, setVotingComplete] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [suspectsBrief, setSuspectsBrief] = useState([]);
  const [briefVisible, setBriefVisible] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const [investigationModalOpen, setInvestigationModalOpen] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [allSuspects, setAllSuspects] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // ✅ enabled from start

  const [hasVoted, setHasVoted] = useState(false);
  const [vote, setVote] = useState(null);
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingSuspects, setVotingSuspects] = useState([]);

  const hasPart = (part) => {
    if (!solution) return false;
    const content = solution[part];
    if (Array.isArray(content)) return content.length > 0 && content.some(item => item.trim() !== '');
    if (typeof content === 'string') return content.trim().length > 0;
    return false;
  };

  useEffect(() => {
    if (roomCode && allSuspects.length === 0) {
      socket.emit('crime_request_data', { roomCode });
    }
  }, [roomCode, allSuspects.length, socket]);

  useEffect(() => {
    socket.on('crime_admin_data', (data) => {
      setHeadline(data.headline);
      setDescription(data.description);
      setSuspects(data.suspects);
      setSolution(data.solution);
      setImage(data.image);
      setStatementsVisible(false);
      setVotes(null);
      setVotingComplete(false);
      setSolutionRevealed(false);
      setSolutionModalOpen(false);
      setSelectedPart(null);
      // ✅ Reset step to 0 on new case (first button enabled)
      setCurrentStep(0);
      setHasVoted(false);
      setVote(null);
      setVotingOpen(false);
    });

    socket.on('crime_voting_complete', ({ votes }) => {
      setVotes(votes);
      setVotingComplete(true);
    });

    socket.on('crime_suspects_brief', ({ suspects }) => {
      setSuspectsBrief(suspects);
      setBriefVisible(true);
      setCurrentStep(prev => Math.max(prev, 2));
    });

    socket.on('crime_evidence', ({ evidence }) => {
      setEvidence(evidence);
      setEvidenceVisible(true);
      setCurrentStep(prev => Math.max(prev, 4));
    });

    socket.on('crime_solution_part', ({ part, content }) => {
      setSelectedPart(part);
      setSolution(prev => ({ ...prev, [part]: content }));
      setSolutionModalOpen(true);
    });

    socket.on('crime_statements_all', () => {
      setStatementsVisible(true);
      setCurrentStep(prev => Math.max(prev, 3));
    });

    socket.on('crime_suspects_data', ({ suspects }) => {
      setAllSuspects(suspects);
    });

    socket.on('crime_solution_data', ({ solution }) => {
      setSolution(solution);
    });

    socket.on('crime_voting_open', ({ suspects }) => {
      setVotingSuspects(suspects);
      setVotingOpen(true);
      setVote(null);
      setHasVoted(false);
      setVotingComplete(false);
    });

    socket.on('crime_case_reset', () => {
      setHeadline('');
      setDescription('');
      setSuspects([]);
      setStatementsVisible(false);
      setVotes(null);
      setVotingComplete(false);
      setSolutionRevealed(false);
      setSolutionModalOpen(false);
      setSuspectsBrief([]);
      setBriefVisible(false);
      setEvidence([]);
      setEvidenceVisible(false);
      setSolution(null);
      setSelectedPart(null);
      setInvestigationModalOpen(false);
      setSelectedSuspect(null);
      setAllSuspects([]);
      setCurrentStep(0);
      setHasVoted(false);
      setVote(null);
      setVotingOpen(false);
    });

    socket.on('crime_scores_update', ({ scores }) => {
      if (onScoreUpdate) onScoreUpdate(scores);
    });

    return () => {
      socket.off('crime_admin_data');
      socket.off('crime_voting_complete');
      socket.off('crime_solution_part');
      socket.off('crime_statements_all');
      socket.off('crime_case_reset');
      socket.off('crime_suspects_brief');
      socket.off('crime_evidence');
      socket.off('crime_suspects_data');
      socket.off('crime_solution_data');
      socket.off('crime_voting_open');
      socket.off('crime_scores_update');
    };
  }, [socket, onScoreUpdate]);

  const handleShowStatements = () => {
    if (currentStep < 2) return;
    socket.emit('crime_show_statements', { roomCode });
  };

  const openSolutionPart = (part) => {
    if (!votingComplete || solutionRevealed || !hasPart(part)) return;
    socket.emit(`crime_show_${part}`, { roomCode });
  };

  const partLabels = {
    puzzle: '🧩 تفكيك اللغز',
    clues: '🔍 كشف الخيوط',
    culprit: '🕵️ الجاني هو'
  };

  const openInvestigation = () => {
    if (currentStep < 4) return;
    if (allSuspects.length === 0) {
      socket.emit('crime_request_data', { roomCode });
    }
    setInvestigationModalOpen(true);
    setSelectedSuspect(null);
  };

  const handleGivePoints = () => {
    socket.emit('crime_give_points', { roomCode });
  };

  return (
    <div className="bg-gray-800/70 rounded-xl p-6 border border-cyan-500/30">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 text-center">🕵️ حل الجرائم (مسؤول)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ===== First button: عرض الجريمة ===== */}
        <button
          onClick={() => {
            // Emit event to show headline
            socket.emit('crime_show_headline', { roomCode });
            // ✅ Unlock next button by setting step to at least 1
            setCurrentStep(prev => Math.max(prev, 1));
          }}
          // ✅ Always enabled because currentStep starts at 0
          disabled={currentStep < 0}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaFileAlt /> عرض الجريمة
        </button>

        <button
          onClick={() => {
            if (currentStep < 1) return;
            socket.emit('crime_show_suspects_brief', { roomCode });
          }}
          disabled={currentStep < 1}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 1 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaUser /> عرض المشتبه بيهم
        </button>

        <button
          onClick={handleShowStatements}
          disabled={currentStep < 2}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 2 ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaUser /> عرض أقوال المشتبهين
        </button>

        <button
          onClick={() => {
            if (currentStep < 3) return;
            socket.emit('crime_show_evidence', { roomCode });
          }}
          disabled={currentStep < 3}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 3 ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaFileAlt /> عرض الأدلة
        </button>

        <button
          onClick={openInvestigation}
          disabled={currentStep < 4}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 4 ? 'bg-orange-600 hover:bg-orange-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaSearch /> تحقيق مع المشتبهين
        </button>

        <button
          onClick={() => {
            if (currentStep < 4) return;
            socket.emit('crime_open_voting', { roomCode });
          }}
          disabled={currentStep < 4}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${currentStep >= 4 ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaVoteYea /> فتح التصويت
        </button>

        <button
          onClick={() => openSolutionPart('puzzle')}
          disabled={!votingComplete || solutionRevealed || !hasPart('puzzle')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${
            votingComplete && !solutionRevealed && hasPart('puzzle')
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <FaLightbulb /> عرض تفكيك اللغز
        </button>

        <button
          onClick={() => openSolutionPart('clues')}
          disabled={!votingComplete || solutionRevealed || !hasPart('clues')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${
            votingComplete && !solutionRevealed && hasPart('clues')
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <FaLightbulb /> عرض كشف الخيوط
        </button>

        <button
          onClick={() => openSolutionPart('culprit')}
          disabled={!votingComplete || solutionRevealed || !hasPart('culprit')}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${
            votingComplete && !solutionRevealed && hasPart('culprit')
              ? 'bg-green-600 hover:bg-green-500'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <FaLightbulb /> عرض الجاني
        </button>

        {solutionRevealed && (
          <button
            onClick={handleGivePoints}
            className="bg-blue-700 hover:bg-blue-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold col-span-full"
          >
            منح النقاط للمصوتين صحيحاً
          </button>
        )}

        <button onClick={() => socket.emit('crime_next_case', { roomCode })} className="bg-red-600 hover:bg-red-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold col-span-full">
          <FaStepForward /> القضية التالية
        </button>
      </div>

      {/* Display blocks (unchanged) */}
      {headline && (
        <div className="mt-4 p-4 bg-gray-700 rounded-xl">
          <h3 className="text-2xl font-bold text-yellow-300">{headline}</h3>
          <p className="text-gray-300 mt-2 whitespace-pre-wrap">{description}</p>
        </div>
      )}
      {statementsVisible && suspects.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-lg font-bold text-cyan-300">أقوال المشتبهين:</h3>
          {suspects.map((s, idx) => (
            <div key={idx} className="bg-purple-900/50 p-4 rounded-xl border border-purple-500">
              <p className="text-white font-bold">{s.name}</p>
              <p className="text-gray-300 italic">"{s.statement}"</p>
              {s.observation && <p className="text-yellow-300 text-sm mt-1">🔍 ملاحظة: {s.observation}</p>}
            </div>
          ))}
        </div>
      )}
      {briefVisible && suspectsBrief.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-lg font-bold text-cyan-300 border-b-2 border-red-600 pb-2">المشتبه بهم وعلاقتهم بالضحية:</h3>
          {suspectsBrief.map((s, idx) => (
            <div key={idx} className="bg-blue-950/40 p-4 rounded-xl border-l-4 border-r-4 border-blue-600">
              <p className="text-white font-bold text-lg">{s.name}</p>
              <p className="text-gray-300">العلاقة: {s.relationship}</p>
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
      {votes && (
        <div className="mt-6 bg-gray-700 p-4 rounded-xl">
          <h3 className="text-lg font-bold text-yellow-300 mb-2">نتائج التصويت:</h3>
          {Object.entries(votes).map(([playerId, vote]) => (
            <div key={playerId} className="flex justify-between py-1 border-b border-gray-600">
              <span className="text-gray-300">{playerId}</span>
              <span className="text-cyan-300">{vote}</span>
            </div>
          ))}
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
                setSolutionRevealed(true);
              }}
              className="mt-6 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-bold border-2 border-red-500 shadow-lg shadow-red-600/50"
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
              className="mt-6 bg-orange-700 hover:bg-orange-600 px-6 py-2 rounded-xl font-bold border-2 border-orange-500 shadow-lg shadow-orange-600/50 w-full"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeGameAdmin;