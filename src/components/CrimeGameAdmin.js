import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaUser, FaVoteYea, FaLightbulb, FaStepForward } from 'react-icons/fa';

const SOLUTION_IMAGE = '/CRIME PHOTO/photo.png'; // change to your own image

const CrimeGameAdmin = ({ socket, roomCode }) => {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [suspects, setSuspects] = useState([]);
  const [solution, setSolution] = useState(null); // { puzzle: [], clues: [], culprit: '' }
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
  const [selectedPart, setSelectedPart] = useState(null); // 'puzzle', 'clues', 'culprit'

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
    });

    socket.on('crime_voting_complete', ({ votes }) => {
      setVotes(votes);
      setVotingComplete(true);
    });

    socket.on('crime_suspects_brief', ({ suspects }) => {
      setSuspectsBrief(suspects);
      setBriefVisible(true);
    });

    socket.on('crime_evidence', ({ evidence }) => {
      setEvidence(evidence);
      setEvidenceVisible(true);
    });

    socket.on('crime_solution_part', ({ part, content }) => {
      setSelectedPart(part);
      setSolution(prev => ({ ...prev, [part]: content }));
      setSolutionModalOpen(true);
    });

    socket.on('crime_statements_all', () => {
      setStatementsVisible(true);
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
    });

    return () => {
      socket.off('crime_admin_data');
      socket.off('crime_voting_complete');
      socket.off('crime_solution_part');
      socket.off('crime_statements_all');
      socket.off('crime_case_reset');
      socket.off('crime_suspects_brief');
      socket.off('crime_evidence');
    };
  }, [socket]);

  const handleShowStatements = () => {
    socket.emit('crime_show_statements', { roomCode });
    setStatementsVisible(true);
  };

  const openSolutionPart = (part) => {
    if (!votingComplete || solutionRevealed) return;
    socket.emit(`crime_show_${part}`, { roomCode });
  };

  const partLabels = {
    puzzle: '🧩 تفكيك اللغز',
    clues: '🔍 كشف الخيوط',
    culprit: '🕵️ الجاني هو'
  };

  return (
    <div className="bg-gray-800/70 rounded-xl p-6 border border-cyan-500/30">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4 text-center">🕵️ حل الجرائم (مسؤول)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => socket.emit('crime_show_headline', { roomCode })} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
          <FaFileAlt /> عرض الجريمة
        </button>
        <button onClick={() => socket.emit('crime_show_suspects_brief', { roomCode })} className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border-2 border-indigo-400">
          <FaUser /> عرض المشتبه بيهم
        </button>
        <button onClick={handleShowStatements} className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
          <FaUser /> عرض أقوال المشتبهين
        </button>
        <button onClick={() => socket.emit('crime_show_evidence', { roomCode })} className="bg-cyan-600 hover:bg-cyan-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
          <FaFileAlt /> عرض الأدلة
        </button>
        <button onClick={() => socket.emit('crime_open_voting', { roomCode })} className="bg-yellow-600 hover:bg-yellow-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold">
          <FaVoteYea /> فتح التصويت
        </button>

        {/* Three solution buttons */}
        <button
          onClick={() => openSolutionPart('puzzle')}
          disabled={!votingComplete || solutionRevealed}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${votingComplete && !solutionRevealed ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaLightbulb /> عرض تفكيك اللغز
        </button>
        <button
          onClick={() => openSolutionPart('clues')}
          disabled={!votingComplete || solutionRevealed}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${votingComplete && !solutionRevealed ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaLightbulb /> عرض كشف الخيوط
        </button>
        <button
          onClick={() => openSolutionPart('culprit')}
          disabled={!votingComplete || solutionRevealed}
          className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold ${votingComplete && !solutionRevealed ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 cursor-not-allowed'}`}
        >
          <FaLightbulb /> عرض الجاني
        </button>

        <button onClick={() => socket.emit('crime_next_case', { roomCode })} className="bg-red-600 hover:bg-red-500 p-4 rounded-xl flex items-center justify-center gap-2 font-bold col-span-full">
          <FaStepForward /> القضية التالية
        </button>
      </div>

      {/* Display blocks */}
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
                setSolutionRevealed(true);
              }}
              className="mt-6 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-bold border-2 border-red-500 shadow-lg shadow-red-600/50"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                setSolutionModalOpen(false);
                setSelectedPart(null);
                socket.emit('crime_next_case', { roomCode });
              }}
              className="mt-6 mr-4 bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-xl font-bold border-2 border-cyan-500 shadow-lg"
            >
              القضية التالية
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrimeGameAdmin;