import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINES_PER_PAGE = 16;
const TOTAL_PAGES = 5;

const DetectiveNotepad = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState(Array(TOTAL_PAGES).fill(''));
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState('next');
  const textareaRef = useRef(null);

  // فوكس على الـ textarea لما الـ notepad يتفتح
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }, [isOpen]);

  const handlePageChange = (direction) => {
    if (isFlipping) return;
    const nextPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    if (nextPage < 0 || nextPage >= TOTAL_PAGES) return;

    setFlipDirection(direction);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(nextPage);
      setIsFlipping(false);
    }, 300);
  };

  const handleTextChange = (val) => {
    const updated = [...pages];
    updated[currentPage] = val;
    setPages(updated);
  };

  // رسم السطور خلف النص
  const renderLines = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ top: '2px' }}>
      {Array(LINES_PER_PAGE).fill(null).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '48px',
            right: '12px',
            top: `${i * 34 + 33}px`,
            height: '1px',
            backgroundColor: 'rgba(100, 130, 200, 0.2)',
          }}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* ── زرار الدفتر الدائري ── */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '28px',
          zIndex: 9000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#1a3a2a',
          border: '2px solid #c8b87a',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 0 4px rgba(200,184,122,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#c8b87a',
          fontSize: '22px',
        }}
        title="مفكرة التحقيق"
      >
        📓
      </motion.button>

      {/* ── الدفتر نفسه ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* خلفية شفافة للإغلاق */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 8999,
                background: 'transparent',
              }}
            />

            {/* الدفتر */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.85, originX: 0, originY: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                position: 'fixed',
                bottom: '96px',
                left: '20px',
                zIndex: 9001,
                width: '340px',
                height: '520px',
                borderRadius: '4px 12px 12px 4px',
                boxShadow: '4px 4px 24px rgba(0,0,0,0.6), -2px 0 8px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                userSelect: 'none',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* العمود الأحمر على اليسار */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '340px',
                height: '100%',
                backgroundColor: '#f5f0dc',
                borderRadius: '4px 12px 12px 4px',
              }} />

              {/* الحلقات على اليمين */}
              <div style={{
                position: 'absolute',
                right: '-8px',
                top: 0,
                bottom: 0,
                width: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                padding: '20px 0',
                zIndex: 2,
              }}>
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#8b7355',
                    border: '2px solid #5a4a2a',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }} />
                ))}
              </div>

              {/* محتوى الدفتر */}
              <div style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f0dc',
                borderRadius: '4px 12px 12px 4px',
                overflow: 'hidden',
              }}>

                {/* الهيدر */}
                <div style={{
                  padding: '10px 16px 6px 16px',
                  borderBottom: '2px solid rgba(100,80,40,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ede8c8',
                }}>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#5a4a2a',
                    letterSpacing: '0.1em',
                  }}>
                    مفكرة التحقيق
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#8b7355',
                  }}>
                    صفحة {currentPage + 1} / {TOTAL_PAGES}
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#8b7355',
                      fontSize: '14px',
                      padding: '2px 4px',
                    }}
                  >✕</button>
                </div>

                {/* منطقة الكتابة */}
                <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>

                  {/* الخط الأحمر الرأسي */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '42px',
                    width: '1.5px',
                    backgroundColor: 'rgba(200,80,80,0.35)',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }} />

                  {/* السطور */}
                  {renderLines()}

                  {/* الـ textarea */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{
                        x: flipDirection === 'next' ? 60 : -60,
                        opacity: 0,
                      }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{
                        x: flipDirection === 'next' ? -60 : 60,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      style={{ position: 'absolute', inset: 0 }}
                    >
                      <textarea
                        ref={textareaRef}
                        value={pages[currentPage]}
                        onChange={e => handleTextChange(e.target.value)}
                        dir="rtl"
                        placeholder={currentPage === 0 ? "دوّن ملاحظاتك هنا..." : ""}
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          resize: 'none',
                          padding: '8px 12px 8px 52px',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#1a1a1a',
                          lineHeight: '34px',
                          position: 'relative',
                          zIndex: 2,
                          cursor: 'text',
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* فوتر — أزرار تقليب الصفحات */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderTop: '1px solid rgba(100,80,40,0.2)',
                  backgroundColor: '#ede8c8',
                }}>

                  {/* زرار الصفحة التالية — يمين */}
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 0 || isFlipping}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: currentPage === 0 ? 'default' : 'pointer',
                      color: currentPage === 0 ? '#c8b87a44' : '#5a4a2a',
                      fontSize: '18px',
                      padding: '2px 8px',
                      opacity: currentPage === 0 ? 0.3 : 1,
                    }}
                    title="الصفحة السابقة"
                  >←</button>

                  {/* نقاط الصفحات */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {Array(TOTAL_PAGES).fill(null).map((_, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          if (isFlipping) return;
                          setFlipDirection(i > currentPage ? 'next' : 'prev');
                          setIsFlipping(true);
                          setTimeout(() => {
                            setCurrentPage(i);
                            setIsFlipping(false);
                          }, 300);
                        }}
                        style={{
                          width: i === currentPage ? '8px' : '6px',
                          height: i === currentPage ? '8px' : '6px',
                          borderRadius: '50%',
                          backgroundColor: i === currentPage ? '#5a4a2a' : '#c8b87a',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </div>

                  {/* زرار الصفحة التالية — يسار */}
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage === TOTAL_PAGES - 1 || isFlipping}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: currentPage === TOTAL_PAGES - 1 ? 'default' : 'pointer',
                      color: currentPage === TOTAL_PAGES - 1 ? '#c8b87a44' : '#5a4a2a',
                      fontSize: '18px',
                      padding: '2px 8px',
                      opacity: currentPage === TOTAL_PAGES - 1 ? 0.3 : 1,
                    }}
                    title="الصفحة التالية"
                  >→</button>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DetectiveNotepad;