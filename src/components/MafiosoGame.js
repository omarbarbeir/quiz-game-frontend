import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaBox, FaUser, FaMapPin, FaUsers, FaTimes, FaFileMedical, FaRedo, FaSkull, FaLock } from 'react-icons/fa';

// ── الأنيميشنز العامة ──────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes redPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    50%     { box-shadow: 0 0 0 6px rgba(239,68,68,0.15); }
  }
  @keyframes greenPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    50%     { box-shadow: 0 0 0 6px rgba(16,185,129,0.2); }
  }
  @keyframes confettiFall {
    0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
  }
  @keyframes pulseGold {
    0%, 100% { box-shadow: 0 0 0px #f59e0b,  0 0 0px #f59e0b; }
    50%       { box-shadow: 0 0 30px #f59e0b, 0 0 60px #d97706; }
  }
  @keyframes badgeGlow {
    0%, 100% { text-shadow: 0 0 6px #fbbf24,  0 0 12px #f59e0b; }
    50%       { text-shadow: 0 0 16px #fbbf24, 0 0 32px #d97706; }
  }
  @keyframes criminalGlow {
    0%, 100% { text-shadow: 0 0 8px #f59e0b, 0 0 24px #f59e0b, 0 0 48px #d97706; }
    50%       { text-shadow: 0 0 16px #fbbf24, 0 0 48px #fbbf24, 0 0 96px #f59e0b; }
  }
  @keyframes flickerIn {
    0%   { opacity: 0; }
    10%  { opacity: 1; }
    12%  { opacity: 0; }
    14%  { opacity: 1; }
    100% { opacity: 1; }
  }
  @keyframes interrogationPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
    50%     { box-shadow: 0 0 20px 2px rgba(251,191,36,0.08); }
  }
  @keyframes evidencePing {
    0%   { box-shadow: 0 0 0 0 rgba(234,179,8,0.6); }
    70%  { box-shadow: 0 0 0 8px rgba(234,179,8,0); }
    100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); }
  }
  .confetti-piece {
    position: fixed;
    top: -20px;
    border-radius: 2px;
    animation: confettiFall linear forwards;
    pointer-events: none;
    z-index: 10000;
  }
`;

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

  const resetLocalState = () => {
    setCaseData(null); setState(null); setInventory([]); setSearchedLocations([]);
    setPoints(100); setInvestigationCost(10); setSelectedSuspect(null);
    setMessagesBySuspect({}); setCurrentNodeIdBySuspect({}); setNotifications([]);
    setAccusationPhase(false); setVote({ suspect: '', weapon: '', motive: '' });
    setSolution(null); setInvestigationOpen(false); setIsTyping(false);
    setSearchModalOpen(false); setSearching(false); setSuspectsModalOpen(false);
    setInvestigatingSuspect(null); setHasVoted(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => {
    socket.on('mafiosa_new_game_starting', () => {
      resetLocalState();
      setShowNewGameOverlay(true);
    });
    socket.on('mafiosa_case_data', (data) => {
      setShowNewGameOverlay(false);
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
    socket.on('mafiosa_inventory_update', ({ inventory }) => setInventory(inventory));
    socket.on('mafiosa_notification', ({ message, type }) => {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message, type, id }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    });
    socket.on('mafiosa_solution', (data) => {
      setSolution(data);
      if (data.finalPoints && data.finalPoints[playerId] !== undefined)
        setPoints(data.finalPoints[playerId]);
    });
    socket.on('mafiosa_error', ({ message }) => {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message, type: 'error', id }]);
    });
    socket.on('mafiosa_investigation_started', ({ suspectId, points, cost }) => {
      setPoints(points); setInvestigationCost(cost); setInvestigatingSuspect(null);
    });
    if (roomCode) socket.emit('mafiosa_start', { roomCode });
    return () => {
      ['mafiosa_new_game_starting','mafiosa_case_data','mafiosa_state',
       'mafiosa_inventory_update','mafiosa_notification','mafiosa_solution',
       'mafiosa_error','mafiosa_investigation_started'].forEach(e => socket.off(e));
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, roomCode, playerId]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messagesBySuspect, isTyping]);

  const handleNewGame = () => socket.emit('mafiosa_start', { roomCode });

  const startInvestigation = (suspectId) => {
    if (investigatingSuspect) return;
    setInvestigatingSuspect(suspectId);
    socket.emit('mafiosa_start_investigation', { roomCode, suspectId });
    setSelectedSuspect(suspectId);
    if (!messagesBySuspect[suspectId] || messagesBySuspect[suspectId].length === 0) {
      const startNode = getInitialNode(suspectId);
      if (startNode) {
        setMessagesBySuspect(prev => ({ ...prev, [suspectId]: [{ type: 'npc', text: startNode.text }] }));
        setCurrentNodeIdBySuspect(prev => ({ ...prev, [suspectId]: startNode.id }));
      }
    }
    setInvestigationOpen(true);
  };

  const closeInvestigation = () => {
    setInvestigationOpen(false); setSelectedSuspect(null); setInvestigatingSuspect(null);
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
      if (nextNode.unlockedBy) socket.emit('mafiosa_confront', { roomCode, evidenceId: nextNode.unlockedBy });
      if (nextNode.reward) {
        const rewardId = nextNode.reward.split(' ').join('_').toLowerCase();
        if (!inventory.includes(rewardId)) socket.emit('mafiosa_add_evidence', { roomCode, evidenceId: rewardId });
      }
      showNpcResponse(suspectId, nextNode);
    } else {
      const id = Date.now() + Math.random();
      setNotifications(prev => [...prev, { message: 'انتهى الحوار.', type: 'info', id }]);
    }
  };

  const handleSearch = (location) => {
    setSearching(true);
    setTimeout(() => { setSearching(false); setSearchModalOpen(false); socket.emit('mafiosa_search', { roomCode, location }); }, 2000);
  };

  const handleGetAutopsy = () => socket.emit('mafiosa_get_autopsy', { roomCode });

  const handleAccuse = () => {
    setAccusationPhase(true);
    setVote({ suspect: '', weapon: '', motive: '' });
    setHasVoted(false);
  };

  const handleVoteSubmit = () => {
    if (!vote.suspect.trim() || !vote.weapon.trim() || !vote.motive.trim()) return;
    socket.emit('mafiosa_submit_vote', { roomCode, playerId, vote });
    setHasVoted(true);
  };

  // ── OVERLAY ────────────────────────────────────────────────────────────────
  if (showNewGameOverlay) {
    return (
      <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.93)',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <style>{GLOBAL_STYLES}</style>
        <motion.div initial={{opacity:0,scale:0.6}} animate={{opacity:1,scale:1}}
          transition={{type:'spring',stiffness:160,damping:14}} style={{textAlign:'center',padding:'2rem'}}>
          <p style={{fontSize:'3rem',fontWeight:700,color:'#fbbf24',animation:'criminalGlow 1.6s ease-in-out infinite',letterSpacing:'0.06em',margin:0}}>
            جاهزين للجريمة
          </p>
          <motion.p animate={{opacity:[0.3,1,0.3]}} transition={{duration:1.4,repeat:Infinity}}
            style={{color:'#9ca3af',marginTop:'1.5rem',fontSize:'1rem'}}>
            ⏳ جاري تحميل القضية الجديدة...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!caseData || !state) {
    return <div style={{textAlign:'center',color:'#9ca3af',padding:'2rem'}}>جاري تحميل القضية...</div>;
  }

  const currentMessages = selectedSuspect ? messagesBySuspect[selectedSuspect] || [] : [];
  const currentNodeId = selectedSuspect ? currentNodeIdBySuspect[selectedSuspect] : null;

  // ── ألوان الجو العام ──────────────────────────────────────────────────────
  const C = {
    bg:        'rgba(10,8,20,0.97)',
    surface:   'rgba(18,14,35,0.95)',
    border:    'rgba(99,60,180,0.25)',
    accent:    '#7c3aed',
    accentDim: 'rgba(124,58,237,0.15)',
    gold:      '#f59e0b',
    goldDim:   'rgba(245,158,11,0.12)',
    red:       '#ef4444',
    redDim:    'rgba(239,68,68,0.12)',
    text:      '#e2d9f3',
    textMuted: '#7c6fa0',
    evidence:  '#eab308',
  };

  return (
    <div style={{ background: C.bg, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, position:'relative', animation:'interrogationPulse 4s ease-in-out infinite' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(n => (
          <motion.div key={n.id} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            style={{
              padding:'8px 14px', borderRadius:10, marginBottom:8, fontSize:'0.85rem', fontWeight:600,
              background: n.type==='success' ? 'rgba(16,185,129,0.2)' : n.type==='error' ? 'rgba(239,68,68,0.2)' : 'rgba(99,60,180,0.2)',
              border: `1px solid ${n.type==='success'?'#10b981':n.type==='error'?'#ef4444':'#7c3aed'}`,
              color: n.type==='success'?'#6ee7b7':n.type==='error'?'#fca5a5':'#c4b5fd',
            }}>
            {n.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── شريط النقاط + قضية جديدة ── */}
      <div style={{
        background: C.goldDim, borderRadius:12, padding:'10px 14px', marginBottom:14,
        border:`1px solid rgba(245,158,11,0.2)`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8,
      }}>
        <div>
          <span style={{color:C.gold, fontWeight:700, fontSize:'1rem'}}>⭐ {points} نقطة</span>
          <span style={{color:C.textMuted, fontSize:'0.72rem', marginRight:10}}>تكلفة التحقيق: {investigationCost}</span>
        </div>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={handleNewGame}
          style={{
            background:'linear-gradient(135deg,#1e1b4b,#312e81)', border:'1px solid #4338ca',
            color:'#a5b4fc', borderRadius:10, padding:'6px 14px', fontWeight:700, fontSize:'0.82rem',
            cursor:'pointer', display:'flex', alignItems:'center', gap:6,
          }}>
          <FaRedo style={{fontSize:'0.75rem'}}/> قضية جديدة
        </motion.button>
      </div>

      {/* ── العنوان والوصف ── */}
      {caseData.title && (
        <div style={{
          background:'linear-gradient(135deg,rgba(30,15,60,0.9),rgba(15,8,30,0.95))',
          borderRadius:14, padding:'14px 16px', marginBottom:14,
          border:`1px solid rgba(124,58,237,0.3)`,
          animation:'flickerIn 0.6s ease forwards',
        }}>
          <h2 style={{color:C.gold, fontWeight:700, fontSize:'1.2rem', margin:'0 0 6px 0', letterSpacing:'0.03em'}}>{caseData.title}</h2>
          <p style={{color:C.textMuted, fontSize:'0.8rem', lineHeight:1.7, margin:0}}>{caseData.description}</p>
        </div>
      )}

      {/* ── التقارير الطبية ── */}
      {caseData.autopsy && (
        <div style={{marginBottom:14}}>
          {/* التقرير الأولي المجاني */}
          {!inventory.includes('basic_autopsy') ? (
            <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}}
              onClick={() => setInventory(prev => [...prev, 'basic_autopsy'])}
              style={{
                width:'100%', padding:'10px 16px', borderRadius:12,
                border:'1px dashed #10b981', background:'rgba(6,78,59,0.15)',
                color:'#6ee7b7', fontWeight:700, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                animation:'greenPulse 2.5s ease-in-out infinite', fontSize:'0.88rem', marginBottom:10,
              }}>
              <FaFileMedical /> عرض التقرير الأولي — مجاني
            </motion.button>
          ) : (
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.45}}
              style={{
                borderRadius:12, border:'1px solid rgba(16,185,129,0.3)',
                background:'linear-gradient(160deg,rgba(6,20,15,0.97),rgba(4,14,10,0.99))',
                overflow:'hidden', position:'relative', marginBottom:10,
              }}>
              <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
                <div style={{position:'absolute',left:0,right:0,height:'25%',background:'linear-gradient(to bottom,transparent,rgba(16,185,129,0.04),transparent)',animation:'scanline 4s linear infinite'}}/>
              </div>
              <div style={{background:'linear-gradient(90deg,#064e3b,#065f46,#064e3b)',padding:'7px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <FaFileMedical style={{color:'#6ee7b7'}}/>
                  <span style={{color:'#a7f3d0',fontWeight:700,fontSize:'0.82rem',letterSpacing:'0.06em'}}>التقرير الأولي — الطب الشرعي</span>
                </div>
                <span style={{color:'#34d399',fontSize:'0.65rem',opacity:0.7}}>PRELIMINARY</span>
              </div>
              <div style={{borderTop:'1px dashed rgba(16,185,129,0.2)',margin:'0 14px',position:'relative',zIndex:1}}/>
              <div style={{padding:'12px 16px',position:'relative',zIndex:1}}>
                {(() => {
                  const basicLines = caseData.autopsy.basicText
                    ? caseData.autopsy.basicText.split('\n').filter(Boolean)
                    : [
                        caseData.autopsy.text.match(/وقت الوفاة[^.\n]*/)?.[0]?.trim() || 'وقت الوفاة: غير محدد بدقة',
                        'سبب الوفاة الظاهري: يتطلب تحليلاً معملياً متقدماً.',
                        'لا توجد إصابات خارجية واضحة في الفحص الأولي السريع.',
                      ];
                  return basicLines.map((line, i) => (
                    <motion.p key={i} initial={{opacity:0,x:-6}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.1,duration:0.3}}
                      style={{color:i===0?'#6ee7b7':'#9ca3af',fontSize:'0.8rem',lineHeight:1.7,margin:'0 0 3px 0'}}>
                      {line}
                    </motion.p>
                  ));
                })()}
              </div>
              <div style={{background:'rgba(6,78,59,0.25)',padding:'4px 14px',display:'flex',justifyContent:'space-between',position:'relative',zIndex:1}}>
                <span style={{color:'#6b7280',fontSize:'0.62rem'}}>وحدة التحقيق الجنائي — أولي</span>
                <span style={{color:'#6b7280',fontSize:'0.62rem'}}>التفاصيل الكاملة في التقرير المتقدم ↓</span>
              </div>
            </motion.div>
          )}

          {/* التقرير المتقدم */}
          {caseData.autopsy.isKey && (
            !inventory.includes('autopsy_report') ? (
              <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}}
                onClick={handleGetAutopsy} disabled={state.ap < 1}
                style={{
                  width:'100%', padding:'10px 16px', borderRadius:12,
                  border: state.ap<1?'1px solid #374151':'1px dashed #dc2626',
                  background: state.ap<1?'rgba(31,41,55,0.5)':'rgba(127,29,29,0.2)',
                  color: state.ap<1?'#6b7280':'#fca5a5', fontWeight:700,
                  cursor: state.ap<1?'not-allowed':'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                  animation: state.ap>=1?'redPulse 2s ease-in-out infinite':'none', fontSize:'0.88rem',
                }}>
                <FaFileMedical/> {state.ap<1?'لا تتوفر طاقة كافية':'طلب تقرير الطب الشرعي المتقدم (−1 AP)'}
              </motion.button>
            ) : (
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
                style={{borderRadius:14,border:'1px solid rgba(239,68,68,0.35)',background:'linear-gradient(160deg,rgba(30,10,10,0.95),rgba(20,5,5,0.98))',overflow:'hidden',position:'relative'}}>
                <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:0}}>
                  <div style={{position:'absolute',left:0,right:0,height:'30%',background:'linear-gradient(to bottom,transparent,rgba(239,68,68,0.04),transparent)',animation:'scanline 3s linear infinite'}}/>
                </div>
                <div style={{background:'linear-gradient(90deg,#7f1d1d,#991b1b,#7f1d1d)',padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <FaFileMedical style={{color:'#fca5a5'}}/>
                    <span style={{color:'#fecaca',fontWeight:700,fontSize:'0.85rem',letterSpacing:'0.08em'}}>تقرير الطب الشرعي المتقدم — سري</span>
                  </div>
                  <span style={{color:'#f87171',fontSize:'0.7rem',opacity:0.8}}>CONFIDENTIAL</span>
                </div>
                <div style={{borderTop:'1px dashed rgba(239,68,68,0.25)',margin:'0 14px',position:'relative',zIndex:1}}/>
                <div style={{padding:'14px 16px',position:'relative',zIndex:1}}>
                  <motion.div initial={{scale:2.5,rotate:-20,opacity:0}} animate={{scale:1,rotate:-12,opacity:0.18}}
                    transition={{delay:0.3,duration:0.6}} style={{position:'absolute',top:12,left:12,border:'3px solid #ef4444',borderRadius:6,padding:'2px 8px',color:'#ef4444',fontWeight:900,fontSize:'1.1rem',letterSpacing:'0.15em',pointerEvents:'none',userSelect:'none'}}>
                    مُحرَّر
                  </motion.div>
                  {caseData.autopsy.text.split('\n').filter(Boolean).map((line,i) => (
                    <motion.p key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.15+i*0.08,duration:0.35}}
                      style={{color:line.startsWith('ملاحظة')||line.startsWith('سبب')?'#fca5a5':'#d1d5db',fontSize:'0.82rem',lineHeight:1.75,margin:'0 0 4px 0',borderRight:line.startsWith('ملاحظة')?'3px solid #ef4444':'none',paddingRight:line.startsWith('ملاحظة')?8:0}}>
                      {line}
                    </motion.p>
                  ))}
                </div>
                <div style={{background:'rgba(127,29,29,0.3)',padding:'5px 14px',display:'flex',justifyContent:'space-between',position:'relative',zIndex:1}}>
                  <span style={{color:'#6b7280',fontSize:'0.65rem'}}>وحدة التحقيق الجنائي</span>
                  <span style={{color:'#6b7280',fontSize:'0.65rem'}}>🔒 وثيقة سرية</span>
                </div>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* ── شريط AP + بحث ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{display:'flex',gap:14,alignItems:'center'}}>
          <span style={{color:C.text,fontSize:'0.85rem'}}>
            ⚡ <span style={{color:'#818cf8',fontWeight:700}}>{state.ap}</span> طاقة
          </span>
          <button onClick={() => {}} style={{color:'#a78bfa',background:'none',border:'none',cursor:'pointer',fontSize:'0.82rem'}}>
            <FaBox style={{display:'inline',marginLeft:4}}/> {inventory.length} دليل
          </button>
        </div>
        <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}}
          onClick={() => setSearchModalOpen(true)} disabled={state.ap<1}
          style={{
            background: state.ap<1?'rgba(31,41,55,0.5)':'linear-gradient(135deg,rgba(6,78,59,0.7),rgba(5,46,22,0.9))',
            border:`1px solid ${state.ap<1?'#374151':'#10b981'}`,
            color: state.ap<1?'#6b7280':'#6ee7b7', borderRadius:10, padding:'7px 14px',
            fontWeight:700, fontSize:'0.82rem', cursor:state.ap<1?'not-allowed':'pointer',
            display:'flex', alignItems:'center', gap:6,
          }}>
          <FaSearch style={{fontSize:'0.75rem'}}/> فحص المواقع (−1 AP)
        </motion.button>
      </div>

      {/* ── الأزرار الرئيسية ── */}
      {[
        { label:'عرض المشتبه بهم', icon:'👥', onClick:()=>setSuspectsModalOpen(true), color:'#818cf8', borderColor:'rgba(129,140,248,0.3)', bg:'rgba(49,46,129,0.2)' },
        { label:'غرفة التحقيق', icon:'🔦', onClick:()=>setInvestigationOpen(true), color:'#fbbf24', borderColor:'rgba(251,191,36,0.3)', bg:'rgba(120,53,15,0.2)' },
        { label:'توجيه الاتهام', icon:'⚖️', onClick:handleAccuse, color:'#f87171', borderColor:'rgba(248,113,113,0.35)', bg:'rgba(127,29,29,0.2)' },
      ].map((btn, i) => (
        <motion.button key={i} whileHover={{scale:1.01}} whileTap={{scale:0.98}}
          onClick={btn.onClick}
          style={{
            width:'100%', padding:'11px 16px', borderRadius:12, marginBottom:10,
            border:`1px solid ${btn.borderColor}`, background:btn.bg,
            color:btn.color, fontWeight:700, fontSize:'0.92rem', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
          <span>{btn.icon}</span> {btn.label}
        </motion.button>
      ))}

      {/* ── WINNING MODAL ── */}
      {solution && (
        <>
          {Array.from({length:30}).map((_,i) => (
            <div key={i} className="confetti-piece" style={{
              left:`${Math.random()*100}%`,
              background:['#f59e0b','#10b981','#3b82f6','#ef4444','#a855f7','#ec4899'][i%6],
              width:`${6+Math.random()*8}px`, height:`${6+Math.random()*8}px`,
              animationDuration:`${2+Math.random()*3}s`, animationDelay:`${Math.random()*2}s`,
            }}/>
          ))}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}}
            style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(4px)'}}>
            <motion.div initial={{scale:0.5,opacity:0,y:60}} animate={{scale:1,opacity:1,y:0}}
              transition={{type:'spring',stiffness:180,damping:16,delay:0.15}}
              style={{background:'#0a0814',borderRadius:24,maxWidth:440,width:'100%',textAlign:'center',overflow:'hidden',border:'2px solid #f59e0b',animation:'pulseGold 2.5s ease-in-out infinite'}}>
              <div style={{background:'linear-gradient(90deg,#92400e,#f59e0b,#92400e)',height:5}}/>
              <div style={{padding:'24px 24px 32px'}}>
                <motion.div initial={{scale:0,rotate:-30}} animate={{scale:1,rotate:0}}
                  transition={{type:'spring',stiffness:200,damping:12,delay:0.35}}
                  style={{fontSize:'3.5rem',lineHeight:1,marginBottom:8}}>🏆</motion.div>
                <motion.h2 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.5}}
                  style={{fontSize:'1.7rem',fontWeight:700,color:'#fbbf24',animation:'badgeGlow 2s ease-in-out infinite',marginBottom:16}}>
                  تم حل القضية!
                </motion.h2>
                {solution.image && (
                  <motion.img src={solution.image} alt="القاتل"
                    initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.6,type:'spring'}}
                    style={{width:120,height:120,borderRadius:'50%',objectFit:'cover',border:'3px solid #f59e0b',margin:'0 auto 16px',display:'block',boxShadow:'0 0 20px #f59e0b88'}}/>
                )}
                {[{label:'🔪 القاتل',value:solution.culprit,color:'#f87171'},{label:'⚔️ الأداة',value:solution.weapon,color:'#fb923c'},{label:'💡 الدافع',value:solution.motive,color:'#facc15'}].map((row,i) => (
                  <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.65+i*0.12}}
                    style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.05)',borderRadius:10,padding:'8px 14px',marginBottom:8}}>
                    <span style={{color:'#9ca3af',fontSize:'0.88rem'}}>{row.label}</span>
                    <span style={{color:row.color,fontWeight:700,fontSize:'0.95rem'}}>{row.value}</span>
                  </motion.div>
                ))}
                {solution.winners?.length > 0 && (
                  <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:1.05,type:'spring'}}
                    style={{margin:'12px 0 6px',padding:'10px 16px',background:'rgba(16,185,129,0.15)',border:'1px solid #10b981',borderRadius:12}}>
                    <p style={{color:'#6ee7b7',fontWeight:700,margin:0}}>🎉 الفائزون: {solution.winners.join('، ')}</p>
                  </motion.div>
                )}
                {solution.finalPoints && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
                    style={{color:'#fbbf24',fontWeight:700,margin:'8px 0 16px',fontSize:'0.95rem'}}>
                    ⭐ نقاطك النهائية: {solution.finalPoints[playerId]||0}
                  </motion.div>
                )}
                <motion.button onClick={handleNewGame} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                  transition={{delay:1.35}} whileHover={{scale:1.04}} whileTap={{scale:0.97}}
                  style={{width:'100%',padding:12,borderRadius:12,background:'linear-gradient(135deg,#0e7490,#0891b2)',color:'white',fontWeight:700,fontSize:'1rem',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <FaRedo/> قضية جديدة
                </motion.button>
              </div>
              <div style={{background:'linear-gradient(90deg,#92400e,#f59e0b,#92400e)',height:5}}/>
            </motion.div>
          </motion.div>
        </>
      )}

      {/* ── Suspects Modal ── */}
      {suspectsModalOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
            style={{background:'linear-gradient(160deg,rgba(15,10,35,0.99),rgba(10,6,25,1))',borderRadius:20,padding:24,maxWidth:560,width:'100%',maxHeight:'80vh',border:`1px solid rgba(129,140,248,0.25)`,overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{color:'#a5b4fc',fontWeight:700,fontSize:'1.1rem',margin:0}}>👥 المشتبه بهم</h3>
              <button onClick={()=>setSuspectsModalOpen(false)} style={{color:'#6b7280',background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {caseData.suspects.map(s => (
                <motion.div key={s.id} whileHover={{scale:1.01}}
                  style={{background:'rgba(49,46,129,0.2)',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(129,140,248,0.2)'}}>
                  <p style={{color:'#e2e8f0',fontWeight:700,margin:'0 0 4px 0',fontSize:'0.95rem'}}>{s.name}</p>
                  <p style={{color:'#818cf8',fontSize:'0.78rem',margin:'0 0 4px 0'}}>العلاقة: {s.relationship}</p>
                  <p style={{color:'#6b7280',fontSize:'0.75rem',margin:0,fontStyle:'italic'}}>"{s.statement}"</p>
                </motion.div>
              ))}
            </div>
            <button onClick={()=>setSuspectsModalOpen(false)}
              style={{width:'100%',marginTop:16,padding:'10px',borderRadius:12,background:'rgba(49,46,129,0.4)',border:'1px solid rgba(129,140,248,0.3)',color:'#a5b4fc',fontWeight:700,cursor:'pointer'}}>
              إغلاق
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ── Investigation Modal ── */}
      {investigationOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16,
                  background:'rgba(0,0,0,0.94)',backdropFilter:'blur(3px)'}}>
          <motion.div initial={{scale:0.88,y:30}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:200,damping:20}}
            style={{
              background:'linear-gradient(160deg,rgba(12,8,28,0.99),rgba(8,4,18,1))',
              borderRadius:20, padding:20, maxWidth:580, width:'100%', maxHeight:'90vh',
              border:'1px solid rgba(251,191,36,0.2)',
              display:'flex', flexDirection:'column',
              boxShadow:'0 0 60px rgba(251,191,36,0.05), inset 0 0 60px rgba(0,0,0,0.5)',
            }}>

            {/* header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,
                          borderBottom:'1px solid rgba(251,191,36,0.1)',paddingBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:'1.2rem'}}>🔦</span>
                <h3 style={{color:'#fbbf24',fontWeight:700,fontSize:'1rem',margin:0,letterSpacing:'0.05em'}}>
                  {selectedSuspect ? `التحقيق مع ${caseData.suspects.find(s=>s.id===selectedSuspect)?.name}` : 'اختر المشتبه به'}
                </h3>
              </div>
              <button onClick={closeInvestigation}
                style={{color:'#6b7280',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
                ✕
              </button>
            </div>

            {!selectedSuspect ? (
              /* قائمة المشتبهين */
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {caseData.suspects.map(s => (
                  <motion.button key={s.id} whileHover={{scale:1.03,borderColor:'rgba(251,191,36,0.5)'}} whileTap={{scale:0.97}}
                    onClick={() => startInvestigation(s.id)}
                    disabled={investigatingSuspect !== null}
                    style={{
                      background:'linear-gradient(135deg,rgba(30,20,60,0.8),rgba(20,12,40,0.9))',
                      border:'1px solid rgba(251,191,36,0.2)', borderRadius:14, padding:'14px 12px',
                      color:'#e2d9f3', fontWeight:700, cursor: investigatingSuspect?'not-allowed':'pointer',
                      opacity: investigatingSuspect?0.5:1, textAlign:'center',
                    }}>
                    <div style={{fontSize:'1.5rem',marginBottom:4}}>🕵️</div>
                    <div style={{fontSize:'0.85rem',color:'#e2d9f3'}}>{s.name}</div>
                    <div style={{fontSize:'0.7rem',color:'#fbbf24',marginTop:4}}>
                      {points >= investigationCost ? `${investigationCost} نقطة` : '⚠️ نقاط غير كافية'}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              /* شاشة الحوار */
              <div style={{display:'flex',flexDirection:'column',flex:1,minHeight:0}}>
                {/* زرار رجوع + معلومات */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <button onClick={()=>{setSelectedSuspect(null);if(typingTimeoutRef.current)clearTimeout(typingTimeoutRef.current);setIsTyping(false);}}
                    style={{color:'#fbbf24',background:'none',border:'none',cursor:'pointer',fontSize:'0.8rem',display:'flex',alignItems:'center',gap:4}}>
                    ← العودة
                  </button>
                  <span style={{color:'#6b7280',fontSize:'0.7rem'}}>
                    {caseData.suspects.find(s=>s.id===selectedSuspect)?.relationship}
                  </span>
                </div>

                {/* منطقة المحادثة */}
                <div style={{
                  flex:1, overflowY:'auto', padding:'12px', borderRadius:12, marginBottom:10,
                  background:'rgba(5,3,15,0.8)',
                  border:'1px solid rgba(251,191,36,0.08)',
                  display:'flex', flexDirection:'column', gap:8, maxHeight:320,
                }}>
                  {currentMessages.map((msg, idx) => (
                    <motion.div key={idx}
                      initial={{opacity:0, x:msg.type==='player'?30:-30, y:5}}
                      animate={{opacity:1, x:0, y:0}}
                      transition={{duration:0.35, ease:'easeOut'}}
                      style={{display:'flex', justifyContent:msg.type==='player'?'flex-end':'flex-start'}}>
                      <div style={{
                        maxWidth:'78%', padding:'9px 13px', borderRadius: msg.type==='player'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                        background: msg.type==='player'
                          ? 'linear-gradient(135deg,rgba(109,40,217,0.7),rgba(76,29,149,0.8))'
                          : 'linear-gradient(135deg,rgba(30,20,50,0.9),rgba(20,14,40,0.95))',
                        border: msg.type==='player'
                          ? '1px solid rgba(167,139,250,0.3)'
                          : '1px solid rgba(251,191,36,0.12)',
                        color: msg.type==='player'?'#ddd6fe':'#d1c9e8',
                        fontSize:'0.83rem', lineHeight:1.6,
                        boxShadow: msg.type==='player'?'0 2px 12px rgba(109,40,217,0.2)':'0 2px 8px rgba(0,0,0,0.3)',
                      }}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* typing indicator */}
                  {isTyping && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',justifyContent:'flex-start'}}>
                      <div style={{
                        padding:'10px 14px', borderRadius:'14px 14px 14px 4px',
                        background:'linear-gradient(135deg,rgba(30,20,50,0.9),rgba(20,14,40,0.95))',
                        border:'1px solid rgba(251,191,36,0.12)',
                        display:'flex', gap:5, alignItems:'center',
                      }}>
                        {[0,300,600].map(delay => (
                          <motion.span key={delay}
                            animate={{y:[-3,0,-3]}} transition={{duration:0.7,repeat:Infinity,delay:delay/1000}}
                            style={{width:6,height:6,background:'#7c6fa0',borderRadius:'50%',display:'block'}}/>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef}/>
                </div>

                {/* الاختيارات */}
                {currentNodeId && !isTyping && (
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {(() => {
                      const dialogue = getSuspectDialogue(selectedSuspect);
                      if (!dialogue) return null;
                      const node = dialogue.find(d => d.id === currentNodeId);
                      if (!node || !node.options || node.options.length === 0) {
                        return (
                          <div style={{textAlign:'center',padding:'10px 0'}}>
                            <p style={{color:'#4b4568',fontSize:'0.78rem',margin:'0 0 8px 0'}}>— انتهى الحوار —</p>
                            <button onClick={()=>setSelectedSuspect(null)}
                              style={{background:'rgba(109,40,217,0.25)',border:'1px solid rgba(167,139,250,0.3)',color:'#a78bfa',borderRadius:10,padding:'7px 16px',cursor:'pointer',fontSize:'0.82rem',fontWeight:600}}>
                              العودة للقائمة
                            </button>
                          </div>
                        );
                      }

                      const freeOptions = node.options.filter(o => !o.requiredEvidence);
                      const unlockedConfronts = node.options.filter(o => o.requiredEvidence && inventory.includes(o.requiredEvidence));
                      const lockedConfronts = node.options.filter(o => o.requiredEvidence && !inventory.includes(o.requiredEvidence));

                      return (
                        <>
                          {/* أسئلة عادية */}
                          {freeOptions.map((opt, idx) => (
                            <motion.button key={`f-${idx}`}
                              whileHover={{scale:1.02, borderColor:'rgba(167,139,250,0.5)'}}
                              whileTap={{scale:0.97}}
                              onClick={() => handleChooseOption(selectedSuspect, opt)}
                              style={{
                                width:'100%', padding:'9px 14px', borderRadius:10, textAlign:'right',
                                background:'rgba(30,20,55,0.7)', border:'1px solid rgba(99,60,180,0.25)',
                                color:'#c4b5fd', fontSize:'0.82rem', cursor:'pointer', fontWeight:500,
                              }}>
                              {opt.text}
                            </motion.button>
                          ))}

                          {/* مواجهات مفتوحة بدليل — بلون مميز */}
                          {unlockedConfronts.map((opt, idx) => (
                            <motion.button key={`u-${idx}`}
                              whileHover={{scale:1.02}}
                              whileTap={{scale:0.97}}
                              onClick={() => handleChooseOption(selectedSuspect, opt)}
                              style={{
                                width:'100%', padding:'9px 14px', borderRadius:10, textAlign:'right',
                                background:'linear-gradient(135deg,rgba(120,53,15,0.5),rgba(92,38,8,0.6))',
                                border:'1px solid rgba(251,191,36,0.4)',
                                color:'#fde68a', fontSize:'0.82rem', cursor:'pointer', fontWeight:700,
                                animation:'evidencePing 1.5s ease-in-out 2',
                                display:'flex', alignItems:'center', gap:8,
                              }}>
                              <span style={{fontSize:'0.9rem'}}>⚡</span>
                              <span>{opt.text}</span>
                            </motion.button>
                          ))}

                          {/* مواجهات مقفولة — مخفية تماماً */}
                          {/* لا نعرض أي حاجة للاختيارات المقفولة */}

                          {freeOptions.length === 0 && unlockedConfronts.length === 0 && lockedConfronts.length > 0 && (
                            <p style={{color:'#4b4568',fontSize:'0.75rem',textAlign:'center',padding:'6px 0'}}>
                              ابحث عن أدلة لفتح أسئلة المواجهة
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── Search Modal ── */}
      {searchModalOpen && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
            style={{background:'linear-gradient(160deg,rgba(5,20,12,0.99),rgba(3,12,8,1))',borderRadius:20,padding:24,maxWidth:420,width:'100%',border:'1px solid rgba(16,185,129,0.25)'}}>
            <h3 style={{color:'#6ee7b7',fontWeight:700,fontSize:'1rem',textAlign:'center',marginBottom:16}}>🔍 اختر موقع البحث</h3>
            {searching ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'32px 0'}}>
                <motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}}
                  style={{fontSize:'2.5rem',color:'#10b981'}}>🔍</motion.div>
                <p style={{color:'#9ca3af',marginTop:16,fontSize:'0.9rem'}}>جاري فحص الموقع...</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {caseData.locations && Object.entries(caseData.locations).map(([key,loc]) => (
                  <motion.button key={key} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                    onClick={() => handleSearch(key)}
                    disabled={searchedLocations.includes(key)}
                    style={{
                      background: searchedLocations.includes(key)?'rgba(31,41,55,0.4)':'rgba(6,78,59,0.2)',
                      border:`1px solid ${searchedLocations.includes(key)?'#374151':'rgba(16,185,129,0.3)'}`,
                      color: searchedLocations.includes(key)?'#4b5563':'#6ee7b7',
                      borderRadius:12, padding:'10px 14px', textAlign:'right',
                      cursor: searchedLocations.includes(key)?'not-allowed':'pointer',
                      fontWeight:600, fontSize:'0.85rem',
                      display:'flex', alignItems:'center', gap:8,
                    }}>
                    <FaMapPin style={{opacity: searchedLocations.includes(key)?0.4:1}}/>
                    {loc.name}
                    {searchedLocations.includes(key) && <span style={{marginRight:'auto',fontSize:'0.7rem',opacity:0.6}}>✓ تم الفحص</span>}
                  </motion.button>
                ))}
                <button onClick={()=>setSearchModalOpen(false)}
                  style={{marginTop:8,padding:'9px',borderRadius:12,background:'rgba(127,29,29,0.3)',border:'1px solid rgba(239,68,68,0.25)',color:'#fca5a5',fontWeight:700,cursor:'pointer'}}>
                  إلغاء
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ── Accusation Modal ── */}
      {accusationPhase && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.94)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16}}>
          <motion.div initial={{scale:0.88,y:30}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:200,damping:20}}
            style={{
              background:'linear-gradient(160deg,rgba(30,10,10,0.99),rgba(20,5,5,1))',
              borderRadius:20, padding:24, maxWidth:420, width:'100%',
              border:'2px solid rgba(239,68,68,0.4)',
              boxShadow:'0 0 40px rgba(239,68,68,0.1)',
            }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#fbbf24',fontWeight:700,fontSize:'1.2rem',margin:0}}>⚖️ توجيه الاتهام</h2>
              <button onClick={()=>setAccusationPhase(false)}
                style={{color:'#6b7280',background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>✕</button>
            </div>

            {hasVoted ? (
              <div style={{textAlign:'center',padding:'32px 0'}}>
                <motion.div animate={{scale:[1,1.1,1]}} transition={{repeat:Infinity,duration:1.5}} style={{fontSize:'3rem',marginBottom:16}}>⏳</motion.div>
                <h3 style={{color:'#10b981',fontWeight:700,margin:'0 0 8px 0'}}>تم تسجيل اتهامك!</h3>
                <p style={{color:'#9ca3af',margin:0,fontSize:'0.88rem'}}>في انتظار باقي المحققين...</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <p style={{color:'#9ca3af',fontSize:'0.8rem',margin:'0 0 4px 0',textAlign:'center'}}>
                  اكتب إجاباتك بناءً على ما جمعته من أدلة
                </p>

                {[
                  { label:'🔪 من هو القاتل؟', key:'suspect', placeholder:'اكتب اسم المشتبه به...', color:'#f87171' },
                  { label:'⚔️ ما هي أداة الجريمة؟', key:'weapon', placeholder:'اكتب أداة الجريمة...', color:'#fb923c' },
                  { label:'💡 ما هو الدافع؟', key:'motive', placeholder:'اكتب الدافع وراء الجريمة...', color:'#fbbf24' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{color:field.color,fontSize:'0.78rem',fontWeight:700,display:'block',marginBottom:5}}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={vote[field.key]}
                      onChange={e => setVote({...vote,[field.key]:e.target.value})}
                      placeholder={field.placeholder}
                      style={{
                        width:'100%', boxSizing:'border-box',
                        padding:'9px 13px', borderRadius:10, fontSize:'0.85rem',
                        background:'rgba(20,10,10,0.8)',
                        border:`1px solid ${vote[field.key]?'rgba(239,68,68,0.4)':'rgba(75,50,50,0.5)'}`,
                        color:'#e2d9f3', outline:'none',
                      }}
                    />
                  </div>
                ))}

                <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                  onClick={handleVoteSubmit}
                  disabled={!vote.suspect.trim()||!vote.weapon.trim()||!vote.motive.trim()}
                  style={{
                    marginTop:4, padding:'11px', borderRadius:12, fontWeight:700, fontSize:'0.95rem',
                    background: (!vote.suspect.trim()||!vote.weapon.trim()||!vote.motive.trim())
                      ?'rgba(75,50,50,0.4)':'linear-gradient(135deg,rgba(185,28,28,0.8),rgba(153,27,27,0.9))',
                    border:'1px solid rgba(239,68,68,0.4)',
                    color: (!vote.suspect.trim()||!vote.weapon.trim()||!vote.motive.trim())?'#6b7280':'#fca5a5',
                    cursor: (!vote.suspect.trim()||!vote.weapon.trim()||!vote.motive.trim())?'not-allowed':'pointer',
                  }}>
                  تأكيد الاتهام
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default MafiosaGame;