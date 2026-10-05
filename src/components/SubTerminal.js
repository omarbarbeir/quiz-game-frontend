// ==========================================
// SubTerminal.jsx
// نافذة ترمينال فرعية تظهر فوق الترمينال الرئيسي
// ==========================================

import React, { useState, useEffect, useRef } from 'react';

const SUB_TERMINAL_CONFIG = {
  network: {
    title: '🌐 NETWORK SCANNER',
    color: 'cyan',
    prompt: 'net@scan:~$',
    helpText: [
      '  scan         - مسح الشبكة وإظهار السيرفرات',
      '  connect [ip] - الاتصال بسيرفر عن طريق الـ IP',
      '  info [name]  - معلومات عن سيرفر معين',
      '  clear        - مسح الشاشة',
      '  close        - إغلاق النافذة (البيانات تتحفظ)',
    ],
  },
  phones: {
    title: '📱 PHONE SCANNER',
    color: 'green',
    prompt: 'phone@scan:~$',
    helpText: [
      '  scan              - عرض الهواتف المتاحة',
      '  connect [name]    - الاتصال بهاتف',
      '  crack [password]  - كسر الباسورد',
      '  extract           - استخراج البيانات',
      '  clear             - مسح الشاشة',
      '  close             - إغلاق النافذة',
    ],
  },
  cameras: {
    title: '📹 CAMERA SCANNER',
    color: 'rose',
    prompt: 'cam@scan:~$',
    helpText: [
      '  scan              - عرض الكاميرات المتاحة',
      '  connect [name]    - الاتصال بكاميرا',
      '  crack [password]  - كسر الباسورد',
      '  extract           - استخراج التسجيلات',
      '  clear             - مسح الشاشة',
      '  close             - إغلاق النافذة',
    ],
  },
  vehicles: {
    title: '🚗 VEHICLE TRACKER',
    color: 'yellow',
    prompt: 'track@veh:~$',
    helpText: [
      '  track [plate]  - تتبع مركبة برقم اللوحة',
      '  history        - عرض آخر عمليات التتبع',
      '  clear          - مسح الشاشة',
      '  close          - إغلاق النافذة',
    ],
  },
  atms: {
    title: '🏧 ATM SCANNER',
    color: 'amber',
    prompt: 'atm@scan:~$',
    helpText: [
      '  scan              - عرض الصرافات المتاحة',
      '  connect [name]    - الاتصال بصراف',
      '  crack [password]  - كسر الباسورد',
      '  extract           - استخراج السجلات',
      '  clear             - مسح الشاشة',
      '  close             - إغلاق النافذة',
    ],
  },
};

const COLOR_MAP = {
  cyan:   { border: '#06b6d4', text: '#06b6d4', bg: 'rgba(6,182,212,0.08)' },
  green:  { border: '#22c55e', text: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  rose:   { border: '#f43f5e', text: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
  yellow: { border: '#eab308', text: '#eab308', bg: 'rgba(234,179,8,0.08)' },
  amber:  { border: '#f59e0b', text: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
};

const SubTerminal = ({
  type,           // 'network' | 'phones' | 'cameras' | 'vehicles' | 'atms'
  onClose,        // () => void
  onCommand,      // (cmd, type) => string[] — بيرجع array of log lines
  persistedLogs,  // string[] — اللوجز المحفوظة من قبل
  onLogsUpdate,   // (logs) => void — لما تتحدث اللوجز
}) => {
  const config = SUB_TERMINAL_CONFIG[type];
  const colors = COLOR_MAP[config?.color || 'cyan'];
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState(persistedLogs || [
    `🔓 ${config?.title} — جلسة مفتوحة.`,
    `اكتب "help" لعرض الأوامر المتاحة.`,
  ]);
  const logsEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    let newLogs = [...logs, `${config.prompt} ${cmd}`];

    if (cmd.toLowerCase() === 'close') {
      onLogsUpdate?.(newLogs);
      onClose();
      setInput('');
      return;
    }

    if (cmd.toLowerCase() === 'clear') {
      const cleared = [`🔓 ${config?.title} — جلسة مفتوحة.`];
      setLogs(cleared);
      onLogsUpdate?.(cleared);
      setInput('');
      return;
    }

    if (cmd.toLowerCase() === 'help') {
      newLogs = [...newLogs, '📋 الأوامر المتاحة:', ...(config?.helpText || [])];
    } else {
      const result = onCommand?.(cmd, type) || [`❌ أمر غير معروف: "${cmd}"`];
      newLogs = [...newLogs, ...result];
    }

    setLogs(newLogs);
    onLogsUpdate?.(newLogs);
    setInput('');
  };

  if (!config) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      {/* الخلفية الشفافة — بتخلي الترمينال الكبير يبان من ورا */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          pointerEvents: 'all',
        }}
        onClick={() => { onLogsUpdate?.(logs); onClose(); }}
      />

      {/* النافذة الفرعية */}
      <div style={{
        position: 'relative',
        background: '#030712',
        border: `1px solid ${colors.border}`,
        borderTop: `3px solid ${colors.border}`,
        borderRadius: '12px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'all',
        boxShadow: `0 0 40px ${colors.border}33`,
        fontFamily: 'monospace',
      }}>

        {/* هيدر النافذة */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderBottom: `1px solid ${colors.border}33`,
          background: colors.bg,
          borderRadius: '10px 10px 0 0',
        }}>
          <span style={{ color: colors.text, fontWeight: 700, fontSize: '12px', letterSpacing: '1px' }}>
            {config.title}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#4b5563', fontSize: '10px' }}>
              اضغط ESC أو اكتب "close" للإغلاق
            </span>
            <button
              onClick={() => { onLogsUpdate?.(logs); onClose(); }}
              style={{
                background: 'none',
                border: `1px solid ${colors.border}44`,
                color: colors.text,
                cursor: 'pointer',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >✕</button>
          </div>
        </div>

        {/* منطقة اللوجز */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 14px',
          fontSize: '12px',
          lineHeight: 1.7,
          direction: 'ltr',
          textAlign: 'left',
          minHeight: '200px',
          maxHeight: '380px',
        }}>
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                color: log.startsWith('❌') ? '#f87171'
                  : log.includes('SUCCESS') || log.includes('✅') ? '#4ade80'
                  : log.startsWith(config.prompt) ? '#e2e8f0'
                  : log.startsWith('📋') || log.startsWith('  ') ? '#94a3b8'
                  : colors.text,
                whiteSpace: 'pre-wrap',
                marginBottom: '1px',
                fontWeight: log.includes('SUCCESS') ? 700 : 400,
              }}
            >
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderTop: `1px solid ${colors.border}33`,
            background: colors.bg,
            borderRadius: '0 0 10px 10px',
          }}
        >
          <span style={{ color: colors.text, fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
            {config.prompt}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="اكتب الأمر..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: '12px',
              fontFamily: 'monospace',
              direction: 'ltr',
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default SubTerminal;