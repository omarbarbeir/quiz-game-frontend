import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUser, FaVoteYea, FaLightbulb, FaStepForward } from 'react-icons/fa';

const SOLUTION_IMAGE = '/CRIME PHOTO/photo.png'; // change to your own image

const CrimeGamePlayer = ({ socket, roomCode, playerId }) => {
  const [horror, setHorror] = useState(false);
  const [headline, setHeadline] = useState(null);
  const [statements, setStatements] = useState([]);
  const [statementsVisible, setStatementsVisible] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const [votingSuspects, setVotingSuspects] = useState([]); // NEW: for voting options
  const [vote, setVote] = useState(null);
  const [votingComplete, setVotingComplete] = useState(false);
  const [solution, setSolution] = useState(null);
  const [solutionModalOpen, setSolutionModalOpen] = useState(false);
  const [suspectsBrief, setSuspectsBrief] = useState([]);
  const [briefVisible, setBriefVisible] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [evidenceVisible, setEvidenceVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  const resetAll = () => {
    setHeadline(null);
    setStatements([]);
    setStatementsVisible(false);
    setVotingOpen(false);
    setVotingSuspects([]); // reset
    setVote(null);
    setVotingComplete(false);
    setSolution(null);
    setSolutionModalOpen(false);
    setSuspectsBrief([]);
    setBriefVisible(false);
    setEvidence([]);
    setEvidenceVisible(false);
    setSelectedPart(null);
  };

  useEffect(() => {
    socket.on('crime_horror_message', () => {
      resetAll();
      setHorror(true);
      setTimeout(() => setHorror(false), 4000);
    });

    socket.on('crime_headline', ({ headline, description }) => {
      setHeadline({ headline, description });
    });

    socket.on('crime_statements_all', ({ suspects }) => {
      setStatements(suspects);
      setStatementsVisible(true);
    });

    socket.on('crime_suspects_brief', ({ suspects }) => {
      setSuspectsBrief(suspects);
      setBriefVisible(true);
    });

    socket.on('crime_evidence', ({ evidence }) => {
      setEvidence(evidence);
      setEvidenceVisible(true);
    });

    socket.on('crime_voting_open', ({ suspects }) => {
      setVotingSuspects(suspects); // store voting options separately
      setVotingOpen(true);
      setVote(null);
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

    socket.on('crime_case_reset', () => {
      resetAll();
    });

    return () => {
      socket.off('crime_horror_message');
      socket.off('crime_headline');
      socket.off('crime_statements_all');
      socket.off('crime_voting_open');
      socket.off('crime_voting_complete');
      socket.off('crime_solution_part');
      socket.off('crime_case_reset');
      socket.off('crime_suspects_brief');
      socket.off('crime_evidence');
    };
  }, [socket]);

  const handleShowStatements = () => {
    socket.emit('crime_show_statements', { roomCode });
  };

  const openSolutionPart = (part) => {
    if (!votingComplete) return;
    socket.emit(`crime_show_${part}`, { roomCode });
  };

  const partLabels = {
    puzzle: '🧩 تفكيك اللغز',
    clues: '🔍 كشف الخيوط',
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 relative z-10">
        <button onClick={() => socket.emit('crime_show_headline', { roomCode })} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-blue-400 shadow-lg shadow-blue-500/30">
          <FaFileAlt /> عرض الجريمة
        </button>
        <button onClick={() => socket.emit('crime_show_suspects_brief', { roomCode })} className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-indigo-400">
          <FaUser /> عرض المشتبه بيهم
        </button>
        <button onClick={handleShowStatements} className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-purple-400">
          <FaUser /> عرض أقوال المشتبهين
        </button>
        <button onClick={() => socket.emit('crime_show_evidence', { roomCode })} className="bg-cyan-600 hover:bg-cyan-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-cyan-400">
          <FaFileAlt /> عرض الأدلة
        </button>
        <button onClick={() => socket.emit('crime_open_voting', { roomCode })} className="bg-yellow-600 hover:bg-yellow-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-yellow-400">
          <FaVoteYea /> فتح التصويت
        </button>

        {/* Three solution buttons */}
        <button
          onClick={() => openSolutionPart('puzzle')}
          disabled={!votingComplete}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 ${votingComplete ? 'bg-green-600 hover:bg-green-500 border-green-400' : 'bg-gray-600 cursor-not-allowed border-gray-500'}`}
        >
          <FaLightbulb /> عرض تفكيك اللغز
        </button>
        <button
          onClick={() => openSolutionPart('clues')}
          disabled={!votingComplete}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 ${votingComplete ? 'bg-green-600 hover:bg-green-500 border-green-400' : 'bg-gray-600 cursor-not-allowed border-gray-500'}`}
        >
          <FaLightbulb /> عرض كشف الخيوط
        </button>
        <button
          onClick={() => openSolutionPart('culprit')}
          disabled={!votingComplete}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 ${votingComplete ? 'bg-green-600 hover:bg-green-500 border-green-400' : 'bg-gray-600 cursor-not-allowed border-gray-500'}`}
        >
          <FaLightbulb /> عرض الجاني
        </button>

        <button onClick={() => socket.emit('crime_next_case', { roomCode })} className="bg-red-700 hover:bg-red-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-red-500 shadow-lg shadow-red-600/40 col-span-full">
          <FaStepForward /> القضية التالية
        </button>
      </div>

      {/* Display blocks */}
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

      {votingOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 p-6 rounded-xl border-2 border-red-500 shadow-2xl shadow-red-600/50 w-full max-w-md">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center" style={{ fontFamily: 'Creepster, cursive' }}>صوّت على الجاني</h2>
            <div className="grid grid-cols-2 gap-3">
              {votingSuspects.map((suspect, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setVote(suspect);
                    socket.emit('crime_submit_vote', { roomCode, voterId: playerId, vote: suspect });
                  }}
                  disabled={vote !== null}
                  className={`p-3 rounded-lg font-bold transition border-2 ${vote === suspect ? 'bg-green-700 border-green-400' : 'bg-gray-800 hover:bg-red-800 border-red-700'} ${vote !== null && vote !== suspect ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {suspect}
                </button>
              ))}
            </div>
            {vote && <p className="text-green-400 text-center mt-4">تم تسجيل تصويتك</p>}
          </div>
        </div>
      )}
      {votingComplete && !solution && (
        <div className="mt-4 p-4 bg-yellow-900/50 border-2 border-yellow-500 rounded-xl text-center">
          <p className="text-yellow-300">تم التصويت! استخدم الأزرار أدناه لعرض الحل.</p>
        </div>
      )}

      {/* Solution Modal */}
      {solutionModalOpen && selectedPart && solution && solution[selectedPart] && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full text-center border-4 border-red-600 shadow-2xl shadow-red-700/70 max-h-[90vh] overflow-y-auto">
            <img src={SOLUTION_IMAGE} alt="حل القضية" className="w-[330px] mx-auto mb-4 object-contain drop-shadow-lg rounded-xl" />
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
              className="mt-6 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-bold border-2 border-red-500 shadow-lg shadow-red-600/50"
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