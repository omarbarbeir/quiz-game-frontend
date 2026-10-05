// ============================================================
// DigitalDetectiveGame.js - النسخة النهائية الكاملة
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, FaImage, FaEnvelope, FaUsers, 
  FaBell, FaMapMarkerAlt, FaSatellite, FaFileInvoice,
  FaMapMarkedAlt, FaLock, FaUnlockAlt, FaVideo, FaTerminal,
  FaFacebook, FaTwitter, FaInstagram, FaFolder, FaFolderOpen,
  FaServer, FaMobileAlt, FaCamera, FaMoneyBillWave
} from 'react-icons/fa';
import CaseReportRenderer from './CaseReportRenderer';
import SubTerminal from './SubTerminal';
import CaseClosureForm from './CaseClosureForm';
import DetectiveNotepad from './DetectiveNotepad';

const { casesDatabase } = require('../data/casesData');



// ==========================================
// SocialMediaSection (مع سكرول)
// ==========================================
const SocialMediaSection = ({
  socialSearchQuery,
  setSocialSearchQuery,
  selectedPlatform,
  setSelectedPlatform,
  handleSocialSearch,
  foundProfiles
}) => {
  const [isPlatformOpen, setIsPlatformOpen] = useState(false);

  const platformIcons = {
    facebook: <FaFacebook className="text-blue-600" size={22} />,
    twitter: <FaTwitter className="text-sky-400" size={22} />,
    instagram: <FaInstagram className="text-pink-500" size={22} />
  };

  const platformColors = {
    facebook: 'border-blue-600/30 bg-blue-950/10',
    twitter: 'border-sky-400/30 bg-sky-950/10',
    instagram: 'border-pink-500/30 bg-pink-950/10'
  };

  return (
    <div className="flex flex-col gap-4 h-full" dir="rtl">
      <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[150px]">
          <button
            onClick={() => setIsPlatformOpen(!isPlatformOpen)}
            className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 w-full text-sm"
          >
            <span>{platformIcons[selectedPlatform]}</span>
            <span className="flex-1 text-white text-right">
              {selectedPlatform === 'facebook' && 'فيسبوك'}
              {selectedPlatform === 'twitter' && 'تويتر'}
              {selectedPlatform === 'instagram' && 'إنستجرام'}
            </span>
            <span className="text-gray-500">▼</span>
          </button>
          {isPlatformOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden z-20">
              {['facebook', 'twitter', 'instagram'].map((plat) => (
                <div
                  key={plat}
                  onClick={() => { setSelectedPlatform(plat); setIsPlatformOpen(false); }}
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-800 cursor-pointer text-sm ${selectedPlatform === plat ? 'bg-gray-800' : ''}`}
                >
                  <span>{platformIcons[plat]}</span>
                  <span className="text-white">
                    {plat === 'facebook' && 'فيسبوك'}
                    {plat === 'twitter' && 'تويتر'}
                    {plat === 'instagram' && 'إنستجرام'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={socialSearchQuery}
            onChange={(e) => setSocialSearchQuery(e.target.value)}
            placeholder={`ابحث في ${selectedPlatform}`}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm text-white font-mono"
            dir="ltr"
          />
          <button
            onClick={handleSocialSearch}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-bold transition"
          >
            بحث
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {foundProfiles.length > 0 ? (
          foundProfiles.map((p, idx) => (
            <div
              key={idx}
              className={`bg-gray-900/60 border rounded-2xl p-4 ${platformColors[p.platform] || 'border-gray-800'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl bg-gray-700">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{p.name}</span>
                    {p.verified && <span className="text-blue-400 text-xs">✓</span>}
                  </div>
                  <span className="text-gray-400 text-xs">{p.status || 'نشط'}</span>
                </div>
                <div className="text-gray-500 text-lg">
                  {platformIcons[p.platform] || <FaUsers />}
                </div>
              </div>

              {p.bio && (
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">{p.bio}</p>
              )}

              {p.posts && p.posts.length > 0 && (
                <div className="space-y-3 mt-2 max-h-[300px] overflow-y-auto">
                  {p.posts.map((post, pi) => (
                    <div key={pi} className="bg-gray-950/60 rounded-xl p-3 border border-gray-800">
                      <p className="text-gray-200 text-sm mb-2">{post.text}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="منشور"
                          className="w-full rounded-lg max-h-48 object-cover border border-gray-800"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                        <span>❤️ 0</span>
                        <span>💬 0</span>
                        <span>↗️ 0</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!p.posts && (
                <div className="text-gray-500 text-xs italic mt-2 border-t border-gray-800 pt-2">
                  لا توجد منشورات حالية
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 text-sm py-12">
            لم يتم العثور على حسابات.
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// RepositoryViewer (المخزن المركزي)
// ==========================================
const RepositoryViewer = ({ 
  decryptedImages, 
  decryptedVideos, 
  decryptedDocs, 
  decryptedMessages,
  onImageClick,
  onVideoClick,
  onDocClick
}) => {
  const [activeTab, setActiveTab] = useState('images');

  return (
    <div className="bg-gray-950 h-full flex flex-col rounded-xl" dir="rtl">
      <div className="flex border-b border-gray-800 bg-gray-900/50 p-2 gap-2 flex-wrap">
        <button onClick={() => setActiveTab('images')} className={`px-4 py-1 rounded text-xs font-bold ${activeTab === 'images' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          🖼️ صور ({decryptedImages.length})
        </button>
        <button onClick={() => setActiveTab('videos')} className={`px-4 py-1 rounded text-xs font-bold ${activeTab === 'videos' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          🎬 فيديوهات ({decryptedVideos.length})
        </button>
        <button onClick={() => setActiveTab('docs')} className={`px-4 py-1 rounded text-xs font-bold ${activeTab === 'docs' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          📄 مستندات ({decryptedDocs.length})
        </button>
        <button onClick={() => setActiveTab('messages')} className={`px-4 py-1 rounded text-xs font-bold ${activeTab === 'messages' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
          💬 مكالمات ورسائل ({decryptedMessages.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'images' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {decryptedImages.map((img, idx) => (
              <div key={idx} className="bg-gray-900/80 p-2 rounded border border-gray-800 cursor-pointer hover:border-cyan-500 transition" onClick={() => onImageClick && onImageClick(img)}>
                <img src={img.path} alt={img.name} className="w-full h-32 object-cover rounded" />
                <p className="text-gray-400 text-[10px] mt-1">{img.name}</p>
              </div>
            ))}
            {decryptedImages.length === 0 && <p className="text-gray-500 text-xs col-span-full text-center py-10">لا توجد صور</p>}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decryptedVideos.map((vid, idx) => (
              <div key={idx} className="bg-gray-900/80 p-2 rounded border border-gray-800" onClick={() => onVideoClick && onVideoClick(vid)}>
                <video src={vid.path} controls className="w-full rounded" />
                <p className="text-gray-400 text-[10px] mt-1">{vid.name}</p>
              </div>
            ))}
            {decryptedVideos.length === 0 && <p className="text-gray-500 text-xs col-span-full text-center py-10">لا توجد فيديوهات</p>}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-3">
            {decryptedDocs.map((doc, idx) => (
              <div key={idx} className="bg-gray-900/90 p-3 rounded border border-amber-600/30 cursor-pointer hover:border-amber-400 transition" onClick={() => onDocClick && onDocClick(doc)}>
                <p className="text-amber-400 font-bold text-xs">{doc.title}</p>
                <p className="text-gray-300 text-xs whitespace-pre-line">{doc.content}</p>
              </div>
            ))}
            {decryptedDocs.length === 0 && <p className="text-gray-500 text-xs text-center py-10">لا توجد مستندات</p>}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-2">
            {decryptedMessages.map((msg, idx) => (
              <div key={idx} className="bg-gray-900/80 p-3 rounded border border-cyan-600/30">
                <p className="text-cyan-400 text-xs font-bold">{msg.from || 'مرسل'}:</p>
                <p className="text-gray-300 text-xs">{msg.text || msg}</p>
                <p className="text-gray-500 text-[10px]">{msg.time || ''}</p>
              </div>
            ))}
            {decryptedMessages.length === 0 && <p className="text-gray-500 text-xs text-center py-10">لا توجد رسائل</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TerminalSession - نافذة ترمينال صغيرة
// ==========================================
const TerminalSession = ({
  title,
  sessionId,
  onClose,
  logs,
  onCommand,
  isLocked,
  lockTimer,
  warning
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLocked) return;
    const cmd = input.trim();
    onCommand(cmd, sessionId);
    setInput('');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-black/60 backdrop-blur-sm absolute inset-0" onClick={onClose}></div>
      <div className="bg-black/95 border border-cyan-900/50 rounded-xl p-4 max-w-2xl w-full max-h-[70vh] pointer-events-auto flex flex-col" dir="rtl">
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <span className="text-cyan-400 font-bold text-xs">{title}</span>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xs">✕ إغلاق</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 text-xs p-2 bg-black/40 rounded-lg min-h-[150px] max-h-[300px] text-left select-text mt-2" dir="ltr">
          {warning && (
            <div className="text-red-500 font-bold text-center py-2 animate-pulse">
              {warning}
              {lockTimer > 0 && ` (${lockTimer}s)`}
            </div>
          )}
          {logs.map((log, i) => (
            <p key={i} className={`whitespace-pre-wrap ${log.startsWith('❌') ? 'text-rose-500' : log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-gray-300'}`}>
              {log}
            </p>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2 border-t border-gray-800 pt-2" dir="ltr">
          <span className="text-cyan-400 font-bold text-xs">$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLocked}
            placeholder={isLocked ? `⛔ معطل ${lockTimer}s...` : "اكتب الأمر..."}
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-700 font-mono"
          />
        </form>
        <p className="text-gray-600 text-[9px] mt-1 text-center">استخدم <span className="text-cyan-400">close</span> لإغلاق النافذة</p>
      </div>
    </div>
  );
};

// ==========================================
// WinnerModal - نسخة نهائية
// ==========================================
const WinnerModal = ({
  show,
  onClose,
  onSubmit,
  answerResult,
  playerName,
  canStartNewCase,
  onNewCase
}) => {
  const [culprits, setCulprits] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!show) return null;

  const handleSubmit = () => {
    const answer = {
      culprits: culprits.split(',').map(s => s.trim()).filter(s => s.length > 0),
    };
    onSubmit(answer);
    setSubmitted(true);
  };

  if (answerResult) {
    const isCorrect = answerResult.isCorrect;
    const correct = answerResult.correctAnswer;
    const correctCulprits = correct?.culprits?.join('، ') || 'غير معروف';

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
        <div className={`bg-gray-900 rounded-2xl p-8 max-w-lg w-full shadow-2xl border ${isCorrect ? 'border-yellow-400' : 'border-red-500'}`} dir="rtl">
          {isCorrect ? (
            <>
              <div className="text-center">
                <span className="text-5xl block mb-3">🎉</span>
                <h2 className="text-3xl font-black text-yellow-400">إجابة صحيحة!</h2>
                <p className="text-emerald-400 mt-2">أنت محقق عبقري!</p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-yellow-400/30 text-right">
                  <p className="text-yellow-300 text-sm">✅ الجناة: {correctCulprits}</p>
                  <p className="text-gray-400 text-xs mt-2 border-t border-gray-700 pt-2">{correct.summary || ''}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition">
                  إغلاق
                </button>
                {canStartNewCase && (
                  <button onClick={onNewCase} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-lg text-sm transition">
                    🚀 قضية جديدة
                  </button>
                )}
                {!canStartNewCase && (
                  <p className="text-xs text-gray-500 flex items-center justify-center flex-1">⏳ انتظر باقي المحققين...</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <span className="text-5xl block mb-3">❌</span>
                <h2 className="text-3xl font-black text-red-500">إجابة خاطئة</h2>
                <p className="text-red-300 mt-2">الجناة الصحيحون: <span className="font-bold text-white">{correctCulprits}</span></p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-red-600/30 text-right">
                  <p className="text-gray-300 text-sm">الدافع: {correct.motive || 'غير محدد'}</p>
                  <p className="text-gray-400 text-xs mt-2 border-t border-gray-700 pt-2">{correct.summary || ''}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition">
                  إغلاق
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-emerald-500/30" dir="rtl">
        <h3 className="text-emerald-400 font-bold text-lg mb-2 text-center">🔍 حل القضية</h3>
        <p className="text-gray-400 text-xs mb-4 text-center">أدخل أسماء الجناة (مفصولة بفواصل)</p>
        <input
          type="text"
          placeholder="مثال: مراد، نادر، الشريك"
          value={culprits}
          onChange={(e) => setCulprits(e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-sm text-white mb-4"
          dir="rtl"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitted}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {submitted ? '⏳ جاري التقديم...' : 'تقديم التقرير'}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg text-sm transition">
            إلغاء
          </button>
        </div>
        <p className="text-gray-500 text-[10px] mt-3 border-t border-gray-800 pt-2 text-center">
          سيتم تقييم إجابتك بشكل مستقل.
        </p>
      </div>
    </div>
  );
};

// ==========================================
// المكون الأساسي للعبة
// ==========================================
const DigitalDetectiveGame = ({ socket, roomCode, playerId, isAdmin }) => {
  // ==========================================
  // States
  // ==========================================
  const [gameState, setGameState] = useState({
    started: false,
    caseId: 'case_murad_01',
    players: []
  });
  const [activeApp, setActiveApp] = useState('desktop');
  const [isDesktopView, setIsDesktopView] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [hasOpenedReport, setHasOpenedReport] = useState(false);
  const [unlockedLocations, setUnlockedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailCracked, setEmailCracked] = useState(false);
  const [isCracking, setIsCracking] = useState(false);

  const [socialSearchQuery, setSocialSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [foundProfiles, setFoundProfiles] = useState([]);
  const [emailTo, setEmailTo] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [commsHistory, setCommsHistory] = useState([]);

  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [caseResolved, setCaseResolved] = useState(false);
  // const [currentPage, setCurrentPage] = useState(0);

  const [hackedSystems, setHackedSystems] = useState([]);
  const [activeHackTarget, setActiveHackTarget] = useState(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeCctvCam, setActiveCctvCam] = useState(null);
  const [extractedDocs, setExtractedDocs] = useState([]);

  const [decryptedImages, setDecryptedImages] = useState([]);
  const [decryptedVideos, setDecryptedVideos] = useState([]);
  const [decryptedDocs, setDecryptedDocs] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const [encryptedFolderUnlocked, setEncryptedFolderUnlocked] = useState(false);
  const [extractedEncryptedFolder, setExtractedEncryptedFolder] = useState(false);

  const [syncedDecryptedImages, setSyncedDecryptedImages] = useState([]);
  const [syncedDecryptedVideos, setSyncedDecryptedVideos] = useState([]);
  const [syncedDecryptedDocs, setSyncedDecryptedDocs] = useState([]);
  const [syncedDecryptedMessages, setSyncedDecryptedMessages] = useState([]);
  const [syncedEncryptedFolderUnlocked, setSyncedEncryptedFolderUnlocked] = useState(false);
  const [syncedExtractedEncryptedFolder, setSyncedExtractedEncryptedFolder] = useState(false);

  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [terminalWarning, setTerminalWarning] = useState('');

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);

  const [discoveredPhones, setDiscoveredPhones] = useState(false);
  const [discoveredAtms, setDiscoveredAtms] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState(false);
  const [syncedDiscoveredPhones, setSyncedDiscoveredPhones] = useState(false);
  const [syncedDiscoveredAtms, setSyncedDiscoveredAtms] = useState(false);
  const [syncedDiscoveredCameras, setSyncedDiscoveredCameras] = useState(false);
  const [allPlayersSubmitted, setAllPlayersSubmitted] = useState(false);

  // جلسات الترمينال الفرعية
  const [activeSessions, setActiveSessions] = useState({});
  const [sessionLogs, setSessionLogs] = useState({});

  const [openSubTerminals, setOpenSubTerminals] = useState({});
  // { network: true/false, phones: true/false, cameras: true/false, vehicles: true/false, atms: true/false }

  const [subTerminalLogs, setSubTerminalLogs] = useState({});
  // { network: [...logs], phones: [...logs], ... }

  const [locationImages, setLocationImages] = useState([]);

  const [lockedFileModal, setLockedFileModal] = useState(null);

  const [notes, setNotes] = useState('');

  const [showRules, setShowRules] = useState(false);

  const currentCase = casesDatabase[gameState?.caseId || 'case_murad_01'];
  const [isCaseLoading, setIsCaseLoading] = useState(false);


  console.log('Cases available:', Object.keys(casesDatabase));
console.log('Current case:', gameState?.caseId);
console.log('Current case data:', casesDatabase[gameState?.caseId]);

  // ==========================================
  // Notifications & Socket
  // ==========================================
  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setNotificationHistory(prev => [{ id, message, type, time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const resetGameState = () => {
    setCaseResolved(false);
    setEmailCracked(false);
    setFoundProfiles([]);
    setCommsHistory([]);
    setSearchResults(null);
    setSelectedLocation('');
    setHasOpenedReport(false);
    setUnlockedLocations([]);
    setHackedSystems([]);
    setExtractedDocs([]);
    setDecryptedImages([]);
    setDecryptedVideos([]);
    setDecryptedDocs([]);
    setDecryptedMessages([]);
    setEncryptedFolderUnlocked(false);
    setExtractedEncryptedFolder(false);
    setActiveHackTarget(null);
    setTerminalInput('');
    setTerminalLogs([]);
    setActiveCctvCam(null);
    setAnswerResult(null);
    setShowWinnerModal(false);
    setDiscoveredPhones(false);
    setDiscoveredAtms(false);
    setDiscoveredCameras(false);
    setSyncedDiscoveredPhones(false);
    setSyncedDiscoveredAtms(false);
    setSyncedDiscoveredCameras(false);
    setAllPlayersSubmitted(false);
    // setCurrentPage(0);
    setGpsLat('');
    setGpsLng('');
    setPasswordAttempts(0);
    setIsTerminalLocked(false);
    setLockTimer(0);
    setTerminalWarning('');
    setIsDesktopView(true);
    setActiveApp('desktop');
    setActiveSessions({});
    setSessionLogs({});
    setOpenSubTerminals({});
    // subTerminalLogs متعملهاش reset عشان لو اللاعب فتح من جديد يلاقي اللوجز موجودة
    setLocationImages([]);
    setLockedFileModal(null);
    setNotes('');
  };

  const openSession = (sessionType) => {
    if (activeSessions[sessionType]) return;
    setActiveSessions(prev => ({ ...prev, [sessionType]: true }));
    setSessionLogs(prev => ({
      ...prev,
      [sessionType]: [`🔓 جلسة ${sessionType} مفتوحة. اكتب help للمساعدة.`]
    }));
  };

  const closeSession = (sessionType) => {
    setActiveSessions(prev => ({ ...prev, [sessionType]: false }));
  };

  const handleSessionCommand = (cmd, sessionType) => {
    const logs = sessionLogs[sessionType] || [];
    let newLogs = [...logs, `$ ${cmd}`];
    const cleanCmd = cmd.toLowerCase().trim();

    if (cleanCmd === 'help') {
      newLogs.push("📋 الأوامر المتاحة:");
      newLogs.push("  scan - عرض الأجهزة المتاحة");
      newLogs.push("  connect [name] - الاتصال بجهاز");
      newLogs.push("  crack [pw] - كسر الباسورد");
      newLogs.push("  show - عرض البيانات");
      newLogs.push("  close - إغلاق الجلسة");
    } else if (cleanCmd === 'close') {
      closeSession(sessionType);
      newLogs.push("🔒 جلسة مغلقة.");
    } else if (cleanCmd === 'scan') {
      if (sessionType === 'phones') {
        const phones = currentCase?.hackableTargets?.phones || {};
        const list = Object.values(phones);
        if (list.length === 0) newLogs.push("📱 لا توجد هواتف.");
        else {
          newLogs.push("📱 الهواتف المتاحة:");
          list.forEach(p => newLogs.push(`   - ${p.name}`));
        }
      } else if (sessionType === 'atms') {
        const atms = currentCase?.hackableTargets?.atms || {};
        const list = Object.values(atms);
        if (list.length === 0) newLogs.push("🏧 لا توجد صرافات.");
        else {
          newLogs.push("🏧 الصرافات المتاحة:");
          list.forEach(a => newLogs.push(`   - ${a.name}`));
        }
      } else if (sessionType === 'cameras') {
        const cams = currentCase?.hackableTargets?.surveillance || {};
        const list = Object.values(cams);
        if (list.length === 0) newLogs.push("📹 لا توجد كاميرات.");
        else {
          newLogs.push("📹 الكاميرات المتاحة:");
          list.forEach(c => newLogs.push(`   - ${c.name}`));
        }
      } else if (sessionType === 'tracker') {
        newLogs.push("🚗 استخدم: track vehicle [رقم اللوحة]");
      }
    } else if (cleanCmd.startsWith('connect ')) {
      const name = cleanCmd.replace('connect ', '').trim();
      newLogs.push(`🔌 جاري الاتصال بـ ${name}...`);
      newLogs.push("✅ متصل.");
    } else if (cleanCmd.startsWith('crack ')) {
      const pw = cleanCmd.replace('crack ', '').trim();
      newLogs.push(`🔓 جاري كسر الباسورد...`);
      newLogs.push("✅ SUCCESS!");
    } else if (cleanCmd === 'show') {
      newLogs.push("📄 لا توجد بيانات لعرضها.");
    } else {
      newLogs.push(`❌ أمر غير معروف: "${cmd}"`);
    }

    setSessionLogs(prev => ({ ...prev, [sessionType]: newLogs }));
  };

  // ==========================================
  // دالة تتبع المركبات
  // ==========================================
  const trackVehicle = (plate) => {
    if (!currentCase) return null;
    const results = [];
    const allTargets = { 
      ...(currentCase.hackableTargets?.servers || {}),
      ...(currentCase.hackableTargets?.phones || {}),
      ...(currentCase.hackableTargets?.atms || {}),
      ...(currentCase.hackableTargets?.surveillance || {})
    };

    for (const key in allTargets) {
      const target = allTargets[key];
      if (target.data && target.data.files && target.data.files.videos) {
        target.data.files.videos.forEach(video => {
          if (video.hidden && video.hidden.plate && video.hidden.plate.includes(plate)) {
            results.push({
              location: video.hidden.location || target.name,
              time: video.hidden.time || '--:--',
              notes: video.hidden.notes || '',
              videoName: video.name,
              source: target.name
            });
          }
        });
      }
    }

    results.sort((a, b) => a.time.localeCompare(b.time));
    return results;
  };

  useEffect(() => {
    if (!socket || !roomCode) return;

    socket.emit('detective_join', { roomCode, playerId });

    socket.on('detective_started', (data) => {
      setGameState(data);
      resetGameState();
      if (data?.unlockedLocations) setUnlockedLocations(data.unlockedLocations);
      if (data?.hackedSystems) setHackedSystems(data.hackedSystems);
      if (data?.hasOpenedReport) setHasOpenedReport(data.hasOpenedReport);
      if (data?.extractedDocs) setExtractedDocs(data.extractedDocs);
      if (data?.decryptedImages) setSyncedDecryptedImages(data.decryptedImages);
      if (data?.decryptedVideos) setSyncedDecryptedVideos(data.decryptedVideos);
      if (data?.decryptedDocs) setSyncedDecryptedDocs(data.decryptedDocs);
      if (data?.decryptedMessages) setSyncedDecryptedMessages(data.decryptedMessages);
      if (data?.encryptedFolderUnlocked) setSyncedEncryptedFolderUnlocked(data.encryptedFolderUnlocked);
      if (data?.extractedEncryptedFolder) setSyncedExtractedEncryptedFolder(data.extractedEncryptedFolder);
      if (data?.discoveredPhones !== undefined) setSyncedDiscoveredPhones(data.discoveredPhones);
      if (data?.discoveredAtms !== undefined) setSyncedDiscoveredAtms(data.discoveredAtms);
      if (data?.discoveredCameras !== undefined) setSyncedDiscoveredCameras(data.discoveredCameras);
      addNotification('🚀 تم تفعيل المنظومة!', 'success');
    });

    socket.on('detective_game_updated', (data) => {
      if (data?.gameState) {
        if (data?.logType !== 'system') {
          setGameState(data.gameState);
          if (data.gameState.emailCracked) setEmailCracked(true);
          if (data.gameState.commsHistory) setCommsHistory(data.gameState.commsHistory);
          if (data.gameState.lastSearchResults) setSearchResults(data.gameState.lastSearchResults.results || data.gameState.lastSearchResults);
          if (data.gameState.selectedLocation) setSelectedLocation(data.gameState.selectedLocation);
          if (data.gameState.hasOpenedReport !== undefined) setHasOpenedReport(data.gameState.hasOpenedReport);
          if (data.gameState.unlockedLocations) setUnlockedLocations(data.gameState.unlockedLocations);
          if (data.gameState.hackedSystems) setHackedSystems(data.gameState.hackedSystems);
          if (data.gameState.extractedDocs !== undefined) setExtractedDocs(data.gameState.extractedDocs);
          if (data.gameState.discoveredPhones !== undefined) setSyncedDiscoveredPhones(data.gameState.discoveredPhones);
          if (data.gameState.discoveredAtms !== undefined) setSyncedDiscoveredAtms(data.gameState.discoveredAtms);
          if (data.gameState.discoveredCameras !== undefined) setSyncedDiscoveredCameras(data.gameState.discoveredCameras);
          if (data.gameState.allPlayersSubmitted !== undefined) setAllPlayersSubmitted(data.gameState.allPlayersSubmitted);
        }
      }
      if (data?.logType === 'resolved') setCaseResolved(true);
      if (data?.logType === 'system') {
        setTimeout(() => {
          setGameState(data.gameState);
          resetGameState();
          setIsCaseLoading(false);
        }, 6000);
      }
      if (data?.logMessage) addNotification(data.logMessage, data.logType);
    });

    socket.on('custom_sync', ({ type, data }) => {
      if (type === 'unlock_location') setUnlockedLocations(prev => prev.includes(data.locKey) ? prev : [...prev, data.locKey]);
      if (type === 'sync_location_select') setSelectedLocation(data.locKey);
      if (type === 'sync_report_opened') setHasOpenedReport(true);
      if (type === 'sync_social_profile') setFoundProfiles(prev => prev.some(p => p.name === data.name) ? prev : [...prev, data]);
      if (type === 'sync_comms') setCommsHistory(prev => [...prev, data]);
      if (type === 'sync_system_hacked') setHackedSystems(prev => prev.includes(data.sysKey) ? prev : [...prev, data.sysKey]);
      if (type === 'sync_cctv_select') setActiveCctvCam(data.camId);
    });

    socket.on('sync_decrypted_data', (data) => {
      setSyncedDecryptedImages(data.decryptedImages || []);
      setSyncedDecryptedVideos(data.decryptedVideos || []);
      setSyncedDecryptedDocs(data.decryptedDocs || []);
      setSyncedDecryptedMessages(data.decryptedMessages || []);
      setSyncedEncryptedFolderUnlocked(data.encryptedFolderUnlocked || false);
      setSyncedExtractedEncryptedFolder(data.extractedEncryptedFolder || false);
      if (data?.discoveredPhones !== undefined) setSyncedDiscoveredPhones(data.discoveredPhones);
      if (data?.discoveredAtms !== undefined) setSyncedDiscoveredAtms(data.discoveredAtms);
      if (data?.discoveredCameras !== undefined) setSyncedDiscoveredCameras(data.discoveredCameras);
    });

    socket.on('case_answer_result', ({ isCorrect, score, correctAnswer, allSubmitted }) => {
      setAnswerResult({ isCorrect, score, correctAnswer });
      if (allSubmitted !== undefined) setAllPlayersSubmitted(allSubmitted);
      if (isCorrect) {
        addNotification('🎉 إجابة صحيحة! النقاط: 4/4', 'success');
      } else {
        addNotification(`❌ إجابة ناقصة — النقاط: ${score}/4`, 'error');
      }
    });

    socket.on('trigger_case_loading', () => {
      setIsCaseLoading(true);
      resetGameState();
    });

    return () => {
      socket.off('detective_started');
      socket.off('detective_game_updated');
      socket.off('custom_sync');
      socket.off('sync_decrypted_data');
      socket.off('case_answer_result');
      socket.off('trigger_case_loading');
    };
  }, [socket, roomCode, playerId]);

  // ==========================================
  // مؤقت تعطيل التيرمينال
  // ==========================================
  useEffect(() => {
    let interval;
    if (isTerminalLocked && lockTimer > 0) {
      interval = setInterval(() => setLockTimer(prev => prev - 1), 1000);
    } else if (lockTimer === 0 && isTerminalLocked) {
      setIsTerminalLocked(false);
      setTerminalWarning('');
      setPasswordAttempts(0);
    }
    return () => clearInterval(interval);
  }, [isTerminalLocked, lockTimer]);

  // ==========================================
  // Handlers
  // ==========================================
  const handleStartGame = () => {
    socket.emit('start_digital_detective', { roomCode, caseId: gameState?.caseId || 'case_murad_01' });
  };

  const handleAppClick = (appName) => {
    if (appName === 'case_report' && !hasOpenedReport) {
      setHasOpenedReport(true);
      socket.emit('custom_sync', { roomCode, type: 'sync_report_opened', data: {} });
      socket.emit('detective_action_submit', {
        roomCode,
        actionType: 'UPDATE_STATE_VALUE',
        payload: { targetKey: 'hasOpenedReport', value: true }
      });
    }
    setActiveApp(appName);
    setIsDesktopView(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !currentCase) return;
    const cleanQuery = searchQuery.trim();
    
    let matchedLocationKey = null;
    let matchedLocationName = '';
    
    if (currentCase.locations) {
      for (const locKey in currentCase.locations) {
        const loc = currentCase.locations[locKey];
        if (loc.keywords && loc.keywords.some(k => 
          k.includes(cleanQuery) || cleanQuery.includes(k)
        )) 
        {
          matchedLocationKey = locKey;
          matchedLocationName = loc.name;
          break;
        }
      }
    }

    if (matchedLocationKey) {
      if (!unlockedLocations.includes(matchedLocationKey)) {
        setUnlockedLocations(prev => [...prev, matchedLocationKey]);
        socket.emit('custom_sync', {
          roomCode,
          type: 'unlock_location',
          data: { locKey: matchedLocationKey, locName: matchedLocationName }
        });
        socket.emit('detective_action_submit', {
          roomCode,
          actionType: 'UPDATE_STATE_ARRAY',
          payload: { targetKey: 'unlockedLocations', value: matchedLocationKey }
        });
      }
      
      const resultData = [{
        title: `🌐 ${matchedLocationName}`,
        content: `✅ تم فتح الموقع! انتقل إلى "خريطة الأماكن".`
      }];
      socket.emit('detective_action_submit', { 
        roomCode, 
        playerId, 
        actionType: 'SEARCH', 
        payload: { searchQuery, resultData } 
      });
      setSearchResults(resultData);
      setSearchQuery('');
      const locImages = Object.values(
      currentCase.locations[matchedLocationKey]?.images || {}
      );
      setLocationImages(prev => [
        ...prev,
        ...locImages.filter(img => !prev.some(p => p.id === img.id))
      ]);
      addNotification(`🗺️ تم فتح "${matchedLocationName}"`, 'success');
      return;
    }

    let foundResult = null;
    if (currentCase.search && currentCase.search[cleanQuery]) {
      foundResult = currentCase.search[cleanQuery];
    }
    
    const resultData = foundResult
      ? [{ title: foundResult.results.title, content: foundResult.results.content }]
      : [{ title: 'بوابة الاستعلام', content: `❌ لم يتم العثور على: "${searchQuery}".` }];
    
    socket.emit('detective_action_submit', { 
      roomCode, 
      playerId, 
      actionType: 'SEARCH', 
      payload: { searchQuery, resultData } 
    });
    setSearchResults(resultData);
    setSearchQuery('');
  };

  const handleSelectLocation = (locKey, locName) => {
    setSelectedLocation(locKey);
    
    const locData = currentCase?.locations?.[locKey];
    let systemName = locData?.hackableSystem?.systemName || `${locKey}_srv`;
    let ipAddress = locData?.hackableSystem?.ipAddress || '192.168.1.100';
    let password = locData?.actualPassword || locData?.hackableSystem?.password || '';
    
    if (!locData?.hackableSystem) {
      const allTargets = { 
        ...(currentCase?.hackableTargets?.servers || {}),
        ...(currentCase?.hackableTargets?.phones || {}),
        ...(currentCase?.hackableTargets?.atms || {}),
        ...(currentCase?.hackableTargets?.surveillance || {})
      };
      for (const key in allTargets) {
        const t = allTargets[key];
        if (t.name === locName || t.ip === ipAddress || t.associatedKey === locKey) {
          systemName = t.systemName || t.name;
          ipAddress = t.ip || ipAddress;
          password = t.password || password;
          break;
        }
      }
    }

    const displayName = locName;
    const target = {
      systemName: systemName,
      displayName: displayName,
      name: displayName,
      ipAddress: ipAddress,
      associatedKey: locKey,
      targetKey: locKey,
      password: password,
      isConnected: true,
      isHoneyPot: false,
      isCustomWrongServer: false,
      currentConnectedName: systemName
    };
    
    setActiveHackTarget(target);
    setTerminalLogs([
      "⚡ TERMINAL v4.0.2 - ACTIVE",
      `📡 Target: ${displayName}`,
      `📍 IP: ${ipAddress}`,
      "🟢 CONNECTION ESTABLISHED.",
      "🔒 Type 'help' for commands."
    ]);
    setPasswordAttempts(0);
    setIsTerminalLocked(false);
    setLockTimer(0);
    setTerminalWarning('');

    socket.emit('custom_sync', { roomCode, type: 'sync_location_select', data: { locKey, locName } });
    socket.emit('detective_action_submit', {
      roomCode,
      actionType: 'UPDATE_STATE_VALUE',
      payload: { targetKey: 'selectedLocation', value: locKey }
    });
    
    addNotification(`🔌 تم ربط البث بـ "${locName}"`, 'success');
  };

  // ==========================================
  // Terminal Commands
  // ==========================================
  const handleTerminalCommandSubmit = (e) => {
    e.preventDefault();
    const rawInput = terminalInput.trim();
    const cleanInput = rawInput.toLowerCase();
    if (!cleanInput) return;

    let responses = [`root# ${rawInput}`];

    if (cleanInput === 'help') {
      responses.push(
        "⚙️ AVAILABLE COMMANDS:",
        "  open network    - فتح ماسح الشبكات",
        "  open phones     - فتح ماسح الهواتف",
        "  open cameras    - فتح ماسح الكاميرات",
        "  open vehicles   - فتح متتبع المركبات",
        "  open atms       - فتح ماسح الصرافات",
        "  disconnect      - قطع الاتصال الحالي",
        "  clear           - مسح الشاشة",
      );
    } else if (cleanInput === 'open network' || cleanInput === 'open net') {
      openSubTerminal('network');
      responses.push('🌐 Network scanner opened.');
    } else if (cleanInput === 'open phones' || cleanInput === 'open phone') {
      openSubTerminal('phones');
      responses.push('📱 Phone scanner opened.');
    } else if (cleanInput === 'open cameras' || cleanInput === 'open camera' || cleanInput === 'open cams') {
      openSubTerminal('cameras');
      responses.push('📹 Camera scanner opened.');
    } else if (cleanInput === 'open vehicles' || cleanInput === 'open vehicle' || cleanInput === 'open tracker') {
      openSubTerminal('vehicles');
      responses.push('🚗 Vehicle tracker opened.');
    } else if (cleanInput === 'open atms' || cleanInput === 'open atm') {
      openSubTerminal('atms');
      responses.push('🏧 ATM scanner opened.');
    } else if (cleanInput === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cleanInput === 'disconnect') {
      if (!activeHackTarget) {
        responses.push("❌ No active connection.");
      } else {
        responses.push(`🔌 Disconnecting from ${activeHackTarget.displayName || activeHackTarget.name}...`, "🗑️ Session cleared.");
        setActiveHackTarget(null);
        setPasswordAttempts(0);
        setIsTerminalLocked(false);
        setLockTimer(0);
        setTerminalWarning('');
      }
    } else {
      responses.push(`❌ Unknown command. Type "help".`);
    }

    setTerminalLogs(prev => [...prev, ...responses]);
    setTerminalInput('');
  };

  // ==========================================
  // Handlers: Email, Social, Comms, GPS
  // ==========================================
  const handleCrackEmail = () => {
    if (!email.trim() || !password.trim() || !currentCase) return;
    setIsCracking(true);
    setTimeout(() => {
      if (email.trim() === currentCase.emails?.account && password.trim() === currentCase.emails?.password) {
        setEmailCracked(true);
        socket.emit('detective_action_submit', { roomCode, actionType: 'EMAIL_CRACK_SUCCESS', payload: {} });
        addNotification('🔓 تم اختراق البريد!', 'success');
      } else {
        addNotification('❌ خطأ في البريد أو كلمة المرور!', 'error');
      }
      setIsCracking(false);
    }, 900);
  };

  const handleSocialSearch = () => {
    if (!socialSearchQuery.trim() || !currentCase) return;
    const clean = socialSearchQuery.trim().toLowerCase();
    let profile = null;

    if (currentCase.socialProfiles) {
      for (const key in currentCase.socialProfiles) {
        const p = currentCase.socialProfiles[key];
        if (p.platform === selectedPlatform && p.name.toLowerCase().includes(clean)) {
          profile = p;
          break;
        }
      }
    }

    if (profile) {
      if (!foundProfiles.some(p => p.name === profile.name)) {
        socket.emit('custom_sync', { roomCode, type: 'sync_social_profile', data: profile });
      }
      addNotification(`👤 تم العثور على الحساب`, 'success');
    } else {
      addNotification(`🕵️‍♂️ لم يتم العثور على الحساب`, 'info');
    }
    setSocialSearchQuery('');
  };

  const handleSendComms = () => {
    if (!currentCase || !currentCase.commsDB) return;
    const foundRule = currentCase.commsDB.find(c => 
      c.to === emailTo.trim() && c.bodyKeywords.some(k => emailBody.includes(k))
    );

    if (foundRule) {
      const newMsg = { 
        sender: 'المنظومة الفيدرالية', 
        to: emailTo, 
        body: emailBody, 
        response: foundRule.response, 
        timestamp: new Date().toLocaleTimeString('ar-EG') 
      };
      socket.emit('custom_sync', { roomCode, type: 'sync_comms', data: newMsg });
      setEmailTo('');
      setEmailBody('');
      addNotification('📡 تم بث الشفرة!', 'success');
    } else {
      addNotification('❌ فشل بث الشفرة!', 'error');
    }
  };

  const handleVerifyGPS = () => {
    if (!currentCase) return;
    if (!gpsLat.trim() || !gpsLng.trim()) {
      addNotification('⚠️ يرجى إدخال الإحداثيات!', 'error');
      return;
    }
    if (gpsLat.trim() === currentCase.solution?.latitude && gpsLng.trim() === currentCase.solution?.longitude) {
      setShowWinnerModal(true);
    } else {
      addNotification('❌ الإحداثيات غير صحيحة!', 'error');
    }
  };

  const handleSubmitAnswer = (fields) => {
    const answer = { ...fields };
    if (fields.culprits) {
      answer.culprits = fields.culprits.split(/[,،]/).map(s => s.trim()).filter(Boolean);
    } else {
      answer.culprits = [];
    }
    socket.emit('submit_case_answer', { roomCode, playerId, answer });
  };

  const handleNewCase = () => {
    socket.emit('request_new_case', { roomCode });
    setShowWinnerModal(false);
    setAnswerResult(null);
  };

  // ==========================================
  // Render Functions (مختصرة لتوفير المساحة)
  // ==========================================

  const renderLocationsMap = () => (
    <div className="p-4 bg-gray-950 h-full flex flex-col rounded-xl" dir="rtl">
      <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2"><FaMapMarkedAlt /> خريطة الأماكن</h3>
      {(unlockedLocations || []).length === 0 ? (
        <p className="text-center text-gray-500 text-xs py-12">ابحث عن أماكن في المتصفح لفتحها.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto flex-1">
          {unlockedLocations.map((locKey) => {
            const loc = currentCase?.locations?.[locKey];
            if (!loc) return null;
            const isSelected = selectedLocation === locKey;
            return (
              <div key={locKey} onClick={() => handleSelectLocation(locKey, loc.name)} className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-emerald-950/40 border-emerald-500' : 'bg-gray-900/50 border-gray-800'}`}>
                <h4 className="text-white font-bold text-xs mb-1">{loc.name}</h4>
                <p className="text-gray-400 text-[11px] line-clamp-2">{loc.description}</p>
                <button className="mt-3 w-full text-[11px] py-1 bg-gray-950 text-gray-300 rounded border border-gray-855">{isSelected ? '🔬 معروض' : '📡 ربط'}</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderBrowser = () => (
    <div className="bg-gray-950 h-full flex flex-col rounded-xl" dir="rtl">
      <div className="bg-gray-900 p-3 rounded-t-xl flex items-center border-b border-gray-800">
        <div className="flex-1 flex items-center bg-gray-950 rounded-lg px-3 py-1.5 border border-gray-800">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} placeholder="ابحث عن مكان..." className="bg-transparent text-white flex-1 outline-none text-xs text-right" />
          <button onClick={handleSearch} className="bg-cyan-600 px-4 py-1 rounded text-xs text-white">استعلام</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {searchResults ? searchResults.map((res, i) => (
          <div key={i} className="bg-gray-900/80 p-4 rounded-xl border border-gray-800">
            <h5 className="text-yellow-400 font-bold text-xs mb-1">{res.title}</h5>
            <p className="text-gray-300 text-xs">{res.content}</p>
          </div>
        )) : <p className="text-center text-gray-500 text-xs py-12">بوابة الاستعلام.</p>}

        {/* ← هنا جوه الـ div نفسه، تحت النتائج مباشرة */}
        {locationImages.length > 0 && (
          <div className="mt-4">
            <h5 className="text-cyan-400 text-xs font-bold mb-3">📸 صور الأماكن</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {locationImages.map((img, idx) => (
                <div key={idx} className="bg-gray-900/80 p-2 rounded border border-gray-800">
                  <img src={img.path || ''} alt={img.name}
                      className="w-full h-28 object-cover rounded mb-1"
                      onError={e => e.target.style.display='none'} />
                  <p className="text-white text-[10px] font-bold mb-1">{img.name}</p>
                  <p className="text-gray-400 text-[10px]">{img.desc}</p>
                  {img.clue && (
                    <div className="mt-1 bg-yellow-900/30 border border-yellow-600/40 rounded px-2 py-1">
                      <p className="text-yellow-400 text-[10px] font-mono">🔍 {img.clue}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );

  const openSubTerminal = (type) => {
  setOpenSubTerminals(prev => ({ ...prev, [type]: true }));
  };

  const closeSubTerminal = (type) => {
    setOpenSubTerminals(prev => ({ ...prev, [type]: false }));
  };

  const updateSubTerminalLogs = (type, logs) => {
    setSubTerminalLogs(prev => ({ ...prev, [type]: logs }));
  };

  const renderTerminal = () => {
    const displayName = activeHackTarget?.displayName || activeHackTarget?.name || 'network';
    return (
      <div className="bg-black/95 text-gray-200 font-mono p-4 rounded-2xl border border-cyan-900/50 h-full flex flex-col" dir="rtl">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3" dir="ltr">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-[10px] text-cyan-500 font-bold tracking-wider">TERMINAL</span>
          <button onClick={() => setIsDesktopView(true)} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
        </div>

        <div className="relative flex-1 overflow-y-auto space-y-1 text-xs p-2 bg-black/40 rounded-lg min-h-[250px] text-left select-text" dir="ltr">
          {terminalWarning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-red-500 font-bold text-2xl animate-pulse text-center">
                {terminalWarning}
                <div className="text-sm font-mono mt-2">{lockTimer}s</div>
              </div>
            </div>
          )}
          <p className="text-emerald-500">[+] Terminal ready. Type "help".</p>
          {terminalLogs.map((log, i) => (
            <p key={i} className={`whitespace-pre-wrap ${log.startsWith('❌') ? 'text-rose-500' : log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('WARNING') ? 'text-yellow-400' : 'text-gray-300'}`}>
              {log}
            </p>
          ))}
        </div>

        <form onSubmit={handleTerminalCommandSubmit} className="mt-3 flex items-center gap-2 border-t border-gray-800 pt-3" dir="ltr">
          <span className="text-cyan-400 font-bold text-xs">💡 guest@{displayName}:~$</span>
          <input
            type="text"
            value={terminalInput || ''}
            onChange={(e) => setTerminalInput(e.target.value)}
            disabled={!activeHackTarget || isTerminalLocked}
            placeholder={isTerminalLocked ? `⛔ معطل ${lockTimer}s` : "اكتب الأمر..."}
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-gray-700 font-mono"
          />
        </form>
      </div>
    );
  };

  const renderEmailCracker = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full" dir="rtl">
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 space-y-3">
        <h4 className="text-rose-400 font-bold text-xs"><FaEnvelope /> كسر البريد</h4>
        {emailCracked ? <p className="text-emerald-400 text-center text-xs font-bold">🔓 تم الاختراق!</p> : (
          <>
            <input type="text" placeholder="البريد..." value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-2 rounded text-xs text-left font-mono" dir="ltr" />
            <input type="password" placeholder="كلمة المرور..." value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-2 rounded text-xs text-left font-mono" dir="ltr" />
            <button onClick={handleCrackEmail} disabled={isCracking} className="w-full bg-rose-600 p-2 rounded font-bold text-xs">{isCracking ? '⏳' : '🔓'}</button>
          </>
        )}
      </div>
      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 overflow-y-auto">
        <h4 className="text-emerald-400 font-bold mb-3 text-xs">📥 الرسائل</h4>
        {emailCracked ? currentCase?.emails?.inbox?.map((mail, idx) => (
          <div key={idx} className="bg-gray-950 p-2 rounded mb-2 border border-gray-855 text-xs">
            <p className="text-cyan-400 font-bold">من: {mail.sender}</p>
            <p className="text-gray-300 mt-1">{mail.content}</p>
          </div>
        )) : <p className="text-center text-gray-500 text-xs py-12">محمية.</p>}
      </div>
    </div>
  );

  const renderFederalComms = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full" dir="rtl">
      <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-xl space-y-2">
        <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full bg-gray-950 border border-gray-855 rounded p-2 text-xs font-mono" placeholder="الجهة..." />
        <textarea rows={2} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full bg-gray-950 border border-gray-855 rounded p-2 text-xs font-mono resize-none" placeholder="الشفرة..." />
        <button onClick={handleSendComms} className="w-full bg-cyan-600 p-2 rounded text-xs font-bold">بث</button>
      </div>
      <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-xl space-y-3 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-2">
          <input type="text" value={gpsLat} onChange={(e) => setGpsLat(e.target.value)} className="bg-gray-950 border border-gray-855 p-2 rounded text-center font-bold text-xs" placeholder="Lat" />
          <input type="text" value={gpsLng} onChange={(e) => setGpsLng(e.target.value)} className="bg-gray-950 border border-gray-855 p-2 rounded text-center font-bold text-xs" placeholder="Lng" />
        </div>
        <button onClick={handleVerifyGPS} className="w-full bg-emerald-600 p-2.5 rounded font-bold text-xs">🎯 إرسال</button>
      </div>
    </div>
  );

  const handleSubTerminalCommand = (cmd, type) => {
    const cleanCmd = cmd.toLowerCase().trim();
    const results = [];

    const helpMsg = {
      network:  ["scan — عرض السيرفرات", "connect [name/ip] — الاتصال", "crack password [pw] — كسر الباسورد", "extract data — استخراج البيانات", "info [name] — معلومات سيرفر"],
      phones:   ["scan — عرض الهواتف", "connect [name] — الاتصال", "crack password [pw] — كسر الباسورد", "extract data — استخراج البيانات"],
      cameras:  ["scan — عرض الكاميرات", "connect [name] — الاتصال", "crack password [pw] — كسر الباسورد", "extract data — استخراج البيانات"],
      vehicles: ["track [plate] — تتبع مركبة بالرقم"],
      atms:     ["scan — عرض الصرافات", "connect [name] — الاتصال", "crack password [pw] — كسر الباسورد", "extract data — استخراج البيانات"],
    };

    // ── HELP ──────────────────────────────────────────────────
    if (cleanCmd === 'help') {
      results.push(`📋 أوامر ${type}:`);
      (helpMsg[type] || []).forEach(c => results.push(`   ${c}`));
      return results;
    }

    // ── SCAN ──────────────────────────────────────────────────
    if (cleanCmd === 'scan') {
      if (type === 'network') {
        const servers = currentCase?.hackableTargets?.servers || {};
        const list = Object.values(servers).filter(s => !s.visibleAfter);
        if (list.length === 0) {
          results.push('🔍 No servers found.');
        } else {
          results.push(`📡 Found ${list.length} server(s):`);
          list.forEach(s => results.push(`   ${s.name.padEnd(15)} ${s.ip}`));
          results.push("💡 Use 'connect [name]' to connect.");
        }
      } else if (type === 'phones') {
        const phones = currentCase?.hackableTargets?.phones || {};
        const list = Object.values(phones);
        if (list.length === 0) results.push('📱 No phones found.');
        else { results.push(`📱 Found ${list.length} phone(s):`); list.forEach(p => results.push(`   - ${p.name}`)); }
      } else if (type === 'cameras') {
        const cams = currentCase?.hackableTargets?.surveillance || {};
        const list = Object.values(cams);
        if (list.length === 0) results.push('📹 No cameras found.');
        else { results.push(`📹 Found ${list.length} camera(s):`); list.forEach(c => results.push(`   - ${c.name}`)); }
      } else if (type === 'atms') {
        const atms = currentCase?.hackableTargets?.atms || {};
        const list = Object.values(atms);
        if (list.length === 0) results.push('🏧 No ATMs found.');
        else { results.push(`🏧 Found ${list.length} ATM(s):`); list.forEach(a => results.push(`   - ${a.name}`)); }
      }
      return results;
    }

    // ── CONNECT ───────────────────────────────────────────────
    if (cleanCmd.startsWith('connect ')) {
      const name = cleanCmd.replace('connect ', '').trim();
      let targets = {};
      let targetType = type;

      if (type === 'network')  targets = currentCase?.hackableTargets?.servers || {};
      if (type === 'phones')   targets = currentCase?.hackableTargets?.phones || {};
      if (type === 'cameras')  targets = currentCase?.hackableTargets?.surveillance || {};
      if (type === 'atms')     targets = currentCase?.hackableTargets?.atms || {};

      const foundKey = Object.keys(targets).find(k =>
        targets[k].name.toLowerCase() === name.toLowerCase() ||
        targets[k].ip === name
      );
      const found = targets[foundKey];

      if (!found) {
        results.push(`❌ "${name}" not found. Use 'scan' to list available targets.`);
      } else {
        setActiveHackTarget({
          ...found,
          targetKey: foundKey,
          targetType,
          displayName: found.name,
          isConnected: true,
          currentConnectedName: found.name
        });
        setTerminalLogs(prev => [
          ...prev,
          `🔌 [${type.toUpperCase()}] Connected to: ${found.name}`,
          `🔒 Use crack password [pw] in the ${type} scanner.`
        ]);
        results.push(`✅ Connected to: ${found.name}`);
        results.push(`🔒 Now use 'crack password [pw]' here.`);
      }
      return results;
    }

    // ── CRACK PASSWORD ────────────────────────────────────────
    if (cleanCmd.startsWith('crack password')) {
      if (!activeHackTarget) {
        results.push("❌ No active connection. Use 'connect' first.");
        return results;
      }
      const pw = cmd.replace(/crack password\s*/i, '').trim();
      if (!pw) {
        results.push("❌ Provide a password. Example: crack password abc123");
        return results;
      }
      if (pw === activeHackTarget.password) {
        results.push("🔓 SUCCESS: Password accepted!");
        results.push(`✅ ${activeHackTarget.displayName} unlocked.`);
        results.push("💡 Now use 'extract data' to get the files.");
        setPasswordAttempts(0);
        setTerminalWarning('');
      } else {
        const newAttempts = passwordAttempts + 1;
        setPasswordAttempts(newAttempts);
        if (newAttempts >= 3) {
          results.push("⚠️ Too many failed attempts. Terminal locked for 60 seconds.");
          setIsTerminalLocked(true);
          setLockTimer(60);
          setTerminalWarning("⛔ TERMINAL LOCKED");
        } else {
          results.push(`❌ Wrong password. ${3 - newAttempts} attempt(s) left.`);
        }
      }
      return results;
    }

    // ── EXTRACT DATA ──────────────────────────────────────────
    if (cleanCmd === 'extract data') {
      if (!activeHackTarget) {
        results.push("❌ No active connection.");
        return results;
      }

      // تحقق إن الباسورد اتكسر
      const cracked = subTerminalLogs[type]?.some(log => log.includes('SUCCESS: Password accepted'));
      if (!cracked) {
        results.push("❌ Target still encrypted. Use 'crack password' first.");
        return results;
      }

      const data = activeHackTarget.data;
      if (!data?.files) {
        results.push("❌ No data found.");
        return results;
      }

      // لو في lockedFile
      if (data.files.lockedFile) {
        const lf = data.files.lockedFile;
        const alreadyAdded = decryptedDocs.some(d => d.id === lf.id);
        if (!alreadyAdded) {
          const updatedDocs = [...decryptedDocs, {
            id: lf.id,
            title: `🔒 ${lf.name}`,
            content: '[ملف مشفر — افتح المخزن واضغط عليه لفكه]',
            isLocked: true,
            password: lf.password,
            unlockedContent: lf.unlockedContent
          }];
          setDecryptedDocs(updatedDocs);
          socket.emit('sync_decrypted_data', {
            roomCode,
            data: {
              decryptedImages, decryptedVideos,
              decryptedDocs: updatedDocs, decryptedMessages,
              encryptedFolderUnlocked: false,
              extractedEncryptedFolder: true,
              discoveredPhones, discoveredAtms, discoveredCameras
            }
          });
        }
        results.push(`📦 تم استخراج ملف مشفر: ${lf.name}`);
        results.push(`🔒 افتح المخزن واضغط على الملف لفكه.`);
        return results;
      }

      // استخراج عادي
      const newImages   = data.files.images   || [];
      const newVideos   = data.files.videos   || [];
      const newDocs     = data.files.documents || [];
      const newMessages = data.files.messages || [];

      const updatedImages   = [...decryptedImages,   ...newImages.filter(i => !decryptedImages.some(x => x.id === i.id))];
      const updatedVideos   = [...decryptedVideos,   ...newVideos.filter(v => !decryptedVideos.some(x => x.id === v.id))];
      const updatedDocs     = [...decryptedDocs,     ...newDocs.filter(d => !decryptedDocs.some(x => x.id === d.id))];
      const updatedMessages = [...decryptedMessages, ...newMessages];

      setDecryptedImages(updatedImages);
      setDecryptedVideos(updatedVideos);
      setDecryptedDocs(updatedDocs);
      setDecryptedMessages(updatedMessages);

      // اكتشاف هواتف وكاميرات وصرافات
      const targetKey = activeHackTarget.targetKey || '';
      let newPhones  = discoveredPhones;
      let newAtms    = discoveredAtms;
      let newCameras = discoveredCameras;

      if (targetKey === 'SRV-09-W') { newPhones = true; newCameras = true; setDiscoveredPhones(true); setDiscoveredCameras(true); }
      if (targetKey === 'SRV-14-C') { newAtms = true; setDiscoveredAtms(true); }

      socket.emit('sync_decrypted_data', {
        roomCode,
        data: {
          decryptedImages: updatedImages,
          decryptedVideos: updatedVideos,
          decryptedDocs: updatedDocs,
          decryptedMessages: updatedMessages,
          encryptedFolderUnlocked: false,
          extractedEncryptedFolder: true,
          discoveredPhones: newPhones,
          discoveredAtms: newAtms,
          discoveredCameras: newCameras
        }
      });

      const total = newImages.length + newVideos.length + newDocs.length + newMessages.length;
      results.push(`✅ Extracted ${total} item(s) successfully.`);
      results.push(`📂 Check the repository for your files.`);
      return results;
    }

    // ── TRACK (vehicles only) ─────────────────────────────────
    if (type === 'vehicles') {
      if (cleanCmd.startsWith('track ')) {
        const plate = cmd.replace(/track\s*/i, '').trim();
        if (!plate) {
          results.push('❌ اكتب رقم اللوحة. مثال: track س ص 1993');
        } else {
          const trackResults = trackVehicle(plate);
          if (!trackResults || trackResults.length === 0) {
            results.push(`❌ لم يتم العثور على مركبة: "${plate}"`);
          } else {
            results.push(`🔍 Tracking: ${plate}`);
            results.push(`📍 Found ${trackResults.length} sighting(s):`);
            trackResults.forEach((r, idx) => {
              results.push(`   ${idx + 1}. [${r.time}] ${r.location}`);
              if (r.notes) results.push(`      📝 ${r.notes}`);
            });
          }
        }
      } else {
        results.push(`❌ Unknown command. Use: track [plate number]`);
      }
      return results;
    }

    // ── INFO (network only) ───────────────────────────────────
    if (type === 'network' && cleanCmd.startsWith('info ')) {
      const name = cleanCmd.replace('info ', '').trim();
      const servers = currentCase?.hackableTargets?.servers || {};
      const found = Object.values(servers).find(s =>
        s.name.toLowerCase().includes(name) || s.ip.includes(name)
      );
      if (found) {
        results.push(`📌 ${found.name}`);
        results.push(`   IP: ${found.ip}`);
        results.push(`   Type: ${found.type || 'server'}`);
      } else {
        results.push(`❌ "${name}" not found.`);
      }
      return results;
    }

    results.push(`❌ Unknown command: "${cmd}". Type "help".`);
    return results;
  };

  const renderRepository = () => {
    const images = syncedDecryptedImages.length > 0 ? syncedDecryptedImages : decryptedImages;
    const videos = syncedDecryptedVideos.length > 0 ? syncedDecryptedVideos : decryptedVideos;
    const docs = syncedDecryptedDocs.length > 0 ? syncedDecryptedDocs : decryptedDocs;
    const messages = syncedDecryptedMessages.length > 0 ? syncedDecryptedMessages : decryptedMessages;

    return (
      <RepositoryViewer
        decryptedImages={images}
        decryptedVideos={videos}
        decryptedDocs={docs}
        decryptedMessages={messages}
        onDocClick={(doc) => {
          if (doc.isLocked) {
            setLockedFileModal(doc);
          }
        }}
      />
    );
  };

  const renderDesktop = () => {
    const apps = [
      { id: 'case_report', name: 'محضر النيابة', icon: <FaFileInvoice className="text-amber-500" />, locked: false },
      { id: 'locations_map', name: 'خريطة الأماكن', icon: hasOpenedReport ? <FaMapMarkedAlt className="text-emerald-400" /> : <FaLock className="text-gray-500" />, locked: !hasOpenedReport },
      { id: 'browser', name: 'متصفح الاستخبارات', icon: <FaSearch className="text-cyan-400" />, locked: false },
      { id: 'terminal_hack', name: 'محاكي الاختراق', icon: <FaTerminal className="text-cyan-400" />, locked: false },
      { id: 'repository', name: 'مخزن المستندات', icon: <FaFolder className="text-cyan-400" />, locked: false },
      { id: 'email_cracker', name: 'اختراق البريد', icon: <FaEnvelope className="text-rose-400" />, locked: false },
      { id: 'social_media', name: 'تعقب الحسابات', icon: <FaUsers className="text-blue-400" />, locked: false },
      { id: 'federal_comms', name: 'الاتصالات والـ GPS', icon: <FaSatellite className="text-cyan-500" />, locked: false },
      { id: 'notepad', name: 'مفكرة التحقيق', icon: <FaFileInvoice className="text-yellow-400" />, locked: false },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black p-6" dir="rtl">
        <div className="bg-gray-900/60 p-4 mb-6 flex justify-between items-center border border-gray-800 rounded-xl">
          <h3 className="text-cyan-400 font-bold text-xs">🕵️ منظومة التحقيق</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWinnerModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-700 to-cyan-700 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              📋 حل القضية
            </button>
            <button
              onClick={() => socket.emit('request_new_case', { roomCode })}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              🔄 قضية جديدة
            </button>

            <button
              onClick={() => setShowRules(true)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-xl text-xs font-bold transition-all"
            >
              📖 القواعد
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {apps.map((app) => (
            <div key={app.id} onClick={() => handleAppClick(app.id)} className={`p-5 rounded-2xl text-center cursor-pointer border transition-all ${app.locked ? 'bg-gray-950/40 border-gray-900 opacity-40' : 'bg-gray-900/40 border-gray-800 hover:border-cyan-500'}`}>
              <div className="text-2xl mb-2 flex justify-center">{app.icon}</div>
              <p className="text-[11px] font-bold text-white leading-tight">{app.name}</p>
            </div>
          ))}
        </div>    
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800 max-h-36 overflow-y-auto">
            <h4 className="text-cyan-500 font-bold mb-2 text-xs flex items-center gap-2"><FaBell /> السجل</h4>
            {notificationHistory.map((n, i) => (<div key={i} className="text-[11px] text-gray-400 py-1 border-b border-gray-900 flex justify-between"><span>{n.message}</span></div>))}
          </div>
          <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800 text-[11px] text-gray-400">
            <p className="font-bold text-cyan-500 mb-1">المحققون:</p>
            {gameState?.players?.map(p => <div key={p.id} className="p-1 bg-black/20 rounded mb-1">👤 {p.name || p.id} {p.id === playerId && '(أنت)'}</div>)}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  if (!gameState) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono text-xs">⏳ Connecting...</div>;
  }

  if (!gameState.started) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-2xl border border-cyan-500/20 max-w-md w-full text-center">
          <span className="text-4xl block mb-3 animate-pulse">🕵️</span>
          <h2 className="text-lg font-bold text-cyan-400 mb-4">منظومة المحقق الرقمي</h2>
          <p className="text-gray-400 text-xs mb-6">في انتظار إشارة البدء...</p>
          {isAdmin && (
            <button onClick={handleStartGame} className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg">
              🚀 تفعيل النظام
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      <AnimatePresence>
        {isCaseLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex flex-col items-center justify-center text-center p-4">
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="space-y-4">
              <div className="text-4xl animate-spin inline-block border-4 border-cyan-500 border-t-transparent rounded-full w-12 h-12 mb-2"></div>
              <h2 className="text-cyan-400 font-mono text-base font-bold tracking-widest uppercase animate-pulse">🔄 LOADING...</h2>
              <p className="text-gray-400 text-xs font-mono">جاري تهيئة القضية...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div key={notif.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 bg-gray-900 border border-cyan-500/40 text-cyan-400 rounded-xl text-center text-xs font-bold shadow-2xl">
              {notif.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {caseResolved && (
        <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center backdrop-blur-md p-4" dir="rtl">
          <div className="bg-gray-900 border border-emerald-500 rounded-2xl p-8 text-center max-w-md w-full">
            <h2 className="text-2xl font-black text-emerald-400 mb-2">✅ تم حل القضية!</h2>
            <button onClick={handleNewCase} className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs mt-4">القضية التالية</button>
          </div>
        </div>
      )}

      {isDesktopView ? renderDesktop() : (
        <div className="fixed inset-0 bg-black/95 z-50 p-4 flex flex-col">
          <div className="bg-gray-900 p-3 flex justify-between items-center rounded-t-xl border-b border-gray-800" dir="rtl">
            <span className="text-cyan-400 font-bold text-xs">📟 {activeApp}</span>
            <button onClick={() => setIsDesktopView(true)} className="text-rose-400 font-bold text-[11px] bg-rose-950/30 px-3 py-1 rounded border border-rose-900/30">← العودة</button>
          </div>
          <div className="flex-1 bg-gray-900/20 p-4 overflow-y-auto rounded-b-xl border-x border-b border-gray-855">
            {activeApp === 'case_report' && (
              <CaseReportRenderer
                caseReport={currentCase?.caseReport}
                introPages={currentCase?.introReportPages}
              />
            )}
            {activeApp === 'locations_map' && renderLocationsMap()}
            {activeApp === 'browser' && renderBrowser()}
            {activeApp === 'terminal_hack' && renderTerminal()}
            {activeApp === 'repository' && renderRepository()}
            {activeApp === 'email_cracker' && renderEmailCracker()}
            {activeApp === 'social_media' && <SocialMediaSection socialSearchQuery={socialSearchQuery} setSocialSearchQuery={setSocialSearchQuery} selectedPlatform={selectedPlatform} setSelectedPlatform={setSelectedPlatform} handleSocialSearch={handleSocialSearch} foundProfiles={foundProfiles} />}
            {activeApp === 'federal_comms' && renderFederalComms()}
            {activeApp === 'notepad' && (
              <div className="bg-gray-950 h-full flex flex-col rounded-xl p-4" dir="rtl">
                <h3 className="text-yellow-400 font-bold text-xs mb-3 flex items-center gap-2">
                  📝 مفكرة التحقيق
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="دوّن ملاحظاتك هنا... أسماء، أرقام، روابط بين الأدلة..."
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 resize-none outline-none leading-relaxed font-mono"
                  dir="rtl"
                />
                <p className="text-gray-600 text-[10px] mt-2 text-center">
                  المفكرة محلية — تُحفظ في جلستك فقط
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* جلسات الترمينال الفرعية */}
      {Object.keys(activeSessions).filter(k => activeSessions[k]).map(sessionId => (
        <TerminalSession
          key={sessionId}
          title={`📟 ${sessionId.toUpperCase()}`}
          sessionId={sessionId}
          onClose={() => closeSession(sessionId)}
          logs={sessionLogs[sessionId] || []}
          onCommand={handleSessionCommand}
          isLocked={false}
        />
      ))}

      {['network', 'phones', 'cameras', 'vehicles', 'atms'].map(type =>
        openSubTerminals[type] ? (
          <SubTerminal
            key={type}
            type={type}
            onClose={() => closeSubTerminal(type)}
            onCommand={handleSubTerminalCommand}
            persistedLogs={subTerminalLogs[type]}
            onLogsUpdate={(logs) => updateSubTerminalLogs(type, logs)}
          />
        ) : null
      )}

      {lockedFileModal && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-gray-900 border border-cyan-700/40 rounded-xl p-6 max-w-sm w-full">
            <h4 className="text-cyan-400 font-bold text-sm mb-1">🔒 {lockedFileModal.title}</h4>
            <p className="text-gray-400 text-xs mb-3">أدخل كلمة مرور الملف</p>
            <input
              type="text"
              value={lockedFileModal.input || ''}
              onChange={e => setLockedFileModal(prev => ({...prev, input: e.target.value}))}
              className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-xs font-mono mb-3"
              placeholder="الباسورد..."
              dir="ltr"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const { input, password, unlockedContent, id } = lockedFileModal;
                  if (input === password) {
                    const uc = unlockedContent;
                    const updatedImages = [...decryptedImages, ...(uc.images || [])];
                    const updatedVideos = [...decryptedVideos, ...(uc.videos || [])];
                    const updatedDocs = [...decryptedDocs.filter(d => d.id !== id), ...(uc.documents || [])];
                    const updatedMessages = [...decryptedMessages, ...(uc.messages || [])];
                    setDecryptedImages(updatedImages);
                    setDecryptedVideos(updatedVideos);
                    setDecryptedDocs(updatedDocs);
                    setDecryptedMessages(updatedMessages);
                    socket.emit('sync_decrypted_data', {
                      roomCode,
                      data: {
                        decryptedImages: updatedImages,
                        decryptedVideos: updatedVideos,
                        decryptedDocs: updatedDocs,
                        decryptedMessages: updatedMessages,
                        encryptedFolderUnlocked: true,
                        extractedEncryptedFolder: true,
                        discoveredPhones, discoveredAtms, discoveredCameras
                      }
                    });
                    addNotification('🔓 تم فك الملف! المحتوى في المخزن.', 'success');
                    setLockedFileModal(null);
                  } else {
                    addNotification('❌ كلمة مرور خاطئة', 'error');
                  }
                }}
                className="flex-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded py-2 text-xs font-bold"
              >فك التشفير</button>
              <button onClick={() => setLockedFileModal(null)}
                className="flex-1 bg-gray-800 text-gray-300 rounded py-2 text-xs">إلغاق</button>
            </div>
          </div>
        </div>
      )}

      {showRules && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gray-800 px-6 py-4 rounded-t-2xl flex justify-between items-center border-b border-gray-700">
              <h3 className="text-cyan-400 font-bold text-sm">📖 كيف تلعب؟</h3>
              <button onClick={() => setShowRules(false)} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-gray-300 leading-relaxed">
              <p className="text-white font-bold text-base">أنت محقق جنائي رقمي.</p>
              <p>وصلتك قضية معقدة — شخص اتضبط في الشارع في الساعة الثانية صباحاً، وبحوزته أدلة رقمية مشبوهة. مهمتك إنك تكشف الحقيقة كاملة من وراء الحادثة.</p>
              <div className="border-t border-gray-700 pt-3">
                <p className="text-cyan-400 font-bold mb-2">الأدوات المتاحة:</p>
                <ul className="space-y-2 text-gray-400">
                  <li>📋 <span className="text-white">محضر النيابة</span> — ابدأ من هنا. اقرأه كويس — كل تفصيلة ممكن تكون مهمة.</li>
                  <li>🔍 <span className="text-white">المتصفح</span> — استخدم المتصفح للبحث .</li>
                  <li>💻 <span className="text-white">الترمينال</span> — اختر جهاز وحاول تدخله. لو عرفت الباسورد هتلاقي أدلة جوّاه.</li>
                  <li>📂 <span className="text-white">المخزن</span> — كل الملفات اللي بتستخرجها بتتجمع هنا.</li>
                  <li>✉️ <span className="text-white">البريد الإلكتروني</span> — لو لقيت أدريس وباسورد، حاول تدخله.</li>
                  <li>👤 <span className="text-white">السوشيال ميديا</span> — ابحث عن أسماء أو حسابات ممكن تلاقيها في الأدلة.</li>
                </ul>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <p className="text-cyan-400 font-bold mb-2">قواعد مهمة:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• مفيش ترتيب إجباري — أنت بتقرر من فين تبدأ.</li>
                  <li>• مش كل دليل حقيقي — في معلومات مضللة، فكّر قبل ما تصدّق.</li>
                  <li>• الباسوردات مش هتلاقيها جاهزة — لازم تجمعها من أماكن مختلفة.</li>
                  <li>• لما تحس إنك جمعت الأدلة الكافية، ارفع تقرير الإغلاق.</li>
                </ul>
              </div>
              <div className="border-t border-gray-700 pt-3 text-center">
                <p className="text-gray-500 text-xs">اللعبة جماعية — كل المحققين في الغرفة بيشوفوا نفس الأدلة.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWinnerModal && (
        <CaseClosureForm
          onSubmit={handleSubmitAnswer}
          onClose={() => { setShowWinnerModal(false); setAnswerResult(null); }}
          answerResult={answerResult}
          playerName={gameState?.players?.find(p => p.id === playerId)?.name || 'محقق'}
          canStartNewCase={allPlayersSubmitted}
          onNewCase={handleNewCase}
          questions={currentCase?.closureQuestions || {}}
        />
      )}
      <DetectiveNotepad />
    </div>
  );
};

export default DigitalDetectiveGame;