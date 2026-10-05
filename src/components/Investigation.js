import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
  Fonts — ضيفهم في index.html:
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
*/

/* ============================================================ SOUNDS */
function useSoundEffects() {
  const ref = useRef({});
  useEffect(() => {
    const files = { correct:'/sounds/correct.mp3', wrong:'/sounds/wrong.mp3', ready:'/sounds/ready.mp3', win:'/sounds/win.mp3', tick:'/sounds/tick.mp3', theme:'/sounds/investigation_theme.mp3', string:'/sounds/ready.mp3' };
    Object.entries(files).forEach(([k,p]) => { try { const a=new Audio(p); a.preload='auto'; a.volume=k==='theme'?0.25:0.5; if(k==='theme')a.loop=true; ref.current[k]=a; } catch{} });
  }, []);
  const play = useCallback(k => { try { const a=ref.current[k]; if(!a)return; a.currentTime=0; const p=a.play(); if(p?.catch)p.catch(()=>{}); } catch{} }, []);
  const stop = useCallback(k => { try { const a=ref.current[k]; if(a){a.pause();a.currentTime=0;} } catch{} }, []);
  const stopAll = useCallback(except => { try { Object.entries(ref.current).forEach(([k,a])=>{ if(!a||k===except)return; a.pause(); a.currentTime=0; }); } catch{} }, []);
  return { play, stop, stopAll };
}

/* ============================================================ NOISE */
const NoiseCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if(!c) return;
    const ctx = c.getContext('2d');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const img = ctx.createImageData(c.width, c.height);
    for(let i=0;i<img.data.length;i+=4){ const v=Math.random()*22; img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=16; }
    ctx.putImageData(img,0,0);
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" style={{mixBlendMode:'overlay'}} />;
};

/* ============================================================ ATOMS */
const Label = ({ children, color='text-stone-500', className='' }) => (
  <p className={`font-['JetBrains_Mono'] text-[9px] tracking-[0.22em] uppercase ${color} ${className}`}>{children}</p>
);

const PulseDot = ({ color='bg-red-700' }) => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-50`}/>
    <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`}/>
  </span>
);

const CaseCard = ({ children, className='', accent=null, hover=false }) => (
  <div className={`relative rounded-xl overflow-hidden bg-[#0d0d11] border border-stone-800/70 ${hover?'transition-all duration-200 hover:border-stone-600 hover:-translate-y-0.5':''} ${className}`}
    style={{ boxShadow: accent ? `0 0 0 1px ${accent}18, 0 6px 28px rgba(0,0,0,0.65)` : '0 4px 24px rgba(0,0,0,0.55)' }}>
    {accent && <div className="absolute inset-x-0 top-0 h-px" style={{background:accent,opacity:0.65}}/>}
    {children}
  </div>
);

const Btn = ({ children, onClick, disabled, variant='ghost', size='md', className='' }) => {
  const base = "inline-flex items-center justify-center gap-2 font-['JetBrains_Mono'] tracking-widest uppercase transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed select-none rounded-lg";
  const sizes = { sm:'text-[10px] px-3 py-1.5', md:'text-[11px] px-5 py-2.5', lg:'text-xs px-7 py-3', xl:'text-sm px-10 py-4' };
  const variants = {
    ghost:'border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200 active:scale-95',
    red:'border border-red-900/80 text-red-400 bg-red-950/25 hover:bg-red-900/35 hover:border-red-700 active:scale-95',
    teal:'border border-teal-900/80 text-teal-400 bg-teal-950/15 hover:bg-teal-900/25 hover:border-teal-700 active:scale-95',
    amber:'border border-amber-900/80 text-amber-400 bg-amber-950/15 hover:bg-amber-900/25 hover:border-amber-700 active:scale-95',
    solid:'bg-stone-100 text-stone-900 hover:bg-white active:scale-95 font-semibold border border-transparent',
  };
  return (
    <motion.button whileTap={!disabled?{scale:0.97}:{}} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </motion.button>
  );
};

const Confetti = () => {
  const colors = ['#dc2626','#0d9488','#d97706','#7c3aed','#e5e7eb'];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {Array.from({length:55}).map((_,i) => (
        <motion.div key={i} className="absolute w-1.5 h-3 rounded-sm"
          style={{left:`${Math.random()*100}%`,top:'-5%',background:colors[i%colors.length]}}
          initial={{y:0,rotate:0,opacity:1}}
          animate={{y:'110vh',rotate:720+Math.random()*720,opacity:[1,1,0]}}
          transition={{duration:3+Math.random()*2,delay:Math.random()*1.5,ease:'easeIn',repeat:Infinity,repeatDelay:Math.random()*3}}/>
      ))}
    </div>
  );
};

/* ============================================================ NEWLY UNLOCKED EVIDENCE TOAST */
const EvidenceToast = ({ evidence, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity:0, y:50, scale:0.92 }} animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:30, scale:0.92 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-5 py-3 rounded-xl"
      style={{ background:'#0d0d11', border:'1px solid #0d9488', boxShadow:'0 0 30px rgba(13,148,136,0.25)' }}
    >
      <span className="text-2xl">{evidence.icon}</span>
      <div>
        <p className="font-['JetBrains_Mono'] text-[9px] text-teal-600 tracking-widest uppercase mb-0.5">دليل جديد اكتُشف</p>
        <p className="font-['Crimson_Pro'] text-stone-200 text-sm font-semibold">{evidence.name}</p>
      </div>
      <div className="w-px h-8 bg-stone-800 mx-1"/>
      <span className="text-teal-500 text-lg">🔍</span>
    </motion.div>
  );
};

