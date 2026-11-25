// courtGame.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import CourtMenu from "./courtMenu";
import CourtCaseFile from "./courtCaseFile";
import CourtTeamChat from "./courtTeamChat";
import CourtVoting from "./courtVoting";
import CourtVerdict from "./courtVerdict";
import CourtResults from "./courtResults";
import CourtWitnessModal from "./courtWitnessModal";
import CourtWitnessCard from "./courtWitnessCard";
import CourtAvatarPicker from "./courtAvatarPicker";
import CourtPlayerAvatarRow from "./courtPlayerAvatarRow";
import CourtTitleCard from "./courtTitleCard";
import CourtTitlesScreen from "./courtTitlesScreen";
import { getCourtSounds } from "./courtSounds";
import CourtTrialRecord from "./courtTrialRecord";
import CourtStats from "./courtStats";
import CourtEvidenceModal from "./courtEvidenceModal";
import CourtEvidenceCard from "./courtEvidenceCard";
// import CourtTitlesScreen from "./courtTitlesScreen";
import "./courtStyles.css";

// ══════════════════════════════════════════════
// Court Sound Paths
// ══════════════════════════════════════════════
const COURT_SOUND_PATHS = {
  click:              "/court/sounds/click.mp3",
  hover:              "/court/sounds/hover.mp3",
  success:            "/court/sounds/success.mp3",
  error:              "/court/sounds/error.mp3",
  notification:       "/court/sounds/notification.mp3",
  gavel:              "/court/sounds/gavel.mp3",
  gavelDouble:        "/court/sounds/gavel_double.mp3",
  gavelTriple:        "/court/sounds/gavel_triple.mp3",
  objection:          "/court/sounds/objection.mp3",
  witnessSummon:      "/court/sounds/witness_summon.mp3",
  verdictGuilty:      "/court/sounds/verdict_guilty.mp3",
  verdictNotGuilty:   "/court/sounds/verdict_not_guilty.mp3",
  phaseChange:        "/court/sounds/phase_change.mp3",
  timerTick:          "/court/sounds/timer_tick.mp3",
  timerDanger:        "/court/sounds/timer_danger.mp3",
  cardFlip:           "/court/sounds/card_flip.mp3",
  voteCast:           "/court/sounds/vote_cast.mp3",
  win:                "/court/sounds/win.mp3",
  lose:               "/court/sounds/lose.mp3",
  titleReveal:        "/court/sounds/title_reveal.mp3",
  caseOpen:           "/court/sounds/case_open.mp3",
  caseClose:          "/court/sounds/case_close.mp3",
  avatarSelect:       "/court/sounds/avatar_select.mp3",
};

const PHASE = {
  WAITING: "waiting",
  BRIEFING: "briefing",
  TRIAL: "trial",
  VOTING: "voting",
  VERDICT: "verdict",
  DEBRIEF: "debrief",
};

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

const TEAM_LABELS = {
  court:   { ar: "فريق المحكمة",   icon: "⚖️" },
  defense: { ar: "فريق الدفاع",    icon: "🛡️" },
};

function AdminBackButton({ isAdmin, onExit }) {
  if (!isAdmin || !onExit) return null;
  return (
    <button
      className="court-btn court-btn-ghost court-btn-sm"
      onClick={onExit}
      title="رجوع لاختيار الفئات"
    >
      ← رجوع للفئات
    </button>
  );
}

