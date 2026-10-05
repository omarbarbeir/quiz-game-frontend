// CivilRegistryGame.jsx
// npm install socket.io-client framer-motion

import { useState, useEffect, useRef, useCallback } from "react"
import { io } from "socket.io-client"
import { motion, AnimatePresence } from "framer-motion"
// Scrollbar + animations styling
const scrollbarCSS = `
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.4); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(184,134,11,0.7); }

  @keyframes borderApprove {
    0%   { border-color: #1a7a3a; box-shadow: 0 0 8px rgba(26,180,80,.4); }
    50%  { border-color: #4cdd80; box-shadow: 0 0 20px rgba(76,220,128,.7); }
    100% { border-color: #1a7a3a; box-shadow: 0 0 8px rgba(26,180,80,.4); }
  }
  @keyframes borderReject {
    0%   { border-color: #8b1a1a; box-shadow: 0 0 8px rgba(220,40,40,.4); }
    50%  { border-color: #ff5555; box-shadow: 0 0 20px rgba(255,80,80,.7); }
    100% { border-color: #8b1a1a; box-shadow: 0 0 8px rgba(220,40,40,.4); }
  }
  @keyframes borderReport {
    0%   { border-color: #7a4a00; box-shadow: 0 0 8px rgba(220,140,0,.4); }
    50%  { border-color: #ffbb33; box-shadow: 0 0 20px rgba(255,180,50,.7); }
    100% { border-color: #7a4a00; box-shadow: 0 0 8px rgba(220,140,0,.4); }
  }
  @keyframes citizenAlert {
    0%   { transform: translateY(-20px) scale(0.8); opacity: 0; }
    15%  { transform: translateY(0px) scale(1.05); opacity: 1; }
    20%  { transform: translateY(0px) scale(1); }
    80%  { transform: translateY(0px) scale(1); opacity: 1; }
    100% { transform: translateY(-10px) scale(0.9); opacity: 0; }
  }
  .btn-approve {
    animation: borderApprove 2s ease-in-out infinite;
    border: 2px solid #1a7a3a !important;
  }
  .btn-reject {
    animation: borderReject 2s ease-in-out infinite;
    border: 2px solid #8b1a1a !important;
  }
  .btn-report {
    animation: borderReport 2s ease-in-out infinite;
    border: 2px solid #7a4a00 !important;
  }
  .citizen-alert {
    animation: citizenAlert 4s ease-in-out forwards;
  }
`



// ─── Constants ────────────────────────────────────────────────────────────────
const GOVERNORATES = [
  {name:"القاهرة",code:"01"},{name:"الإسكندرية",code:"02"},{name:"بورسعيد",code:"03"},
  {name:"السويس",code:"04"},{name:"الدقهلية",code:"05"},{name:"كفر الشيخ",code:"06"},
  {name:"الغربية",code:"07"},{name:"المنوفية",code:"08"},{name:"البحيرة",code:"09"},
  {name:"الإسماعيلية",code:"10"},{name:"الشرقية",code:"11"},{name:"الجيزة",code:"12"},
  {name:"القليوبية",code:"13"},{name:"بني سويف",code:"14"},{name:"الفيوم",code:"15"},
  {name:"المنيا",code:"16"},{name:"أسيوط",code:"17"},{name:"سوهاج",code:"18"},
  {name:"قنا",code:"19"},{name:"الأقصر",code:"20"},{name:"أسوان",code:"21"},
  {name:"البحر الأحمر",code:"22"},{name:"الوادي الجديد",code:"23"},{name:"مطروح",code:"24"},
  {name:"شمال سيناء",code:"25"},{name:"جنوب سيناء",code:"26"},{name:"دمياط",code:"27"},
]

const REQUEST_TYPES = [
  {id:"new_id",        name:"استخراج بطاقة جديدة",    docs:["شهادة ميلاد","قيد عائلي","شهادة تجنيد","صورتان شخصيتان"],maleOnly:["شهادة تجنيد"]},
  {id:"renew_id",      name:"تجديد بطاقة",             docs:["البطاقة القديمة","إيصال مرافق"],maleOnly:[]},
  {id:"replace_id",    name:"بدل فاقد",                docs:["محضر شرطة بالفقد","قيد عائلي","فيش وتشبيه"],maleOnly:[]},
  {id:"family_register",name:"استخراج قيد عائلي",     docs:["بطاقة رب الأسرة","شهادات ميلاد الأبناء","وثيقة الزواج"],maleOnly:[]},
  {id:"address_update",name:"تغيير محل الإقامة",      docs:["إيصال مرافق","عقد إيجار أو ملكية","البطاقة القديمة"],maleOnly:[]},
  {id:"marital_status",name:"تحديث الحالة الاجتماعية",docs:["وثيقة الزواج","البطاقة القديمة","قيد عائلي"],maleOnly:[]},
]

const DOC_DAYS = {
  "شهادة ميلاد":1,"قيد عائلي":2,"شهادة تجنيد":3,"صورتان شخصيتان":1,
  "البطاقة القديمة":1,"إيصال مرافق":1,"محضر شرطة بالفقد":2,
  "فيش وتشبيه":3,"بطاقة رب الأسرة":1,"شهادات ميلاد الأبناء":2,
  "وثيقة الزواج":2,"عقد إيجار أو ملكية":3,
}

const ROLES = [
  {id:"desk",    icon:"🖥️",name:"موظف الشباك",   desc:"يقبل أو يرفض",              hint:"إنت بس اللي تقدر تقرر!"},
  {id:"checker", icon:"🔍",name:"مدقق البطاقات",  desc:"يكشف التزوير",              hint:"إنت شايف لو في تزوير!"},
  {id:"security",icon:"🚨",name:"محقق الأمن",     desc:"قايمة المطلوبين كاملة",      hint:"إنت بس عندك القايمة كاملة!"},
  {id:"archive", icon:"📦",name:"موظف الأرشيف",  desc:"يطلب أوراق ناقصة",           hint:"إنت تقدر تطلب الأوراق!"},
  {id:"manager", icon:"👔",name:"مدير الوردية",   desc:"يشوف كل حاجة",              hint:"إنت شايف كل حاجة!"},
  {id:"printer", icon:"🖨️",name:"موظف الطباعة", desc:"يكشف أخطاء البيانات",        hint:"إنت شايف أخطاء البيانات!"},
]