/* ============================================================ REPORT MODAL */
const ReportModal = ({ open, onClose, askedQuestions, collectedEvidence, evidenceList, filterById, isAdmin }) => {
  const visibleQ = askedQuestions.filter(q=>q.askedById===filterById);
  const grouped = {};
  visibleQ.forEach(q => { if(!grouped[q.suspectId]) grouped[q.suspectId]={name:q.suspectName,avatar:q.suspectAvatar,items:[]}; grouped[q.suspectId].items.push(q); });
  const evItems = evidenceList.filter(e=>collectedEvidence.includes(e.id)&&!e.hidden);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(8px)'}}
          onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
          <motion.div initial={{y:-30,opacity:0,scale:0.96}} animate={{y:0,opacity:1,scale:1}} exit={{y:-30,opacity:0}}
            transition={{type:'spring',stiffness:240,damping:24}} className="my-8 w-full max-w-2xl">
            <CaseCard accent="#dc2626">
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800/60">
                <div>
                  <Label color="text-red-700" className="mb-1">{isAdmin?'سجل كامل':'سجلي الشخصي'}</Label>
                  <p className="font-['Crimson_Pro'] text-xl font-semibold text-stone-100">سجل التحقيق</p>
                </div>
                <div className="text-right">
                  <p className="font-['Bebas_Neue'] text-4xl text-red-500 leading-none">{visibleQ.length}</p>
                  <Label color="text-stone-600">استجواب</Label>
                </div>
              </div>
              <div className="p-5 max-h-[68vh] overflow-y-auto space-y-5">
                {evItems.length > 0 && (
                  <div>
                    <Label color="text-teal-600" className="mb-3">الأدلة المكتشفة ({evItems.length})</Label>
                    <div className="space-y-2">
                      {evItems.map(e=>(
                        <div key={e.id} className="flex items-start gap-3 p-3 bg-stone-900/40 border border-stone-800/50 rounded-lg">
                          <span className="text-xl shrink-0">{e.icon}</span>
                          <div>
                            <p className="font-['Crimson_Pro'] text-sm font-semibold text-stone-200">{e.name}</p>
                            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{e.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label color="text-stone-500" className="mb-3">الاستجوابات</Label>
                  {Object.values(grouped).length===0 ? (
                    <p className="text-center py-8 text-stone-600 font-['Crimson_Pro'] italic text-sm">لم تجرِ أي استجوابات حتى الآن</p>
                  ) : (
                    Object.entries(grouped).map(([sid,g])=>(
                      <div key={sid} className="mb-5">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-800/50">
                          <span className="text-xl">{g.avatar}</span>
                          <p className="font-['Bebas_Neue'] text-lg text-stone-200 tracking-wide">{g.name}</p>
                          <span className="ml-auto font-['JetBrains_Mono'] text-[10px] text-stone-600">{g.items.length}</span>
                        </div>
                        <div className="space-y-2 pr-1">
                          {g.items.map((q,i)=>(
                            <div key={i} className="p-3 bg-stone-900/50 border-r-2 border-stone-700 rounded-r-sm">
                              <p className="text-sm text-stone-300 font-['Crimson_Pro']"><span className="text-amber-500 font-['JetBrains_Mono'] text-[9px] ml-1">س</span>{q.questionText}</p>
                              <p className="text-sm text-stone-400 mt-1.5 font-['Crimson_Pro'] leading-relaxed"><span className="text-teal-500 font-['JetBrains_Mono'] text-[9px] ml-1">ج</span>{q.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-stone-800/60 flex justify-center">
                <Btn variant="ghost" size="sm" onClick={onClose}>✕ إغلاق</Btn>
              </div>
            </CaseCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================ CRIME BOARD */
const CrimeBoard = ({ items:itemsProp, connections, suspects, evidence, collectedEvidence, onConnect, onDisconnect, onMove }) => {
  const boardRef = useRef(null);
  const [localItems, setLocalItems] = useState(itemsProp);
  const [boardSize, setBoardSize] = useState({w:1000,h:700});
  const dragRef = useRef(null);
  const dragCardRef = useRef(null);
  const hoverTargetRef = useRef(null);
  const localItemsRef = useRef(localItems);
  const pendingMovesRef = useRef(new Map());
  const [dragVisual, setDragVisual] = useState(null);
  const [dragCardVisual, setDragCardVisual] = useState(null);
  const [hoverTarget, setHoverTarget] = useState(null);
  const [selectedConn, setSelectedConn] = useState(null);

  useEffect(()=>{localItemsRef.current=localItems;},[localItems]);
  useEffect(()=>{hoverTargetRef.current=hoverTarget;},[hoverTarget]);
  useEffect(()=>{
    const now=Date.now();
    setLocalItems(itemsProp.map(inc=>{
      const pendingAt=pendingMovesRef.current.get(inc.id);
      if(pendingAt&&now-pendingAt<1500){const local=localItemsRef.current.find(p=>p.id===inc.id);if(local)return{...inc,x:local.x,y:local.y};}
      return inc;
    }));
  },[itemsProp]);
  useEffect(()=>{const id=setInterval(()=>{const now=Date.now();for(const[k,v]of pendingMovesRef.current)if(now-v>2500)pendingMovesRef.current.delete(k);},800);return()=>clearInterval(id);},[]);
  useEffect(()=>{
    const update=()=>{if(boardRef.current){const r=boardRef.current.getBoundingClientRect();setBoardSize({w:r.width,h:r.height});}};
    update(); const ro=new ResizeObserver(update); if(boardRef.current)ro.observe(boardRef.current);
    window.addEventListener('resize',update); return()=>{ro.disconnect();window.removeEventListener('resize',update);};
  },[]);

  const itemById = useMemo(()=>{const m={};localItems.forEach(it=>{m[it.id]=it;});return m;},[localItems]);

  const getItemData = item => {
    if(item.type==='suspect'){const s=suspects.find(x=>x.id===item.refId);return s?{name:s.name,avatar:s.avatar,photo:s.photo,hidden:false,isSuspect:true}:null;}
    const e=evidence.find(x=>x.id===item.refId); if(!e)return null;
    const collected=collectedEvidence.includes(item.refId);
    if(!collected||e.hidden)return{name:'???',avatar:'?',photo:null,hidden:true,isSuspect:false};
    return{name:e.name,avatar:e.icon,photo:null,hidden:false,isSuspect:false};
  };

  const CARD_W=76, CARD_H=104;
  const getAnchorPos=(item,anchor)=>({x:(item.x/100)*boardSize.w+CARD_W/2,y:(item.y/100)*boardSize.h+(anchor==='top'?0:CARD_H)});
  const handleAnchorDown=(e,item,anchor)=>{e.preventDefault();e.stopPropagation();const rect=boardRef.current.getBoundingClientRect();dragRef.current={fromItem:item.id,fromAnchor:anchor};setDragVisual({fromItem:item.id,fromAnchor:anchor,x:e.clientX-rect.left,y:e.clientY-rect.top});};
  const handleCardDown=(e,item)=>{if(e.target.closest('[data-anchor]')||dragRef.current)return;e.preventDefault();e.stopPropagation();const rect=boardRef.current.getBoundingClientRect();dragCardRef.current={itemId:item.id,offsetX:e.clientX-rect.left-(item.x/100)*rect.width,offsetY:e.clientY-rect.top-(item.y/100)*rect.height};setDragCardVisual({itemId:item.id});};

  useEffect(()=>{
    const onMoveFn=e=>{
      if(!boardRef.current)return; const rect=boardRef.current.getBoundingClientRect();
      if(dragRef.current){
        setDragVisual(d=>d?{...d,x:e.clientX-rect.left,y:e.clientY-rect.top}:null);
        const elem=document.elementFromPoint(e.clientX,e.clientY);
        if(elem?.dataset?.anchor&&elem?.dataset?.item&&elem.dataset.item!==dragRef.current.fromItem) setHoverTarget({itemId:elem.dataset.item,anchor:elem.dataset.anchor});
        else setHoverTarget(null);
      } else if(dragCardRef.current){
        const dc=dragCardRef.current;
        const pctX=Math.max(0,Math.min(95,(e.clientX-rect.left-dc.offsetX)/rect.width*100));
        const pctY=Math.max(0,Math.min(92,(e.clientY-rect.top-dc.offsetY)/rect.height*100));
        pendingMovesRef.current.set(dc.itemId,Date.now());
        setLocalItems(prev=>prev.map(it=>it.id===dc.itemId?{...it,x:pctX,y:pctY}:it));
      }
    };
    const onUpFn=()=>{
      if(dragRef.current){const ht=hoverTargetRef.current;if(ht&&ht.itemId!==dragRef.current.fromItem)onConnect({fromItem:dragRef.current.fromItem,fromAnchor:dragRef.current.fromAnchor,toItem:ht.itemId,toAnchor:ht.anchor});dragRef.current=null;setDragVisual(null);setHoverTarget(null);}
      else if(dragCardRef.current){const dc=dragCardRef.current;const item=localItemsRef.current.find(it=>it.id===dc.itemId);if(item){pendingMovesRef.current.set(item.id,Date.now());onMove(item.id,item.x,item.y);}dragCardRef.current=null;setDragCardVisual(null);}
    };
    window.addEventListener('pointermove',onMoveFn); window.addEventListener('pointerup',onUpFn); window.addEventListener('pointercancel',onUpFn);
    return()=>{window.removeEventListener('pointermove',onMoveFn);window.removeEventListener('pointerup',onUpFn);window.removeEventListener('pointercancel',onUpFn);};
  },[onConnect,onMove]);

  return (
    <div ref={boardRef} className="relative w-full h-full select-none overflow-hidden rounded-xl"
      style={{background:'#06060a',backgroundImage:`radial-gradient(ellipse at 30% 20%,rgba(127,29,29,0.07) 0%,transparent 55%),radial-gradient(ellipse at 70% 80%,rgba(13,148,136,0.05) 0%,transparent 50%),repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(255,255,255,0.01) 32px),repeating-linear-gradient(90deg,transparent,transparent 31px,rgba(255,255,255,0.01) 32px)`,border:'1px solid #1c1c24',touchAction:'none'}}>
      <svg className="absolute inset-0 w-full h-full" style={{pointerEvents:'none'}}>
        {connections.map(c=>{
          const from=itemById[c.fromItem],to=itemById[c.toItem]; if(!from||!to)return null;
          const p1=getAnchorPos(from,c.fromAnchor),p2=getAnchorPos(to,c.toAnchor);
          const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2+28;
          const path=`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`;
          const sel=selectedConn===c.id;
          return(
            <g key={c.id} style={{pointerEvents:'auto'}}>
              <path d={path} stroke="transparent" strokeWidth="16" fill="none" style={{cursor:'pointer'}} onClick={e=>{e.stopPropagation();setSelectedConn(sel?null:c.id);}}/>
              <path d={path} stroke={sel?'#ef4444':'#7f1d1d'} strokeWidth={sel?2:1.5} fill="none" strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${sel?'#ef4444':'#7f1d1d'}88)`}}/>
              {[p1,p2].map((pt,i)=><circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#7f1d1d"/>)}
            </g>
          );
        })}
        {dragVisual&&(()=>{const from=itemById[dragVisual.fromItem];if(!from)return null;const p1=getAnchorPos(from,dragVisual.fromAnchor);return<line x1={p1.x} y1={p1.y} x2={dragVisual.x} y2={dragVisual.y} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="5 3" style={{filter:'drop-shadow(0 0 4px #dc2626)'}}/>;})()}
      </svg>

      {localItems.map(item=>{
        const data=getItemData(item); if(!data)return null;
        const isDragging=dragCardVisual?.itemId===item.id;
        const isHov=hoverTarget?.itemId===item.id;
        return(
          <div key={item.id} className="absolute"
            style={{left:`${item.x}%`,top:`${item.y}%`,width:CARD_W,height:CARD_H,cursor:isDragging?'grabbing':'grab',zIndex:isDragging?100:1,transform:isDragging?'scale(1.06)':'scale(1)',transition:isDragging?'none':'transform 0.15s'}}
            onPointerDown={e=>handleCardDown(e,item)}>
            <button data-item={item.id} data-anchor="top" onPointerDown={e=>handleAnchorDown(e,item,'top')}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full cursor-crosshair z-10 transition-all"
              style={{background:isHov&&hoverTarget.anchor==='top'?'#ef4444':'#7f1d1d',border:'1.5px solid #000',transform:`translateX(-50%) scale(${isHov&&hoverTarget.anchor==='top'?1.5:1})`,boxShadow:isHov&&hoverTarget.anchor==='top'?'0 0 12px #ef4444':'0 0 6px #7f1d1d66'}}/>
            <div className="w-full h-full rounded-xl overflow-hidden"
              style={{background:data.hidden?'#0a0a0f':data.isSuspect?'#0f0a0a':'#080f0f',border:`1px solid ${data.hidden?'#1a1a1a':data.isSuspect?'#7f1d1d55':'#134e4a55'}`,boxShadow:data.hidden?'none':data.isSuspect?'0 4px 16px rgba(127,29,29,0.4)':'0 4px 16px rgba(13,148,136,0.3)'}}>
              <div className="h-[60%] flex items-center justify-center overflow-hidden relative" style={{background:data.isSuspect?'rgba(127,29,29,0.08)':'rgba(13,148,136,0.06)'}}>
                {data.hidden?<span className="text-stone-700 font-['Bebas_Neue'] text-2xl">?</span>:data.photo?(
                  <><img src={data.photo} alt={data.name} className="w-full h-full object-cover" style={{filter:'grayscale(30%) contrast(1.1)'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><div className="w-full h-full absolute inset-0 items-center justify-center text-3xl" style={{display:'none'}}>{data.avatar}</div></>
                ):<span className="text-3xl">{data.avatar}</span>}
                <div className="absolute inset-x-0 bottom-0 h-6" style={{background:'linear-gradient(to top,rgba(10,5,5,0.95),transparent)'}}/>
              </div>
              <div className="h-[40%] px-1 pt-1 flex flex-col items-center text-center">
                <p className="text-[8px] font-['Bebas_Neue'] leading-tight tracking-wide line-clamp-2" style={{color:data.hidden?'#333':data.isSuspect?'#fca5a5':'#99f6e4'}}>{data.name}</p>
                <p className="text-[7px] font-['JetBrains_Mono'] mt-0.5" style={{color:data.hidden?'#1a1a1a':'#44403c'}}>{data.isSuspect?'مشتبه':'دليل'}</p>
              </div>
            </div>
            <button data-item={item.id} data-anchor="bottom" onPointerDown={e=>handleAnchorDown(e,item,'bottom')}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full cursor-crosshair z-10 transition-all"
              style={{background:isHov&&hoverTarget.anchor==='bottom'?'#ef4444':'#7f1d1d',border:'1.5px solid #000',transform:`translateX(-50%) scale(${isHov&&hoverTarget.anchor==='bottom'?1.5:1})`,boxShadow:isHov&&hoverTarget.anchor==='bottom'?'0 0 12px #ef4444':'0 0 6px #7f1d1d66'}}/>
          </div>
        );
      })}

      {connections.length===0&&localItems.length>0&&(
        <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 pointer-events-none rounded-lg"
          style={{background:'rgba(0,0,0,0.8)',border:'1px solid #1c1c24',backdropFilter:'blur(8px)'}}
          animate={{opacity:[0.5,1,0.5]}} transition={{duration:2.5,repeat:Infinity}}>
          <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 tracking-widest">اسحب من النقطة → نقطة · اسحب الكارت للتحريك</p>
        </motion.div>
      )}
      <AnimatePresence>
        {selectedConn&&(
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:16}}
            className="absolute top-3 right-3 p-3 rounded-xl"
            style={{background:'rgba(0,0,0,0.92)',border:'1px solid #7f1d1d',backdropFilter:'blur(8px)'}}>
            <p className="font-['JetBrains_Mono'] text-[10px] text-red-400 mb-2">خيط مختار</p>
            <button onClick={()=>{onDisconnect(selectedConn);setSelectedConn(null);}}
              className="font-['JetBrains_Mono'] text-[10px] px-3 py-1 border border-red-900 text-red-400 hover:bg-red-950/50 transition-colors rounded-md">✂ قطع</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================ MAIN */
export default function Investigation({ socket, roomCode, playerId, playerName, isAdmin=false, players=[], onExit }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [openSuspect, setOpenSuspect] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(null);
  const [justAsked, setJustAsked] = useState(null);
  const [musicOn, setMusicOn] = useState(false);
  const [newEvidenceQueue, setNewEvidenceQueue] = useState([]);

  const { play:playSound, stop:stopSound, stopAll:stopAllSounds } = useSoundEffects();
  const prevPhaseRef = useRef(null);
  const lastAskedCountRef = useRef(0);
  const prevCollectedRef = useRef([]);
  const tickRef = useRef(null);

  useEffect(()=>{
    if(!socket)return;
    const onState=s=>setState(s);
    const onError=({message})=>{setError(message);setTimeout(()=>setError(null),3000);};
    socket.on('inv_state',onState); socket.on('inv_error',onError);
    // ✅ الأدمن بيدخل من نفس الـ join event بتاع اللاعبين
    socket.emit('inv_join',{roomCode,playerId,playerName,isAdmin});
    return()=>{socket.off('inv_state',onState);socket.off('inv_error',onError);socket.emit('inv_leave',{roomCode});};
  },[socket,roomCode,playerId,playerName,isAdmin]);

  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(id);},[]);

  // detect newly asked question + newly unlocked evidence
  useEffect(()=>{
    if(!state)return;
    const cur=state.askedQuestions.length;
    if(cur>lastAskedCountRef.current&&state.phase==='investigation'){
      playSound('correct');
      setJustAsked({suspectId:state.askedQuestions[cur-1].suspectId});
      setTimeout(()=>setJustAsked(null),1600);
    }
    lastAskedCountRef.current=cur;

    // detect new evidence unlocked
    const prev=prevCollectedRef.current;
    const newIds=(state.collectedEvidence||[]).filter(id=>!prev.includes(id));
    if(newIds.length>0&&state.caseInfo){
      const newEvidence=newIds.map(id=>state.caseInfo.evidence.find(e=>e.id===id)).filter(Boolean).filter(e=>!e.hidden);
      if(newEvidence.length>0){
        setNewEvidenceQueue(q=>[...q,...newEvidence]);
      }
    }
    prevCollectedRef.current=state.collectedEvidence||[];
  },[state?.askedQuestions?.length,state?.collectedEvidence,state?.phase,playSound]);

  useEffect(()=>{
    if(!state)return; const cur=state.phase;
    if(prevPhaseRef.current===cur)return;
    stopAllSounds(musicOn?'theme':undefined);
    if(cur==='investigation')playSound('ready');
    else if(cur==='reveal')playSound(state.teamWon?'win':'wrong');
    prevPhaseRef.current=cur;
  },[state?.phase,state?.teamWon,playSound,stopAllSounds,musicOn]);

  const accusationLeft=state?.phase==='accusation'?Math.max(0,Math.ceil((state.phaseStartedAt+(state.accusationTime||120000)-now)/1000)):0;
  useEffect(()=>{
    if(state?.phase!=='accusation')return;
    if(accusationLeft<=10&&accusationLeft>0&&tickRef.current!==accusationLeft){tickRef.current=accusationLeft;playSound('tick');}
    if(accusationLeft>10)tickRef.current=null;
  },[state?.phase,accusationLeft,playSound]);

  const toggleMusic=()=>{if(musicOn)stopSound('theme');else playSound('theme');setMusicOn(!musicOn);};
  const emit=useCallback((ev,payload)=>{socket?.emit(ev,{roomCode,...payload});},[socket,roomCode]);
  const handleBoardConnect=useCallback(c=>{playSound('string');emit('inv_board_connect',c);},[emit,playSound]);
  const handleBoardDisconnect=useCallback(id=>emit('inv_board_disconnect',{connectionId:id}),[emit]);
  const handleBoardMove=useCallback((itemId,x,y)=>emit('inv_board_move',{itemId,x,y}),[emit]);

  if(!state){
    return(
      <div className="relative min-h-screen flex items-center justify-center bg-[#07070b]">
        <NoiseCanvas/>
        <div className="text-center z-10">
          <motion.div className="w-10 h-10 rounded-full border border-stone-800 border-t-red-800 mx-auto mb-4"
            animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:'linear'}}/>
          <Label color="text-stone-700">جارٍ تحميل القضية</Label>
        </div>
      </div>
    );
  }

  const { phase, me } = state;

  /* INTRO */
  const renderIntro=()=>(
    <div className="relative min-h-full flex items-center justify-center overflow-hidden bg-[#07070b]">
      <NoiseCanvas/>
      <div className="pointer-events-none absolute inset-0">
        <motion.div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[120px]" style={{background:'rgba(127,29,29,0.07)'}} animate={{scale:[1,1.15,1],opacity:[0.6,1,0.6]}} transition={{duration:10,repeat:Infinity}}/>
        <motion.div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px]" style={{background:'rgba(13,148,136,0.05)'}} animate={{scale:[1,1.2,1],opacity:[0.4,0.9,0.4]}} transition={{duration:13,repeat:Infinity}}/>
      </div>
      <button onClick={toggleMusic} className="fixed top-5 left-5 z-40 w-9 h-9 rounded-lg flex items-center justify-center border border-stone-800 hover:border-stone-600 transition-colors" style={{background:'rgba(7,7,11,0.9)'}}>
        <span className="text-sm">{musicOn?'🎵':'🔇'}</span>
      </button>
      <motion.div className="relative z-10 text-center px-6" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.8}}>
        <motion.div className="inline-flex items-center gap-3 mb-8" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <div className="h-px w-12 bg-red-900"/><Label color="text-red-800">ملف القضية · رقم ٤٧</Label><div className="h-px w-12 bg-red-900"/>
        </motion.div>
        <motion.h1 className="font-['Bebas_Neue'] leading-none mb-6" style={{fontSize:'clamp(5rem,14vw,11rem)',letterSpacing:'0.02em',color:'#f5f5f0'}} initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}} transition={{delay:0.5,duration:0.8,ease:[0.16,1,0.3,1]}}>
          المحققون
        </motion.h1>
        <motion.div className="h-px mx-auto mb-6 bg-red-900" style={{width:'60%'}} initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:0.9,duration:0.6}}/>
        <motion.p className="font-['Crimson_Pro'] italic text-stone-500 mb-12 text-lg" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}>
          "في كل جريمة، هناك حقيقة تنتظر من يجرؤ على الكشف عنها"
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-3 justify-center" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:1.3}}>
          <Btn variant="solid" size="xl" onClick={()=>emit('inv_enter_lobby')}>افتح ملف القضية</Btn>
          <Btn variant="ghost" size="xl" onClick={onExit}>← رجوع</Btn>
        </motion.div>
        <motion.div className="flex items-center justify-center gap-8 mt-12" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.6}}>
          {['استجوب','اربط','اكتشف'].map((t,i)=>(
            <React.Fragment key={t}>{i>0&&<span className="w-1 h-1 rounded-full bg-red-900"/>}<Label color="text-stone-700">{t}</Label></React.Fragment>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );

  /* HUD */
  const renderHUD=()=>(
    <div dir="rtl" className="relative z-30 w-full px-4 sm:px-6 pt-4 pb-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="font-['JetBrains_Mono'] text-[10px] text-stone-600 hover:text-stone-300 tracking-widest transition-colors uppercase">← خروج</button>
          {me.isAdmin&&<Btn size="sm" variant="ghost" onClick={()=>{if(window.confirm('رجوع للرئيسية؟'))onExit();}}>⌂ الرئيسية</Btn>}
        </div>
        <div className="flex items-center gap-5">
          {phase==='investigation'&&(
            <div className="text-center">
              <Label color="text-stone-700" className="mb-0.5">أسئلة</Label>
              <p className={`font-['Bebas_Neue'] text-2xl leading-none ${state.questionsLeft<=5?'text-red-500':'text-amber-500'}`}>
                {state.questionsLeft}<span className="text-stone-700 text-base">/{state.caseInfo?.totalQuestions||20}</span>
              </p>
            </div>
          )}
          {phase==='accusation'&&(
            <div className="text-center">
              <Label color="text-stone-700" className="mb-0.5">تصويت</Label>
              <p className={`font-['Bebas_Neue'] text-2xl leading-none ${accusationLeft<=10?'text-red-500':'text-amber-500'}`}>{accusationLeft}s</p>
            </div>
          )}
          <div className="text-center">
            <Label color="text-stone-700" className="mb-0.5">فريق</Label>
            <p className="font-['Bebas_Neue'] text-2xl leading-none text-stone-300">{state.players.length}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <PulseDot color={phase==='investigation'?'bg-teal-700':'bg-red-700'}/>
            <Label color={phase==='investigation'?'text-teal-700':'text-red-700'}>
              {phase==='investigation'?'تحقيق':phase==='accusation'?'اتهام':phase}
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleMusic} className="w-8 h-8 rounded-lg flex items-center justify-center border border-stone-800 hover:border-stone-600 transition-colors text-sm" style={{background:'rgba(7,7,11,0.8)'}}>{musicOn?'🎵':'🔇'}</button>
          <span className="font-['JetBrains_Mono'] text-[10px] text-stone-700 hidden sm:block tracking-widest">{roomCode}</span>
        </div>
      </div>
    </div>
  );

  /* LOBBY */
  const renderLobby=()=>(
    <div dir="rtl" className="relative min-h-full bg-[#07070b] flex items-center justify-center p-6">
      <NoiseCanvas/>
      <div className="relative z-10 w-full max-w-lg space-y-4">
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
          <CaseCard accent="#0d9488" className="p-8 text-center">
            <motion.div className="text-5xl mb-4" animate={{y:[0,-6,0]}} transition={{duration:3,repeat:Infinity}}>🕵️</motion.div>
            <h2 className="font-['Bebas_Neue'] text-3xl text-stone-100 tracking-wider mb-1">غرفة المحققين</h2>
            <p className="font-['Crimson_Pro'] italic text-stone-500 text-sm">في انتظار اكتمال الفريق</p>
          </CaseCard>
        </motion.div>
        <CaseCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <Label color="text-stone-600">المحققون المنضمون</Label>
            <span className="font-['JetBrains_Mono'] text-[10px] px-2 py-0.5 bg-teal-950 text-teal-500 border border-teal-900 rounded-md">{state.players.length}</span>
          </div>
          {state.players.length===0?(
            <p className="text-center py-6 font-['Crimson_Pro'] italic text-stone-600 text-sm">في انتظار انضمام المحققين...</p>
          ):(
            <div className="grid grid-cols-2 gap-2">
              {state.players.map(p=>(
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-stone-900/40 border border-stone-800/50 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-700"/>
                  <span className="text-sm text-stone-300 font-['Crimson_Pro']">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </CaseCard>
        {me.isAdmin?(
          <Btn variant={state.players.length>0?'solid':'ghost'} size="lg" className="w-full" disabled={state.players.length===0} onClick={()=>emit('inv_start')}>
            {state.players.length>0?'📁 افتح ملف القضية':'في انتظار المحققين...'}
          </Btn>
        ):(
          <p className="text-center font-['Crimson_Pro'] italic text-stone-600 text-sm">في انتظار رئيس التحقيق...</p>
        )}
      </div>
    </div>
  );

  /* SUSPECT CARD — أصغر + rounded */
  const SuspectCard=({s,isFlashing,onClick})=>{
    const hasAvail=s.availCount>0;
    const hasAsked=s.askedCount>0;
    return(
      <motion.button onClick={onClick} whileHover={{y:-4,scale:1.02}} whileTap={{scale:0.98}}
        animate={isFlashing?{scale:[1,1.04,1]}:{}} transition={{duration:0.4}}
        className="relative text-right group rounded-2xl overflow-hidden"
        style={{aspectRatio:'3/4',background:'#0a070a',border:`1px solid ${hasAvail?'#7f1d1d':'#1c1c24'}`,boxShadow:hasAvail?'0 4px 20px rgba(127,29,29,0.3),0 2px 8px rgba(0,0,0,0.6)':'0 2px 10px rgba(0,0,0,0.5)'}}>
        {isFlashing&&<motion.div className="absolute inset-0 z-20 pointer-events-none rounded-2xl" style={{background:'rgba(220,38,38,0.25)'}} initial={{opacity:1}} animate={{opacity:0}} transition={{duration:0.8}}/>}
        <div className="absolute inset-0">
          {s.photo?(
            <><img src={s.photo} alt={s.name} className="w-full h-full object-cover" style={{filter:'grayscale(25%) contrast(1.1) brightness(0.78)'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><div className="w-full h-full absolute inset-0 items-center justify-center" style={{display:'none',fontSize:'3.5rem',background:'#0a070a'}}>{s.avatar}</div></>
          ):(
            <div className="w-full h-full flex items-center justify-center" style={{fontSize:'3.5rem',background:'linear-gradient(to bottom,#110a0a,#07070b)'}}>{s.avatar}</div>
          )}
        </div>
        {/* gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 pt-12 pb-2.5 px-2 z-10" style={{background:'linear-gradient(to top,rgba(5,3,5,1) 0%,rgba(5,3,5,0.82) 50%,transparent 100%)'}}>
          <p className="font-['Bebas_Neue'] text-sm text-stone-100 tracking-wide leading-tight truncate mb-0.5">{s.name}</p>
          <p className="font-['JetBrains_Mono'] text-[8px] text-stone-600 mb-1 truncate">{s.role}</p>
          <span className="inline-block font-['JetBrains_Mono'] text-[8px] px-1.5 py-0.5 bg-red-950/60 text-red-400 border border-red-900/50 rounded-md leading-none">{s.publicMotive}</span>
        </div>
        {/* badges top-left */}
        <div className="absolute top-1.5 left-1.5 z-20 flex flex-col gap-1 items-start">
          {hasAvail&&<motion.span animate={{opacity:[0.7,1,0.7]}} transition={{duration:1.6,repeat:Infinity}} className="font-['JetBrains_Mono'] text-[8px] px-1.5 py-0.5 bg-teal-950/90 text-teal-400 border border-teal-900/70 rounded-md">{s.availCount} سؤال</motion.span>}
          {hasAsked&&<span className="font-['JetBrains_Mono'] text-[8px] px-1.5 py-0.5 bg-amber-950/90 text-amber-500 border border-amber-900/70 rounded-md">✓ {s.askedCount}</span>}
        </div>
        {hasAvail&&<div className="absolute top-0 right-0 w-6 h-6 pointer-events-none rounded-tr-2xl overflow-hidden"><div className="w-full h-full" style={{background:'linear-gradient(135deg,#7f1d1d 0%,transparent 60%)'}}/></div>}
      </motion.button>
    );
  };

  /* INVESTIGATION */
  const renderInvestigation=()=>{
    const c=state.caseInfo;
    const collected=state.collectedEvidence||[];
    const suspectsWithData=c.suspects.map(s=>({...s,availCount:(state.availableQuestions[s.id]||[]).length,askedCount:state.askedQuestions.filter(q=>q.suspectId===s.id).length}));
    const visibleEvidenceCount=collected.filter(id=>!c.evidence.find(e=>e.id===id)?.hidden).length;
    const myReportCount=me.isAdmin?state.askedQuestions.length:state.askedQuestions.filter(q=>q.askedById===me.id).length;
    return(
      <div dir="rtl" className="relative min-h-full bg-[#07070b]">
        <NoiseCanvas/>{renderHUD()}
        <div className="relative z-10 w-full px-4 sm:px-6 py-4 pb-24">
          <div className="flex flex-col lg:flex-row gap-5">
            {/* suspects */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <PulseDot color="bg-red-800"/>
                <Label color="text-stone-500">المشتبه فيهم ({suspectsWithData.length})</Label>
                <span className="font-['JetBrains_Mono'] text-[9px] text-stone-700 mr-auto">اضغط للاستجواب</span>
              </div>
              {/* grid — 3 columns on md+, 2 on sm */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
                {suspectsWithData.map(s=>(
                  <SuspectCard key={s.id} s={s} isFlashing={justAsked?.suspectId===s.id} onClick={()=>setOpenSuspect(s.id)}/>
                ))}
              </div>
              {/* last transcripts */}
              {state.askedQuestions.length>0&&(
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2"><span className="text-stone-700 text-sm">📻</span><Label color="text-stone-600">آخر الاستجوابات</Label></div>
                  <CaseCard className="divide-y divide-stone-900/60">
                    {state.askedQuestions.slice(-3).reverse().map((q,i)=>(
                      <div key={i} className="px-4 py-3">
                        <p className="font-['JetBrains_Mono'] text-[9px] text-amber-600 mb-1">{q.suspectName}</p>
                        <p className="font-['Crimson_Pro'] italic text-stone-500 text-sm mb-1">"{q.questionText}"</p>
                        <p className="font-['Crimson_Pro'] text-stone-300 text-sm leading-relaxed line-clamp-2">← {q.answer}</p>
                      </div>
                    ))}
                  </CaseCard>
                </div>
              )}
            </div>
            {/* sidebar */}
            <div className="lg:w-[300px] xl:w-[340px] shrink-0 space-y-3">
              {/* case file */}
              <CaseCard accent="#dc2626" className="p-4">
                <Label color="text-red-800" className="mb-2">ملف القضية</Label>
                <h2 className="font-['Bebas_Neue'] text-lg text-stone-100 tracking-wider leading-tight mb-0.5">{c.title}</h2>
                <p className="font-['Crimson_Pro'] italic text-stone-500 text-sm mb-3">{c.subtitle}</p>
                <div className="space-y-1.5 mb-3 pb-3 border-b border-stone-900/60">
                  {[{icon:'📍',val:c.location},{icon:'⏰',val:c.timeOfDeath},{icon:'💀',val:c.causeOfDeath}].map(({icon,val})=>(
                    <div key={val} className="flex items-start gap-2"><span className="text-sm shrink-0 mt-0.5">{icon}</span><p className="font-['JetBrains_Mono'] text-[9px] text-stone-500 leading-relaxed">{val}</p></div>
                  ))}
                </div>
                <p className="font-['Crimson_Pro'] text-stone-400 text-sm leading-relaxed">{c.description}</p>
              </CaseCard>
              {/* evidence — NO manual collect button */}
              <CaseCard className="overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-stone-900/60">
                  <div className="flex items-center gap-2"><span className="text-sm">🔍</span><Label color="text-teal-800">الأدلة المادية</Label></div>
                  <span className="font-['JetBrains_Mono'] text-[9px] text-teal-700 px-2 py-0.5 bg-teal-950 border border-teal-900 rounded-md">{visibleEvidenceCount}/{c.evidence.length}</span>
                </div>
                <div className="max-h-[240px] overflow-y-auto divide-y divide-stone-900/40">
                  {c.evidence.map(e=>{
                    const has=collected.includes(e.id);
                    const visible=has&&!e.hidden;
                    return(
                      <div key={e.id}
                        onClick={()=>{ if(visible) setEvidenceOpen(e); }}
                        className={`w-full text-right flex items-start gap-3 px-4 py-3 ${visible?'cursor-pointer hover:bg-teal-950/10 transition-colors':''}`}>
                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border text-base ${visible?'border-teal-900/50 bg-teal-950/20':'border-stone-900/60 bg-stone-900/20'}`}>
                          {visible?e.icon:<span className="font-['Bebas_Neue'] text-stone-700 text-xs">?</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-['JetBrains_Mono'] text-[9px] mb-0.5 ${visible?'text-teal-400':'text-stone-700'}`}>
                            {visible?e.name:'دليل مقفول'}
                            {visible&&e.type==='document'&&<span className="mr-1.5 px-1 py-0.5 text-[7px] bg-amber-950 text-amber-500 border border-amber-900/50 rounded">وثيقة</span>}
                          </p>
                          <p className="font-['Crimson_Pro'] text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {visible?e.description:'تُكتشف خلال الاستجواب'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CaseCard>
            </div>
          </div>
        </div>
        {/* bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 sm:px-6 pb-4 pt-3" style={{background:'linear-gradient(to top,rgba(7,7,11,1) 0%,rgba(7,7,11,0.85) 70%,transparent 100%)'}}>
          <div className="max-w-6xl mx-auto flex gap-2">
            <Btn variant="ghost" size="md" className="flex-1" onClick={()=>setReportOpen(true)}>
              📄 تقريري<span className="ml-1 font-['JetBrains_Mono'] text-[9px] px-1.5 py-0.5 bg-stone-900 text-stone-500 rounded">{myReportCount}</span>
            </Btn>
            <Btn variant="teal" size="md" className="flex-1" onClick={()=>setBoardOpen(true)}>
              🧵 البورد<span className="ml-1 font-['JetBrains_Mono'] text-[9px] px-1.5 py-0.5 bg-teal-950 text-teal-600 rounded">{state.boardConnections.length}</span>
            </Btn>
            {me.isAdmin&&<Btn variant="red" size="md" className="flex-1" onClick={()=>{if(window.confirm('ابدأ التصويت النهائي؟'))emit('inv_to_accusation');}}>⚖️ التصويت</Btn>}
          </div>
        </div>
      </div>
    );
  };

  /* SUSPECT MODAL */
  const renderSuspectModal=()=>{
    if(!openSuspect)return null;
    const s=state.caseInfo.suspects.find(x=>x.id===openSuspect); if(!s)return null;
    const avail=state.availableQuestions[s.id]||[];
    const asked=state.askedQuestions.filter(q=>q.suspectId===s.id);
    return(
      <AnimatePresence>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto"
          style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}
          onClick={e=>{if(e.target===e.currentTarget)setOpenSuspect(null);}}>
          <motion.div initial={{y:30,opacity:0,scale:0.96}} animate={{y:0,opacity:1,scale:1}} exit={{y:30,opacity:0}} transition={{type:'spring',stiffness:240,damping:26}} className="my-8 w-full max-w-xl">
            <CaseCard accent="#dc2626">
              <div className="flex items-start gap-4 p-5 border-b border-stone-800/60">
                <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xl border border-stone-800" style={{background:'#0f0a0a'}}>
                  {s.photo?(<><img src={s.photo} alt={s.name} className="w-full h-full object-cover" style={{filter:'grayscale(20%) contrast(1.1)'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><div className="w-full h-full items-center justify-center text-4xl" style={{display:'none'}}>{s.avatar}</div></>):(<div className="w-full h-full flex items-center justify-center text-4xl">{s.avatar}</div>)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Bebas_Neue'] text-2xl text-stone-100 tracking-wider mb-0.5">{s.name}</h3>
                  <p className="font-['JetBrains_Mono'] text-[9px] text-stone-600 mb-2">{s.role} — {s.age} سنة</p>
                  <span className="inline-block font-['JetBrains_Mono'] text-[8px] px-2 py-1 bg-red-950/50 text-red-400 border border-red-900/50 rounded-md">{s.publicMotive}</span>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PulseDot color="bg-teal-800"/>
                    <Label color="text-teal-700">أسئلة متاحة ({avail.length})</Label>
                    {state.questionsLeft===0&&<span className="font-['JetBrains_Mono'] text-[8px] text-red-500 mr-auto">خلصت الأسئلة</span>}
                  </div>
                  {avail.length===0?(
                    <div className="border border-dashed border-stone-800/60 py-6 text-center rounded-xl">
                      <p className="font-['Crimson_Pro'] italic text-stone-600 text-sm">لا أسئلة متاحة — افتح مسارات أخرى للكشف عنها</p>
                    </div>
                  ):(
                    <div className="space-y-2">
                      {avail.map(q=>(
                        <motion.button key={q.id} onClick={()=>{emit('inv_ask',{suspectId:s.id,questionId:q.id});setOpenSuspect(null);}}
                          disabled={state.questionsLeft<=0} whileHover={{x:-3}} whileTap={{scale:0.99}}
                          className="w-full text-right p-3 border border-stone-800/60 hover:border-teal-900 hover:bg-teal-950/10 disabled:opacity-30 transition-all group rounded-xl"
                          style={{background:'#0a0a0f'}}>
                          <span className="font-['Crimson_Pro'] text-stone-300 text-sm group-hover:text-teal-300 transition-colors">❓ {q.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                {asked.length>0&&(
                  <div>
                    <Label color="text-stone-700" className="mb-3">استجوابات سابقة ({asked.length})</Label>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {asked.map((q,i)=>(
                        <div key={i} className="p-3 border-r-2 border-stone-800 rounded-r-sm" style={{background:'#0a0a0f'}}>
                          <p className="font-['Crimson_Pro'] italic text-stone-500 text-sm mb-1.5"><span className="text-amber-600 not-italic font-['JetBrains_Mono'] text-[9px] ml-1">س</span>{q.questionText}</p>
                          <p className="font-['Crimson_Pro'] text-stone-300 text-sm leading-relaxed"><span className="text-teal-600 font-['JetBrains_Mono'] text-[9px] ml-1">ج</span>{q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-stone-800/60 flex justify-center">
                <Btn variant="ghost" size="sm" onClick={()=>setOpenSuspect(null)}>✕ إغلاق</Btn>
              </div>
            </CaseCard>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  /* EVIDENCE MODAL — with document viewer */
  const renderEvidenceModal=()=>{
    if(!evidenceOpen)return null;
    const e=evidenceOpen;
    const isDoc=e.type==='document';
    return(
      <AnimatePresence>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{background:'rgba(0,0,0,0.92)',backdropFilter:'blur(10px)'}}
          onClick={ev=>{if(ev.target===ev.currentTarget)setEvidenceOpen(null);}}>
          <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
            className={`w-full ${isDoc?'max-w-lg':'max-w-sm'}`}>
            <CaseCard accent={isDoc?'#d97706':'#0d9488'} className="overflow-hidden">
              {/* header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-800/60">
                <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl border ${isDoc?'border-amber-900/50 bg-amber-950/20':'border-teal-900/50 bg-teal-950/20'}`}>{e.icon}</div>
                <div className="flex-1">
                  <Label color={isDoc?'text-amber-700':'text-teal-700'} className="mb-0.5">{isDoc?'وثيقة رسمية':'دليل مادي'}</Label>
                  <h3 className="font-['Bebas_Neue'] text-xl text-stone-100 tracking-wider">{e.name}</h3>
                </div>
              </div>
              {/* body */}
              <div className="p-5">
                <p className="font-['Crimson_Pro'] text-stone-400 text-sm leading-relaxed mb-4">{e.description}</p>
                {isDoc&&e.content&&(
                  <div className="rounded-xl border border-amber-900/30 overflow-hidden">
                    <div className="px-3 py-2 border-b border-amber-900/20 flex items-center gap-2" style={{background:'rgba(120,53,15,0.08)'}}>
                      <span className="text-amber-600 text-xs">📜</span>
                      <Label color="text-amber-700">محتوى الوثيقة</Label>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto" style={{background:'rgba(7,7,11,0.6)'}}>
                      <pre className="font-['Crimson_Pro'] text-stone-300 text-sm leading-loose whitespace-pre-wrap">{e.content}</pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-stone-800/60 flex justify-center">
                <Btn variant="ghost" size="sm" onClick={()=>setEvidenceOpen(null)}>✕ إغلاق</Btn>
              </div>
            </CaseCard>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  /* BOARD MODAL */
  const renderBoardModal=()=>{
    if(!boardOpen)return null;
    return(
      <AnimatePresence>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[60] flex flex-col bg-[#06060a]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-900 shrink-0" style={{background:'#070709'}}>
            <div className="flex items-center gap-3"><PulseDot color="bg-red-800"/><h3 className="font-['Bebas_Neue'] text-xl text-stone-100 tracking-wider">لوحة الأدلة</h3></div>
            <div className="flex items-center gap-4">
              <p className="font-['JetBrains_Mono'] text-[9px] text-stone-700 hidden sm:block tracking-widest">اسحب الكارت للتحريك · اسحب من النقطة لخيط</p>
              <Btn variant="ghost" size="sm" onClick={()=>setBoardOpen(false)}>✕ إغلاق</Btn>
            </div>
          </div>
          <div className="flex-1 p-2 sm:p-3 overflow-hidden">
            <CrimeBoard items={state.boardItems} connections={state.boardConnections} suspects={state.caseInfo.suspects} evidence={state.caseInfo.evidence} collectedEvidence={state.collectedEvidence} onConnect={handleBoardConnect} onDisconnect={handleBoardDisconnect} onMove={handleBoardMove}/>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  /* ACCUSATION */
  const AccusationView=()=>{
    const [culpritId,setCulpritId]=useState(null);
    const [weapon,setWeapon]=useState(null);
    const [motive,setMotive]=useState(null);
    const canSubmit=culpritId&&weapon&&motive&&!me.hasVoted;
    const c=state.caseInfo;
    return(
      <div dir="rtl" className="relative min-h-full bg-[#07070b]">
        <NoiseCanvas/>{renderHUD()}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-10 space-y-5">
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-center py-4">
            <motion.div className="inline-block font-['Bebas_Neue'] text-5xl sm:text-7xl text-red-700 leading-none mb-2" animate={{opacity:[0.7,1,0.7]}} transition={{duration:2,repeat:Infinity}}>{accusationLeft}</motion.div>
            <p className="font-['Crimson_Pro'] italic text-stone-500">ثانية لاتخاذ القرار</p>
          </motion.div>
          <div className="flex items-center justify-between px-1"><Label color="text-stone-600">{state.votesCount} / {state.players.length} صوّتوا</Label></div>
          {me.hasVoted?(
            <CaseCard accent="#0d9488" className="p-10 text-center">
              <motion.div className="text-5xl mb-4" animate={{scale:[1,1.1,1]}} transition={{duration:2,repeat:Infinity}}>✓</motion.div>
              <p className="font-['Bebas_Neue'] text-2xl text-teal-400 tracking-wider">تم تسجيل صوتك</p>
              <p className="font-['Crimson_Pro'] italic text-stone-500 text-sm mt-2">في انتظار باقي المحققين...</p>
            </CaseCard>
          ):(
            <>
              <CaseCard className="p-5">
                <Label color="text-red-800" className="mb-4">من هو القاتل؟</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {c.suspects.map(s=>(
                    <motion.button key={s.id} onClick={()=>setCulpritId(s.id)} whileHover={{scale:1.03}} whileTap={{scale:0.97}} className="rounded-xl overflow-hidden transition-all"
                      style={{border:culpritId===s.id?'1.5px solid #dc2626':'1px solid #1c1c24',boxShadow:culpritId===s.id?'0 0 20px rgba(220,38,38,0.3)':'none'}}>
                      <div className="aspect-[3/4] flex items-center justify-center overflow-hidden relative" style={{background:'#0a070a'}}>
                        {s.photo?(<><img src={s.photo} alt={s.name} className="w-full h-full object-cover" style={{filter:'grayscale(30%) contrast(1.1) brightness(0.8)'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><div className="absolute inset-0 items-center justify-center text-3xl" style={{display:'none'}}>{s.avatar}</div></>):(<span className="text-3xl">{s.avatar}</span>)}
                      </div>
                      <div className="px-1 py-1.5 border-t border-stone-900"><p className={`font-['JetBrains_Mono'] text-[8px] text-center truncate ${culpritId===s.id?'text-red-400':'text-stone-500'}`}>{s.name}</p></div>
                    </motion.button>
                  ))}
                </div>
              </CaseCard>
              <CaseCard className="p-5">
                <Label color="text-amber-800" className="mb-3">أداة الجريمة</Label>
                <div className="flex flex-wrap gap-2">
                  {c.weaponOptions.map(w=>(
                    <motion.button key={w} onClick={()=>setWeapon(w)} whileTap={{scale:0.97}} className="font-['Crimson_Pro'] text-sm px-4 py-2 border rounded-lg transition-all"
                      style={{border:weapon===w?'1px solid #92400e':'1px solid #1c1c24',background:weapon===w?'rgba(120,53,15,0.2)':'transparent',color:weapon===w?'#fbbf24':'#78716c'}}>{w}</motion.button>
                  ))}
                </div>
              </CaseCard>
              <CaseCard className="p-5">
                <Label color="text-teal-800" className="mb-3">الدافع</Label>
                <div className="flex flex-wrap gap-2">
                  {c.motiveOptions.map(m=>(
                    <motion.button key={m} onClick={()=>setMotive(m)} whileTap={{scale:0.97}} className="font-['Crimson_Pro'] text-sm px-4 py-2 border rounded-lg transition-all"
                      style={{border:motive===m?'1px solid #134e4a':'1px solid #1c1c24',background:motive===m?'rgba(13,148,136,0.1)':'transparent',color:motive===m?'#2dd4bf':'#78716c'}}>{m}</motion.button>
                  ))}
                </div>
              </CaseCard>
              <Btn variant={canSubmit?'red':'ghost'} size="lg" className="w-full" disabled={!canSubmit} onClick={()=>emit('inv_vote',{culpritId,weapon,motive})}>
                {canSubmit?'⚖️ ثبّت الاتهام':'اختر القاتل والأداة والدافع'}
              </Btn>
            </>
          )}
        </div>
      </div>
    );
  };

  /* REVEAL */
  const renderReveal=()=>{
    const sol=state.solution; if(!sol)return null;
    const won=state.teamWon;
    const culprit=state.caseInfo.suspects.find(s=>s.id===sol.culpritId);
    return(
      <div dir="rtl" className="relative min-h-full bg-[#07070b]">
        <NoiseCanvas/>{won&&<Confetti/>}
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-5">
          <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200}} className="text-center">
            <motion.div className="font-['Bebas_Neue'] leading-none mb-3" style={{fontSize:'clamp(3rem,10vw,5rem)',color:won?'#0d9488':'#dc2626'}}
              animate={won?{scale:[1,1.04,1]}:{x:[0,-8,8,-4,4,0]}} transition={{duration:2,repeat:won?Infinity:0}}>
              {won?'قضية محلولة':'المجرم هرب'}
            </motion.div>
            <p className="font-['JetBrains_Mono'] text-[10px] text-stone-600 tracking-[0.3em]">{won?'CASE CLOSED · JUSTICE SERVED':'CASE UNSOLVED · VERDICT FAILED'}</p>
          </motion.div>
          <CaseCard accent={won?'#0d9488':'#dc2626'} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-24 h-28 shrink-0 rounded-xl overflow-hidden border border-stone-800" style={{background:'#0f0a0a'}}>
                {culprit?.photo?(<><img src={culprit.photo} alt={culprit.name} className="w-full h-full object-cover" style={{filter:'grayscale(20%) contrast(1.1)'}} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}}/><div className="w-full h-full items-center justify-center text-5xl" style={{display:'none'}}>{culprit.avatar}</div></>):(<div className="w-full h-full flex items-center justify-center text-5xl">{culprit?.avatar||'🕵️'}</div>)}
              </div>
              <div className="flex-1">
                <Label color="text-red-800" className="mb-1">القاتل الحقيقي</Label>
                <p className="font-['Bebas_Neue'] text-3xl text-stone-100 tracking-wider mb-1">{sol.culpritName}</p>
                <p className="font-['JetBrains_Mono'] text-[9px] text-stone-600 mb-3">{culprit?.role}</p>
                <div className="flex flex-wrap gap-2">
                  {[{label:'القاتل',ok:sol.culpritCorrect},{label:sol.weapon,ok:sol.weaponCorrect},{label:sol.motive,ok:sol.motiveCorrect}].map(({label,ok})=>(
                    <span key={label} className={`font-['JetBrains_Mono'] text-[9px] px-2 py-1 border rounded-md ${ok?'border-teal-900 text-teal-400 bg-teal-950/30':'border-red-900 text-red-500 bg-red-950/20'}`}>{ok?'✓':'✗'} {label}</span>
                  ))}
                </div>
              </div>
            </div>
          </CaseCard>
          <CaseCard accent="#d97706" className="p-5">
            <Label color="text-amber-700" className="mb-3">ما جرى بالتفصيل</Label>
            <p className="font-['Crimson_Pro'] text-stone-300 text-base leading-loose">{sol.explanation}</p>
          </CaseCard>
          {me.isAdmin&&<Btn variant="ghost" size="lg" className="w-full" onClick={()=>emit('inv_reset')}>🔄 قضية جديدة</Btn>}
        </div>
      </div>
    );
  };

  /* ============================================================ RENDER */
  /* ============================================================ RENDER */
  return(
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#07070b]">
      {phase==='intro'&&renderIntro()}
      {phase==='lobby'&&renderLobby()}
      {phase==='investigation'&&renderInvestigation()}
      {phase==='accusation'&&<AccusationView/>}
      {phase==='reveal'&&renderReveal()}

      {renderSuspectModal()}
      {renderEvidenceModal()}
      {renderBoardModal()}

      <ReportModal open={reportOpen} onClose={()=>setReportOpen(false)} askedQuestions={state.askedQuestions} collectedEvidence={state.collectedEvidence||[]} evidenceList={state.caseInfo?.evidence||[]} filterById={me.id} isAdmin={me.isAdmin}/>

      {/* Evidence unlock toasts */}
      <AnimatePresence>
        {newEvidenceQueue.length>0&&(
          <EvidenceToast key={newEvidenceQueue[0].id} evidence={newEvidenceQueue[0]} onDone={()=>setNewEvidenceQueue(q=>q.slice(1))}/>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error&&(
          <motion.div initial={{opacity:0,y:-40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-40}}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 font-['JetBrains_Mono'] text-[11px] tracking-widest text-red-300 border border-red-900 rounded-xl"
            style={{background:'rgba(7,7,11,0.95)',backdropFilter:'blur(10px)'}}>
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}