export default function CourtGame({
  socket,
  roomCode,
  playerId,
  playerName,
  isAdmin,
  players: mainPlayers,
  onExit,
}) {
  const [phase, setPhase] = useState(PHASE.WAITING);
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState(null);
  const [myFile, setMyFile] = useState(null);
  const [caseInfo, setCaseInfo] = useState(null);
  const [cases, setCases] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState([]);
  const [allRoles, setAllRoles] = useState({});

  const [timer, setTimer] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(1);

  const [votes, setVotes] = useState({});
  const [verdict, setVerdict] = useState(null);
  const [debrief, setDebrief] = useState(null);

  const [showCaseFile, setShowCaseFile] = useState(false);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // ✅ نظام الشهود
  const [witnessCards, setWitnessCards] = useState(null);
  const [usedWitnesses, setUsedWitnesses] = useState([]);
  const [summonsLeft, setSummonsLeft] = useState({ prosecution: 2, defense: 2 });
  const [witnessLog, setWitnessLog] = useState([]);
  const [showWitnessModal, setShowWitnessModal] = useState(false);
  const [activeWitness, setActiveWitness] = useState(null);
  const [trialLog, setTrialLog] = useState([]);
  const [showTrialRecord, setShowTrialRecord] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [viewMode, setViewMode] = useState("journal"); // journal | titles | stats

  const [soundMuted, setSoundMuted] = useState(false);
  const soundRef = useRef(null);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [myAvatar, setMyAvatar] = useState(null);
  const [myDisplayName, setMyDisplayName] = useState(playerName || "");
  const [caseFileJustClosed, setCaseFileJustClosed] = useState(false);

  const [evidenceCards, setEvidenceCards] = useState(null);
  const [usedEvidence, setUsedEvidence] = useState([]);
  const [evidenceLeft, setEvidenceLeft] = useState({ prosecution: 2, defense: 2 });
  const [evidenceLog, setEvidenceLog] = useState([]);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null);


  // ✅ Sound Engine Setup
  useEffect(() => {
    soundRef.current = getCourtSounds();
    soundRef.current.loadSounds(COURT_SOUND_PATHS);
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setEnabled(!soundMuted);
    }
  }, [soundMuted]);

  const playSound = useCallback((name) => {
    soundRef.current?.play(name);
}, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("court_join", { roomCode, playerId, playerName });
    socket.emit("court_get_cases");

    const onJoined = (d) => {
      setCaseInfo(d.caseInfo);
      setIsHost(d.isHost);
      setPlayers(d.players || []);
    };

    const onCasesList = ({ cases: c }) => setCases(c);

    const onPlayerJoined = ({ playerId: pid, playerName: pn }) => {
      setPlayers(prev =>
        prev.find(p => p.id === pid) ? prev : [...prev, { id: pid, name: pn }]
      );
    };

    const onPlayerLeft = ({ playerId: pid }) => {
      setPlayers(prev => prev.filter(p => p.id !== pid));
    };

    const onPhaseChanged = ({ phase: p }) => {
      setPhase(p);
      playSound("phaseChange");
      if (p !== PHASE.BRIEFING) setShowCaseFile(false);
      if (p === PHASE.TRIAL) setShowCaseFile(false);
    };

    const onRoleAssigned = (data) => {
      setRole(data.role);
      setTeam(data.team);
      setMyFile(data);
      setAllRoles(data.allRoles || {});
      if (data.role) {
        setShowCaseFile(true);
        setCaseFileJustClosed(false);
        playSound("caseOpen");
      }
    };

    

    const onTimerUpdate = ({ seconds }) => setTimer(seconds);

    const onReadyUpdate = ({ readyCount: rc, totalPlayers: tp }) => {
      setReadyCount(rc);
      setTotalPlayers(tp);
    };

    const onVoteCast = ({ playerId: pid }) => {
      setVotes(prev => ({ ...prev, [pid]: true }));
      playSound("voteCast");
    };

    const onVerdictAnnounced = ({ verdict: v }) => {
      setVerdict(v);
      setPhase(PHASE.VERDICT);
      playSound(v === "guilty" ? "verdictGuilty" : "verdictNotGuilty");
    };

    const onDebrief = (d) => {
      setDebrief(d);
      setStatsData(d.stats || null);
      setPhase(PHASE.DEBRIEF);
      setViewMode("journal");
      playSound("win");
    };

    const onRestarted = () => {
      setPhase(PHASE.WAITING);
      setRole(null);
      setTeam(null);
      setMyFile(null);
      setAllRoles({});
      setVotes({});
      setVerdict(null);
      setDebrief(null);
      setReadyCount(0);
      setShowCaseFile(false);
      setShowTeamChat(false);
      setUnreadMessages(0);
      setUsedWitnesses([]);
      setSummonsLeft({ prosecution: 2, defense: 2 });
      setWitnessLog([]);
      setTrialLog([]);
      setStatsData(null);
      setViewMode("journal");
      setShowTrialRecord(false);
      setActiveWitness(null);
      setShowWitnessModal(false);
      setUsedEvidence([]);
      setEvidenceLeft({ prosecution: 2, defense: 2 });
      setEvidenceLog([]);
      setActiveEvidence(null);
      setShowEvidenceModal(false);
    };

    const onCaseChanged = ({ caseInfo: ci }) => setCaseInfo(ci);

    const onTeamMessage = () => {
      if (!showTeamChat) setUnreadMessages(c => c + 1);
    };

    const onError = (err) => console.warn("[Court]", err?.message || err);

    // ✅ نظام الشهود
    const onWitnessState = (data) => {
      setWitnessCards(data.witnessCards);
      setUsedWitnesses(data.usedWitnesses || []);
      setSummonsLeft(data.summonsLeft || { prosecution: 2, defense: 2 });
      setWitnessLog(data.witnessLog || []);
    };

    const onWitnessSummoned = ({ witness, side, witnessLog: log }) => {
      setActiveWitness(witness);
      setWitnessLog(log || []);
      playSound("witnessSummon");
    };

    const onWitnessUpdate = (data) => {
      setUsedWitnesses(data.usedWitnesses || []);
      setSummonsLeft(data.summonsLeft || { prosecution: 2, defense: 2 });
      setWitnessLog(data.witnessLog || []);
    };

    const onTrialLogUpdate = (data) => {
      setTrialLog(data.trialLog || []);
    };

    // ✅ Evidence listeners
    const onEvidenceState = (data) => {
      setEvidenceCards(data.evidenceCards);
      setUsedEvidence(data.usedEvidence || []);
      setEvidenceLeft(data.evidenceLeft || { prosecution: 2, defense: 2 });
      setEvidenceLog(data.evidenceLog || []);
    };

    const onEvidencePresented = ({ evidence, side, evidenceLog: log }) => {
      setActiveEvidence(evidence);
      setEvidenceLog(log || []);
      playSound("cardFlip");
    };

    const onEvidenceUpdate = (data) => {
      setUsedEvidence(data.usedEvidence || []);
      setEvidenceLeft(data.evidenceLeft || { prosecution: 2, defense: 2 });
      setEvidenceLog(data.evidenceLog || []);
    };

    const onPlayersUpdated = ({ players: updated }) => {
      setPlayers(updated);
      const me = updated.find(p => p.id === playerId);
      if (me?.avatar) setMyAvatar(me.avatar);
      if (me?.name) setMyDisplayName(me.name);
    };



    socket.on("court_joined", onJoined);
    socket.on("court_cases_list", onCasesList);
    socket.on("court_player_joined", onPlayerJoined);
    socket.on("court_player_left", onPlayerLeft);
    socket.on("court_phase_changed", onPhaseChanged);
    socket.on("court_role_assigned", onRoleAssigned);
    socket.on("court_timer_update", onTimerUpdate);
    socket.on("court_ready_update", onReadyUpdate);
    socket.on("court_vote_cast", onVoteCast);
    socket.on("court_verdict_announced", onVerdictAnnounced);
    socket.on("court_debrief", onDebrief);
    socket.on("court_restarted", onRestarted);
    socket.on("court_case_changed", onCaseChanged);
    socket.on("court_team_message", onTeamMessage);
    socket.on("court_error", onError);
    socket.on("court_witness_state", onWitnessState);
    socket.on("court_witness_summoned", onWitnessSummoned);
    socket.on("court_witness_update", onWitnessUpdate);
    socket.on("court_trial_log_update", onTrialLogUpdate);
    socket.on("court_evidence_state", onEvidenceState);
    socket.on("court_evidence_presented", onEvidencePresented);
    socket.on("court_evidence_update", onEvidenceUpdate);
    socket.on("court_players_updated", onPlayersUpdated);

    return () => {
      [
        "court_joined", "court_cases_list", "court_player_joined",
        "court_player_left", "court_phase_changed", "court_role_assigned",
        "court_timer_update", "court_ready_update", "court_vote_cast",
        "court_verdict_announced", "court_debrief", "court_restarted",
        "court_case_changed", "court_team_message", "court_error",
        "court_witness_state", "court_witness_summoned", "court_witness_update",
        "court_players_updated", "court_trial_log_update", "court_evidence_state", "court_evidence_presented", "court_evidence_update",
      ].forEach(ev => socket.off(ev));
      socket.emit("court_leave", { roomCode, playerId });
    };
    // eslint-disable-next-line
  }, [socket, roomCode, playerId, playerName]);

  // ✅ فتح الـ picker تلقائي بعد ما اللاعب يقفل ملف القضية
  useEffect(() => {
    if (phase !== PHASE.BRIEFING) return;
    if (!caseFileJustClosed) return;
    if (myAvatar) return; // عنده أفاتار بالفعل
    setShowAvatarPicker(true);
    setCaseFileJustClosed(false);
  }, [phase, caseFileJustClosed, myAvatar]);

  const startGame = useCallback(() => {
    soundRef.current?.unlock();
    playSound("gavel");
    socket.emit("court_start_game", { roomCode, playerId });
  }, [socket, roomCode, playerId, playSound]);

  const markReady = useCallback(() => {
    playSound("success");
    socket.emit("court_player_ready", { roomCode, playerId });
  }, [socket, roomCode, playerId, playSound]);

  const endTrial = useCallback(() => {
    playSound("gavelTriple");
    socket.emit("court_end_trial", { roomCode, playerId });
  }, [socket, roomCode, playerId, playSound]);

  const submitVote = useCallback((verdictId) => {
    playSound("voteCast");
    socket.emit("court_vote", { roomCode, playerId, verdict: verdictId });
  }, [socket, roomCode, playerId, playSound]);

  const restart = useCallback(() => {
    setViewMode("journal");
    socket.emit("court_restart", { roomCode, playerId });
  }, [socket, roomCode, playerId]);

  const changeCase = useCallback((caseId) => {
    socket.emit("court_change_case", { roomCode, playerId, caseId });
  }, [socket, roomCode, playerId]);

  const openTeamChat = useCallback(() => {
    setShowTeamChat(true);
    setUnreadMessages(0);
  }, []);

  const closeTeamChat = useCallback(() => {
    setShowTeamChat(false);
  }, []);

  const summonWitness = useCallback((witnessId, side) => {
    socket.emit("court_summon_witness", {
      roomCode,
      playerId,
      witnessId,
      side,
    });
    setShowWitnessModal(false);
  }, [socket, roomCode, playerId]);

  const presentEvidence = useCallback((evidenceId, side) => {
    socket.emit("court_present_evidence", {
      roomCode,
      playerId,
      evidenceId,
      side,
    });
    setShowEvidenceModal(false);
  }, [socket, roomCode, playerId]);

  const confirmAvatar = useCallback(({ avatar, displayName }) => {
    socket.emit("court_set_avatar", {
      roomCode,
      playerId,
      avatar,
      displayName,
    });
    setMyAvatar(avatar);
    setMyDisplayName(displayName);
    setShowAvatarPicker(false);
  }, [socket, roomCode, playerId]);

  const roleInfo = role ? ROLE_LABELS[role] : null;
  const teamInfo = team ? TEAM_LABELS[team] : null;

  // ─── WAITING ───
  if (phase === PHASE.WAITING) {
    return (
      <CourtMenu
        roomCode={roomCode}
        playerId={playerId}
        playerName={playerName}
        players={players}
        isHost={isHost}
        caseInfo={caseInfo}
        cases={cases}
        onChangeCase={changeCase}
        onStart={startGame}
        onExit={onExit}
      />
    );
  }

  // ─── BRIEFING ───
  if (phase === PHASE.BRIEFING) {
    const me = players.find(p => p.id === playerId);
    const hasAvatar = !!(me?.avatar || myAvatar);

    return (
      <div className="court-screen taboo-scroll" dir="rtl">
        <header className="court-header">
          <div className="court-header-left">
            <span className="court-icon">📜</span>
            <div>
              <h1 className="court-title">مرحلة القراءة</h1>
              {caseInfo && <p className="court-subtitle">{caseInfo.title}</p>}
            </div>
          </div>
          <div className="court-header-right">
            {roleInfo && (
              <span
                className="court-role-badge"
                style={{
                  background: roleInfo.color + "22",
                  borderColor: roleInfo.color,
                  color: roleInfo.color,
                }}
              >
                {roleInfo.icon} {roleInfo.ar}
              </span>
            )}
            <CourtTimer seconds={timer} max={240} />
            <button
              className="court-sound-toggle"
              onClick={() => setSoundMuted(m => !m)}
              title={soundMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
            <AdminBackButton isAdmin={isAdmin} onExit={onExit} />
          </div>
        </header>

        <div className="court-briefing-body">
          <div className="court-briefing-card">
            <div className="court-briefing-icon">📁</div>
            <h2>افتح ملف القضية لقراءة التفاصيل</h2>
            <p>
              {role === "accused"
                ? "هذا الملف يحتوي على الحقيقة الكاملة وما يجب أن تقوله."
                : role === "defense"
                ? "هذا الملف يحتوي على نقاط الدفاع وما قاله لك موكّلك."
                : role === "prosecution"
                ? "هذا الملف يحتوي على نظرية الاتهام والأدلة."
                : role === "jury"
                ? "هذا الملف يحتوي على ملخص مختصر للقضية."
                : "هذا الملف يحتوي على الوقائع والأدلة المتاحة."}
            </p>
            <button
              className="court-btn court-btn-gold"
              onClick={() => setShowCaseFile(true)}
            >
              📄 فتح ملف القضية
            </button>
          </div>

          <div className="court-briefing-ready">
            <div className="court-ready-count">
              <span>{readyCount}</span>
              <span className="court-ready-total">/ {totalPlayers}</span>
            </div>
            <p>لاعبين جاهزين</p>

            {/* زر اختيار الصورة */}
            {hasAvatar && (
              <button
                className="court-btn court-btn-ghost court-btn-sm court-briefing-avatar-btn"
                onClick={() => setShowAvatarPicker(true)}
              >
                🎭 تغيير صورتك
              </button>
            )}

            {/* زر "أنا جاهز" — معطل لو مفيش أفاتار */}
            <button
              className="court-btn court-btn-green"
              onClick={markReady}
              disabled={!hasAvatar}
            >
              {hasAvatar ? "✅ أنا جاهز" : "🎭 اختر صورتك أولاً"}
            </button>
          </div>
        </div>

        {showCaseFile && myFile && (
          <CourtCaseFile
            file={myFile}
            role={role}
            caseInfo={caseInfo}
            onClose={() => {
              setShowCaseFile(false);
              setCaseFileJustClosed(true);
            }}
          />
        )}

        {/* مودال اختيار الأفاتار */}
        {showAvatarPicker && (
          <CourtAvatarPicker
            playerId={playerId}
            currentName={myDisplayName}
            currentAvatar={myAvatar}
            takenAvatars={players
              .filter(p => p.id !== playerId && p.avatar)
              .map(p => p.avatar)}
            onConfirm={confirmAvatar}
            isMandatory={!hasAvatar}
          />
        )}
      </div>
    );
  }

  // ─── TRIAL ───
  if (phase === PHASE.TRIAL) {
    const totalSummons = summonsLeft.prosecution + summonsLeft.defense;
    const canSummon = totalSummons > 0;

    return (
      <div className="court-screen taboo-scroll" dir="rtl">
        <header className="court-header ">
          <div className="court-header-left ">
            <span className="court-icon">⚖️</span>
            <div>
              <h1 className="court-title">الجلسة جارية</h1>
              {caseInfo && <p className="court-subtitle">{caseInfo.title}</p>}
            </div>
          </div>
          <div className="court-header-right">
            {roleInfo && (
              <span
                className="court-role-badge"
                style={{
                  background: roleInfo.color + "22",
                  borderColor: roleInfo.color,
                  color: roleInfo.color,
                }}
              >
                {roleInfo.icon} {roleInfo.ar}
              </span>
            )}
            {teamInfo && (
              <span className="court-team-badge">
                {teamInfo.icon} {teamInfo.ar}
              </span>
            )}
            <button
              className="court-sound-toggle"
              onClick={() => setSoundMuted(m => !m)}
              title={soundMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
            <AdminBackButton isAdmin={isAdmin} onExit={onExit} />
          </div>
        </header>

        {/* ✅ صف صور اللعيبة */}
        <CourtPlayerAvatarRow
          players={players}
          allRoles={allRoles}
          playerId={playerId}
        />

        <div className="court-trial-body">
          <div className="court-trial-main">
            <div className="court-trial-illustration">
              <div className="court-gavel">🔨</div>
              <h2>المرافعة جارية</h2>
                <p className="court-trial-hint">
                  {role === "judge"
                    ? "استمع للطرفين، واستدع الشهود عند الحاجة."
                    : role === "prosecution"
                    ? "اعرض قضيتك، واطلب من القاضي استدعاء شهودك."
                    : role === "defense"
                    ? "دافع عن موكلك، واطلب من القاضي استدعاء شهودك."
                    : role === "accused"
                    ? (myFile?.isSelfDefending
                        ? "أنت المتهم وتدافع عن نفسك. استخدم ملف الدفاع واطلب من القاضي استدعاء شهودك."
                        : "التزم بروايتك ولا تنهار.")
                    : "استمع جيداً ثم صوّت."}
                </p>

              <div className="court-trial-actions">
                <button
                  className="court-btn court-btn-gold"
                  onClick={() => setShowCaseFile(true)}
                >
                  📄 راجع الملف
                </button>

                <button
                  className="court-btn court-btn-ghost"
                  onClick={() => setShowTrialRecord(true)}
                >
                  📜 سجل الجلسة
                  {trialLog.length > 0 && (
                    <span className="court-trial-record-badge">{trialLog.length}</span>
                  )}
                </button>

                {(team === "court" || team === "defense") && (
                  <button
                    className="court-btn court-btn-blue"
                    onClick={openTeamChat}
                  >
                    💬 شات الفريق
                    {unreadMessages > 0 && (
                      <span className="court-unread-badge">{unreadMessages}</span>
                    )}
                  </button>
                )}

                {role === "judge" && (
                  <button
                    className="court-btn court-btn-gold"
                    onClick={() => setShowWitnessModal(true)}
                    disabled={!canSummon || !witnessCards}
                  >
                    📣 استدعاء شاهد
                    <span className="court-summons-badge">{totalSummons}</span>
                  </button>
                )}

                {role === "judge" && (
                  <button
                    className="court-btn court-btn-gold"
                    onClick={() => setShowEvidenceModal(true)}
                    disabled={
                      (evidenceLeft.prosecution + evidenceLeft.defense) === 0 || !evidenceCards
                    }
                  >
                    🔍 تقديم دليل
                    <span className="court-summons-badge">
                      {evidenceLeft.prosecution + evidenceLeft.defense}
                    </span>
                  </button>
                )}

                {role === "judge" && (
                  <button
                    className="court-btn court-btn-red"
                    onClick={endTrial}
                  >
                    🔨 إنهاء المرافعة والتصويت
                  </button>
                )}
              </div>
            </div>

            {/* سجل الاستدعاءات */}
            {witnessLog.length > 0 && (
              <div className="court-witness-log">
                <h3 className="court-witness-log-title">📋 سجل الاستدعاءات</h3>
                <ul className="court-witness-log-list">
                  {witnessLog.map((entry, i) => (
                    <li key={i} className="court-witness-log-item">
                      <span className="court-witness-log-icon">📣</span>
                      <span className="court-witness-log-text">
                        القاضي استدعى
                      </span>
                      <strong className="court-witness-log-name">
                        {entry.name}
                      </strong>
                      <span
                        className={`court-witness-log-side court-witness-log-side-${entry.side}`}
                      >
                        ({entry.side === "prosecution" ? "نيابة" : "دفاع"})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="court-trial-sidebar">
            <h3>اللاعبون</h3>
            <div className="court-players-list">
              {players.map(p => {
                const pRole = allRoles[p.id]?.role;
                const pInfo = ROLE_LABELS[pRole];
                return (
                  <div key={p.id} className="court-player-row">
                    <span
                      className="court-player-dot"
                      style={{ background: pInfo?.color || "#666" }}
                    />
                    <span className="court-player-name">
                      {p.name}
                      {p.id === playerId ? " (أنت)" : ""}
                    </span>
                    {pInfo && (
                      <span className="court-player-role">
                        {pInfo.icon} {pInfo.ar}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* فرص الاستدعاء */}
            <div className="court-summons-status">
              <h4 className="court-summons-status-title">🎤 الاستدعاءات</h4>
              <div className="court-summons-row">
                <span className="court-summons-row-side">📋 النيابة:</span>
                <span className="court-summons-row-count">
                  {summonsLeft.prosecution} / 2
                </span>
              </div>
              <div className="court-summons-row">
                <span className="court-summons-row-side">🛡️ الدفاع:</span>
                <span className="court-summons-row-count">
                  {summonsLeft.defense} / 2
                </span>
              </div>
            </div>

            <div className="court-summons-status">
              <h4 className="court-summons-status-title">🔍 الأدلة</h4>
              <div className="court-summons-row">
                <span className="court-summons-row-side">📋 النيابة:</span>
                <span className="court-summons-row-count">
                  {evidenceLeft.prosecution} / {evidenceCards ? Object.keys(evidenceCards.prosecution || {}).length : 0}
                </span>
              </div>
              <div className="court-summons-row">
                <span className="court-summons-row-side">🛡️ الدفاع:</span>
                <span className="court-summons-row-count">
                  {evidenceLeft.defense} / {evidenceCards ? Object.keys(evidenceCards.defense || {}).length : 0}
                </span>
              </div>
            </div>
          </aside>
        </div>

        {showCaseFile && myFile && (
          <CourtCaseFile
            file={myFile}
            role={role}
            caseInfo={caseInfo}
            onClose={() => {
              setShowCaseFile(false);
              setCaseFileJustClosed(true);
            }}
          />
        )}

        {showTeamChat && (
          <CourtTeamChat
            socket={socket}
            roomCode={roomCode}
            playerId={playerId}
            team={team}
            role={role}
            players={players}
            onClose={closeTeamChat}
          />
        )}

        {/* ✅ مودال استدعاء الشهود */}
        {showWitnessModal && witnessCards && (
          <CourtWitnessModal
            witnesses={witnessCards}
            usedWitnesses={usedWitnesses}
            summonsLeft={summonsLeft}
            onSummon={summonWitness}
            onClose={() => setShowWitnessModal(false)}
          />
        )}

        {/* ✅ كارت الشاهد */}
        {activeWitness && (
          <CourtWitnessCard
            witness={activeWitness}
            onClose={() => setActiveWitness(null)}
          />
        )}

        {showTrialRecord && (
          <CourtTrialRecord
            trialLog={trialLog}
            onClose={() => setShowTrialRecord(false)}
          />
        )}

        {showEvidenceModal && evidenceCards && (
          <CourtEvidenceModal
            evidence={evidenceCards}
            usedEvidence={usedEvidence}
            evidenceLeft={evidenceLeft}
            onPresent={presentEvidence}
            onClose={() => setShowEvidenceModal(false)}
          />
        )}

        {activeEvidence && (
          <CourtEvidenceCard
            evidence={activeEvidence}
            onClose={() => setActiveEvidence(null)}
          />
        )}
      </div>
    );
  }

  // ─── VOTING ───
  if (phase === PHASE.VOTING) {
    return (
      <div className="court-screen taboo-scroll">
        <header className="court-header">
          <div className="court-header-left">
            <span className="court-icon">🗳️</span>
            <div>
              <h1 className="court-title">التصويت</h1>
              {caseInfo && <p className="court-subtitle">{caseInfo.title}</p>}
            </div>
          </div>
          <div className="court-header-right">
            {roleInfo && (
              <span
                className="court-role-badge"
                style={{
                  background: roleInfo.color + "22",
                  borderColor: roleInfo.color,
                  color: roleInfo.color,
                }}
              >
                {roleInfo.icon} {roleInfo.ar}
              </span>
            )}

            <button
              className="court-sound-toggle"
              onClick={() => setSoundMuted(m => !m)}
              title={soundMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>

            <AdminBackButton isAdmin={isAdmin} onExit={onExit} />
          </div>
        </header>

        <CourtVoting
          role={role}
          votes={votes}
          players={players}
          playerId={playerId}
          timer={timer}
          onSubmit={submitVote}
        />
      </div>
    );
  }

  // ─── VERDICT ───
  if (phase === PHASE.VERDICT) {
    return (
      <div className="court-screen taboo-scroll">
        <header className="court-header">
          <div className="court-header-left">
            <span className="court-icon">🔨</span>
            <div>
              <h1 className="court-title">إعلان الحكم</h1>
            </div>
          </div>
          <div className="court-header-right">

            <button
              className="court-sound-toggle"
              onClick={() => setSoundMuted(m => !m)}
              title={soundMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>

            <AdminBackButton isAdmin={isAdmin} onExit={onExit} />
          </div>
        </header>

        <CourtVerdict verdict={verdict} />
      </div>
    );
  }

  // ─── DEBRIEF ───
  if (phase === PHASE.DEBRIEF && debrief) {
    return (
      <div className="court-screen">
        <header className="court-header">
          <div className="court-header-left">
            <span className="court-icon">
              {viewMode === "journal" && "📰"}
              {viewMode === "titles" && "🏆"}
              {viewMode === "stats" && "📊"}
            </span>
            <div>
              <h1 className="court-title">
                {viewMode === "journal" && "النتائج النهائية"}
                {viewMode === "titles" && "الألقاب"}
                {viewMode === "stats" && "الإحصائيات"}
              </h1>
            </div>
          </div>
          <div className="court-header-right">
            <button
              className="court-sound-toggle"
              onClick={() => setSoundMuted(m => !m)}
              title={soundMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
            <AdminBackButton isAdmin={isAdmin} onExit={onExit} />
          </div>
        </header>

        {/* ✅ Journal View */}
        {viewMode === "journal" && (
          <CourtResults
            debrief={debrief}
            players={players}
            playerId={playerId}
            isHost={isHost}
            isAdmin={isAdmin}
            onRestart={restart}
            onExit={onExit}
            onShowTitles={() => setViewMode("titles")}
            onShowStats={() => setViewMode("stats")}
          />
        )}

        {/* ✅ Titles View */}
        {viewMode === "titles" && (
          <CourtTitlesScreen
            debrief={debrief}
            players={players}
            onDone={() => setViewMode("stats")}
          />
        )}

        {/* ✅ Stats View */}
        {viewMode === "stats" && (
          <CourtStats
            stats={statsData}
            players={players}
            isAdmin={isAdmin}
            onBack={() => setViewMode("journal")}
            onExit={onExit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="court-screen court-loading" dir="rtl">
      <div className="court-loading-icon">⚖️</div>
      <p>جارٍ التحميل...</p>
    </div>
  );
}

function CourtTimer({ seconds, max }) {
  const pct = max > 0 ? Math.min(100, (seconds / max) * 100) : 0;
  const isDanger = seconds < 30;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="court-timer">
      <div className="court-timer-bar">
        <div
          className={`court-timer-fill ${isDanger ? "court-timer-danger" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`court-timer-text ${isDanger ? "court-timer-danger" : ""}`}>
        {mins}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}