const WANTED_LIST = [
  {name:"سامي حسين عوض",crime:"تزوير وثائق"},{name:"وليد رشاد الغول",crime:"تزوير بطاقات"},
  {name:"محمود رزق إبراهيم",crime:"احتيال مالي"},{name:"طارق أنور حلاوة",crime:"نصب واحتيال"},
  {name:"هشام فتحي سالم",crime:"تهريب بضائع"},{name:"بلال عوض الجمل",crime:"تهريب مخدرات"},
  {name:"عادل شعبان البدوي",crime:"سرقة بالإكراه"},{name:"حازم برعي المنيسي",crime:"غسيل أموال"},
  {name:"معتز دياب الشرقاوي",crime:"اتجار في آثار"},{name:"جمال خليل عفيفي",crime:"فرار من حكم"},
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MALE_AVATARS_COUNT   = 50
const FEMALE_AVATARS_COUNT = 50

const avatar = (seed, gender) => {
  const isMale = gender === "M" || gender === true || gender === 40
  // نختار صورة عشوائية ثابتة بناءً على الـ seed
  const seedNum = Math.abs(String(seed).split("").reduce((a,c)=>a+c.charCodeAt(0),0))
  if (isMale) {
    const idx = (seedNum % MALE_AVATARS_COUNT) + 1
    return `/avatars/male/male_${String(idx).padStart(3,"0")}.jpg`
  } else {
    const idx = (seedNum % FEMALE_AVATARS_COUNT) + 1
    return `/avatars/female/female_${String(idx).padStart(3,"0")}.jpg`
  }
}

const getRequiredDocs = (typeId,gender) => {
  const rt = REQUEST_TYPES.find(r=>r.id===typeId)
  return rt ? rt.docs.filter(d=>gender==="M"||!rt.maleOnly.includes(d)) : []
}
const getMissing = c => (c?.required_docs||[]).filter(d=>!(c?.available_docs||[]).includes(d))
const formatForge = r => ({
  invalid_national_id_birthdate:"الرقم القومي لا يطابق تاريخ الميلاد",
  wrong_governorate_code:"كود المحافظة غلط",
  name_mismatch_form:"الاسم في الاستمارة مختلف",
  name_mismatch_doc:"الاسم في ورقة مرفقة مختلف",
  expired_id:"البطاقة منتهية الصلاحية",
  photo_mismatch:"الصورة مش نفس الشخص",
  wrong_gender_digit:"رقم الجنس في الرقم القومي غلط",
  future_birthdate:"تاريخ الميلاد في المستقبل!",
}[r]||r)

// ─── Sound Effects ────────────────────────────────────────────────────────────
function useSound() {
  const ctx = useRef(null)
  useEffect(()=>{
    ctx.current = new (window.AudioContext||window.webkitAudioContext)()
    return ()=>ctx.current?.close()
  },[])

  function playTone(freq, duration, type='sine', gain=0.3) {
    if (!ctx.current) return
    try {
      const o = ctx.current.createOscillator()
      const g = ctx.current.createGain()
      o.connect(g); g.connect(ctx.current.destination)
      o.type = type; o.frequency.setValueAtTime(freq, ctx.current.currentTime)
      g.gain.setValueAtTime(gain, ctx.current.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.current.currentTime+duration)
      o.start(); o.stop(ctx.current.currentTime+duration)
    } catch {}
  }

  return {
    stamp:   ()=>{ playTone(200,0.1,'square',0.4); setTimeout(()=>playTone(150,0.2,'square',0.3),100) },
    approve: ()=>{ playTone(523,0.1); setTimeout(()=>playTone(659,0.15),100); setTimeout(()=>playTone(784,0.2),200) },
    reject:  ()=>{ playTone(300,0.1,'square'); setTimeout(()=>playTone(220,0.2,'square'),120) },
    warning: ()=>{ playTone(440,0.1); setTimeout(()=>playTone(440,0.1),200); setTimeout(()=>playTone(440,0.1),400) },
    bribe:   ()=>{ playTone(880,0.05); setTimeout(()=>playTone(1047,0.05),60); setTimeout(()=>playTone(1319,0.1),120) },
    caught:  ()=>{ playTone(880,0.05,'square'); setTimeout(()=>playTone(440,0.3,'square'),80) },
    chat:    ()=>playTone(660,0.08,'sine',0.15),
    alert:   ()=>{ playTone(880,0.05); setTimeout(()=>playTone(660,0.1),80) },
  }
}

// ─── Solo Citizen Generator ───────────────────────────────────────────────────
const FM=["أحمد","محمد","علي","عمر","خالد","كريم","طارق","وليد","سامر","هشام","عماد","رامي","شريف","ماهر","نادر","عادل","فارس","منير","سعيد","جمال","بهاء","زياد","تامر","أشرف","مجدي"]
const FF=["فاطمة","مريم","نور","سارة","هبة","رنا","دينا","ريم","منى","لمياء","آية","رانيا","سمر","نهى","ولاء","شيماء","رشا","إيمان","أميرة","نسرين","ياسمين","غادة","نادية","وفاء","أسماء"]
const LN=["محمد","أحمد","علي","حسن","إبراهيم","سالم","عوض","رزق","فتحي","شعبان","سعد","زيدان","عطية","غريب","حسانين","مرسي","الشيخ","شلبي","كامل","رشوان","حمدان","بيومي","الصاوي","درويش","حلاوة"]

function genCitizenSolo(day,opts={}) {
  const g=opts.gender||(Math.random()>.5?"M":"F")
  const fn=g==="M"?FM[~~(Math.random()*FM.length)]:FF[~~(Math.random()*FF.length)]
  const mn=LN[~~(Math.random()*LN.length)],ln=LN[~~(Math.random()*LN.length)]
  const full=`${fn} ${mn} ${ln}`
  const gov=GOVERNORATES[~~(Math.random()*GOVERNORATES.length)]
  const birth=new Date(1960+~~(Math.random()*40),~~(Math.random()*12),~~(Math.random()*28)+1)
  const specialType=Math.random()<.18?["elderly","proxy","foreigner"][~~(Math.random()*3)]:"normal"
  const forgeChance=Math.min(.15+day*.05,.55)
  const isForged=opts.isForced!==undefined?opts.isForced:Math.random()<forgeChance
  // السمعة بتزيد احتمال الرشوة (reputation يتاخد من خارج الدالة)
  const reputationBonus = typeof window!=="undefined" ? (window._civilReputation||0)*0.05 : 0
  const isWanted=day>=3&&Math.random()<.10, hasBribe=day>=2&&Math.random()<Math.min(0.5,0.18+reputationBonus)
  const rt=REQUEST_TYPES[~~(Math.random()*REQUEST_TYPES.length)]
  const req=getRequiredDocs(rt.id,g)
  function genId(b,gc){const y=b.getFullYear(),c=y>=2000?"3":"2",yy=String(y).slice(2);return `${c}${yy}${String(b.getMonth()+1).padStart(2,"0")}${String(b.getDate()).padStart(2,"0")}${gc}${String(~~(Math.random()*9999)).padStart(4,"0")}${g==="M"?"1":"2"}${~~(Math.random()*9)+1}`}
  function drop(s){const p=s.split(" "),wi=~~(Math.random()*p.length),w=p[wi];if(w.length>2){const ci=1+~~(Math.random()*(w.length-2));p[wi]=w.slice(0,ci)+w.slice(ci+1)}return p.join(" ")}
  let nid=genId(birth,gov.code),decl=full,pSeed=null,exp="2027-06-01",fr=null,fdoc=null
  if(isForged){
    const ft=["invalid_national_id_birthdate","wrong_governorate_code","name_mismatch_form","name_mismatch_doc","expired_id","photo_mismatch","wrong_gender_digit","future_birthdate"]
    fr=ft[~~(Math.random()*ft.length)]
    if(fr==="invalid_national_id_birthdate")nid=genId(new Date(1948+~~(Math.random()*14),0,1),gov.code)
    else if(fr==="wrong_governorate_code"){const wg=GOVERNORATES.filter(x=>x.code!==gov.code)[~~(Math.random()*(GOVERNORATES.length-1))];nid=genId(birth,wg.code)}
    else if(fr==="name_mismatch_form")decl=drop(full)
    else if(fr==="name_mismatch_doc"){fdoc=req.length?req[~~(Math.random()*req.length)]:null;if(!fdoc){decl=drop(full);fr="name_mismatch_form"}}
    else if(fr==="expired_id")exp="2022-01-01"
    else if(fr==="photo_mismatch")pSeed="x"+Math.random().toString(36).slice(2)
    else if(fr==="wrong_gender_digit")nid=nid.slice(0,13)+(g==="M"?"2":"1")+nid.slice(14)
    else if(fr==="future_birthdate"){const fd=new Date(Date.now()+365*24*60*60*1000*2);nid=genId(fd,gov.code)}
  }
  if(specialType==="elderly")exp="2019-06-01"
  const idSeed=nid;if(!pSeed)pSeed=idSeed
  let avail
  if(opts.isReturning)avail=[...req]
  else{const hp=Math.max(.35,.85-day*.04);avail=req.filter(()=>Math.random()<hp);if(fdoc&&!avail.includes(fdoc))avail.push(fdoc)}
  const docs={};avail.forEach(dn=>{docs[dn]={printed_name:fdoc===dn?drop(full):full,printed_governorate:gov.name,issue_date:new Date(2015+~~(Math.random()*9),~~(Math.random()*12),~~(Math.random()*28)+1).toISOString().split("T")[0]}})
  const wantedData=isWanted?WANTED_LIST[~~(Math.random()*WANTED_LIST.length)]:null
  const isNervous=isForged&&day>=4&&Math.random()<.4
  const dlgs={normal:["صباح النور يا أستاذ.","الأوراق كلها معايا.","عايز أخلص بسرعة.","ربنا يخليك."],forged:["أنا مستعجل جداً!","ليه الاستفسار ده؟","بقالي ساعة واقف!"],bribe:["يا أستاذ إحنا ناس بنعرف بعض.","في طريقة أسرع؟"],wanted:["صباح الخير يا أستاذ.","بكل سرور يا فندم."],elderly:["يا ابني أنا تعبت.","ساعدني بسرعة يا ولدي."],proxy:["جاي بالوكالة عن أخويا."],foreigner:["معايا كل الأوراق."]}
  const dt=hasBribe?"bribe":isForged?"forged":isWanted?"wanted":specialType==="elderly"?"elderly":specialType==="proxy"?"proxy":specialType==="foreigner"?"foreigner":"normal"
  const pool=dlgs[dt]||dlgs.normal
  return {
    id:`s_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
    full_name:full,declared_name:decl,national_id:nid,
    birth_date:birth.toISOString().split("T")[0],governorate:gov.name,governorate_code:gov.code,gender:g,
    special_type:specialType,is_nervous:isNervous,
    request_type_id:rt.id,request_type:rt.name,required_docs:req,available_docs:avail,doc_contents:docs,
    is_wanted:isWanted,wanted_data:wantedData,has_bribe:hasBribe,bribe_amount:hasBribe?(~~(Math.random()*18)+1)*50:0,
    expires_at:exp,id_photo_seed:idSeed,person_seed:pSeed,
    dialogue:pool[~~(Math.random()*pool.length)],is_returning:!!opts.isReturning,
    wife_name:g==="M"?(()=>{const fN=["فاطمة","مريم","نور","سارة","هبة","رنا","دينا","ريم","منى","لمياء","آية","رانيا","سمر","نهى","ولاء"];const lN=["محمد","أحمد","علي","حسن","إبراهيم","سالم","عوض","رزق","فتحي","شعبان"];const s=parseInt(nid.slice(-4));return fN[s%fN.length]+" "+lN[Math.floor(s/fN.length)%lN.length]})():null,
    proxy_data: specialType==="proxy"?(()=>{
      // بيانات الوكيل (الشخص الواقف قدامك)
      const pg=Math.random()>.5?"M":"F"
      const pfn=pg==="M"?FM[~~(Math.random()*FM.length)]:FF[~~(Math.random()*FF.length)]
      const pmn=LN[~~(Math.random()*LN.length)],pln=LN[~~(Math.random()*LN.length)]
      const pname=`${pfn} ${pmn} ${pln}`
      const pgov=GOVERNORATES[~~(Math.random()*GOVERNORATES.length)]
      const pbirth=new Date(1975+~~(Math.random()*25),~~(Math.random()*12),~~(Math.random()*28)+1)
      const py=pbirth.getFullYear(),pc=py>=2000?"3":"2",pyy=String(py).slice(2)
      const pnid=`${pc}${pyy}${String(pbirth.getMonth()+1).padStart(2,"0")}${String(pbirth.getDate()).padStart(2,"0")}${pgov.code}${String(~~(Math.random()*9999)).padStart(4,"0")}${pg==="M"?"1":"2"}${~~(Math.random()*9)+1}`
      const poaNum=`${1000+~~(Math.random()*9000)}/${new Date().getFullYear()}`
      return {
        name:pname, gender:pg, national_id:pnid,
        birth_date:pbirth.toISOString().split("T")[0],
        governorate:pgov.name, poa_number:poaNum,
        id_photo_seed:pnid,
      }
    })():null,
    _secret:{isForged,forgeReason:fr,isWanted,wantedData,forgedDocName:fdoc,specialType,isNervous},
  }
}

// ─── Document Components ──────────────────────────────────────────────────────
function OfficialCircleStamp({color,label}){
  return <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}><div style={{width:64,height:64,borderRadius:"50%",border:`3px solid ${color}50`,display:"flex",alignItems:"center",justifyContent:"center",color:`${color}50`,fontSize:8,textAlign:"center",transform:"rotate(-12deg)",lineHeight:1.3}}>{label}</div></div>
}

function NationalIDCard({citizen}){
  const [flipped,setFlipped]=useState(false)
  const fp=citizen.gender==="M"?40:0
  const expired=citizen.expires_at<"2024-06-01"
  const isMale=citizen.gender==="M"
  const maritalOptions=isMale?["أعزب","متزوج","مطلق","أرمل"]:["عزباء","متزوجة","مطلقة","أرملة"]
  const seed=citizen.national_id
  const marital=maritalOptions[parseInt(seed.slice(-1))%4]
  // مؤهل ومهنة متوافقين
  const jobEduPairs=isMale?[
    {job:"موظف",edu:"بكالوريوس"},{job:"مهندس",edu:"بكالوريوس"},
    {job:"طبيب",edu:"بكالوريوس"},{job:"محاسب",edu:"بكالوريوس"},
    {job:"معلم",edu:"بكالوريوس"},{job:"محامي",edu:"بكالوريوس"},
    {job:"تاجر",edu:"ثانوية عامة"},{job:"فني",edu:"دبلوم"},
    {job:"سائق",edu:"ثانوية عامة"},{job:"بدون عمل",edu:"بدون مؤهل"},
    {job:"عامل",edu:"ابتدائي"},{job:"ميكانيكي",edu:"دبلوم"},
  ]:[
    {job:"موظفة",edu:"بكالوريوس"},{job:"مهندسة",edu:"بكالوريوس"},
    {job:"طبيبة",edu:"بكالوريوس"},{job:"محاسبة",edu:"بكالوريوس"},
    {job:"معلمة",edu:"بكالوريوس"},{job:"محامية",edu:"بكالوريوس"},
    {job:"ربة منزل",edu:"ثانوية عامة"},{job:"فنية",edu:"دبلوم"},
    {job:"ممرضة",edu:"دبلوم"},{job:"بدون عمل",edu:"بدون مؤهل"},
    {job:"صيدلانية",edu:"بكالوريوس"},{job:"مديرة",edu:"ماجستير"},
  ]
  const pairIdx=parseInt(seed.slice(-2))%jobEduPairs.length
  const {job,edu}=jobEduPairs[pairIdx]
  // الديانة في الخلف - مسلم/مسيحي
  const religionOptions=["مسلم","مسيحي"]
  const religion=religionOptions[parseInt(seed.slice(-4))%10<8?0:1] // 80% مسلم

  const CardFront=()=>(
    <div style={{background:"linear-gradient(140deg,#0c2d5e,#1a4f8a,#0a2244)",borderRadius:10,overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,.5)",border:"2px solid #2a6ab0"}}>
      <div style={{background:"rgba(0,0,0,.35)",padding:"7px 14px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:"#f0c040",fontSize:11,letterSpacing:3,fontWeight:"bold"}}>جمهورية مصر العربية</div>
        <div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>بطاقة تحقيق الشخصية</div>
        <div style={{color:"#8ab8d8",fontSize:9}}>Arab Republic of Egypt — National ID Card</div>
      </div>
      <div style={{display:"flex",gap:12,padding:14}}>
        <div style={{flexShrink:0,width:80,height:100,borderRadius:4,overflow:"hidden",border:"2px solid #4a8ac8",background:"#1a3a5c"}}>
          <img src={avatar(citizen.id_photo_seed,citizen.gender)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
        </div>
        <div style={{flex:1}}>
          {[["الاسم",citizen.full_name,false],["الرقم القومي",citizen.national_id,true],["تاريخ الميلاد",citizen.birth_date,false],["محل الميلاد",citizen.governorate,false],].map(([lbl,val,mono])=>(
            <div key={lbl} style={{marginBottom:5}}>
              <div style={{color:"#7ab0d8",fontSize:9}}>{lbl}</div>
              <div style={{color:"#fff",fontSize:mono?11:12,fontFamily:mono?"monospace":"inherit",fontWeight:600}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,.3)",padding:"6px 14px",display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:expired?"#ff6b6b":"#8ab8d8",fontSize:11}}>صالحة حتى: <strong style={{color:expired?"#ff4444":"#6de4ff"}}>{citizen.expires_at}{expired?" ⚠️ منتهية!":""}</strong></div>
        <div style={{color:"#f0c040",fontSize:22}}>𓅃</div>
      </div>
    </div>
  )

  const CardBack=()=>(
    <div style={{background:"linear-gradient(140deg,#0c2d5e,#1a4f8a,#0a2244)",borderRadius:10,overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,.5)",border:"2px solid #2a6ab0"}}>
      <div style={{background:"rgba(0,0,0,.35)",padding:"7px 14px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:"#f0c040",fontSize:11,letterSpacing:3,fontWeight:"bold"}}>جمهورية مصر العربية</div>
        <div style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>بيانات إضافية — ظهر البطاقة</div>
      </div>
      <div style={{padding:14}}>
        {[
          ["الحالة الاجتماعية",marital],
          ["المهنة",job],
          ["المؤهل الدراسي",edu],
          ["الديانة",religion],
          ["الجنس",citizen.gender==="M"?"ذكر":"أنثى"],
          ["المحافظة",citizen.governorate],
        ].map(([lbl,val])=>(
          <div key={lbl} style={{marginBottom:7,borderBottom:"1px solid rgba(255,255,255,.1)",paddingBottom:5}}>
            <div style={{color:"#7ab0d8",fontSize:9}}>{lbl}</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{val}</div>
          </div>
        ))}
        <div style={{background:"#111",height:28,borderRadius:3,marginTop:8,display:"flex",alignItems:"center",padding:"0 8px"}}>
          <div style={{color:"#555",fontSize:9,fontFamily:"monospace",letterSpacing:1}}>{citizen.national_id}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:400,margin:"0 auto",userSelect:"none"}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <button onClick={()=>setFlipped(f=>!f)} style={{padding:"5px 16px",background:"#1a3a6b",color:"#fff",border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
          {flipped?"↩️ الوجه الأمامي":"↪️ اقلب للخلف"}
        </button>
      </div>
      <div style={{perspective:1000}}>
        <motion.div
          animate={{rotateY:flipped?180:0}}
          transition={{duration:0.55,type:"spring",damping:22,stiffness:180}}
          style={{transformStyle:"preserve-3d",position:"relative",minHeight:210}}
        >
          <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"}}>
            <CardFront/>
          </div>
          <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",position:"absolute",top:0,left:0,right:0}}>
            <CardBack/>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── استمارة الطلب ─────────────────────────────────────────────────────────────
function RequestFormDoc({citizen}){
  const allRt=[
    {id:"new_id",name:"استخراج بطاقة جديدة",docs:["شهادة ميلاد","قيد عائلي","شهادة تجنيد","صورتان شخصيتان"],maleOnly:["شهادة تجنيد"]},
    {id:"renew_id",name:"تجديد بطاقة",docs:["البطاقة القديمة","إيصال مرافق"],maleOnly:[]},
    {id:"replace_id",name:"بدل فاقد",docs:["محضر شرطة بالفقد","قيد عائلي","فيش وتشبيه"],maleOnly:[]},
    {id:"family_register",name:"استخراج قيد عائلي",docs:["بطاقة رب الأسرة","شهادات ميلاد الأبناء","وثيقة الزواج"],maleOnly:[]},
    {id:"address_update",name:"تغيير محل الإقامة",docs:["إيصال مرافق","عقد إيجار أو ملكية","البطاقة القديمة"],maleOnly:[]},
    {id:"marital_status",name:"تحديث الحالة الاجتماعية",docs:["وثيقة الزواج","البطاقة القديمة","قيد عائلي"],maleOnly:[]},
  ]
  const currentRt=allRt.find(r=>r.id===citizen.request_type_id)||allRt[0]
  const requiredDocs=currentRt.docs.filter(d=>citizen.gender==="M"||!currentRt.maleOnly.includes(d))
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)",position:"relative"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:0}}>
          <div style={{fontSize:80,opacity:.03,fontWeight:900,color:"#8a6010",transform:"rotate(-30deg)"}}>السجل المدني</div>
        </div>
        <div style={{background:"linear-gradient(180deg,#8a6010,#c08020)",padding:"10px 16px",position:"relative",zIndex:1}}>
          <div style={{textAlign:"center"}}>
            <div style={{color:"#f0e090",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية — وزارة الداخلية</div>
            <div style={{color:"#f0e090",fontSize:10}}>مصلحة الأحوال المدنية — السجل المدني</div>
            <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:6,borderTop:"1px solid rgba(255,255,255,.3)",paddingTop:6}}>استمارة طلب</div>
          </div>
        </div>
        <div style={{padding:"14px 18px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:12}}>
          {/* نوع الطلب */}
          <div style={{border:"1.5px solid #d0a840",borderRadius:4,overflow:"hidden"}}>
            <div style={{background:"#fffaee",padding:"5px 10px",borderBottom:"1px solid #d0a840",fontWeight:700,fontSize:12,color:"#7a5010"}}>✦ نوع الطلب</div>
            <div style={{padding:"8px 12px"}}>
              {allRt.map(r=>(
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",fontSize:12}}>
                  <div style={{width:14,height:14,border:`2px solid ${r.id===citizen.request_type_id?"#8a6010":"#ccc"}`,borderRadius:3,flexShrink:0,background:r.id===citizen.request_type_id?"#8a6010":"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {r.id===citizen.request_type_id&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{color:r.id===citizen.request_type_id?"#3a2000":"#999",fontWeight:r.id===citizen.request_type_id?700:400}}>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* بيانات مقدم الطلب */}
          <div style={{border:"1.5px solid #d0a840",borderRadius:4,overflow:"hidden"}}>
            <div style={{background:"#fffaee",padding:"5px 10px",borderBottom:"1px solid #d0a840",fontWeight:700,fontSize:12,color:"#7a5010"}}>✦ بيانات مقدم الطلب</div>
            <div style={{padding:"8px 12px"}}>
              {[["الاسم",citizen.declared_name||citizen.full_name],["الرقم القومي",citizen.national_id],["الجنس",citizen.gender==="M"?"ذكر":"أنثى"],["تاريخ الطلب",new Date().toISOString().split("T")[0]]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px dotted #e0c860",fontSize:12}}>
                  <span style={{color:"#7a5010",fontWeight:600}}>{l}</span>
                  <span style={{fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* الوثائق المطلوبة */}
          <div style={{border:"1.5px solid #d0a840",borderRadius:4,overflow:"hidden"}}>
            <div style={{background:"#fffaee",padding:"5px 10px",borderBottom:"1px solid #d0a840",fontWeight:700,fontSize:12,color:"#7a5010"}}>✦ الوثائق المطلوبة</div>
            <div style={{padding:"8px 12px"}}>
              {requiredDocs.map(doc=>{
                const present=(citizen.available_docs||[]).includes(doc)
                return (
                  <div key={doc} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:12,borderBottom:"1px dotted #e0c860"}}>
                    <div style={{width:14,height:14,border:`1.5px solid ${present?"#1a5c2a":"#cc4444"}`,borderRadius:3,flexShrink:0,background:present?"#1a5c2a":"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {present&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
                    </div>
                    <span style={{color:present?"#1a5c2a":"#cc4444",fontWeight:present?600:400}}>{doc}</span>
                    {!present&&<span style={{marginRight:"auto",fontSize:10,color:"#cc4444",background:"#ffe0da",padding:"1px 6px",borderRadius:10}}>ناقصة</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <div style={{width:60,height:60,borderRadius:"50%",border:"3px solid #c0a840",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#7a5010",textAlign:"center",lineHeight:1.3}}>السجل<br/>المدني<br/>مصر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── شهادة الميلاد ─────────────────────────────────────────────────────────────
function BirthCertificateDoc({citizen,content,isChildCert=false}){
  const _s1=parseInt(citizen.national_id.slice(-6))
  const regNum=100000+(_s1%900000)
  const bookNum=1000+((_s1*3)%9000)

  // لو شهادة ميلاد الأبناء - نولّد اسم ابن/بنت
  const childSeed=parseInt(citizen.national_id.slice(-4))
  const childMaleNames=["أحمد","محمد","علي","عمر","خالد","كريم","يوسف","عمر"]
  const childFemaleNames=["فاطمة","مريم","نور","سارة","هبة","ريم","دينا","لمياء"]
  const childGender=childSeed%2===0?"M":"F"
  const childFirstName=childGender==="M"
    ?childMaleNames[childSeed%childMaleNames.length]
    :childFemaleNames[childSeed%childFemaleNames.length]
  // اسم الطفل: اسمه + اسم أبوه + اسم جده
  // في الاسم المصري: هبة (البنت) شعبان (أبوها) الشيخ (جدها)
  const nameParts       = citizen.full_name.split(" ")
  const fatherFirstName = nameParts[0]   // اسم المواطن نفسه = اسم الأب للطفل
  const grandfatherName = nameParts[1] || ""
  const childFullName   = `${childFirstName} ${fatherFirstName} ${grandfatherName}`.trim()

  // الأب والأم
  const isMale=citizen.gender==="M"

  // أسماء الزوج المولّد لو المواطنة أنثى
  const maleNamesC=["أحمد","محمد","علي","عمر","خالد","طارق","وليد","سامر"]
  const lastNamesC=["محمد","أحمد","علي","حسن","إبراهيم","سالم","عوض","رزق"]
  const hSeedC=parseInt(citizen.national_id.slice(-4))
  const generatedHusbandName=maleNamesC[hSeedC%maleNamesC.length]+" "+lastNamesC[Math.floor(hSeedC/maleNamesC.length)%lastNamesC.length]

  // شهادة ميلاد عادية (بتاعة المواطن نفسه):
  //   الأب = الكلمة التانية والتالتة من اسم المواطن (مش اسمه هو)
  // شهادة ميلاد الأبناء:
  //   الأب = اسم المواطن كامل لو ذكر، أو اسم زوجها لو أنثى
  const isChildDoc_check = false // بيتحدد في الـ rows تحت
  const fatherNameForOwnCert = (nameParts.slice(1).join(" "))||"—"
  const fatherName = isMale
    ? citizen.full_name          // لو ذكر وعنده أبناء — هو الأب
    : (citizen.wife_name||generatedHusbandName) // لو أنثى — زوجها هو الأب

  // اسم الأم
  const femMotherNames=["فاطمة","مريم","نور","سارة","هبة","رانيا","سمر","نهى","ولاء","شيماء","آية","إيمان","أميرة","دينا","ريم"]
  const lastMotherNames=["عبدالله","إبراهيم","محمود","سالم","عوض","رزق","شعبان","زيدان","عطية","غريب"]
  const mSeed=parseInt(citizen.national_id.slice(-5))
  const generatedMotherName=femMotherNames[mSeed%femMotherNames.length]+" "+lastMotherNames[Math.floor(mSeed/femMotherNames.length)%lastMotherNames.length]
  const motherName = !isMale
    ? citizen.full_name          // لو أنثى — هي الأم
    : (citizen.wife_name||generatedMotherName) // لو ذكر — زوجته هي الأم

  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)",position:"relative"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:0}}>
          <div style={{fontSize:100,opacity:.03,fontWeight:900,color:"#1a6b2a",transform:"rotate(-30deg)",whiteSpace:"nowrap"}}>وزارة الداخلية</div>
        </div>
        <div style={{background:"linear-gradient(180deg,#1a6b2a,#2a8a3e)",padding:"10px 16px",position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{color:"#a8e8b0",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية</div>
              <div style={{color:"#fff",fontSize:11,marginTop:2}}>وزارة الداخلية — مصلحة الأحوال المدنية</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:900,marginTop:6,borderTop:"1px solid rgba(255,255,255,.3)",paddingTop:6}}>شهادة الميلاد</div>
              <div style={{color:"#a8e8b0",fontSize:9,marginTop:2}}>Birth Certificate</div>
            </div>
            <div style={{fontSize:36,marginRight:8}}>𓅃</div>
          </div>
        </div>
        <div style={{background:"#f0faf0",padding:"4px 14px",borderBottom:"2px solid #2a8a3e",display:"flex",justifyContent:"space-between",fontSize:11,color:"#2a5a2a",position:"relative",zIndex:1}}>
          <span>رقم القيد: <strong style={{fontFamily:"monospace"}}>{regNum}</strong></span>
          <span>رقم الدفتر: <strong style={{fontFamily:"monospace"}}>{bookNum}</strong></span>
          <span>سجل: <strong>{citizen.governorate}</strong></span>
        </div>
        <div style={{padding:"14px 18px",position:"relative",zIndex:1}}>
          <div style={{fontSize:11,color:"#1a5a1a",marginBottom:12,textAlign:"center",borderBottom:"1px dashed #aaa",paddingBottom:8}}>
            يُشهد بموجب هذه الشهادة الرسمية أن المولود/ة الآتي بيانه/ا قد سُجِّل/ت بسجلات مصلحة الأحوال المدنية
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {(()=>{
                const isChildDoc = content?._docName==="شهادات ميلاد الأبناء"
                const rows=[
                  ["الاسم الرباعي كاملاً", isChildDoc ? childFullName : (content?.printed_name||citizen.full_name)],
                  ["الجنس", isChildDoc ? (childGender==="M"?"ذكر  ☑   أنثى  ☐":"ذكر  ☐   أنثى  ☑") : (citizen.gender==="M"?"ذكر  ☑   أنثى  ☐":"ذكر  ☐   أنثى  ☑")],
                  ["تاريخ الميلاد", isChildDoc ? "—" : citizen.birth_date],
                  ["محل الميلاد / المحافظة", citizen.governorate],
                  ["اسم الأب", isChildDoc ? fatherName : fatherNameForOwnCert],
                  ["اسم الأم", isChildDoc ? motherName : generatedMotherName],
                  ["تاريخ تحرير الشهادة", content?.issue_date||"—"],
                  ...(content?._deadOfficerNote?[["الموظف الموقِّع", content._deadOfficerNote]]:[] ),
                  ...(content?._conflictBirthdate?[["تاريخ الميلاد (نسخة الورقة)", content._conflictBirthdate]]:[] ),
                ]
                return rows
              })().map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #ddd"}}>
                  <td style={{padding:"6px 10px",color:"#2a5a2a",fontWeight:700,width:"40%",background:"#f8fff8"}}>{l}</td>
                  <td style={{padding:"6px 10px",fontWeight:500}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:14,paddingTop:8,borderTop:"1px dashed #aaa"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع مأمور السجل المدني</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:70,height:70,borderRadius:"50%",border:"3px solid #1a6b2a",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#1a6b2a",textAlign:"center",lineHeight:1.3}}>مصلحة<br/>الأحوال المدنية<br/>مصر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── القيد العائلي / بطاقة رب الأسرة ──────────────────────────────────────────
function FamilyRegisterDoc({citizen,content}){
  const _s2=parseInt(citizen.national_id.slice(-6))
  const regNum=100000+(_s2%900000)
  const isMale=citizen.gender==="M"
  const headLabel=isMale?"اسم رب الأسرة":"اسم ربة الأسرة"
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)",position:"relative"}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:0}}>
          <div style={{fontSize:80,opacity:.03,fontWeight:900,color:"#8a6010",transform:"rotate(-30deg)"}}>السجل المدني</div>
        </div>
        <div style={{background:"linear-gradient(180deg,#7a5010,#c09030)",padding:"10px 16px",position:"relative",zIndex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{color:"#f0e0a0",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية — وزارة الداخلية</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:900,marginTop:6}}>قيد عائلي</div>
              <div style={{color:"#f0e0a0",fontSize:9}}>Family Register</div>
            </div>
            <div style={{fontSize:32}}>𓅃</div>
          </div>
        </div>
        <div style={{background:"#fdf8e8",padding:"4px 14px",borderBottom:"2px solid #c09030",fontSize:11,color:"#7a5010",display:"flex",justifyContent:"space-between",position:"relative",zIndex:1}}>
          <span>رقم القيد: <strong style={{fontFamily:"monospace"}}>{regNum}</strong></span>
          <span>محافظة: <strong>{content?.printed_governorate||citizen.governorate}</strong></span>
        </div>
        <div style={{padding:"14px 18px",position:"relative",zIndex:1}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                [headLabel, content?.printed_name||citizen.full_name],
                ["الجنس", isMale?"ذكر":"أنثى"],
                ["محافظة القيد", content?.printed_governorate||citizen.governorate],
                ["عدد أفراد الأسرة", String(2+Math.floor(Math.random()*5))],
                ["تاريخ إنشاء القيد", content?.issue_date||"—"],
                ["رقم البطاقة القومية", citizen.national_id],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #e0c860"}}>
                  <td style={{padding:"6px 10px",color:"#7a5010",fontWeight:700,width:"40%",background:"#fffaee"}}>{l}</td>
                  <td style={{padding:"6px 10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:12,padding:8,background:"#fffaee",border:"1px solid #e0c860",borderRadius:4,fontSize:11,color:"#7a5010"}}>
            هذا القيد العائلي صادر من مصلحة الأحوال المدنية ويُعتد به في جميع الإجراءات الرسمية.
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع الموظف المختص</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:70,height:70,borderRadius:"50%",border:"3px solid #c09030",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#7a5010",textAlign:"center",lineHeight:1.3}}>السجل<br/>المدني<br/>مصر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── شهادة التجنيد ─────────────────────────────────────────────────────────────
function MilitaryCertDoc({citizen,content}){
  const _s3=parseInt(citizen.national_id.slice(-5))
  const certNum=10000+(_s3%90000)
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)",position:"relative"}}>
        <div style={{background:"linear-gradient(180deg,#1a3a10,#2a6a1a)",padding:"10px 16px",position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:36}}>⭐</div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{color:"#b8e898",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية</div>
              <div style={{color:"#fff",fontSize:11}}>القوات المسلحة المصرية</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>شهادة أداء الخدمة العسكرية</div>
            </div>
            <div style={{fontSize:36}}>⭐</div>
          </div>
        </div>
        <div style={{background:"#e8f4e0",padding:"4px 14px",borderBottom:"2px solid #2a6a1a",fontSize:11,color:"#2a5010",display:"flex",justifyContent:"space-between"}}>
          <span>رقم الشهادة: <strong style={{fontFamily:"monospace"}}>{certNum}</strong></span>
          <span>سري — للاستخدام الرسمي فقط</span>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#e8f4e0",border:"1px solid #4a7a2a",borderRadius:4,padding:"8px 12px",textAlign:"center",marginBottom:12,fontSize:12,color:"#1a5010"}}>
            {citizen.gender==="M"
              ? <>يُشهد بأن المواطن الموضحة بياناته قد <strong>أتمَّ الخدمة العسكرية / أُعفي منها</strong> وفقاً للقانون رقم 127 لسنة 1980</>
              : <>تُشهد بأن المواطنة الموضحة بياناتها <strong>مُعفاة من الخدمة العسكرية</strong> وفقاً للقانون المصري</>
            }
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                ["الاسم كاملاً",content?.printed_name||citizen.full_name],
                ["الرقم القومي",citizen.national_id],
                ["المحافظة",content?.printed_governorate||citizen.governorate],
                ["الحالة","أتم الخدمة العسكرية / معفى بموجب القانون"],
                ["تاريخ الإصدار",content?.issue_date||"—"],
                ["رقم الشهادة",String(certNum)],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #c8e0b8"}}>
                  <td style={{padding:"6px 10px",color:"#2a5a10",fontWeight:700,width:"40%",background:"#f0fae8"}}>{l}</td>
                  <td style={{padding:"6px 10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع الضابط المختص</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:70,height:70,borderRadius:"50%",border:"3px solid #2a6a1a",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#1a5010",textAlign:"center",lineHeight:1.3}}>القوات<br/>المسلحة<br/>المصرية</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── فيش وتشبيه ────────────────────────────────────────────────────────────────
function FayshDoc({citizen,content}){
  const _s4=parseInt(citizen.national_id.slice(-6))
  const refNum=100000+(_s4%900000)
  const fp=citizen.gender==="M"?40:0
  const Fingerprint=({x,y,size=22})=>(
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={size/2} cy={size/2} rx={size/2} ry={size*0.6} fill="none" stroke="#555" strokeWidth="0.8" opacity="0.6"/>
      {[0.3,0.45,0.6,0.75].map((r,i)=>(
        <ellipse key={i} cx={size/2} cy={size/2} rx={size*r*0.5} ry={size*r*0.65} fill="none" stroke="#555" strokeWidth="0.6" opacity="0.5"/>
      ))}
    </g>
  )
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #bbb",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        <div style={{background:"linear-gradient(180deg,#0a2a5a,#1a4a8a)",padding:"10px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:28}}>𓅃</div>
            <div style={{textAlign:"center",flex:1}}>
              <div style={{color:"#80c0f0",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية — وزارة الداخلية</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>فيش وتشبيه</div>
              <div style={{color:"#80c0f0",fontSize:9}}>صحيفة الحالة الجنائية — Criminal Record Certificate</div>
            </div>
            <div style={{fontSize:28}}>𓅃</div>
          </div>
        </div>
        <div style={{background:"#e8f0ff",padding:"4px 14px",borderBottom:"2px solid #1a4a8a",fontSize:11,color:"#1a3a6a",display:"flex",justifyContent:"space-between"}}>
          <span>رقم المرجع: <strong style={{fontFamily:"monospace"}}>{refNum}</strong></span>
          <span>الصلاحية: 3 أشهر من تاريخ الإصدار</span>
        </div>
        <div style={{padding:"12px 16px"}}>
          {/* الصورة فوق الشمال + بصمات */}
          <div style={{display:"flex",gap:12,marginBottom:12}}>
            {/* صورة متدبسة */}
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{position:"absolute",top:-5,left:6,width:9,height:9,borderRadius:"50%",background:"#c0392b",border:"1px solid #922b21",zIndex:2}}/>
              <div style={{position:"absolute",top:-5,right:6,width:9,height:9,borderRadius:"50%",background:"#c0392b",border:"1px solid #922b21",zIndex:2}}/>
              <div style={{width:85,height:105,border:"2px solid #888",overflow:"hidden",background:"#eee",position:"relative"}}>
                <img src={avatar(citizen.id_photo_seed,citizen.gender)}
                  style={{width:"100%",height:"100%",objectFit:"cover"}} alt="صورة"/>
              </div>
              <div style={{fontSize:9,color:"#555",textAlign:"center",marginTop:3}}>صورة صاحب الشهادة</div>
            </div>
            {/* بصمات */}
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#1a3a6a",fontWeight:700,marginBottom:4}}>بصمات الأصابع</div>
              <svg width="100%" height="95" viewBox="0 0 200 90">
                <text x="50" y="10" textAnchor="middle" fontSize="9" fill="#555">اليد اليمنى</text>
                {[0,1,2,3,4].map(i=><Fingerprint key={`r${i}`} x={i*38+4} y={14} size={28}/>)}
                <text x="50" y="58" textAnchor="middle" fontSize="9" fill="#555">اليد اليسرى</text>
                {[0,1,2,3,4].map(i=><Fingerprint key={`l${i}`} x={i*38+4} y={62} size={28}/>)}
              </svg>
            </div>
          </div>
          {/* شهادة عدم السوابق */}
          <div style={{background:"#e8f8e8",border:"2px solid #2a8a2a",borderRadius:4,padding:"8px 12px",textAlign:"center",marginBottom:10}}>
            <div style={{fontSize:16,marginBottom:2}}>✓</div>
            <div style={{fontWeight:900,fontSize:13,color:"#1a6a1a"}}>شهادة بعدم السوابق الجنائية</div>
            <div style={{fontSize:11,color:"#2a6a2a",marginTop:2}}>لا توجد سوابق جنائية مسجلة في سجلات وزارة الداخلية</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              {[
                ["الاسم الكامل",content?.printed_name||citizen.full_name],
                ["الرقم القومي",citizen.national_id],
                ["المحافظة",content?.printed_governorate||citizen.governorate],
                ["تاريخ الإصدار",content?.issue_date||"—"],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #ddd"}}>
                  <td style={{padding:"5px 8px",color:"#1a3a6a",fontWeight:700,width:"38%",background:"#f0f4ff"}}>{l}</td>
                  <td style={{padding:"5px 8px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع المختص</div>
              <div style={{width:90,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:65,height:65,borderRadius:"50%",border:"3px solid #1a4a8a",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#1a3a6a",textAlign:"center",lineHeight:1.3}}>وزارة<br/>الداخلية<br/>مصر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── محضر الشرطة ───────────────────────────────────────────────────────────────
function PoliceReportDoc({citizen,content}){
  const _s5=parseInt(citizen.national_id.slice(-4))
  const reportNum=1000+(_s5%9000)
  const year=new Date().getFullYear()
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)",position:"relative"}}>
        <div style={{background:"linear-gradient(180deg,#1a1a6a,#2a2a9a)",padding:"10px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:30}}>⚖️</div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{color:"#9898c8",fontSize:10,letterSpacing:2}}>وزارة الداخلية — الشرطة المصرية</div>
              <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>محضر شرطة</div>
            </div>
            <div style={{fontSize:30}}>⚖️</div>
          </div>
        </div>
        <div style={{background:"#eeeeff",padding:"4px 14px",borderBottom:"2px solid #2a2a9a",fontSize:11,color:"#2a2a6a",display:"flex",justifyContent:"space-between"}}>
          <span>رقم المحضر: <strong style={{fontFamily:"monospace"}}>{reportNum}/{year}</strong></span>
          <span>قسم الشرطة المختص</span>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#f8f8ff",border:"1px solid #aaaaee",borderRadius:4,padding:"10px 12px",marginBottom:12,fontSize:12,lineHeight:1.8,color:"#222"}}>
            أُحرر هذا المحضر بمعرفة الضابط المحقق المنوب في الوردية، وفيه يُقر المبلِّغ المذكور بياناته أدناه بفقد بطاقة تحقيق الشخصية الخاصة به دون أن يعلم مكانها، وذلك لأسباب خارجة عن إرادته.
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                ["اسم المبلِّغ",content?.printed_name||citizen.full_name],["الجنس",citizen.gender==="M"?"ذكر":"أنثى"],
                ["الرقم القومي",citizen.national_id],
                ["المحافظة",content?.printed_governorate||citizen.governorate],
                ["تاريخ التحرير",content?.issue_date||"—"],
                ["القسم","قسم شرطة المنطقة"],
                ["رقم المحضر",`${reportNum}/${year}`],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #ddddff"}}>
                  <td style={{padding:"6px 10px",color:"#2a2a6a",fontWeight:700,width:"38%",background:"#f5f5ff"}}>{l}</td>
                  <td style={{padding:"6px 10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع المبلِّغ</div>
              <div style={{width:90,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع الضابط المحقق</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:65,height:65,borderRadius:"50%",border:"3px solid #2a2a9a",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#2a2a6a",textAlign:"center",lineHeight:1.3}}>الشرطة<br/>المصرية</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── إيصال مرافق ───────────────────────────────────────────────────────────────
function UtilityBillDoc({citizen,content}){
  const seed=parseInt(citizen.national_id.slice(-6))
  const meterNum=1000000+(seed%9000000)
  const amount=50+((seed*7)%250)
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #ddd",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
        <div style={{background:"linear-gradient(90deg,#d06000,#f08010)",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:14}}>شركة توزيع كهرباء</div>
            <div style={{color:"#ffe0a0",fontSize:10,marginTop:2}}>إيصال سداد دوري — Utility Bill</div>
          </div>
          <div style={{fontSize:36}}>⚡</div>
        </div>
        <div style={{background:"#fff3e0",padding:"4px 14px",borderBottom:"2px solid #f08010",fontSize:11,color:"#8a4000",display:"flex",justifyContent:"space-between"}}>
          <span>رقم العداد: <strong style={{fontFamily:"monospace"}}>{meterNum}</strong></span>
          <span>فترة: {content?.issue_date?.slice(0,7)||"—"}</span>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#fff3e0",border:"2px dashed #f08010",borderRadius:4,padding:"10px",textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:"#8a4000"}}>إجمالي المبلغ المستحق</div>
            <div style={{fontSize:26,fontWeight:900,color:"#d06000",fontFamily:"monospace"}}>{amount} جنيه</div>
            <div style={{fontSize:10,color:"#888",marginTop:2}}>تم السداد بتاريخ: {content?.issue_date||"—"}</div>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                ["اسم المشترك",content?.printed_name||citizen.full_name],
                ["رقم العداد",String(meterNum)],
                ["العنوان / المحافظة",content?.printed_governorate||citizen.governorate],
                ["تاريخ السداد",content?.issue_date||"—"],
                ["طريقة السداد","نقداً / كاش"],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #ffe0b0"}}>
                  <td style={{padding:"5px 8px",color:"#8a4000",fontWeight:700,width:"38%",background:"#fffaf0"}}>{l}</td>
                  <td style={{padding:"5px 8px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:10,fontSize:10,color:"#aaa",textAlign:"center",borderTop:"1px dashed #ddd",paddingTop:6}}>
            هذا الإيصال دليل على السداد — يُرجى الاحتفاظ به
          </div>
        </div>
      </div>
    </div>
  )
}

// ── وثيقة الزواج ──────────────────────────────────────────────────────────────
function MarriageDoc({citizen,content}){
  const _s6=parseInt(citizen.national_id.slice(-4))
  const docNum=1000+(_s6%9000)
  const isMale=citizen.gender==="M"
  // لو المواطن ذكر هو الزوج، لو أنثى هي الزوجة
  // لو ذكر: هو الزوج، الزوجة من wife_name
  // لو أنثى: هي الزوجة، الزوج من husband_name (مولّد من الرقم القومي)
  const maleNames=["أحمد","محمد","علي","عمر","خالد","كريم","طارق","وليد","سامر","مصطفى"]
  const lastNamesH=["محمد","أحمد","علي","حسن","إبراهيم","سالم","عوض","رزق","فتحي","شعبان"]
  const hSeed=parseInt(citizen.national_id.slice(-4))
  const generatedHusbandName=maleNames[hSeed%maleNames.length]+" "+lastNamesH[Math.floor(hSeed/maleNames.length)%lastNamesH.length]
  const husbandName = isMale ? (content?.printed_name||citizen.full_name) : generatedHusbandName
  const wifeName    = !isMale ? (content?.printed_name||citizen.full_name) : (citizen.wife_name||"—")
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        <div style={{background:"linear-gradient(180deg,#7a1010,#aa3030)",padding:"10px 16px"}}>
          <div style={{textAlign:"center"}}>
            <div style={{color:"#f0c0b0",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية — وزارة العدل</div>
            <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>وثيقة الزواج</div>
            <div style={{color:"#f0c0b0",fontSize:9}}>Marriage Certificate</div>
          </div>
        </div>
        <div style={{background:"#fdf0f0",padding:"4px 14px",borderBottom:"2px solid #aa3030",fontSize:11,color:"#7a1010",display:"flex",justifyContent:"space-between"}}>
          <span>رقم الوثيقة: <strong style={{fontFamily:"monospace"}}>{docNum}</strong></span>
          <span>مأذونية: {citizen.governorate}</span>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#fdf0f0",border:"1px solid #cc8080",borderRadius:4,padding:"8px 12px",textAlign:"center",marginBottom:12,fontSize:12,color:"#5a1010"}}>
            تُشهد هذه الوثيقة بأن عقد الزواج الشرعي قد أُبرم وفقاً لأحكام الشريعة الإسلامية والقانون المصري
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                ["اسم الزوج", husbandName],
                ["اسم الزوجة", wifeName],
                ["تاريخ عقد الزواج", content?.issue_date||"—"],
                ["محل الإبرام", content?.printed_governorate||citizen.governorate],
                ["رقم وثيقة الزواج", String(docNum)],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #eec0c0"}}>
                  <td style={{padding:"6px 10px",color:"#7a1010",fontWeight:700,width:"38%",background:"#fff5f5"}}>{l}</td>
                  <td style={{padding:"6px 10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع المأذون</div>
              <div style={{width:90,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:65,height:65,borderRadius:"50%",border:"3px solid #aa3030",display:"flex",alignItems:"center",justifyContent:"center",opacity:.6}}>
              <div style={{fontSize:6,color:"#7a1010",textAlign:"center",lineHeight:1.3}}>وزارة<br/>العدل<br/>مصر</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── عقد إيجار ─────────────────────────────────────────────────────────────────
function RentalContractDoc({citizen,content}){
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #aaa",borderRadius:4,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        <div style={{background:"linear-gradient(180deg,#3a3a6a,#5a5a9a)",padding:"10px 16px"}}>
          <div style={{textAlign:"center"}}>
            <div style={{color:"#c0c0e8",fontSize:10,letterSpacing:2}}>عقد إيجار رسمي موثق</div>
            <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>عقد إيجار / وثيقة ملكية</div>
          </div>
        </div>
        <div style={{padding:"14px 18px"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              {[
                ["اسم المستأجر / المالك",content?.printed_name||citizen.full_name],
                ["العنوان",content?.printed_governorate||citizen.governorate],
                ["تاريخ التعاقد",content?.issue_date||"—"],
                ["مدة العقد","سنة قابلة للتجديد"],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #ddd"}}>
                  <td style={{padding:"6px 10px",color:"#3a3a6a",fontWeight:700,width:"38%",background:"#f5f5ff"}}>{l}</td>
                  <td style={{padding:"6px 10px"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── البطاقة القديمة (نفس شكل الجديدة بس بتصميم مختلف قليلاً) ──────────────────
function OldIDCard({citizen,content}){
  const [flipped,setFlipped]=useState(false)
  const expired=citizen.expires_at<"2024-06-01"
  const isMale2=citizen.gender==="M"
  const maritalOptions=isMale2?["أعزب","متزوج","مطلق","أرمل"]:["عزباء","متزوجة","مطلقة","أرملة"]
  const seed=citizen.national_id
  const marital=maritalOptions[parseInt(seed.slice(-1))%4]
  const jobEduPairs2=isMale2?[
    {job:"موظف",edu:"بكالوريوس"},{job:"مهندس",edu:"بكالوريوس"},
    {job:"طبيب",edu:"بكالوريوس"},{job:"محاسب",edu:"بكالوريوس"},
    {job:"معلم",edu:"بكالوريوس"},{job:"محامي",edu:"بكالوريوس"},
    {job:"تاجر",edu:"ثانوية عامة"},{job:"فني",edu:"دبلوم"},
    {job:"سائق",edu:"ثانوية عامة"},{job:"بدون عمل",edu:"بدون مؤهل"},
    {job:"عامل",edu:"ابتدائي"},{job:"ميكانيكي",edu:"دبلوم"},
  ]:[
    {job:"موظفة",edu:"بكالوريوس"},{job:"مهندسة",edu:"بكالوريوس"},
    {job:"طبيبة",edu:"بكالوريوس"},{job:"محاسبة",edu:"بكالوريوس"},
    {job:"معلمة",edu:"بكالوريوس"},{job:"محامية",edu:"بكالوريوس"},
    {job:"ربة منزل",edu:"ثانوية عامة"},{job:"فنية",edu:"دبلوم"},
    {job:"ممرضة",edu:"دبلوم"},{job:"بدون عمل",edu:"بدون مؤهل"},
    {job:"صيدلانية",edu:"بكالوريوس"},{job:"مديرة",edu:"ماجستير"},
  ]
  const pairIdx2=parseInt(seed.slice(-2))%jobEduPairs2.length
  const {job,edu}=jobEduPairs2[pairIdx2]
  const religion2=parseInt(seed.slice(-4))%10<8?"مسلم":"مسيحي"

  const CardFront=()=>(
    <div style={{background:"linear-gradient(140deg,#2d4a1e,#4a7a2a,#1e3a12)",borderRadius:10,overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,.5)",border:"2px solid #5a8a3a"}}>
      <div style={{background:"rgba(0,0,0,.35)",padding:"7px 14px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:"#f0e040",fontSize:11,letterSpacing:3,fontWeight:"bold"}}>جمهورية مصر العربية</div>
        <div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>بطاقة تحقيق الشخصية</div>
        <div style={{color:"#a8d88a",fontSize:9}}>Arab Republic of Egypt — National ID Card</div>
      </div>
      <div style={{display:"flex",gap:12,padding:14}}>
        <div style={{flexShrink:0,width:80,height:100,borderRadius:4,overflow:"hidden",border:"2px solid #7ab85a",background:"#2a4a1a"}}>
          <img src={avatar(citizen.id_photo_seed,citizen.gender)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
        </div>
        <div style={{flex:1}}>
          {[["الاسم",content?.printed_name||citizen.full_name,false],["الرقم القومي",citizen.national_id,true],["تاريخ الميلاد",citizen.birth_date,false],["محل الميلاد",citizen.governorate,false],].map(([lbl,val,mono])=>(
            <div key={lbl} style={{marginBottom:5}}>
              <div style={{color:"#a8d88a",fontSize:9}}>{lbl}</div>
              <div style={{color:"#fff",fontSize:mono?11:12,fontFamily:mono?"monospace":"inherit",fontWeight:600}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"rgba(0,0,0,.3)",padding:"6px 14px",display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:expired?"#ff6b6b":"#a8d88a",fontSize:11}}>صالحة حتى: <strong style={{color:expired?"#ff4444":"#c8f0a0"}}>{citizen.expires_at}{expired?" ⚠️ منتهية!":""}</strong></div>
        <div style={{color:"#f0e040",fontSize:22}}>𓅃</div>
      </div>
    </div>
  )

  const CardBack=()=>(
    <div style={{background:"linear-gradient(140deg,#2d4a1e,#4a7a2a,#1e3a12)",borderRadius:10,overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,.5)",border:"2px solid #5a8a3a"}}>
      <div style={{background:"rgba(0,0,0,.35)",padding:"7px 14px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{color:"#f0e040",fontSize:11,letterSpacing:3,fontWeight:"bold"}}>جمهورية مصر العربية</div>
        <div style={{color:"#fff",fontSize:13,fontWeight:"bold"}}>بيانات إضافية — ظهر البطاقة</div>
      </div>
      <div style={{padding:14}}>
        {[
          ["الحالة الاجتماعية",marital],
          ["المهنة",job],
          ["المؤهل الدراسي",edu],
          ["الديانة",religion2],
          ["الجنس",citizen.gender==="M"?"ذكر":"أنثى"],
          ["المحافظة",citizen.governorate],
        ].map(([lbl,val])=>(
          <div key={lbl} style={{marginBottom:7,borderBottom:"1px solid rgba(255,255,255,.1)",paddingBottom:5}}>
            <div style={{color:"#a8d88a",fontSize:9}}>{lbl}</div>
            <div style={{color:"#fff",fontSize:13,fontWeight:600}}>{val}</div>
          </div>
        ))}
        <div style={{background:"#111",height:28,borderRadius:3,marginTop:10,display:"flex",alignItems:"center",padding:"0 8px"}}>
          <div style={{color:"#555",fontSize:9,fontFamily:"monospace",letterSpacing:1}}>{citizen.national_id}</div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:400,margin:"0 auto",userSelect:"none"}}>
      <div style={{textAlign:"center",marginBottom:8}}>
        <button onClick={()=>setFlipped(f=>!f)} style={{padding:"5px 16px",background:"#2a5a10",color:"#fff",border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
          {flipped?"↩️ الوجه الأمامي":"↪️ اقلب للخلف"}
        </button>
      </div>
      <div style={{perspective:1000}}>
        <motion.div
          animate={{rotateY:flipped?180:0}}
          transition={{duration:0.55,type:"spring",damping:22,stiffness:180}}
          style={{transformStyle:"preserve-3d",position:"relative",minHeight:210}}
        >
          <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"}}><CardFront/></div>
          <div style={{backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",transform:"rotateY(180deg)",position:"absolute",top:0,left:0,right:0}}><CardBack/></div>
        </motion.div>
      </div>
    </div>
  )
}

// ── صورتان شخصيتان ───────────────────────────────────────────────────────────
function PersonalPhotosDoc({citizen}){
  const photoUrl = avatar(citizen.id_photo_seed, citizen.gender)
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"1px solid #ddd",borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>
        <div style={{background:"linear-gradient(90deg,#2a2a6a,#4a4a9a)",padding:"10px 16px",textAlign:"center"}}>
          <div style={{color:"#c0c0f0",fontSize:10,letterSpacing:2}}>صور شخصية للتقديم</div>
          <div style={{color:"#fff",fontSize:14,fontWeight:900,marginTop:4}}>صورتان شخصيتان</div>
          <div style={{color:"#c0c0f0",fontSize:9}}>Personal Photos — 4×6 cm</div>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:16,alignItems:"center"}}>
          {/* الصورتان جنب بعض */}
          <div style={{display:"flex",gap:20,justifyContent:"center"}}>
            {[1,2].map(n=>(
              <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{width:100,height:120,border:"2px solid #555",overflow:"hidden",background:"#f5f5f5",position:"relative"}}>
                  <img src={photoUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={`صورة ${n}`}/>
                  {/* خلفية بيضاء زي صورة جواز السفر */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"15%",background:"rgba(245,245,245,.8)"}}/>
                </div>
                <div style={{fontSize:10,color:"#888"}}>صورة {n}</div>
              </div>
            ))}
          </div>
          {/* بيانات */}
          <div style={{width:"100%",borderTop:"1px dashed #ddd",paddingTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
              <span style={{color:"#666"}}>الاسم:</span>
              <span style={{fontWeight:700}}>{citizen.full_name}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
              <span style={{color:"#666"}}>الرقم القومي:</span>
              <span style={{fontWeight:700,fontFamily:"monospace"}}>{citizen.national_id}</span>
            </div>
          </div>
          <div style={{fontSize:10,color:"#aaa",textAlign:"center"}}>
            صور ملونة حديثة — خلفية بيضاء — بدون نظارة
          </div>
        </div>
      </div>
    </div>
  )
}

// ── بطاقة الوكيل ─────────────────────────────────────────────────────────────
function ProxyIDCard({proxyData}){
  if(!proxyData) return null
  const expired = false
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:400,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(140deg,#1a3a1a,#2a6a2a,#0a2a0a)",borderRadius:10,overflow:"hidden",boxShadow:"0 6px 24px rgba(0,0,0,.5)",border:"2px solid #4a9a4a"}}>
        <div style={{background:"rgba(0,0,0,.35)",padding:"7px 14px",textAlign:"center",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{color:"#f0e040",fontSize:11,letterSpacing:3,fontWeight:"bold"}}>جمهورية مصر العربية</div>
          <div style={{color:"#fff",fontSize:14,fontWeight:"bold"}}>بطاقة تحقيق الشخصية — الوكيل</div>
          <div style={{color:"#a8e8a8",fontSize:9}}>Representative ID Card</div>
        </div>
        <div style={{display:"flex",gap:12,padding:14}}>
          <div style={{flexShrink:0,width:80,height:100,borderRadius:4,overflow:"hidden",border:"2px solid #4a9a4a",background:"#1a3a1a"}}>
            <img src={avatar(proxyData.id_photo_seed,proxyData.gender)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
          </div>
          <div style={{flex:1}}>
            {[
              ["الاسم",proxyData.name,false],
              ["الرقم القومي",proxyData.national_id,true],
              ["تاريخ الميلاد",proxyData.birth_date,false],
              ["محل الميلاد",proxyData.governorate,false],
            ].map(([lbl,val,mono])=>(
              <div key={lbl} style={{marginBottom:5}}>
                <div style={{color:"#a8e8a8",fontSize:9}}>{lbl}</div>
                <div style={{color:"#fff",fontSize:mono?11:12,fontFamily:mono?"monospace":"inherit",fontWeight:600}}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"rgba(0,0,0,.3)",padding:"6px 14px",display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.1)"}}>
          <div style={{color:"#a8e8a8",fontSize:11}}>هوية الوكيل المخوّل</div>
          <div style={{color:"#f0e040",fontSize:22}}>𓅃</div>
        </div>
      </div>
    </div>
  )
}

// ── وثيقة الوكالة ─────────────────────────────────────────────────────────────
function POADoc({citizen,proxyData}){
  if(!proxyData) return null
  const _sp=parseInt(citizen.national_id.slice(-4))
  const notaryNum=`${10000+(_sp%90000)}/${new Date().getFullYear()}`
  return (
    <div style={{direction:"rtl",fontFamily:"Arial,sans-serif",maxWidth:500,margin:"0 auto",color:"#111"}}>
      <div style={{background:"#fff",border:"2px solid #1a5a2a",borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
        {/* هيدر */}
        <div style={{background:"linear-gradient(180deg,#1a5a2a,#2a8a3e)",padding:"10px 16px",textAlign:"center"}}>
          <div style={{color:"#a8e8b0",fontSize:10,letterSpacing:2}}>جمهورية مصر العربية — وزارة العدل</div>
          <div style={{color:"#fff",fontSize:15,fontWeight:900,marginTop:4}}>توكيل رسمي</div>
          <div style={{color:"#a8e8b0",fontSize:9}}>Power of Attorney</div>
        </div>
        <div style={{background:"#f0faf0",padding:"4px 14px",borderBottom:"2px solid #2a8a3e",fontSize:11,color:"#1a5a2a",display:"flex",justifyContent:"space-between"}}>
          <span>رقم التوثيق: <strong style={{fontFamily:"monospace"}}>{notaryNum}</strong></span>
          <span>مكتب الشهر العقاري — {citizen.governorate}</span>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{background:"#e8f8e8",border:"1px solid #4a8a4a",borderRadius:4,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#1a4a1a",lineHeight:1.8}}>
            أنا الموقّع أدناه <strong>{citizen.full_name}</strong> أُوكِّل بموجب هذا التوكيل الرسمي الموثَّق السيد/ة <strong>{proxyData.name}</strong> لاستيفاء كافة الإجراءات المتعلقة بمعاملاتي لدى مصلحة الأحوال المدنية.
          </div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <tbody>
              <tr style={{background:"#f0f8f0"}}><td colSpan={2} style={{padding:"5px 10px",color:"#1a5a2a",fontWeight:900,fontSize:12}}>بيانات الموكِّل (صاحب المعاملة)</td></tr>
              {[
                ["الاسم", citizen.full_name],
                ["الرقم القومي", citizen.national_id],
                ["المحافظة", citizen.governorate],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #c8e8c8"}}>
                  <td style={{padding:"5px 10px",color:"#2a5a2a",fontWeight:700,width:"35%",background:"#f8fff8"}}>{l}</td>
                  <td style={{padding:"5px 10px"}}>{v}</td>
                </tr>
              ))}
              <tr style={{background:"#f0f8f0"}}><td colSpan={2} style={{padding:"5px 10px",color:"#1a5a2a",fontWeight:900,fontSize:12,borderTop:"2px solid #2a8a3e"}}>بيانات الوكيل (الشخص الحاضر)</td></tr>
              {[
                ["الاسم", proxyData.name],
                ["الرقم القومي", proxyData.national_id],
                ["المحافظة", proxyData.governorate],
                ["رقم الوكالة", proxyData.poa_number],
              ].map(([l,v])=>(
                <tr key={l} style={{borderBottom:"1px solid #c8e8c8"}}>
                  <td style={{padding:"5px 10px",color:"#2a5a2a",fontWeight:700,width:"35%",background:"#f8fff8"}}>{l}</td>
                  <td style={{padding:"5px 10px",fontFamily:l==="رقم الوكالة"?"monospace":"inherit"}}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:14}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع الموكِّل</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
            <div style={{width:70,height:70,borderRadius:"50%",border:"3px solid #2a8a3e",display:"flex",alignItems:"center",justifyContent:"center",opacity:.7}}>
              <div style={{fontSize:6,color:"#1a5a2a",textAlign:"center",lineHeight:1.3}}>وزارة<br/>العدل<br/>مصر</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:10,color:"#555",marginBottom:4}}>توقيع الموثِّق</div>
              <div style={{width:100,borderBottom:"1px solid #333",height:18}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── DocRenderer المحدّث ────────────────────────────────────────────────────────
function DocRenderer({docName,citizen,content}){
  if(docName==="id_card")          return <NationalIDCard citizen={citizen}/>
  if(docName==="البطاقة القديمة")  return <OldIDCard citizen={citizen} content={content}/>
  if(docName==="request_form")     return <RequestFormDoc citizen={citizen}/>
  if(docName==="صورتان شخصيتان")  return <PersonalPhotosDoc citizen={citizen}/>
  if(docName==="بطاقة الوكيل")    return <ProxyIDCard proxyData={citizen.proxy_data}/>
  if(docName==="وثيقة الوكالة")   return <POADoc citizen={citizen} proxyData={citizen.proxy_data}/>
  if(docName==="شهادة ميلاد"||docName==="شهادات ميلاد الأبناء") return <BirthCertificateDoc citizen={citizen} content={content}/>
  if(docName==="شهادة تجنيد") return <MilitaryCertDoc citizen={citizen} content={content}/>
  if(docName==="قيد عائلي"||docName==="بطاقة رب الأسرة") return <FamilyRegisterDoc citizen={citizen} content={content}/>
  if(docName==="وثيقة الزواج") return <MarriageDoc citizen={citizen} content={content}/>
  if(docName==="فيش وتشبيه")  return <FayshDoc citizen={citizen} content={content}/>
  if(docName==="محضر شرطة بالفقد") return <PoliceReportDoc citizen={citizen} content={content}/>
  if(docName==="إيصال مرافق") return <UtilityBillDoc citizen={citizen} content={content}/>
  if(docName==="عقد إيجار أو ملكية") return <RentalContractDoc citizen={citizen} content={content}/>
  return (
    <div style={{padding:16,background:"#fff",borderRadius:8,border:"1px solid #ddd",direction:"rtl",color:"#111"}}>
      <div style={{fontWeight:700,marginBottom:8,fontSize:14}}>{docName}</div>
      {content&&Object.entries(content).map(([k,v])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px dotted #eee",fontSize:13}}>
          <span style={{color:"#555"}}>{k==="printed_name"?"الاسم":k==="printed_governorate"?"المحافظة":"تاريخ الإصدار"}</span>
          <span style={{fontWeight:600}}>{String(v)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Decode Panel ─────────────────────────────────────────────────────────────
function DecodePanel({nid}){
  const [open,setOpen]=useState(false)
  if(!nid) return null
  const segs=[{cls:"#6b5e4a",label:"القرن",val:nid.slice(0,1)},{cls:"#1a3a6b",label:"سنة",val:nid.slice(1,3)},{cls:"#1a5c2a",label:"شهر",val:nid.slice(3,5)},{cls:"#c45c00",label:"يوم",val:nid.slice(5,7)},{cls:"#8b1a1a",label:"محافظة",val:nid.slice(7,9)},{cls:"#555",label:"تسلسل",val:nid.slice(9,13)},{cls:"#6a4c93",label:"النوع",val:nid.slice(13,14)},{cls:"#333",label:"تحقق",val:nid.slice(14,15)}]
  const century=nid[0]==="3"?2000:1900
  const birthFromId=`${century+parseInt(nid.slice(1,3))}-${nid.slice(3,5)}-${nid.slice(5,7)}`
  const govCode=nid.slice(7,9),govMatch=GOVERNORATES.find(g=>g.code===govCode),gd=parseInt(nid[13])
  return (
    <div style={{marginTop:8}}>
      <motion.button whileHover={{scale:1.01,y:-1}} onClick={()=>setOpen(o=>!o)} style={{width:"100%",padding:"8px 14px",fontSize:12,background:open?"rgba(10,30,80,.8)":"rgba(10,30,70,.5)",border:`1px ${open?"solid":"dashed"} rgba(100,150,255,.5)`,borderRadius:8,cursor:"pointer",color:"#aac8ff",fontWeight:700,fontFamily:"inherit",direction:"rtl",boxShadow:"0 2px 8px rgba(0,0,0,.4)",backdropFilter:"blur(4px)"}}>
        {open?"▲ إغلاق":"🔎 فك شفرة الرقم القومي — اضغط للتحقق"}
      </motion.button>
      <AnimatePresence>
        {open&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} style={{overflow:"hidden"}}>
          <div style={{marginTop:8,direction:"ltr",display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
            {segs.map(s=><div key={s.label} title={s.label} style={{background:s.cls,color:"#fff",padding:"5px 8px",borderRadius:4,fontFamily:"monospace",fontWeight:700,fontSize:14,minWidth:28,textAlign:"center"}}>{s.val}</div>)}
          </div>
          <div style={{marginTop:8,padding:10,background:"#f5f0e8",borderRadius:4,fontSize:12,direction:"rtl"}}>
            <div>📅 تاريخ الميلاد: <strong>{birthFromId}</strong></div>
            <div>📍 المحافظة كود {govCode}: <strong>{govMatch?govMatch.name:"⚠️ غير معروف"}</strong></div>
            <div>⚧ النوع: <strong>{gd%2===1?"ذكر":"أنثى"}</strong></div>
          </div>
        </motion.div>}
      </AnimatePresence>
    </div>
  )
}

// ─── Stamp ────────────────────────────────────────────────────────────────────
function StampSVG({type}){
  const approve=type==="APPROVE",c=approve?"#1a5c2a":"#8b1a1a",text=approve?"موافق عليه":"مرفوض"
  const today=new Date().toLocaleDateString("ar-EG-u-nu-latn")
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill={c} fillOpacity=".13"/>
      <circle cx="100" cy="100" r="96" fill="none" stroke={c} strokeWidth="5" strokeOpacity=".9"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke={c} strokeWidth="2" strokeOpacity=".6" strokeDasharray="6 3"/>
      <text x="100" y="58" textAnchor="middle" fontSize="20" fill={c} fillOpacity=".8">{approve?"✦":"✕"}</text>
      <text x="100" y="100" textAnchor="middle" fontSize="22" fontWeight="bold" fill={c} fontFamily="Arial,sans-serif">{text}</text>
      <text x="100" y="122" textAnchor="middle" fontSize="13" fill={c} fillOpacity=".7" fontFamily="Arial,sans-serif">{approve?"APPROVED":"REJECTED"}</text>
      <path id="arc-b" d="M 14,100 A 86,86 0 0,0 186,100" fill="none"/>
      <text fontSize="11" fill={c} fillOpacity=".8" fontFamily="monospace"><textPath href="#arc-b" startOffset="18%">{today} — السجل المدني</textPath></text>
    </svg>
  )
}
function StampOverlay({type,onDone}){
  return (
    <motion.div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <motion.div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.1)"}} initial={{opacity:0}} animate={{opacity:1}}/>
      <motion.div initial={{y:-200,rotate:-18,scale:1.3,opacity:0}} animate={{y:0,rotate:-6,scale:1,opacity:1}} transition={{type:"spring",damping:10,stiffness:350,mass:.5}} onAnimationComplete={()=>setTimeout(onDone,400)}>
        <StampSVG type={type}/>
      </motion.div>
    </motion.div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({messages,onSend,onAlert,myRole,C}){
  const [msg,setMsg]=useState("")
  const endRef=useRef(null)
  const roleData=ROLES.find(r=>r.id===myRole)
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[messages])
  const QUICK_ALERTS=[
    {type:"forge",  label:"🔍 تزوير!"},
    {type:"wanted", label:"🚨 مطلوب!"},
    {type:"missing",label:"📋 ناقص!"},
    {type:"bribe",  label:"💰 رشوة!"},
    {type:"ok",     label:"✅ تمام"},
  ]
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:C.paper}}>
      {/* Quick alerts */}
      <div style={{padding:"6px 8px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:4,flexWrap:"wrap"}}>
        {QUICK_ALERTS.map(a=>(
          <button key={a.type} onClick={()=>onAlert(a.type)} style={{padding:"4px 8px",fontSize:11,border:`1px solid ${C.border}`,borderRadius:20,cursor:"pointer",fontFamily:"inherit",background:C.paper2,fontWeight:700}}>{a.label}</button>
        ))}
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:8,display:"flex",flexDirection:"column",gap:6}}>
        {messages.map((m,i)=>(
          <div key={i} style={{fontSize:12,direction:"rtl"}}>
            <span style={{fontWeight:700,color:"#1a3a6b"}}>{m.roleIcon} {m.playerName}: </span>
            <span style={{color:m.isAlert?"#8b1a1a":"#111",fontWeight:m.isAlert?700:400}}>{m.message}</span>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      {/* Input */}
      <div style={{padding:8,borderTop:`1px solid ${C.border}`,display:"flex",gap:6}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&msg.trim()){onSend(msg);setMsg("")}}}
          placeholder="اكتب رسالة..." style={{flex:1,padding:"6px 10px",border:`1px solid ${C.border}`,borderRadius:20,fontSize:12,fontFamily:"inherit",direction:"rtl"}}/>
        <button onClick={()=>{if(msg.trim()){onSend(msg);setMsg("")}}} style={{padding:"6px 12px",background:"#1a3a6b",color:"#fff",border:"none",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:700}}>إرسال</button>
      </div>
    </div>
  )
}

// ─── Leaderboard Screen ───────────────────────────────────────────────────────
function LeaderboardScreen({data,onClose,C}){
  if(!data) return null
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(8px)",zIndex:950,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto"}}>
      <motion.div initial={{scale:.88,y:20,opacity:0}} animate={{scale:1,y:0,opacity:1}} transition={{type:"spring",damping:20}}
        style={{
          background:"linear-gradient(160deg,rgba(15,10,2,.97),rgba(25,18,4,.97))",
          border:"1.5px solid rgba(184,134,11,.3)",
          borderRadius:16,overflow:"hidden",width:"100%",maxWidth:500,maxHeight:"90vh",
          display:"flex",flexDirection:"column",
          boxShadow:"0 24px 64px rgba(0,0,0,.7),0 0 40px rgba(184,134,11,.08)",
        }}>
        <div style={{
          background:"linear-gradient(180deg,rgba(30,20,4,.95),rgba(20,13,3,.9))",
          borderBottom:"1px solid rgba(184,134,11,.25)",
          padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <span style={{fontWeight:800,fontSize:16,color:"#f0c040",letterSpacing:1}}>🏆 الترتيب الكلي — {data.roomCode}</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",color:"#f5f0e8",fontSize:14,cursor:"pointer",borderRadius:20,padding:"3px 10px",fontFamily:"inherit"}}>✕</button>
        </div>
        <div style={{padding:"6px 16px",background:"rgba(184,134,11,.08)",fontSize:11,color:"#888",borderBottom:"1px solid rgba(184,134,11,.15)",display:"flex",gap:16}}>
          <span>📅 يوم {data.currentDay}</span>
          <span>🕐 آخر لعب: {data.lastPlayed}</span>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
          {(data.players||[]).map((p,i)=>(
            <motion.div key={p.id} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*.08}}
              style={{
                background:i===0?"linear-gradient(135deg,rgba(40,30,5,.9),rgba(60,45,8,.9))":"rgba(255,255,255,.04)",
                border:`1.5px solid ${i===0?"rgba(184,134,11,.4)":"rgba(255,255,255,.07)"}`,
                borderRadius:10,padding:12,
                boxShadow:i===0?"0 4px 16px rgba(184,134,11,.1)":"none",
              }}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontSize:22}}>{"🥇🥈🥉"[i]||`${i+1}.`}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700}}>{p.name}</div>
                  <div style={{fontSize:11,color:C.muted}}>{p.daysPlayed} يوم | معدل: {p.avgScore} نقطة/يوم</div>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontWeight:900,fontSize:20,color:'#f0c040',fontFamily:"monospace"}}>{p.totalScore}</div>
                  <div style={{fontSize:10,color:'#888'}}>أعلى يوم: {p.bestDayScore}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {[[`✅ ${p.stats?.correct||0}`,"#1a5c2a"],[`❌ ${p.stats?.wrong||0}`,"#8b1a1a"],[`🚨 ${p.stats?.wantedCaught||0}`,"#c45c00"],[`🔍 ${p.stats?.forgeCaught||0}`,"#1a3a6b"],[`🧱 ${p.stats?.bribesRefused||0}`,"#555"]].map(([label,color])=>(
                  <span key={label} style={{background:`${color}15`,color,border:`1px solid ${color}30`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>{label}</span>
                ))}
              </div>
              {p.history&&p.history.length>0&&(
                <div style={{marginTop:8,display:"flex",gap:3,alignItems:"flex-end",height:30}}>
                  {p.history.slice(-10).map((h,j)=>(
                    <div key={j} title={`يوم ${h.day}: ${h.score}`} style={{flex:1,background:h.score>0?"#1a5c2a":"#8b1a1a",borderRadius:2,minHeight:4,height:`${Math.max(10,Math.min(100,(h.score/50)*100))}%`,opacity:.7}}/>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div style={{padding:12,borderTop:"1px solid rgba(184,134,11,.2)"}}>
          <motion.button whileHover={{scale:1.01}} whileTap={{scale:.97}} onClick={onClose}
            style={{width:"100%",padding:11,fontWeight:700,fontSize:13,border:"1px solid rgba(255,255,255,.1)",borderRadius:10,cursor:"pointer",
              background:"rgba(255,255,255,.06)",color:"#888",fontFamily:"inherit",backdropFilter:"blur(4px)"}}>إغلاق</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Tutorial Modal ──────────────────────────────────────────────────────────
function TutorialModal({onClose,C}){
  const [step,setStep]=useState(0)
  const steps=[
    {icon:"🏛️",title:"أهلاً في السجل المدني",text:"إنت موظف بتفحص أوراق المواطنين. مهمتك تكشف التزوير وتحمي الناس الصح."},
    {icon:"🪪",title:"افتح الأوراق وافحصها",text:"افتح البطاقة وافحص الرقم القومي — تاريخ الميلاد صح؟ كود المحافظة صح؟ الصورة نفس الشخص؟"},
    {icon:"🔎",title:"فك شفرة الرقم القومي",text:"دوس على 'فك شفرة الرقم القومي' عشان تتحقق من كل خانة — القرن، السنة، الشهر، اليوم، المحافظة، الجنس."},
    {icon:"✅❌",title:"قرر بعد ما تفحص",text:"قبول لو كل حاجة تمام. رفض لو في تزوير أو أوراق ناقصة — وهتحدد السبب بالظبط. إبلاغ لو شايف اسمه في قائمة المطلوبين."},
    {icon:"⚠️",title:"انتبه من...",text:"مواطن بيعرض رشوة — ارفضها. مواطن بالوكالة — تحقق من بطاقة الوكيل ووثيقة الوكالة. مواطن بيزعق — سرّع بس متتعجلش."},
  ]
  const current=steps[step]
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)"}}>
      <motion.div initial={{scale:.85,y:30}} animate={{scale:1,y:0}} exit={{scale:.85,y:30}} transition={{type:"spring",damping:20}}
        style={{background:"linear-gradient(135deg,rgba(15,10,2,.97),rgba(25,18,4,.97))",border:"1.5px solid rgba(184,134,11,.3)",borderRadius:20,padding:28,maxWidth:380,width:"100%",
          boxShadow:"0 24px 64px rgba(0,0,0,.7),0 0 40px rgba(184,134,11,.08)"}}>
        {/* Progress dots */}
        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:20}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?20:7,height:7,borderRadius:10,background:i===step?"#b8860b":i<step?"rgba(184,134,11,.4)":"rgba(255,255,255,.1)",transition:"all .3s"}}/>
          ))}
        </div>
        {/* Content */}
        <motion.div key={step} initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:52,marginBottom:12}}>{current.icon}</div>
          <div style={{fontSize:18,fontWeight:900,color:"#f0c040",marginBottom:12}}>{current.title}</div>
          <div style={{fontSize:14,color:"#c8b890",lineHeight:1.7}}>{current.text}</div>
        </motion.div>
        {/* Buttons */}
        <div style={{display:"flex",gap:10}}>
          {step>0&&(
            <motion.button whileTap={{scale:.97}} onClick={()=>setStep(s=>s-1)}
              style={{flex:1,padding:10,fontWeight:700,fontSize:13,border:"1px solid rgba(255,255,255,.1)",borderRadius:10,cursor:"pointer",fontFamily:"inherit",background:"rgba(255,255,255,.06)",color:"#888"}}>
              ◀ السابق
            </motion.button>
          )}
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}}
            onClick={()=>step<steps.length-1?setStep(s=>s+1):onClose()}
            style={{flex:2,padding:10,fontWeight:800,fontSize:14,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
              background:step===steps.length-1?"linear-gradient(135deg,#8b1a1a,#cc3030)":"linear-gradient(135deg,#6a5010,#b8860b)",
              color:"#fff",boxShadow:"0 4px 12px rgba(0,0,0,.3)",
            }}>
            {step===steps.length-1?"ابدأ الوردية 🏛️":"التالي ▶"}
          </motion.button>
        </div>
        <div style={{textAlign:"center",marginTop:10}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#555",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>تخطي</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Queue & Wanted Panel (Popup) ────────────────────────────────────────────
function QueueWantedPanel({gs,myRole,isSolo,C,canSeeWanted}){
  const [showQueue,setShowQueue]  = useState(false)
  const [showWanted,setShowWanted]= useState(false)

  return (
    <>
      {/* أزرار فتح الـ popup — تختفي لما يكون فيه popup مفتوح */}
      <AnimatePresence>
        {!showQueue&&!showWanted&&(
          <motion.div
            initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
            style={{position:"absolute",top:"50%",right:0,transform:"translateY(-50%)",zIndex:50,display:"flex",flexDirection:"column",gap:6}}
          >
            <motion.button
              whileHover={{x:-4}} whileTap={{scale:.95}}
              onClick={()=>{setShowQueue(true);setShowWanted(false)}}
              style={{background:"rgba(26,18,9,.9)",border:"1px solid rgba(184,134,11,.35)",borderRight:"none",borderRadius:"8px 0 0 8px",padding:"10px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,boxShadow:"-2px 0 8px rgba(0,0,0,.5)",backdropFilter:"blur(6px)"}}>
              <span style={{fontSize:14}}>🏛️</span>
              <span style={{fontSize:9,color:"#b8860b",fontWeight:700,writingMode:"vertical-rl",letterSpacing:1}}>الطابور</span>
              <span style={{fontSize:10,color:"#b8860b",fontWeight:900,background:"rgba(0,0,0,.4)",borderRadius:10,padding:"1px 4px",minWidth:16,textAlign:"center"}}>
                {Math.max(0,(gs.totalCitizens||0)-(gs.currentCitizenIndex||0))}
              </span>
            </motion.button>
            {canSeeWanted&&(
              <motion.button
                whileHover={{x:-4}} whileTap={{scale:.95}}
                onClick={()=>{setShowWanted(true);setShowQueue(false)}}
                style={{background:"rgba(26,18,9,.9)",border:"1px solid rgba(139,26,26,.35)",borderRight:"none",borderRadius:"8px 0 0 8px",padding:"10px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,boxShadow:"-2px 0 8px rgba(0,0,0,.5)",backdropFilter:"blur(6px)"}}>
                <span style={{fontSize:14}}>🚨</span>
                <span style={{fontSize:9,color:"#cc4444",fontWeight:700,writingMode:"vertical-rl",letterSpacing:1}}>مطلوبون</span>
              </motion.button>
            )}
            {myRole&&!isSolo&&(
              <motion.button whileHover={{x:-4}} onClick={()=>{}} title={ROLES.find(r=>r.id===myRole)?.hint}
                style={{background:"rgba(26,18,9,.9)",border:"1px solid rgba(100,100,200,.25)",borderRight:"none",borderRadius:"8px 0 0 8px",padding:"10px 6px",cursor:"help",display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"-2px 0 8px rgba(0,0,0,.5)"}}>
                <span style={{fontSize:14}}>{ROLES.find(r=>r.id===myRole)?.icon}</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup الطابور */}
      <AnimatePresence>
        {showQueue&&(
          <motion.div
            initial={{x:300,opacity:0}} animate={{x:0,opacity:1}} exit={{x:300,opacity:0}}
            transition={{type:"spring",damping:25,stiffness:300}}
            style={{
              position:"absolute",top:0,right:0,bottom:0,width:220,zIndex:40,
              background:"linear-gradient(180deg,#1a0e02,#120a00)",
              borderRight:"none",borderLeft:"2px solid #b8860b",
              boxShadow:"-4px 0 20px rgba(0,0,0,.5)",
              display:"flex",flexDirection:"column",
              overflowY:"auto",
            }}
          >
            <div style={{padding:"10px 12px",borderBottom:"1px solid rgba(184,134,11,.3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#b8860b",fontWeight:700,fontSize:12}}>🏛️ الطابور</span>
              <motion.button whileTap={{scale:.9}} onClick={()=>setShowQueue(false)}
                style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#888",cursor:"pointer",fontSize:12,borderRadius:20,padding:"2px 8px",fontFamily:"inherit"}}>✕</motion.button>
            </div>
            <div style={{padding:8,display:"flex",flexDirection:"column",gap:4,flex:1}}>
              {(gs.citizens||[]).slice(Math.max(0,(gs.currentCitizenIndex||0)-1),(gs.currentCitizenIndex||0)+12).map((cit,i)=>{
                const idx=Math.max(0,(gs.currentCitizenIndex||0)-1)+i
                const isCurr=idx===gs.currentCitizenIndex
                return (
                  <div key={cit.id} style={{
                    background:isCurr?"rgba(184,134,11,.2)":cit._resolved?"rgba(255,255,255,.03)":"rgba(255,255,255,.05)",
                    border:`1px solid ${isCurr?"#b8860b":"rgba(255,255,255,.08)"}`,
                    borderRadius:4,padding:"5px 8px",fontSize:11,
                    display:"flex",alignItems:"center",gap:5,color:"#f5f0e8"
                  }}>
                    <span style={{fontSize:9,color:"#888",minWidth:16}}>{idx+1}</span>
                    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:cit._resolved?"#555":isCurr?"#f0c040":"#f5f0e8"}}>
                      {cit._pending?"...":cit._resolved?"✓ انتهى":cit.full_name||"—"}
                    </span>
                    {isCurr&&<span style={{color:"#f0c040",fontSize:10}}>◀</span>}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup المطلوبين */}
      <AnimatePresence>
        {showWanted&&canSeeWanted&&(
          <motion.div
            initial={{x:300,opacity:0}} animate={{x:0,opacity:1}} exit={{x:300,opacity:0}}
            transition={{type:"spring",damping:25,stiffness:300}}
            style={{
              position:"absolute",top:0,right:0,bottom:0,width:220,zIndex:40,
              background:"linear-gradient(180deg,#1a0000,#0a0000)",
              borderLeft:"2px solid #8b1a1a",
              boxShadow:"-4px 0 20px rgba(0,0,0,.5)",
              display:"flex",flexDirection:"column",
              overflowY:"auto",
            }}
          >
            <div style={{padding:"10px 12px",borderBottom:"1px solid rgba(139,26,26,.3)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#cc4444",fontWeight:700,fontSize:12}}>🚨 قائمة المطلوبين</span>
              <motion.button whileTap={{scale:.9}} onClick={()=>setShowWanted(false)}
                style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"#888",cursor:"pointer",fontSize:12,borderRadius:20,padding:"2px 8px",fontFamily:"inherit"}}>✕</motion.button>
            </div>
            <div style={{padding:8,display:"flex",flexDirection:"column",gap:6,flex:1}}>
              {WANTED_LIST.map((w,i)=>(
                <div key={w.name} style={{padding:"6px 8px",borderBottom:"1px solid rgba(139,26,26,.2)",fontSize:11}}>
                  <div style={{fontWeight:700,color:"#ff9999"}}>{w.name}</div>
                  <div style={{color:"#cc4444",fontSize:10,marginTop:2}}>{w.crime}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Reject Reason Modal ─────────────────────────────────────────────────────
const ALL_REJECT_REASONS = [
  { id:"invalid_national_id_birthdate", label:"الرقم القومي لا يطابق تاريخ الميلاد", icon:"🔢" },
  { id:"wrong_governorate_code",        label:"كود المحافظة في الرقم القومي غلط",    icon:"📍" },
  { id:"name_mismatch_form",            label:"الاسم مختلف في استمارة الطلب",         icon:"✏️" },
  { id:"name_mismatch_doc",             label:"الاسم مختلف في إحدى الأوراق المرفقة", icon:"📄" },
  { id:"expired_id",                    label:"البطاقة منتهية الصلاحية",              icon:"⏰" },
  { id:"photo_mismatch",                label:"الصورة مش نفس الشخص الواقف",           icon:"📷" },
  { id:"wrong_gender_digit",            label:"رقم الجنس في الرقم القومي غلط",        icon:"⚧" },
  { id:"future_birthdate",              label:"تاريخ الميلاد في المستقبل",             icon:"🔮" },
  { id:"missing_docs",                  label:"أوراق مطلوبة ناقصة",                   icon:"📋" },
  { id:"wanted",                        label:"المواطن مطلوب أمنياً",                  icon:"🚨" },
]

function RejectReasonModal({onConfirm,onCancel,selected,setSelected,citizen,C}){
  const toggle=(id)=>{
    // radio — واحد بس
    setSelected(prev=>prev.has(id)?new Set():new Set([id]))
  }

  return (
    <motion.div
      initial={{opacity:0}}
      animate={{opacity:1}}
      exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:850,display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"rgba(26,18,9,.8)"}}
    >
      <motion.div
        initial={{scale:.85,y:40,opacity:0}}
        animate={{scale:1,y:0,opacity:1}}
        exit={{scale:.85,y:40,opacity:0}}
        transition={{type:"spring",damping:22,stiffness:280}}
        style={{background:"linear-gradient(160deg,#1a0a00,#2d1200)",border:"2px solid #b8860b",borderRadius:16,padding:0,maxWidth:480,width:"100%",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.7)"}}
      >
        {/* هيدر */}
        <div style={{background:"linear-gradient(90deg,#8b1a1a,#aa3030)",padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:28}}>❌</span>
          <div>
            <div style={{color:"#fff",fontWeight:900,fontSize:16}}>سبب الرفض</div>
            <div style={{color:"#ffaaaa",fontSize:11,marginTop:2}}>اختار السبب الصح — النقاط بتتحسب على دقتك</div>
          </div>
        </div>

        {/* الأسباب */}
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:8,maxHeight:"60vh",overflowY:"auto"}}>
          {ALL_REJECT_REASONS.map((r,i)=>{
            const isSel=selected.has(r.label)
            return (
              <motion.div
                key={r.id}
                initial={{x:-30,opacity:0}}
                animate={{x:0,opacity:1}}
                transition={{delay:i*0.04}}
                onClick={()=>toggle(r.label)}
                style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"10px 14px",borderRadius:10,cursor:"pointer",
                  background:isSel?"rgba(184,134,11,.25)":"rgba(255,255,255,.05)",
                  border:`1.5px solid ${isSel?"#b8860b":"rgba(255,255,255,.1)"}`,
                  transition:"all .15s"
                }}
              >
                {/* checkbox */}
                <div style={{
                  width:22,height:22,borderRadius:6,flexShrink:0,
                  border:`2px solid ${isSel?"#b8860b":"rgba(255,255,255,.3)"}`,
                  background:isSel?"#b8860b":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all .15s"
                }}>
                  {isSel&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</motion.span>}
                </div>
                <span style={{fontSize:18}}>{r.icon}</span>
                <span style={{color:isSel?"#f0c040":"#f5f0e8",fontSize:13,fontWeight:isSel?700:400,flex:1}}>{r.label}</span>
              </motion.div>
            )
          })}
        </div>

        {/* نظام النقاط */}
        <div style={{padding:"8px 16px",background:"rgba(0,0,0,.3)",fontSize:11,color:"#888",display:"flex",gap:16,justifyContent:"center"}}>
          <span>🎯 سبب صح: <strong style={{color:"#4caf50"}}>+25</strong></span>
          <span>✅ رفض بدون سبب: <strong style={{color:"#8bc34a"}}>+12</strong></span>
          <span>❌ سبب غلط: <strong style={{color:"#ff9800"}}>+5</strong></span>
        </div>

        {/* أزرار */}
        <div style={{padding:"12px 16px",display:"flex",gap:10}}>
          <motion.button
            whileTap={{scale:.97}}
            onClick={onCancel}
            style={{flex:1,padding:"10px",fontWeight:700,fontSize:13,border:"1px solid rgba(255,255,255,.2)",borderRadius:8,cursor:"pointer",fontFamily:"inherit",background:"rgba(255,255,255,.08)",color:"#f5f0e8"}}
          >
            إلغاء
          </motion.button>
          <motion.button
            whileTap={{scale:.97}}
            onClick={()=>selected.size>0&&onConfirm()}
            style={{flex:2,padding:"10px",fontWeight:900,fontSize:14,border:"none",borderRadius:8,cursor:selected.size===0?"not-allowed":"pointer",fontFamily:"inherit",background:selected.size>0?"linear-gradient(135deg,#8b1a1a,#aa3030)":"#333",color:"#fff",opacity:selected.size===0?.5:1}}
          >
            {selected.size===0?"اختار سبب الأول":"تأكيد الرفض — "+[...selected][0]?.slice(0,20)+"..."}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Daily Report ─────────────────────────────────────────────────────────────
function DailyReport({summary,onNextDay,onHome,onShowLB,C}){
  const accuracy=summary.teamAccuracy||0
  const grade=accuracy>=90?"S":accuracy>=75?"A":accuracy>=60?"B":accuracy>=45?"C":"D"
  const gradeColor={"S":"#f0c040","A":"#4caf50","B":"#2196f3","C":"#ff9800","D":"#f44336"}[grade]
  const gradeMsg={"S":"أسطوري! 🏆","A":"ممتاز! 🌟","B":"كويس 👍","C":"مقبول ⚠️","D":"محتاج تدريب 😬"}[grade]

  return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0a0500,#1a0e02,#0a0500)",fontFamily:"Arial,sans-serif",direction:"rtl",overflowY:"auto",padding:20,position:"relative"}}>
      {/* خلفية نجوم */}
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(184,134,11,.08),transparent 60%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,maxWidth:500,margin:"0 auto"}}>
        {/* هيدر */}
        <motion.div initial={{y:-30,opacity:0}} animate={{y:0,opacity:1}} style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:52,marginBottom:8}}>🏛️</div>
          <h2 style={{fontSize:24,margin:"0 0 6px",fontWeight:900,color:"#f5f0e8",letterSpacing:2}}>تقرير اليوم {summary.day}</h2>
          <div style={{color:"#888",fontSize:12}}>
            معالجات: <strong style={{color:"#f0c040"}}>{summary.totalProcessed}/{summary.totalCitizens}</strong>
            {summary.waitingCount>0&&<> | مستنيين: <strong style={{color:"#aac8ff"}}>{summary.waitingCount}</strong></>}
          </div>
        </motion.div>

        {/* Grade Card */}
        <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:.1}}
          style={{
            background:"linear-gradient(135deg,rgba(30,20,5,.9),rgba(50,35,8,.9))",
            border:`2px solid ${gradeColor}40`,borderRadius:16,padding:20,marginBottom:16,
            textAlign:"center",boxShadow:`0 8px 32px rgba(0,0,0,.4), 0 0 40px ${gradeColor}15`,
            backdropFilter:"blur(10px)",
          }}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20}}>
            <div>
              <div style={{fontSize:64,fontWeight:900,color:gradeColor,textShadow:`0 0 20px ${gradeColor}60`,lineHeight:1}}>{grade}</div>
              <div style={{fontSize:12,color:gradeColor,marginTop:4}}>{gradeMsg}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#888",marginBottom:4}}>نقاط الفريق</div>
              <div style={{fontSize:40,fontWeight:900,color:"#f0c040",fontFamily:"monospace"}}>{summary.teamScore}</div>
              <div style={{fontSize:11,color:summary.dayMistakes>4?"#ff6666":"#888",marginTop:4}}>
                أخطاء: {summary.dayMistakes}
              </div>
            </div>
          </div>
          {/* شريط الدقة */}
          <div style={{marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginBottom:4}}>
              <span>دقة الفريق</span><span style={{color:gradeColor}}>{accuracy}%</span>
            </div>
            <div style={{background:"rgba(255,255,255,.08)",borderRadius:20,height:8,overflow:"hidden"}}>
              <motion.div
                initial={{width:0}} animate={{width:`${accuracy}%`}}
                transition={{duration:.8,delay:.3,ease:"easeOut"}}
                style={{height:"100%",background:`linear-gradient(90deg,${gradeColor}80,${gradeColor})`,borderRadius:20}}
              />
            </div>
          </div>
        </motion.div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {(summary.players||[]).map((p,i)=>(
          <motion.div key={p.id} initial={{x:-40,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:.2+i*.1}}
            style={{
              background:i===0?"linear-gradient(135deg,rgba(40,30,5,.9),rgba(60,45,8,.9))":"linear-gradient(135deg,rgba(20,15,3,.85),rgba(30,22,5,.85))",
              border:`1.5px solid ${i===0?"rgba(184,134,11,.5)":"rgba(184,134,11,.15)"}`,
              borderRadius:12,padding:14,
              backdropFilter:"blur(8px)",
              boxShadow:i===0?"0 4px 20px rgba(184,134,11,.15)":"none",
            }}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:22}}>{"🥇🥈🥉"[i]||`${i+1}.`}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:'#f5f0e8'}}>{p.name}</div>
                <div style={{fontSize:11,color:'#888'}}>{ROLES.find(r=>r.id===p.role)?.name||"—"} {p.badge&&`• ${p.badge}`}</div>
              </div>
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight:900,fontSize:18,color:C.gold,fontFamily:"monospace"}}>{p.score}</div>
                <div style={{fontSize:10,color:p.accuracy>=70?"#1a5c2a":p.accuracy>=50?"#c45c00":"#8b1a1a"}}>{p.accuracy||0}% دقة</div>
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[[`✅ ${p.stats?.correct||0}`,"#1a5c2a"],[`❌ ${p.stats?.wrong||0}`,"#8b1a1a"],[`🚨 ${p.stats?.wantedCaught||0}`,"#c45c00"],[`🔍 ${p.stats?.forgeCaught||0}`,"#1a3a6b"],[`🧱 ${p.stats?.bribesRefused||0}`,"#555"]].map(([label,color])=>(
                <span key={label} style={{background:`${color}15`,color,border:`1px solid ${color}30`,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700}}>{label}</span>
              ))}
            </div>
            {p.message&&<div style={{marginTop:8,fontSize:12,color:C.muted,fontStyle:"italic"}}>"{p.message}"</div>}
          </motion.div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <motion.button whileHover={{scale:1.02,y:-2}} whileTap={{scale:.97}} onClick={onNextDay}
          style={{flex:1,padding:14,fontWeight:800,fontSize:14,border:"none",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
            background:"linear-gradient(135deg,#8a6010,#c09030,#8a6010)",color:"#fff",minWidth:140,
            boxShadow:"0 4px 16px rgba(184,134,11,.3),inset 0 1px 0 rgba(255,255,255,.15)",letterSpacing:.5,
          }}>اليوم التالي ▶</motion.button>
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} onClick={onShowLB}
          style={{flex:"0 0 auto",padding:14,fontWeight:700,fontSize:14,
            border:"1px solid rgba(184,134,11,.3)",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
            background:"rgba(30,20,5,.8)",color:"#f0c040",backdropFilter:"blur(8px)",
          }}>🏆 الترتيب</motion.button>
        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} onClick={onHome}
          style={{flex:"0 0 auto",padding:14,fontWeight:700,fontSize:14,
            border:"1px solid rgba(255,255,255,.1)",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
            background:"rgba(20,15,5,.8)",color:"#888",backdropFilter:"blur(8px)",
          }}>🏠 الرئيسية</motion.button>
      </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CivilRegistryGame({serverUrl=""}){
  const [screen,       setScreen]       = useState("lobby")
  const [playerName,   setPlayerName]   = useState(()=>localStorage.getItem("civil_name")||"")
  const [playerPin,    setPlayerPin]    = useState(()=>localStorage.getItem("civil_pin")||"")
  const [inputCode,    setInputCode]    = useState("")
  const [lobbyMode,    setLobbyMode]    = useState("join")
  const [myId,         setMyId]         = useState(null)
  const [myRole,       setMyRole]       = useState(null)
  const [isAdmin,      setIsAdmin]      = useState(false)
  const [isSolo,       setIsSolo]       = useState(false)
  const [gameState,    setGameState]    = useState(null)
  const [soloState,    setSoloState]    = useState(null)
  const [currentCitizen,setCurrentCitizen]=useState(null)
  const [connOk,       setConnOk]       = useState(false)
  const [activeDoc,    setActiveDoc]    = useState(null)
  const [stampType,    setStampType]    = useState(null)
  const [pendingDec,   setPendingDec]   = useState(null)
  const [resultData,   setResultData]   = useState(null)
  const [mgrWarning,   setMgrWarning]   = useState(null)
  const [showReqSheet, setShowReqSheet] = useState(false)
  const [selMissing,   setSelMissing]   = useState(new Set())
  const [roleHints,    setRoleHints]    = useState([])
  const [queueInfo,    setQueueInfo]    = useState({remaining:0,pressure:"low",waitingCount:0})
  const [summary,      setSummary]      = useState(null)
  const [pendingSummary,setPendingSummary]= useState(null)
  const [dayMemory,setDayMemory]          = useState({})  // ذاكرة بين الأيام
  const [openedDocs,setOpenedDocs]        = useState(new Set()) // الأوراق اللي اتفتحت
  const [showRejectModal,setShowRejectModal]= useState(false)
  const [selectedReasons,setSelectedReasons]= useState(new Set())
  const [knownCitizens,setKnownCitizens]    = useState({})  // نظام العلاقات
  const [queueTimer,setQueueTimer]          = useState(null)
  const [queueGrowth,setQueueGrowth]        = useState(0)   // ضغط الوقت
  const [managerEntered,setManagerEntered]  = useState(false)
  const [reputation,setReputation]          = useState(0)    // 0=نظيف، >3=مشبوه، >6=فاسد
  const [angryLevel,setAngryLevel]          = useState(0)    // مستوى عصبية المواطن
  const [angryTimer,setAngryTimer]          = useState(null)
  const [inspectorMode,setInspectorMode]    = useState(false) // مفتش مجهول
  const [gameEvent,    setGameEvent]    = useState(null)
  const [chatMsgs,     setChatMsgs]     = useState([])
  const [showChat,     setShowChat]     = useState(false)
  const [unreadChat,   setUnreadChat]   = useState(0)
  const [citizenPressure,setCitizenPressure]=useState(null)
  const [lbData,       setLbData]       = useState(null)
  const [showLB,       setShowLB]       = useState(false)
  const [showTutorial, setShowTutorial] = useState(()=>!localStorage.getItem("civil_tutorial_done"))
  const [saveData,     setSaveData]     = useState(null)
  const socketRef  = useRef(null)
  const mgrTimer   = useRef(null)
  const eventTimer = useRef(null)
  const pressTimer = useRef(null)
  const sound = useSound()

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const socket=io(`${serverUrl}/civil`,{autoConnect:true,reconnection:true,reconnectionDelay:3000})
    socketRef.current=socket
    socket.on("connect",    ()=>setConnOk(true))
    socket.on("disconnect", ()=>setConnOk(false))
    socket.on("CONNECTED",      ({sessionId})=>setMyId(sessionId))
    socket.on("ROOM_CREATED",   ({state,saveData:sd})=>{setIsAdmin(true);setGameState(state);setSaveData(sd);setScreen("room")})
    socket.on("ROOM_JOINED",    ({state,saveData:sd})=>{setIsAdmin(false);setGameState(state);setSaveData(sd);setScreen("room")})
    socket.on("PLAYER_JOINED",  ({state})=>setGameState(state))
    socket.on("PLAYER_LEFT",    ({state})=>setGameState(state))
    socket.on("ROLE_SELECTED",  ({state})=>setGameState(state))
    socket.on("PLAYER_READY",   ({state})=>setGameState(state))
    socket.on("ROLE_ASSIGNED",  ({role})=>setMyRole(role))
    socket.on("GAME_STARTED",   ({state})=>{setGameState(state);setChatMsgs([]);setScreen("game")})
    socket.on("DECISION_RESULT",({state,...rest})=>{setResultData(rest);setGameState(state)})
    socket.on("CITIZEN_LEFT",   ({state})=>setGameState(state))
    socket.on("SHIFT_ENDED",    ({summary:s})=>{setSummary(s);setScreen("end")})
    socket.on("MANAGER_WARNING",msg=>{showMgrWarn(msg);sound.warning()})
    socket.on("NEXT_DAY_READY", ({state})=>{setGameState(state);setScreen("room")})
    socket.on("GAME_EVENT",     ({event})=>showEv(event))
    socket.on("ROLE_HINT",      ({hints})=>setRoleHints(hints))
    socket.on("QUEUE_UPDATE",   info=>setQueueInfo(info))
    socket.on("CITIZEN_PRESSURE",({message})=>{setCitizenPressure(message);clearTimeout(pressTimer.current);pressTimer.current=setTimeout(()=>setCitizenPressure(null),5000)})
    socket.on("CHAT_MESSAGE",   msg=>{setChatMsgs(p=>[...p.slice(-49),msg]);if(!showChat)setUnreadChat(c=>c+1);sound.chat()})
    socket.on("QUICK_ALERT",    msg=>{setChatMsgs(p=>[...p.slice(-49),{...msg,isAlert:true}]);if(!showChat)setUnreadChat(c=>c+1);sound.alert()})
    socket.on("LEADERBOARD_DATA",data=>setLbData(data))
    socket.on("ERROR",          ({message})=>console.warn("[Civil]",message))
    return ()=>socket.disconnect()
  },[serverUrl])

  // ── ضغط الوقت + مواطن عصبي ─────────────────────────────────────────────────
  useEffect(()=>{
    if(screen!=="game"||!currentCitizen) return
    setAngryLevel(0)
    const interval=setInterval(()=>{
      setQueueGrowth(g=>{
        const newG=g+1

        // مواطن عصبي — بيتصاعد كل 30 ثانية
            if(newG===30){
          setAngryLevel(1)
          setCitizenPressure(`😤 "${currentCitizen.full_name.split(" ")[0]}: إيه اللي بياخد وقتك كده؟!"`)
          setTimeout(()=>setCitizenPressure(null),4000)
          sound.warning()
        }
        if(newG===60){
          setAngryLevel(2)
          setCitizenPressure(`😡 "${currentCitizen.full_name.split(" ")[0]}: بقالي نص ساعة واقف — هاروح أشتكي!"`)
          setTimeout(()=>setCitizenPressure(null),4000)
          sound.warning()
        }
        if(newG===90){
          setAngryLevel(3)
          setCitizenPressure(`🤬 "${currentCitizen.full_name.split(" ")[0]}: خلاص! أنا مشيت — هاعمل شكوى رسمية!"`)
          setTimeout(()=>setCitizenPressure(null),5000)
          setManagerEntered(true)
          showMgrWarn({level:"danger",message:"👔 المدير دخل بسبب شكوى مواطن — اتحرك بسرعة!"})
          setTimeout(()=>setManagerEntered(false),15000)
          sound.caught()
        }

        // كل 45 ثانية — ضغط طابور
        if(newG%45===0 && newG>0 && newG<90){
          const msgs=["🏛️ الطابور كبر — في ناس كتير مستنيين!","⏰ ناس تانية واقفة — سرّع!","😤 الطابور بيزعق من البطء!"]
          setCitizenPressure(msgs[Math.floor(Math.random()*msgs.length)])
          setTimeout(()=>setCitizenPressure(null),3000)
        }

        return newG
      })
    },1000)
    return ()=>clearInterval(interval)
  },[screen,currentCitizen])

  useEffect(()=>{
    if(!gameState)return
    const c=gameState.citizens?.[gameState.currentCitizenIndex]
    if(c&&!c._pending&&!c._resolved){
      setCurrentCitizen(c)
      setQueueGrowth(0)
      setAngryLevel(0)
      setOpenedDocs(new Set())
      // نظام العلاقات
      if(c.is_returning && knownCitizens[c.id]){
        const prev=knownCitizens[c.id]
        setCitizenPressure(`🔁 ${prev.name} راجع تاني — عاملته ${prev.wasApproved?"كويس":"مش كويس"} المرة الجاية`)
        setTimeout(()=>setCitizenPressure(null),4000)
      }
    }
  },[gameState])

  const emit=(ev,data)=>socketRef.current?.emit(ev,data)
  function showMgrWarn(msg){setMgrWarning(msg);clearTimeout(mgrTimer.current);mgrTimer.current=setTimeout(()=>setMgrWarning(null),8000)}
  function showEv(ev){setGameEvent(ev);clearTimeout(eventTimer.current);eventTimer.current=setTimeout(()=>setGameEvent(null),5000)}

  // ── Decisions ────────────────────────────────────────────────────────────────
  function handleDecide(decision){
    if(decision==="REJECT"){
      // فتح modal اختيار سبب الرفض
      setSelectedReasons(new Set())
      setShowRejectModal(true)
      sound.warning()
    } else if(["APPROVE","REPORT"].includes(decision)){
      setStampType(decision==="REPORT"?"REJECT":decision)
      setPendingDec(decision)
      sound.stamp()
    } else {
      executeDecision(decision)
    }
  }

  function confirmReject(){
    if(selectedReasons.size===0) return
    setShowRejectModal(false)
    setStampType("REJECT")
    setPendingDec("REJECT")
    sound.stamp()
  }
  function onStampDone(){
    const d=pendingDec;setStampType(null);setPendingDec(null)
    if(d==="APPROVE")sound.approve();else sound.reject()
    // تأخير بسيط قبل ما تظهر النتيجة
    setTimeout(()=>{
      executeDecision(d, [...selectedReasons])
      setSelectedReasons(new Set())
    }, 400)
  }
  function executeDecision(decision, reasons=null){
    const reasonsToSend = reasons || [...selectedReasons]
    if(isSolo)soloDecide(decision, reasonsToSend)
    else{if(!currentCitizen)return;emit("DECISION",{decision,citizenId:currentCitizen.id,reasons:reasonsToSend})}
  }

  // ── Solo ─────────────────────────────────────────────────────────────────────
  function buildSolo(day,deferred){
    const ready=deferred.filter(d=>d.returnDay<=day),waiting=deferred.filter(d=>d.returnDay>day)
    const citizens=[];ready.forEach(d=>citizens.push(genCitizenSolo(day,{gender:d.gender,isReturning:true})))
    const target=Math.min(6+day*3,25),rem=Math.max(0,target-citizens.length),fi=rem>0?~~(Math.random()*rem):-1
    for(let i=0;i<rem;i++)citizens.push(genCitizenSolo(day,{isForced:i===fi?true:undefined}))
    for(let i=citizens.length-1;i>0;i--){const j=~~(Math.random()*(i+1));[citizens[i],citizens[j]]=[citizens[j],citizens[i]]}

    // شبكة تزوير منظمة — بعد يوم 4 باحتمال 20%
    let crimeNetwork=null
    if(day>=4 && Math.random()<0.20 && citizens.length>=5){
      const networkIndices=[]
      while(networkIndices.length<3){
        const idx=~~(Math.random()*citizens.length)
        if(!networkIndices.includes(idx))networkIndices.push(idx)
      }
      const sharedAddress=["شارع الجمهورية، مبنى 7","شارع النيل، شقة 12","ميدان التحرير، عمارة النيل"][~~(Math.random()*3)]
      const sharedLawyer=["المحامي أحمد سالم","المحامي خالد عوض","المحامية نور إبراهيم"][~~(Math.random()*3)]
      networkIndices.forEach(idx=>{
        if(!citizens[idx]._secret.isForged){
          citizens[idx]={...citizens[idx],_secret:{...citizens[idx]._secret,isForged:true,forgeReason:"name_mismatch_form"}}
          citizens[idx].declared_name=citizens[idx].full_name.split(" ")[0]+" "+citizens[idx].full_name.split(" ")[2]
        }
        citizens[idx]._networkAddress=sharedAddress
        citizens[idx]._networkLawyer=sharedLawyer
        citizens[idx]._networkMember=true
      })
      crimeNetwork={indices:networkIndices,address:sharedAddress,lawyer:sharedLawyer,detected:0}
    }

    // مفتش مجهول — بييجي بعد يوم 3 باحتمال 15%
    let inspectorIdx=-1
    if(day>=3 && Math.random()<0.15 && citizens.length>3){
      inspectorIdx=~~(Math.random()*citizens.length)
      citizens[inspectorIdx]={
        ...citizens[inspectorIdx],
        _isInspector:true,
        // المفتش بييجي بأوراق كاملة وسليمة دايماً
        _secret:{isForged:false,forgeReason:null,isWanted:false,wantedData:null,forgedDocName:null},
        available_docs:[...citizens[inspectorIdx].required_docs],
        has_bribe:false,
        dialogue:"صباح النور يا أستاذ، عايز أخلص بسرعة.",
      }
    }

    return {day,score:0,citizens,idx:0,deferred:waiting,dayMistakes:0,stats:{correct:0,wrong:0,wantedCaught:0,forgeCaught:0,bribesRefused:0,bribesAccepted:0},inspectorIdx,crimeNetwork,networkDetected:0}
  }
  function toGS(s,name){return {day:s.day,score:s.score,citizens:s.citizens,currentCitizenIndex:s.idx,totalCitizens:s.citizens.length,players:[{id:"solo_player",name:name||"موظف",score:s.score,stats:s.stats}],waitingCount:s.deferred.length}}
  function startSolo(){setIsSolo(true);setMyRole("desk");setMyId("solo_player");const s=buildSolo(1,[]);setSoloState(s);setGameState(toGS(s,playerName));setScreen("game")}

  // خريطة أسباب التزوير
  const FORGE_REASON_MAP = {
    "invalid_national_id_birthdate": "الرقم القومي لا يطابق تاريخ الميلاد",
    "wrong_governorate_code":        "كود المحافظة غلط",
    "name_mismatch_form":            "الاسم مختلف في استمارة الطلب",
    "name_mismatch_doc":             "الاسم مختلف في إحدى الأوراق",
    "expired_id":                    "البطاقة منتهية الصلاحية",
    "photo_mismatch":                "الصورة مش نفس الشخص",
    "wrong_gender_digit":            "رقم الجنس في الرقم القومي غلط",
    "future_birthdate":              "تاريخ الميلاد في المستقبل",
  }

  function soloDecide(decision, reasons=[]){
    if(!soloState||!currentCitizen)return
    const s=currentCitizen._secret,hasAll=getMissing(currentCitizen).length===0
    let pts=0,msg="",correct=false,bad=false;const stats={...soloState.stats}
    // تحقق لو المواطن ده مفتش
    const isInspector=currentCitizen?._isInspector||false
    const inspectorIdx=soloState?.inspectorIdx

    if(decision==="APPROVE"){
      if(s.isWanted){
        pts=-30;msg=`🚨 مطلوب! التهمة: ${s.wantedData?.crime||""}`;bad=true;stats.wrong++
        // flash أحمر
        document.body.style.background="rgba(255,0,0,.3)"
        setTimeout(()=>{document.body.style.background=""},400)
      }
      else if(s.isForged){pts=-15;msg=`❌ تزوير: ${formatForge(s.forgeReason)}`;bad=true;stats.wrong++}
      else if(!hasAll){pts=-10;msg="❌ وافقت على ملف ناقص!";bad=true;stats.wrong++}
      else{
        pts=10;correct=true;stats.correct++
        if(isInspector){
          // أجبت على المفتش بشكل صح
          pts=30;msg="✅ مواطن سليم! 🕵️ [سري: كان مفتش مجهول — عاملته بشكل احترافي! +30]"
          setInspectorMode(false)
          showMgrWarn({level:"warning",message:"🕵️ كشف: المواطن ده كان مفتش مجهول — عاملته كويس! ممتاز."})
        } else {
          msg="✅ مواطن سليم!"
        }
      }
    }else if(decision==="REJECT"){
      if(s.isForged||!hasAll){
        // تحقق من دقة اختيار السبب
        const correctReason = s.isForged
          ? (FORGE_REASON_MAP[s.forgeReason] || "")
          : "أوراق ناقصة"
        const pickedCorrect = reasons.includes(correctReason)
        const pickedWrong   = reasons.some(r => r !== correctReason && r !== "أوراق ناقصة")
        if(s.isForged && pickedCorrect && !pickedWrong){
          pts=25;correct=true
          msg=`🎯 ممتاز! حددت التزوير بالظبط: ${formatForge(s.forgeReason)}`
          stats.correct++;stats.forgeCaught++
        } else if(!pickedWrong){
          pts=12;correct=true
          msg=s.isForged?`✅ رفضت صح — بس كان فيه تزوير: ${formatForge(s.forgeReason)}`:"✅ رفضت ملف ناقص"
          stats.correct++;if(s.isForged)stats.forgeCaught++
        } else {
          pts=5;correct=true
          msg=`⚠️ رفضت صح بس حددت سبب غلط — التزوير الحقيقي: ${formatForge(s.forgeReason)}`
          stats.correct++
        }
        // شبكة تزوير — لو رفضت عضو في الشبكة
        if(correct && currentCitizen?._networkMember && soloState?.crimeNetwork){
          const newDetected=(soloState.networkDetected||0)+1
          if(newDetected===3){
            pts+=100
            msg+=" 🕸️ اكتشفت الشبكة كاملة! مكافأة +100!"
            showMgrWarn({level:"warning",message:`🕸️ ممتاز! اكتشفت شبكة تزوير منظمة (${currentCitizen._networkAddress}) — مكافأة +100 نقطة!`})
            sound.caught()
          } else {
            msg+=` 🕸️ عضو ${newDetected}/3 في شبكة تزوير!`
            showMgrWarn({level:"warning",message:`🕸️ كشفت عضو ${newDetected}/3 في شبكة تزوير — في ${3-newDetected} لسه!`})
            sound.alert()
          }
          newState.networkDetected=newDetected
        }
      } else if(s.isWanted){pts=5;correct=true;msg="✅ رفضت مطلوب!";stats.correct++}
      else{
        bad=true;stats.wrong++
        if(isInspector){
          pts=-40;msg="❌ رفضت مفتش مجهول! التقرير بيقول إنك بترفض بشكل عشوائي!"
          showMgrWarn({level:"critical",message:"🕵️ المفتش المجهول شاف إنك رفضته بدون سبب — تقرير سلبي رُفع!"})
        } else {
          pts=-10;msg="❌ رفضت مواطن سليم!"
        }
      }
    }else if(decision==="REPORT"){
      if(s.isWanted){pts=50;correct=true;msg=`🚨 مسكت مطلوب! ${s.wantedData?.crime||""}`;stats.correct++;stats.wantedCaught++;sound.caught()}
      else{pts=-20;msg="❌ بلاغ كاذب!";bad=true;stats.wrong++}
    }else if(decision==="ACCEPT_BRIBE"){
      stats.bribesAccepted++
      if(isInspector){
        // قبلت رشوة من مفتش — خلاص انكشفت
        pts=-100;bad=true;msg="🕵️ اتكشفت! قبلت رشوة من مفتش مجهول! تحقيق رسمي فوري!"
        showMgrWarn({level:"critical",message:"🕵️ المفتش المجهول شاف إنك قبلت رشوة — اتخذت إجراءات تأديبية فورية!"})
        setReputation(r=>{window._civilReputation=r+5;return r+5})
      } else {
        setReputation(r=>{
          const newR=r+1
          window._civilReputation=newR
          if(newR===3){showMgrWarn({level:"warning",message:"🗣️ إشاعة انتشرت: 'الشباك ده فيه موظف مرن' — هيجيلك ناس أكتر يحاولوا!"});sound.alert()}
          if(newR===6){showMgrWarn({level:"danger", message:"🔥 سمعتك وصلت للإدارة — المفتشية بتراقبك!"});sound.warning()}
          if(newR>=9) {showMgrWarn({level:"critical",message:"🚨 تقرير رُفع ضدك! المفتشية هتيجي أي يوم!"});sound.caught()}
          return newR
        })
        pts=Math.random()<.35?-50:Math.max(5,~~(currentCitizen.bribe_amount/50));msg=pts<0?"🚔 اتكشفت! المفتشية كانت مراقباك!":"💰 قبلت الرشوة...";if(pts<0)bad=true
      }
      sound.bribe()
    }else if(decision==="REFUSE_BRIBE"){pts=15;correct=true;msg="🧱 رفضت الرشوة!";stats.bribesRefused++}
    if(correct)sound.approve();else if(bad)sound.reject()
    const newMistakes=soloState.dayMistakes+(bad?1:0),newScore=Math.max(0,soloState.score+pts),nextIdx=soloState.idx+1
    const newState={...soloState,score:newScore,idx:nextIdx,dayMistakes:newMistakes,stats}
    const remCount=soloState.citizens.length-nextIdx
    setQueueInfo({remaining:remCount,pressure:remCount>15?"high":remCount>8?"medium":"low",waitingCount:soloState.deferred.length})
    if(remCount===3){
      showMgrWarn({level:"warning",message:"⏰ آخر 3 مواطنين في الوردية — ركّز!"})
      sound.alert()
    }
    if(bad&&newMistakes>=2)showMgrWarn({level:newMistakes>=6?"critical":newMistakes>=4?"danger":"warning",message:newMistakes>=6?"🚫 المدير هدد بتحقيق!":newMistakes>=4?"🔥 إنذار من المدير!":"⚠️ ركّز!"})
    if(nextIdx>=soloState.citizens.length){
      setSoloState(newState)
      const total=newState.citizens.length,acc=total>0?Math.round((stats.correct/Math.max(1,stats.correct+stats.wrong))*100):100
      const badge=stats.wantedCaught>=3?"🦅 صائد المطلوبين":stats.forgeCaught>=3?"🔍 كاشف التزوير":stats.bribesRefused>=3?"🧱 الصخرة":stats.correct>=10?"👑 موظف الوردية":"⚡ نشيط"
      const msgs={excellent:["وردية ممتازة! 🏆","أداء رائع 🌟"],good:["وردية كويسة 👍","شغل فوق المتوسط"],average:["وردية عادية ⚠️","ركّز أكتر"],bad:["وردية صعبة 😟","أخطاء كتير ❌"]}
      const mp=acc>=80?msgs.excellent:acc>=60?msgs.good:acc>=40?msgs.average:msgs.bad
      const ps={day:soloState.day,teamScore:newScore,totalProcessed:total,totalCitizens:total,waitingCount:newState.deferred.length,teamAccuracy:acc,dayMistakes:newMistakes,players:[{id:"solo_player",name:playerName||"موظف",role:"desk",score:newScore,stats,accuracy:acc,badge,message:mp[~~(Math.random()*mp.length)]}]}
      setPendingSummary(ps)
      // نبين النتيجة الأول، لما اللاعب يدوس التالي يظهر الملخص
      setResultData({correct,pointsDelta:pts,message:msg,secret:s,newTeamScore:newScore})
    }else{
      // نظام العلاقات — نحفظ المواطن في الـ known citizens
      if(currentCitizen){
        setKnownCitizens(prev=>({...prev,[currentCitizen.id]:{name:currentCitizen.full_name,wasApproved:correct,day:soloState.day}}))
        // ذاكرة بين الأيام
        setDayMemory(prev=>({...prev,[currentCitizen.national_id]:{name:currentCitizen.full_name,wasApproved:correct,day:soloState.day}}))
      }
      // لو أخو مواطن سابق — بيديك أو بياخد منك نقاط
      if(currentCitizen?._brotherOf&&currentCitizen?._bonusPoints){
        const bonus=currentCitizen._bonusPoints
        pts+=bonus
        const bonusMsg=bonus>0?`🎁 +${bonus} هدية من أخو ${currentCitizen._brotherOf.split(" ")[0]}`:`💢 ${bonus} عقوبة من شكوى أخو ${currentCitizen._brotherOf.split(" ")[0]}`
        setTimeout(()=>showMgrWarn({level:bonus>0?"warning":"danger",message:bonusMsg}),500)
      }
      setSoloState(newState)
      setGameState(toGS(newState,playerName))
      setResultData({correct,pointsDelta:pts,message:msg,secret:s,newTeamScore:newScore})
    }
  }

  function soloReqPapers(docs){
    if(!soloState||!currentCitizen)return
    const days=docs.map(d=>DOC_DAYS[d]||1),returnDay=soloState.day+Math.max(...days)+(docs.length-1)
    const nd=[...soloState.deferred,{gender:currentCitizen.gender,returnDay}],nextIdx=soloState.idx+1,ns={...soloState,idx:nextIdx,deferred:nd}
    if(nextIdx>=soloState.citizens.length){
      setSoloState(ns)
      const pendSum={day:soloState.day,teamScore:soloState.score,totalProcessed:soloState.citizens.length,totalCitizens:soloState.citizens.length,waitingCount:nd.length,teamAccuracy:100,dayMistakes:soloState.dayMistakes,players:[{id:"solo_player",name:playerName||"موظف",role:"desk",score:soloState.score,stats:soloState.stats,accuracy:100,badge:"⚡ نشيط",message:"وردية انتهت"}]}
      setSummary(pendSum);setScreen("end")
    }
    else{setSoloState(ns);setGameState(toGS(ns,playerName))}
  }

  function nextDay(){
    if(isSolo&&soloState){
      const ns=buildSolo(soloState.day+1,soloState.deferred)
      // ذاكرة بين الأيام — لو في مواطنين محفوظين ممكن أخوهم ييجي
      if(Object.keys(dayMemory).length>0 && Math.random()<0.3 && ns.citizens.length>2){
        const memKeys=Object.keys(dayMemory)
        const randomKey=memKeys[~~(Math.random()*memKeys.length)]
        const mem=dayMemory[randomKey]
        // أخو المواطن بييجي
        const brotherIdx=~~(Math.random()*ns.citizens.length)
        const relation=mem.wasApproved?"أخوه ممتنن":"أخوه زعلان"
        const dialogue=mem.wasApproved
          ?`أخويا ${mem.name.split(" ")[0]} قالي إنك موظف محترم — شكراً جزيلاً!`
          :`أنا أخو ${mem.name.split(" ")[0]} — إيه اللي عملته معاه ده؟!`
        ns.citizens[brotherIdx]={
          ...ns.citizens[brotherIdx],
          dialogue,
          _brotherOf:mem.name,
          _brotherRelation:mem.wasApproved?"positive":"negative",
          _bonusPoints:mem.wasApproved?15:-5,
        }
      }
      setSoloState(ns);setGameState(toGS(ns,playerName));setScreen("game");return
    }
    emit("NEXT_DAY")
  }

  function joinRoom(){
    if(!playerName.trim()||!inputCode.trim()||!playerPin.trim())return
    localStorage.setItem("civil_name",playerName);localStorage.setItem("civil_pin",playerPin)
    emit("JOIN_ROOM",{roomCode:inputCode.toUpperCase(),playerName,pin:playerPin})
  }
  function createRoom(){
    if(!playerName.trim()||!inputCode.trim()||!playerPin.trim())return
    localStorage.setItem("civil_name",playerName);localStorage.setItem("civil_pin",playerPin)
    emit("CREATE_ROOM",{roomCode:inputCode.toUpperCase(),playerName,pin:playerPin})
  }
  function selectRole(r){const taken=new Set((gameState?.players||[]).filter(p=>p.id!==myId).map(p=>p.role));if(taken.has(r))return;setMyRole(r);emit("SELECT_ROLE",{role:r})}
  function toggleReady(){emit("SET_READY",{ready:true})}
  function startMP(){emit("START_GAME")}
  function reqPapers(){if(selMissing.size===0||!currentCitizen)return;const docs=[...selMissing];setShowReqSheet(false);setSelMissing(new Set());if(isSolo)soloReqPapers(docs);else emit("REQUEST_PAPERS",{citizenId:currentCitizen.id,docNames:docs})}
  function sendChat(msg){emit("SEND_CHAT",{roomCode:inputCode.toUpperCase(),message:msg})}
  function sendAlert(type){emit("SEND_ALERT",{roomCode:inputCode.toUpperCase(),alertType:type})}
  function fetchLB(){emit("GET_LEADERBOARD",{roomCode:inputCode.toUpperCase()});setShowLB(true)}

  const missing=getMissing(currentCitizen)
  const retDays=[...selMissing].map(d=>DOC_DAYS[d]||1)
  const totalRetDays=retDays.length>0?Math.max(...retDays)+(retDays.length-1):0
  const canDecide=myRole==="desk"||myRole==="manager"||isSolo

  const C={ink:"#1a1209",paper:"#f5f0e8",paper2:"#ede6d6",stampR:"#8b1a1a",stampG:"#1a5c2a",gold:"#b8860b",muted:"#6b5e4a",border:"#c4b49a",warn:"#c45c00",blue:"#1a3a6b",wood:"linear-gradient(160deg,#5a3d24,#4a3019)"}
  const warnC={warning:{bg:"#fff3cd",text:"#7a5900"},danger:{bg:"#ffe0cc",text:"#8a3b00"},critical:{bg:"#5c0000",text:"#fff"}}

  // ══ LOBBY ════════════════════════════════════════════════════════════════════
  if(screen==="lobby") return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#1a0a00,#2d1200,#1a0a00)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"Arial,sans-serif",direction:"rtl",position:"relative",overflow:"hidden"}}>
      {/* خلفية ورقية */}
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,.02) 40px,rgba(255,255,255,.02) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,.02) 40px,rgba(255,255,255,.02) 41px)",pointerEvents:"none"}}/>
      {/* ختم ديكور */}
      <div style={{position:"absolute",top:-60,left:-60,width:250,height:250,borderRadius:"50%",border:"3px solid rgba(184,134,11,.08)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-80,right:-80,width:300,height:300,borderRadius:"50%",border:"3px solid rgba(184,134,11,.06)",pointerEvents:"none"}}/>

      <div style={{width:"100%",maxWidth:420,display:"flex",flexDirection:"column",gap:0,position:"relative",zIndex:1}}>
        {/* الهيدر */}
        <div style={{background:"linear-gradient(180deg,#8b1a1a,#6a1010)",padding:"28px 24px",borderRadius:"12px 12px 0 0",textAlign:"center",borderBottom:"3px solid #b8860b",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>
          <div style={{fontSize:52,marginBottom:8}}>🏛️</div>
          <h1 style={{fontSize:28,fontWeight:900,color:"#f5f0e8",margin:0,letterSpacing:3,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>السجل المدني</h1>
          <p style={{color:"#d4a0a0",fontSize:12,marginTop:6,margin:"6px 0 0",letterSpacing:1}}>وزارة الداخلية — مصلحة الأحوال المدنية</p>
          {/* شريط ذهبي */}
          <div style={{width:60,height:2,background:"linear-gradient(90deg,transparent,#b8860b,transparent)",margin:"10px auto 0"}}/>
        </div>

        {/* الفورم */}
        <div style={{background:"#f5f0e8",borderRadius:"0 0 12px 12px",padding:24,display:"flex",flexDirection:"column",gap:14,boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
          {/* اسم + PIN */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#5a3a1a",display:"block",marginBottom:5,letterSpacing:.5}}>الاسم</label>
              <input value={playerName} onChange={e=>setPlayerName(e.target.value)} placeholder="أحمد محمد" style={{width:"100%",padding:"10px 12px",border:"1.5px solid #c4b49a",borderRadius:6,fontSize:14,fontFamily:"inherit",direction:"rtl",boxSizing:"border-box",background:"#fff",color:"#111",outline:"none"}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#5a3a1a",display:"block",marginBottom:5,letterSpacing:.5}}>الرقم السري</label>
              <input value={playerPin} onChange={e=>setPlayerPin(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="••••" maxLength={4} type="password" style={{width:"100%",padding:"10px 12px",border:"1.5px solid #c4b49a",borderRadius:6,fontSize:18,fontFamily:"monospace",direction:"ltr",boxSizing:"border-box",background:"#fff",color:"#111",letterSpacing:4,outline:"none"}}/>
            </div>
          </div>

          {/* تبويبات */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,border:"1.5px solid #c4b49a",borderRadius:6,overflow:"hidden"}}>
            {[["join","🚪 دخول"],["create","➕ إنشاء"],["solo","👤 فردي"]].map(([m,label])=>(
              <button key={m} onClick={()=>setLobbyMode(m)} style={{padding:"10px 4px",fontWeight:700,fontSize:12,cursor:"pointer",border:"none",borderLeft:m!=="solo"?"1px solid #c4b49a":"none",fontFamily:"inherit",background:lobbyMode===m?"#8b1a1a":"#fff",color:lobbyMode===m?"#fff":"#5a3a1a",transition:"all .15s"}}>
                {label}
              </button>
            ))}
          </div>

          {/* كود الغرفة */}
          {lobbyMode!=="solo"&&(
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#5a3a1a",display:"block",marginBottom:5,letterSpacing:.5}}>{lobbyMode==="join"?"كود الغرفة":"اختر كود للغرفة"}</label>
              <input value={inputCode} onChange={e=>setInputCode(e.target.value.toUpperCase())} placeholder="مثال: MASR2024" maxLength={10}
                style={{width:"100%",padding:"12px 14px",border:"1.5px solid #c4b49a",borderRadius:6,fontSize:16,fontFamily:"monospace",direction:"ltr",letterSpacing:3,boxSizing:"border-box",background:"#fff",color:"#111",fontWeight:700,outline:"none"}}/>
            </div>
          )}

          {/* سيف موجود */}
          {saveData&&lobbyMode!=="solo"&&(
            <div style={{background:"#e8f4ff",border:"1.5px solid #1a3a6b",borderRadius:6,padding:"8px 12px",fontSize:12,color:"#1a3a6b",display:"flex",alignItems:"center",gap:8}}>
              <span>💾</span>
              <span>سيف موجود: يوم {saveData.currentDay} | آخر لعب: {saveData.lastPlayed}</span>
            </div>
          )}

          {lobbyMode==="solo"&&(
            <div style={{background:"#fff8e8",border:"1px solid #c4b49a",borderRadius:6,padding:"8px 12px",fontSize:12,color:"#5a3a1a",textAlign:"center"}}>
              العب لوحدك — حقق في البطاقات والمطلوبين بدون ضغط
            </div>
          )}

          {/* زرار الدخول */}
          <button onClick={lobbyMode==="solo"?startSolo:lobbyMode==="join"?joinRoom:createRoom}
            style={{padding:"13px",fontWeight:900,fontSize:15,border:"none",borderRadius:6,cursor:"pointer",fontFamily:"inherit",background:lobbyMode==="solo"?"linear-gradient(135deg,#1a5c2a,#2a8a3e)":lobbyMode==="create"?"linear-gradient(135deg,#1a1a6b,#2a2a9a)":"linear-gradient(135deg,#8b1a1a,#aa3030)",color:"#fff",letterSpacing:1,boxShadow:"0 4px 12px rgba(0,0,0,.3)",transition:"transform .1s"}}>
            {lobbyMode==="solo"?"🏛️ ابدأ الوردية":lobbyMode==="join"?"🚪 دخول الغرفة":"➕ إنشاء غرفة جديدة"}
          </button>

          {/* حالة الاتصال */}
          <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:connOk?"#2a8a3e":"#cc4444",boxShadow:connOk?"0 0 6px #2a8a3e":"0 0 6px #cc4444"}}/>
            <span style={{fontSize:11,color:"#888"}}>{connOk?"متصل بالسيرفر":"جاري الاتصال بالسيرفر..."}</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ══ ROOM ═════════════════════════════════════════════════════════════════════
  if(screen==="room") return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0a0500,#1a0e02,#0a0500)",fontFamily:"Arial,sans-serif",direction:"rtl"}}>
      <div style={{
        background:"linear-gradient(180deg,rgba(10,6,2,.95),rgba(20,12,4,.9))",
        backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(184,134,11,.25)",
        color:"#f5f0e8",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",
        boxShadow:"0 2px 16px rgba(0,0,0,.4)",
      }}>
        <span style={{fontWeight:700,fontSize:15}}>🏛️ غرفة الانتظار</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowTutorial(true)} style={{padding:"4px 10px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"#888",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>📖 تعليمات</button>
          <button onClick={fetchLB} style={{padding:"4px 10px",background:"rgba(255,255,255,.1)",border:"none",color:"#f5f0e8",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>🏆 الترتيب</button>
          <span style={{background:"rgba(255,255,255,.12)",borderRadius:20,padding:"2px 12px",fontFamily:"monospace",fontSize:13}}>{inputCode||"—"}</span>
        </div>
      </div>
      {saveData&&<div style={{background:"rgba(26,58,107,.6)",backdropFilter:"blur(8px)",color:"#aac8ff",padding:"6px 16px",fontSize:12,textAlign:"center",borderBottom:"1px solid rgba(100,160,255,.2)"}}>💾 متابعة من يوم {saveData.currentDay} | آخر لعب: {saveData.lastPlayed}</div>}
      <div style={{padding:12,display:"flex",flexDirection:"column",gap:12,maxWidth:600,margin:"0 auto"}}>
        <div style={{background:"rgba(30,20,5,.7)",border:"1px solid rgba(184,134,11,.2)",borderRadius:12,padding:14,backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#b8860b",marginBottom:10,letterSpacing:1}}>اللاعبين</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
            {(gameState?.players||[]).map(p=>(
              <div key={p.id} style={{
                background:p.id===myId?"rgba(184,134,11,.15)":"rgba(255,255,255,.04)",
                border:`1.5px solid ${p.id===myId?"rgba(184,134,11,.5)":"rgba(255,255,255,.08)"}`,
                borderRadius:8,padding:10,textAlign:"center",fontSize:13,color:"#f5f0e8",
                backdropFilter:"blur(4px)",
              }}>
                <div style={{fontWeight:700,color:p.id===myId?"#f0c040":"#f5f0e8"}}>{p.name}{p.isAdmin?" 👑":""}</div>
                <div style={{fontSize:11,color:"#888",marginTop:2}}>{p.role?ROLES.find(r=>r.id===p.role)?.name:"لم يختر بعد"}</div>
                {p.isReady&&<div style={{fontSize:10,color:"#4caf50",marginTop:2}}>✓ جاهز</div>}
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"rgba(30,20,5,.7)",border:"1px solid rgba(184,134,11,.2)",borderRadius:12,padding:14,backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#b8860b",marginBottom:10,letterSpacing:1}}>اختر وظيفتك</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
            {ROLES.map(r=>{
              const taken=(gameState?.players||[]).some(p=>p.role===r.id&&p.id!==myId),selected=myRole===r.id
              return (
                <motion.div key={r.id} whileHover={!taken?{y:-3,scale:1.02}:{}}
                  onClick={()=>!taken&&selectRole(r.id)}
                  style={{
                    background:selected?"rgba(26,92,42,.4)":taken?"rgba(20,20,20,.3)":"rgba(255,255,255,.04)",
                    border:`2px solid ${selected?"rgba(76,175,80,.5)":taken?"rgba(255,255,255,.06)":"rgba(255,255,255,.1)"}`,
                    borderRadius:10,padding:12,textAlign:"center",cursor:taken?"not-allowed":"pointer",
                    opacity:taken?.4:1,backdropFilter:"blur(4px)",
                    boxShadow:selected?"0 4px 16px rgba(76,175,80,.2)":"none",
                  }}>
                  <div style={{fontSize:24,marginBottom:4}}>{r.icon}</div>
                  <div style={{fontWeight:700,fontSize:13,color:selected?"#a0f0b0":taken?"#555":"#f5f0e8"}}>{r.name}</div>
                  <div style={{fontSize:10,color:"#666",marginTop:2}}>{r.desc}</div>
                  {selected&&<div style={{fontSize:10,color:"#4caf50",marginTop:4,fontWeight:700}}>✓ وظيفتك</div>}
                  {taken&&<div style={{fontSize:10,color:"#555",marginTop:4}}>محجوزة</div>}
                </motion.div>
              )
            })}
          </div>
          {myRole&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(26,92,42,.2)",border:"1px solid rgba(76,175,80,.3)",borderRadius:8,fontSize:12,color:"#80e890",fontWeight:700,backdropFilter:"blur(4px)"}}>{ROLES.find(r=>r.id===myRole)?.hint}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} onClick={toggleReady}
            style={{flex:1,padding:12,fontWeight:700,fontSize:14,
              border:"1px solid rgba(255,255,255,.15)",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
              background:"rgba(255,255,255,.07)",color:"#f5f0e8",backdropFilter:"blur(6px)",
            }}>جاهز ✓</motion.button>
          {(isAdmin||isSolo)&&(
            <motion.button whileHover={{scale:1.02,y:-2}} whileTap={{scale:.97}} onClick={startMP}
              style={{flex:1,padding:12,fontWeight:800,fontSize:14,border:"none",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
                background:"linear-gradient(135deg,#8b1a1a,#cc3030)",color:"#fff",
                boxShadow:"0 4px 16px rgba(139,26,26,.4),inset 0 1px 0 rgba(255,255,255,.15)",letterSpacing:.5,
              }}>ابدأ اللعبة 🚀</motion.button>
          )}
        </div>
      </div>
      <AnimatePresence>{showLB&&<LeaderboardScreen data={lbData} onClose={()=>setShowLB(false)} C={C}/>}</AnimatePresence>
      <AnimatePresence>{showTutorial&&<TutorialModal onClose={()=>{setShowTutorial(false);localStorage.setItem("civil_tutorial_done","1")}} C={C}/>}</AnimatePresence>
    </div>
  )

  // ══ GAME ═════════════════════════════════════════════════════════════════════
  if(screen==="game"){
    const gs=gameState||{},c=currentCitizen
    const myRoleData=ROLES.find(r=>r.id===myRole)
    const remaining=queueInfo.remaining||Math.max(0,(gs.totalCitizens||0)-(gs.currentCitizenIndex||0))
    const pressColor={low:C.stampG,medium:C.warn,high:C.stampR}[queueInfo.pressure||"low"]

    return (
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",fontFamily:"Arial,sans-serif",direction:"rtl",overflow:"hidden"}}>
        <style>{scrollbarCSS}</style>
        {/* Topbar */}
        <div style={{
          background:"linear-gradient(180deg,rgba(10,6,2,.92),rgba(20,12,4,.88))",
          backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
          borderBottom:"1px solid rgba(184,134,11,.25)",
          color:"#f5f0e8",padding:"6px 14px",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",zIndex:10,
          boxShadow:"0 2px 16px rgba(0,0,0,.4)",
        }}>
          <span style={{fontWeight:700,fontSize:13}}>🏛️</span>
          {(gs.players||[]).sort((a,b)=>b.score-a.score).map(p=>(
            <span key={p.id} style={{background:p.id===myId?C.gold:"rgba(255,255,255,.12)",borderRadius:20,padding:"2px 8px",fontSize:11,color:"#fff",fontWeight:p.id===myId?700:400}}>
              {p.name}{p.id===myId?" ✓":""}: {p.score}
            </span>
          ))}
          <span style={{marginRight:"auto"}}/>
          <span style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"2px 8px",fontSize:11}}>يوم {gs.day||1}</span>
          <span style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"2px 8px",fontSize:11}}>{gs.currentCitizenIndex||0}/{gs.totalCitizens||0}</span>
          {myRoleData&&<span style={{background:"rgba(255,255,255,.08)",borderRadius:20,padding:"2px 8px",fontSize:11}}>{myRoleData.icon}</span>}
          {managerEntered&&(
            <motion.div
              initial={{x:30,opacity:0}} animate={{x:0,opacity:1}}
              style={{background:"rgba(255,200,0,.2)",border:"1px solid #f0c040",borderRadius:20,padding:"2px 10px",fontSize:11,color:"#f0c040",fontWeight:700}}
            >
              👔 المدير موجود!
            </motion.div>
          )}
          {/* مؤشر السمعة */}
          {reputation>0&&(
            <div style={{background:reputation>=9?"rgba(139,26,26,.4)":reputation>=6?"rgba(180,80,0,.3)":reputation>=3?"rgba(180,140,0,.2)":"transparent",border:`1px solid ${reputation>=9?"#ff4444":reputation>=6?"#ff8800":reputation>=3?"#f0c040":"transparent"}`,borderRadius:20,padding:"2px 8px",fontSize:10,color:reputation>=9?"#ff6666":reputation>=6?"#ffaa44":reputation>=3?"#f0c040":"transparent",fontWeight:700}}>
              {reputation>=9?"🔴 سمعة سيئة":reputation>=6?"🟠 مشبوه":reputation>=3?"🟡 تحت المراقبة":""}
            </div>
          )}
          {!isSolo&&(
            <button onClick={()=>{setShowChat(c=>!c);setUnreadChat(0)}} style={{position:"relative",padding:"4px 10px",background:"rgba(255,255,255,.1)",border:"none",color:"#f5f0e8",borderRadius:20,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
              💬{unreadChat>0&&<span style={{position:"absolute",top:-4,right:-4,background:C.stampR,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unreadChat}</span>}
            </button>
          )}
        </div>

        {/* Queue Pressure Bar */}
        <div style={{background:"rgba(0,0,0,.2)",padding:"3px 14px",display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#f5f0e8"}}>
          <span>🏛️</span>
          <div style={{flex:1,background:"rgba(255,255,255,.1)",borderRadius:20,height:5,overflow:"hidden"}}>
            <motion.div animate={{width:`${Math.min(100,(remaining/30)*100)}%`}} style={{height:"100%",background:pressColor,borderRadius:20}}/>
          </div>
          <span style={{color:pressColor,fontWeight:700,fontSize:10}}>{remaining} شخص</span>
          {queueInfo.waitingCount>0&&<span style={{color:C.gold,fontSize:10}}>+{queueInfo.waitingCount} مستني</span>}
          {queueGrowth>0&&(
            <span style={{color:queueGrowth>60?"#ff4444":queueGrowth>30?"#ff9800":"#aaa",fontSize:10,fontFamily:"monospace",minWidth:32}}>
              ⏱{Math.floor(queueGrowth/60)}:{String(queueGrowth%60).padStart(2,"0")}
            </span>
          )}
        </div>

        {/* Warnings & Events */}
        {/* تحذير المدير */}
        <AnimatePresence>
          {mgrWarning&&(
            <motion.div
              initial={{opacity:0,y:-40,scale:.85}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:-30,scale:.9}}
              transition={{type:"spring",damping:20,stiffness:300}}
              style={{
                position:"fixed",top:"12%",left:"50%",
                transform:"translateX(-50%)",
                zIndex:870,maxWidth:380,width:"90%",
                pointerEvents:"none",
              }}
            >
              <div style={{
                background:mgrWarning.level==="critical"
                  ?"linear-gradient(135deg,rgba(60,0,0,.95),rgba(100,0,0,.98))"
                  :mgrWarning.level==="danger"
                  ?"linear-gradient(135deg,rgba(60,20,0,.95),rgba(100,40,0,.98))"
                  :"linear-gradient(135deg,rgba(40,30,0,.95),rgba(80,60,0,.98))",
                backdropFilter:"blur(16px)",
                border:`1.5px solid ${mgrWarning.level==="critical"?"rgba(255,60,60,.5)":mgrWarning.level==="danger"?"rgba(255,140,0,.5)":"rgba(255,200,0,.4)"}`,
                borderRadius:14,padding:"14px 20px",textAlign:"center",
                boxShadow:"0 8px 32px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08)",
              }}>
                <div style={{
                  color:mgrWarning.level==="critical"?"#ffaaaa":mgrWarning.level==="danger"?"#ffc080":"#ffe080",
                  fontSize:13,fontWeight:700,lineHeight:1.5,
                  textShadow:`0 0 12px ${mgrWarning.level==="critical"?"rgba(255,80,80,.5)":mgrWarning.level==="danger"?"rgba(255,140,0,.5)":"rgba(255,200,0,.4)"}`,
                }}>
                  {mgrWarning.message}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* حدث عشوائي */}
        <AnimatePresence>
          {gameEvent&&(
            <motion.div
              initial={{opacity:0,x:60}}
              animate={{opacity:1,x:0}}
              exit={{opacity:0,x:60}}
              transition={{type:"spring",damping:22,stiffness:280}}
              style={{
                position:"fixed",top:"35%",left:16,
                zIndex:860,maxWidth:280,
                pointerEvents:"none",
              }}
            >
              <div style={{
                background:"linear-gradient(135deg,rgba(10,30,80,.95),rgba(20,50,120,.98))",
                backdropFilter:"blur(12px)",
                border:"1.5px solid rgba(100,160,255,.35)",
                borderRadius:12,padding:"12px 16px",
                boxShadow:"0 6px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.08)",
              }}>
                <div style={{color:"#aac8ff",fontSize:12,fontWeight:700,lineHeight:1.5}}>
                  {gameEvent.message}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* إشعار المواطن الغاضب — في منتصف الشاشة */}
        <AnimatePresence>
          {citizenPressure&&(
            <motion.div
              initial={{opacity:0,y:-60,scale:.7}}
              animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:40,scale:.8}}
              transition={{type:"spring",damping:18,stiffness:280}}
              style={{
                position:"fixed",
                top:"22%",left:"50%",
                transform:"translateX(-50%)",
                zIndex:880,
                maxWidth:340,width:"90%",
                pointerEvents:"none",
              }}
            >
              <div style={{
                background:"linear-gradient(135deg,rgba(80,0,0,.92),rgba(40,0,0,.97))",
                backdropFilter:"blur(16px)",
                WebkitBackdropFilter:"blur(16px)",
                border:"1.5px solid rgba(255,80,80,.4)",
                borderRadius:16,
                padding:"16px 20px",
                boxShadow:"0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(255,100,100,.15), inset 0 1px 0 rgba(255,255,255,.08)",
                textAlign:"center",
              }}>
                {/* أيقونة الغضب */}
                <motion.div
                  animate={{rotate:[-3,3,-3]}}
                  transition={{repeat:Infinity,duration:.4}}
                  style={{fontSize:angryLevel>=3?40:angryLevel>=2?34:28,marginBottom:8}}
                >
                  {angryLevel>=3?"🤬":angryLevel>=2?"😡":"😤"}
                </motion.div>
                {/* النص */}
                <div style={{
                  color:"#ffcccc",
                  fontSize:14,
                  fontWeight:700,
                  fontFamily:"'Georgia',serif",
                  lineHeight:1.6,
                  textShadow:"0 0 12px rgba(255,80,80,.5)",
                }}>
                  {citizenPressure}
                </div>
                {/* شريط الغضب */}
                <div style={{marginTop:10,background:"rgba(255,255,255,.1)",borderRadius:20,height:4,overflow:"hidden"}}>
                  <motion.div
                    initial={{width:"100%"}}
                    animate={{width:"0%"}}
                    transition={{duration:4,ease:"linear"}}
                    style={{height:"100%",background:"linear-gradient(90deg,#ff4444,#ff8800)",borderRadius:20}}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid */}
        <div style={{flex:1,display:"grid",gridTemplateColumns:showChat&&!isSolo?"1fr 220px":"1fr",overflow:"hidden",position:"relative"}}>
          {/* Queue & Wanted — popup buttons */}
          <QueueWantedPanel
            gs={gs} myRole={myRole} isSolo={isSolo} C={C}
            canSeeWanted={myRole==="security"||myRole==="manager"||isSolo}
          />

          {/* Center */}
          <div style={{display:"flex",flexDirection:"column",overflow:"hidden",color:"#111",position:"relative"}}>
            {/* صورة المكتب */}
            <img src="/desk.jpg" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0,pointerEvents:"none"}}/>
            {/* حافة المكتب فوق */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:"rgba(0,0,0,.3)",zIndex:1}}/>
            {/* الورق بيبان كانه واقع على المكتب */}
            <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
            {/* Person vs ID — Liquid Glass */}
            {c&&(
              <div style={{display:"flex",gap:8,padding:"10px 14px",
                background:"rgba(255,255,255,0.08)",
                backdropFilter:"blur(12px) saturate(180%)",
                WebkitBackdropFilter:"blur(12px) saturate(180%)",
                borderBottom:"1px solid rgba(255,255,255,0.15)",
                borderTop:"1px solid rgba(255,255,255,0.2)",
                boxShadow:"0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.25)",
                alignItems:"center",flexWrap:"wrap",
                position:"relative",
              }}>
                {/* Glass shimmer */}
                <div style={{position:"absolute",top:0,left:0,right:0,height:"50%",background:"linear-gradient(180deg,rgba(255,255,255,.06),transparent)",pointerEvents:"none",borderRadius:"0 0 50% 50%"}}/>
                <div style={{flex:"0 0 auto",textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.6)",marginBottom:2}}>
                    {c.special_type==="proxy"?"الوكيل الواقف قدامك":"الشخص الواقف"}
                  </div>
                  <div style={{width:80,height:80,borderRadius:"50%",border:`3px solid ${c.is_nervous?"#ff6b6b":c.special_type==="proxy"?"#2a7a2a":C.border}`,overflow:"hidden",background:"#ddd",margin:"0 auto",boxShadow:c.is_nervous?"0 0 10px rgba(255,0,0,.4)":"none"}}>
                    <img src={c.special_type==="proxy"&&c.proxy_data?avatar(c.proxy_data.id_photo_seed,c.proxy_data.gender):avatar(c.person_seed,c.gender)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,marginTop:3,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"#f5f0e8"}}>
                    {c.special_type==="proxy"&&c.proxy_data?c.proxy_data.name:(c.declared_name||c.full_name)}
                  </div>
                  {c.is_nervous&&<div style={{fontSize:10,color:C.stampR,fontWeight:700}}>😰 nervous</div>}
                </div>
                <div style={{color:C.muted,fontSize:16}}>⇄</div>
                <div style={{flex:"0 0 auto",textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.6)",marginBottom:2}}>
                    {c.special_type==="proxy"?"بطاقة صاحب المعاملة":"صورة البطاقة"}
                  </div>
                  <div style={{width:80,height:80,borderRadius:4,border:`3px solid ${c.special_type==="proxy"?"#2a6ab0":C.gold}`,overflow:"hidden",background:"#1a3a5c",margin:"0 auto"}}>
                    <img src={avatar(c.id_photo_seed,c.gender)} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  </div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2}}>رسمية</div>
                </div>
                <div style={{flex:1,minWidth:100}}>
                  {c.special_type&&c.special_type!=="normal"&&(
                    <div style={{
                      background:c.special_type==="elderly"?"rgba(120,80,20,.3)":c.special_type==="proxy"?"rgba(20,60,120,.3)":c.special_type==="foreigner"?"rgba(20,80,40,.3)":"rgba(80,20,80,.3)",
                      border:`1px solid ${c.special_type==="elderly"?"rgba(200,140,40,.5)":c.special_type==="proxy"?"rgba(60,140,255,.4)":c.special_type==="foreigner"?"rgba(60,200,100,.4)":"rgba(180,60,180,.4)"}`,
                      borderRadius:6,padding:"3px 8px",fontSize:10,
                      color:c.special_type==="elderly"?"#f0c040":c.special_type==="proxy"?"#80b8ff":c.special_type==="foreigner"?"#80e890":"#e080e0",
                      marginBottom:3,fontWeight:700,backdropFilter:"blur(4px)"
                    }}>
                      {c.special_type==="elderly"?"👴 كبير في السن":
                       c.special_type==="proxy"?`📝 بالوكالة — الوكيل: ${c.proxy_data?.name||"—"}`:
                       c.special_type==="foreigner"?"🌍 أجنبي":"🦽 معاق"}
                    </div>
                  )}
                  {/* لو بالوكالة - نبين صورة الوكيل VS صاحب المعاملة */}
                  {c.special_type==="proxy"&&c.proxy_data&&(
                    <div style={{background:"#fff8e8",border:`1px solid ${C.gold}`,borderRadius:4,padding:"3px 7px",fontSize:10,color:"#7a5000",marginBottom:3}}>
                      ⚠️ الشخص الواقف (الوكيل) ≠ صاحب المعاملة — تحقق من الوكالة!
                    </div>
                  )}
                  {c.is_returning&&(
                    <motion.div
                      initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}}
                      style={{background:"rgba(20,80,40,.4)",border:"1px solid rgba(76,200,100,.4)",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#80e890",marginBottom:3,fontWeight:700,backdropFilter:"blur(4px)"}}>
                      ✅ راجع بأوراق كاملة — وافق فوراً!
                    </motion.div>
                  )}
                  {c._networkMember&&(
                    <div style={{background:"rgba(100,0,100,.3)",border:"1px solid rgba(200,0,200,.5)",borderRadius:4,padding:"2px 6px",fontSize:10,color:"#e080e0",marginBottom:3}}>
                      🕸️ عنوان: {c._networkAddress}
                    </div>
                  )}
                  {c.dialogue&&(
                    <div style={{
                      background:angryLevel>=3?"#3a0000":angryLevel>=2?"#5a1000":angryLevel>=1?"#7a3000":"#fff",
                      border:`1px solid ${angryLevel>=2?C.stampR:angryLevel>=1?"#c45c00":C.border}`,
                      borderRadius:6,padding:"4px 7px",fontSize:11,fontStyle:"italic",
                      color:angryLevel>=2?"#ffaaaa":angryLevel>=1?"#ffcc88":"#333",
                      transition:"all 0.5s"
                    }}>
                      {angryLevel>=3?"🤬":angryLevel>=2?"😡":angryLevel>=1?"😤":""} "{c.dialogue}"
                    </div>
                  )}
                  {c.has_bribe&&<div style={{background:"#fff3cd",border:`1.5px solid ${C.gold}`,borderRadius:4,padding:"3px 7px",fontSize:11,color:"#7a5900",marginTop:3}}>💰 عارض {c.bribe_amount} جنيه!</div>}
                  {c._networkMember&&(
                    <div style={{background:"rgba(100,0,100,.3)",border:"1px solid rgba(200,0,200,.5)",borderRadius:4,padding:"2px 6px",fontSize:10,color:"#e080e0",marginBottom:3}}>
                      🕸️ عنوان: {c._networkAddress}
                    </div>
                  )}
                  {c._brotherOf&&(
                    <motion.div initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}}
                      style={{background:c._brotherRelation==="positive"?"rgba(0,80,0,.4)":"rgba(80,0,0,.4)",border:`1px solid ${c._brotherRelation==="positive"?"#4caf50":"#cc4444"}`,borderRadius:4,padding:"3px 7px",fontSize:10,color:c._brotherRelation==="positive"?"#a0e0a0":"#ff9999",marginTop:3}}>
                      {c._brotherRelation==="positive"?`🤝 أخو ${c._brotherOf.split(" ")[0]} — بييجي بنية حسنة (+${c._bonusPoints})`:`😤 أخو ${c._brotherOf.split(" ")[0]} — جاي يشتكي (${c._bonusPoints})`}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Docs */}
            <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:14}}>
              {c?(
                <>
                  {/* أزرار فتح المستندات — كأنها تابات فوق المكتب */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,padding:"6px 8px",background:"rgba(0,0,0,.15)",borderRadius:8,backdropFilter:"blur(2px)"}}>
                    <motion.button whileHover={{y:-2}} whileTap={{scale:.95}}
                      onClick={()=>{setActiveDoc({name:"id_card"});setOpenedDocs(p=>new Set([...p,"id_card"]));sound.chat()}}
                      style={{padding:"6px 12px",background:openedDocs.has("id_card")?"#0a2040":"rgba(12,45,94,.6)",color:"#fff",
                        border:`1px solid ${openedDocs.has("id_card")?"#4a8ac8":"rgba(42,106,176,.5)"}`,
                        borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700,
                        backdropFilter:"blur(4px)",boxShadow:"0 2px 8px rgba(0,0,0,.4)",
                        opacity:openedDocs.has("id_card")?.7:1,
                      }}>
                      {openedDocs.has("id_card")?"✓ ":""}🪪 بطاقة صاحب المعاملة
                    </motion.button>
                    {/* لو جاي بالوكالة - اظهر بطاقة الوكيل ووثيقة الوكالة */}
                    {c.special_type==="proxy"&&c.proxy_data&&(
                      <>
                        <button onClick={()=>setActiveDoc({name:"بطاقة الوكيل"})} style={{padding:"5px 10px",background:"#2a5a10",color:"#fff",border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>🪪 بطاقة الوكيل</button>
                        <button onClick={()=>setActiveDoc({name:"وثيقة الوكالة"})} style={{padding:"5px 10px",background:"#1a5a2a",color:"#fff",border:"none",borderRadius:20,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>📜 وثيقة الوكالة</button>
                      </>
                    )}
                    {(c.available_docs||[]).map(d=>(
                      <motion.button key={d} whileHover={{y:-2}} whileTap={{scale:.95}}
                        onClick={()=>{setActiveDoc({name:d,content:c.doc_contents?.[d]});setOpenedDocs(p=>new Set([...p,d]));sound.chat()}}
                        style={{padding:"6px 12px",
                          background:openedDocs.has(d)?"rgba(255,254,245,.5)":"rgba(255,254,245,.15)",
                          border:`1px solid ${openedDocs.has(d)?"rgba(196,180,154,.8)":"rgba(196,180,154,.3)"}`,
                          borderRadius:8,fontSize:11,cursor:"pointer",fontFamily:"inherit",
                          color:openedDocs.has(d)?"#3a2800":"#c4b49a",fontWeight:600,
                          backdropFilter:"blur(4px)",boxShadow:"0 2px 6px rgba(0,0,0,.3)",
                          opacity:openedDocs.has(d)?.7:1,
                        }}>
                        {openedDocs.has(d)?"✓ ":""}📄 {d}
                      </motion.button>
                    ))}
                    {getMissing(c).map(d=>(
                      <span key={d} style={{padding:"6px 12px",background:"rgba(58,0,0,.6)",border:"1px solid rgba(139,26,26,.5)",borderRadius:8,fontSize:11,color:"#ff9999",fontWeight:600,backdropFilter:"blur(4px)"}}>❌ {d}</span>
                    ))}
                  </div>

                  {/* الاستمارة على المكتب - تظهر بس لما في مواطن */}
                  {c&&(
                    <motion.div
                      initial={{opacity:0,y:10,rotate:-1}}
                      animate={{opacity:1,y:0,rotate:-0.4}}
                      exit={{opacity:0,y:-10}}
                      style={{position:"relative",transformOrigin:"top center"}}>
                      <div style={{position:"absolute",bottom:-6,left:6,right:-6,height:20,background:"rgba(0,0,0,.4)",filter:"blur(8px)",borderRadius:4,zIndex:0}}/>
                      <div style={{position:"relative",zIndex:1,borderRadius:2,overflow:"hidden",boxShadow:"2px 4px 16px rgba(0,0,0,.4),1px 1px 0 #c4b49a,-1px -1px 0 #e8dcc8"}}>
                        <RequestFormDoc citizen={c}/>
                      </div>
                    </motion.div>
                  )}

                  {/* فك شفرة الرقم القومي */}
                  <DecodePanel nid={c.national_id}/>
                </>
              ):(
                <div style={{textAlign:"center",color:C.muted,padding:40}}>لا يوجد مواطنين حالياً</div>
              )}
            </div>

            {/* Action Bar */}
            {c&&(
              <div style={{
                background:"linear-gradient(180deg,rgba(20,10,0,.85),rgba(10,5,0,.9))",
                backdropFilter:"blur(10px)",
                borderTop:"1px solid rgba(184,134,11,.3)",
                padding:"10px 12px",display:"flex",flexDirection:"column",gap:8,
                boxShadow:"0 -4px 20px rgba(0,0,0,.4)",
              }}>
                {missing.length>0&&(
                  <button onClick={()=>setShowReqSheet(true)} style={{padding:"6px 10px",background:C.warn,color:"#fff",border:"none",borderRadius:4,fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>
                    📋 طلب أوراق ناقصة ({missing.length})
                  </button>
                )}
                {canDecide?(
                  <>
                    {/* أزرار القرار الرئيسية */}
                    <div style={{display:"flex",gap:8}}>
                      <motion.button
                        className="btn-approve"
                        whileHover={{scale:1.03,y:-2}} whileTap={{scale:.94}}
                        onClick={()=>handleDecide("APPROVE")}
                        style={{flex:1,padding:"8px 6px",fontWeight:800,fontSize:12,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                          background:"linear-gradient(135deg,#0d4a1f,#1a7a3a,#0d4a1f)",
                          color:"#7fff9a",letterSpacing:.5,textShadow:"0 0 8px rgba(100,255,150,.4)",
                          boxShadow:"inset 0 1px 0 rgba(255,255,255,.1)",
                        }}>
                        <div style={{fontSize:16,marginBottom:1}}>✅</div>
                        <div>قبول</div>
                      </motion.button>

                      <motion.button
                        className="btn-reject"
                        whileHover={{scale:1.03,y:-2}} whileTap={{scale:.94}}
                        onClick={()=>handleDecide("REJECT")}
                        style={{flex:1,padding:"8px 6px",fontWeight:800,fontSize:12,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                          background:"linear-gradient(135deg,#4a0d0d,#8b1a1a,#4a0d0d)",
                          color:"#ffaaaa",letterSpacing:.5,textShadow:"0 0 8px rgba(255,100,100,.4)",
                          boxShadow:"inset 0 1px 0 rgba(255,255,255,.1)",
                        }}>
                        <div style={{fontSize:16,marginBottom:1}}>❌</div>
                        <div>رفض</div>
                      </motion.button>
                    </div>

                    {/* زرار الإبلاغ */}
                    <motion.button
                      className="btn-report"
                      whileHover={{scale:1.02,y:-1}} whileTap={{scale:.96}}
                      onClick={()=>handleDecide("REPORT")}
                      style={{width:"100%",padding:"6px",fontWeight:700,fontSize:11,borderRadius:7,cursor:"pointer",fontFamily:"inherit",
                        background:"linear-gradient(135deg,#3a2000,#7a4500,#3a2000)",
                        color:"#ffd080",letterSpacing:.5,
                        boxShadow:"inset 0 1px 0 rgba(255,255,255,.08)",
                      }}>
                      🚨 إبلاغ الأمن
                    </motion.button>

                    {/* أزرار الرشوة */}
                    {c.has_bribe&&(
                      <div style={{display:"flex",gap:6}}>
                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.96}}
                          onClick={()=>handleDecide("ACCEPT_BRIBE")}
                          style={{flex:1,padding:"7px",fontWeight:700,fontSize:11,border:"1px solid #b8860b",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                            background:"linear-gradient(135deg,#2a1f00,#4a3800)",color:"#f0c040",
                          }}>💰 قبول الرشوة</motion.button>
                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:.96}}
                          onClick={()=>handleDecide("REFUSE_BRIBE")}
                          style={{flex:1,padding:"7px",fontWeight:700,fontSize:11,border:"1px solid rgba(255,255,255,.2)",borderRadius:8,cursor:"pointer",fontFamily:"inherit",
                            background:"linear-gradient(135deg,#111,#222)",color:"#ccc",
                          }}>🧱 رفض الرشوة</motion.button>
                      </div>
                    )}
                  </>
                ):(
                  <div style={{padding:"10px 14px",background:"rgba(30,60,120,.3)",border:"1px solid rgba(100,140,255,.3)",borderRadius:8,fontSize:12,color:"#aac8ff",textAlign:"center",fontWeight:700,backdropFilter:"blur(4px)"}}>
                    {myRoleData?.icon} دورك {myRoleData?.name} — لاحظ وبلّغ موظف الشباك
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {showChat&&!isSolo&&(
            <div style={{borderRight:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{background:C.ink,color:"#f5f0e8",padding:"6px 10px",fontSize:12,fontWeight:700,display:"flex",justifyContent:"space-between"}}>
                <span>💬 الشات</span>
                <button onClick={()=>setShowChat(false)} style={{background:"none",border:"none",color:"#f5f0e8",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <ChatPanel messages={chatMsgs} onSend={sendChat} onAlert={sendAlert} myRole={myRole} C={C}/>
            </div>
          )}
        </div>{/* end zIndex:2 wrapper */}
          </div>{/* end center panel */}

        {/* Role Hint Toast */}
        <AnimatePresence>
          {roleHints.length>0&&(
            <motion.div initial={{x:60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:60,opacity:0}}
              style={{position:"fixed",top:60,left:12,right:12,zIndex:850,display:"flex",flexDirection:"column",gap:5}}>
              {roleHints.map((h,i)=>(
                <div key={i} onClick={()=>setRoleHints([])} style={{background:h.level==="danger"?"#ffe0e0":"#fff3cd",border:`1.5px solid ${h.level==="danger"?"#ff6b6b":"#f0c040"}`,borderRadius:8,padding:"9px 12px",fontSize:12,fontWeight:700,color:h.level==="danger"?"#8b1a1a":"#7a5900",direction:"rtl",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,.15)"}}>
                  {h.message}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Modal */}
        <AnimatePresence>
          {activeDoc&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={e=>e.target===e.currentTarget&&setActiveDoc(null)}
              style={{position:"fixed",inset:0,background:"rgba(26,18,9,.75)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}}>
              <motion.div
                initial={{scale:.85,opacity:0,y:30,rotateX:8}}
                animate={{scale:1,opacity:1,y:0,rotateX:0}}
                exit={{scale:.88,opacity:0,y:20,rotateX:-4}}
                transition={{type:"spring",damping:22,stiffness:300}}
                style={{background:C.paper,borderRadius:12,overflow:"hidden",width:"100%",maxWidth:460,maxHeight:"90vh",display:"flex",flexDirection:"column",
                  boxShadow:"0 24px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.1)",
                  transformOrigin:"center top",
                }}>
                <div style={{background:C.ink,color:"#f5f0e8",padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700}}>📄 {activeDoc.name==="id_card"?"البطاقة الوطنية":activeDoc.name==="request_form"?"استمارة الطلب":activeDoc.name}</span>
                  <button onClick={()=>setActiveDoc(null)} style={{background:"none",border:"none",color:"#f5f0e8",fontSize:20,cursor:"pointer"}}>✕</button>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:16}}>
                  <DocRenderer docName={activeDoc.name} citizen={c||currentCitizen} content={activeDoc.content}/>
                </div>
                <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`}}>
                  <button onClick={()=>setActiveDoc(null)} style={{width:"100%",padding:"9px",fontWeight:700,fontSize:13,border:"none",borderRadius:4,cursor:"pointer",background:C.ink,color:"#f5f0e8",fontFamily:"inherit"}}>إغلاق</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Request Sheet */}
        <AnimatePresence>
          {showReqSheet&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={e=>e.target===e.currentTarget&&setShowReqSheet(false)}
              style={{position:"fixed",inset:0,background:"rgba(26,18,9,.6)",zIndex:800,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
              <motion.div initial={{y:300}} animate={{y:0}} exit={{y:300}} transition={{type:"spring",damping:25,stiffness:300}}
                style={{background:C.paper,borderRadius:"14px 14px 0 0",width:"100%",maxWidth:480,padding:18,boxShadow:"0 -4px 20px rgba(0,0,0,.3)"}}>
                <h3 style={{fontSize:14,margin:"0 0 10px",direction:"rtl"}}>📋 اختار الأوراق الناقصة</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
                  {missing.map(d=>{const sel=selMissing.has(d);return(
                    <button key={d} onClick={()=>{const n=new Set(selMissing);sel?n.delete(d):n.add(d);setSelMissing(n)}} style={{padding:"7px 11px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${sel?C.warn:C.border}`,background:sel?C.warn:"#fff",color:sel?"#fff":C.ink,fontWeight:sel?700:400}}>
                      {d} <span style={{opacity:.7,fontSize:10}}>({DOC_DAYS[d]||1}د)</span>
                    </button>
                  )})}
                </div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{selMissing.size>0?`يرجع بعد ~${totalRetDays} يوم`:"اختار الأوراق"}</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowReqSheet(false)} style={{flex:1,padding:10,fontWeight:700,fontSize:13,border:`1px solid ${C.border}`,borderRadius:4,cursor:"pointer",fontFamily:"inherit",background:C.paper2}}>إلغاء</button>
                  <button onClick={reqPapers} disabled={selMissing.size===0} style={{flex:1,padding:10,fontWeight:700,fontSize:13,border:"none",borderRadius:4,cursor:selMissing.size===0?"not-allowed":"pointer",fontFamily:"inherit",background:selMissing.size===0?"#ccc":C.stampR,color:"#fff"}}>يمشي يجيبهم</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Reason Modal */}
        <AnimatePresence>
          {showRejectModal&&(
            <RejectReasonModal
              onConfirm={confirmReject}
              onCancel={()=>setShowRejectModal(false)}
              selected={selectedReasons}
              setSelected={setSelectedReasons}
              citizen={currentCitizen}
              C={C}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>{stampType&&<StampOverlay type={stampType} onDone={onStampDone}/>}</AnimatePresence>

        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial&&(
            <TutorialModal onClose={()=>{setShowTutorial(false);localStorage.setItem("civil_tutorial_done","1")}} C={C}/>
          )}
        </AnimatePresence>

        {/* Result Modal */}
        <AnimatePresence>
          {resultData&&!stampType&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{position:"fixed",inset:0,background:"rgba(26,18,9,.7)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
              <motion.div
                initial={{scale:.75,opacity:0,y:30}}
                animate={{scale:1,opacity:1,y:0}}
                exit={{scale:.85,opacity:0,y:20}}
                transition={{type:"spring",damping:18,stiffness:300}}
                style={{
                  background:resultData.correct
                    ?"linear-gradient(135deg,rgba(5,30,15,.96),rgba(10,50,25,.98))"
                    :"linear-gradient(135deg,rgba(30,5,5,.96),rgba(50,10,10,.98))",
                  backdropFilter:"blur(20px)",
                  border:`1.5px solid ${resultData.correct?"rgba(50,200,100,.3)":"rgba(200,50,50,.3)"}`,
                  borderRadius:20,padding:"28px 24px",maxWidth:380,width:"100%",textAlign:"center",
                  boxShadow:`0 24px 64px rgba(0,0,0,.7), 0 0 40px ${resultData.correct?"rgba(50,200,100,.1)":"rgba(200,50,50,.1)"}`,
                }}>
                {/* أيقونة كبيرة */}
                <motion.div
                  initial={{scale:0,rotate:-20}}
                  animate={{scale:1,rotate:0}}
                  transition={{type:"spring",damping:12,stiffness:400,delay:.1}}
                  style={{fontSize:64,marginBottom:12,filter:`drop-shadow(0 0 20px ${resultData.correct?"rgba(50,255,100,.5)":"rgba(255,50,50,.5)"})`}}
                >
                  {resultData.correct?"✅":"❌"}
                </motion.div>

                {/* الرسالة */}
                <div style={{fontSize:15,fontWeight:700,marginBottom:10,color:"#f5f0e8",lineHeight:1.5}}>
                  {resultData.message}
                </div>

                {/* النقاط */}
                <motion.div
                  initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.2}}
                  style={{
                    display:"inline-flex",alignItems:"center",gap:8,
                    background:"rgba(255,255,255,.08)",borderRadius:30,
                    padding:"8px 20px",marginBottom:14,
                  }}
                >
                  <span style={{
                    fontWeight:900,fontSize:22,fontFamily:"monospace",
                    color:resultData.pointsDelta>0?"#6eff9a":"#ff6666",
                    textShadow:`0 0 12px ${resultData.pointsDelta>0?"rgba(100,255,150,.6)":"rgba(255,100,100,.6)"}`,
                  }}>
                    {resultData.pointsDelta>0?`+${resultData.pointsDelta}`:resultData.pointsDelta}
                  </span>
                  <span style={{color:"rgba(255,255,255,.4)",fontSize:12}}>|</span>
                  <span style={{color:"rgba(255,255,255,.6)",fontSize:12}}>إجمالي: <strong style={{color:"#f0c040"}}>{resultData.newTeamScore}</strong></span>
                </motion.div>

                {/* تفاصيل إضافية */}
                {resultData.secret?.isForged&&(
                  <div style={{fontSize:12,color:"#ffaaaa",background:"rgba(255,50,50,.1)",border:"1px solid rgba(255,80,80,.2)",borderRadius:8,padding:"6px 12px",marginBottom:8}}>
                    🔍 التزوير: {formatForge(resultData.secret.forgeReason)}
                  </div>
                )}
                {resultData.secret?.isWanted&&!resultData.correct&&(
                  <div style={{fontSize:12,color:"#ffd080",background:"rgba(255,160,0,.1)",border:"1px solid rgba(255,160,0,.2)",borderRadius:8,padding:"6px 12px",marginBottom:8}}>
                    🚨 كان مطلوب! التهمة: {resultData.secret.wantedData?.crime}
                  </div>
                )}

                {/* زرار التالي */}
                <motion.button
                  whileHover={{scale:1.02,y:-2}} whileTap={{scale:.97}}
                  onClick={()=>{setResultData(null);if(pendingSummary){setSummary(pendingSummary);setPendingSummary(null);setScreen("end")}}}
                  style={{
                    width:"100%",padding:"12px",fontWeight:800,fontSize:14,border:"none",
                    borderRadius:10,cursor:"pointer",fontFamily:"inherit",
                    background:pendingSummary
                      ?"linear-gradient(135deg,#1a3a6b,#2a5a9b)"
                      :"linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.06))",
                    color:"#f5f0e8",letterSpacing:.5,
                    boxShadow:"0 4px 12px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.1)",
                    border:"1px solid rgba(255,255,255,.15)",
                  }}>
                  {pendingSummary?"📊 عرض ملخص اليوم":"التالي ▶"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ══ END ══════════════════════════════════════════════════════════════════════
  if(screen==="end"&&summary) return (
    <>
      <DailyReport summary={summary} onNextDay={nextDay} onShowLB={()=>{fetchLB();setShowLB(true)}} onHome={()=>{setScreen("lobby");setSoloState(null);setGameState(null);setIsSolo(false);setSummary(null)}} C={C}/>
      <AnimatePresence>{showLB&&<LeaderboardScreen data={lbData} onClose={()=>setShowLB(false)} C={C}/>}</AnimatePresence>
    </>
  )

  return null
}