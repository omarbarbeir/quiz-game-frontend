import React, { useState } from 'react';

// ==========================================
// CaseReportRenderer — كومبوننت المحضر الرسمي
// ==========================================
const CaseReportRenderer = ({ caseReport, introPages }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = caseReport ? Object.keys(caseReport).filter(k => k.startsWith('page')).length : 0;
  if (!caseReport && introPages) {
    return (
      <div className="p-4 space-y-4 text-gray-200 text-sm leading-relaxed" dir="rtl">
        {introPages.map((page, idx) => (
          <div key={idx} className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 whitespace-pre-line">
            {page}
          </div>
        ))}
      </div>
    );
  }

  if (!caseReport) return null;
  const { meta, page1, page2, page3, page4, page5, page6 } = caseReport;

  // ==========================================
  // الهيدر الثابت — بيظهر في كل الصفحات
  // ==========================================
  const Header = () => (
    <div>
      <div style={{
        background: '#1a3a5c',
        color: '#f5edd6',
        textAlign: 'center',
        padding: '10px 20px 8px',
        borderBottom: '3px double #c9b06a'
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '1px', margin: 0 }}>
          جمهورية مصر العربية — النيابة العامة — إدارة الشؤون الجنائية الموحدة
        </p>
        <p style={{ fontSize: '17px', fontWeight: 700, margin: '4px 0 2px' }}>
          محضر تحقيق رقم ({meta.caseNumber}) لسنة {meta.year} {meta.caseType}
        </p>
        <p style={{ fontSize: '11px', letterSpacing: '2px', opacity: 0.85, margin: 0 }}>
          {meta.classification} — للاستخدام الرسمي فقط
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 20px',
        borderBottom: '1px solid #c9b06a',
        background: '#ede0b8',
        fontSize: '11px',
        color: '#5a3e1b'
      }}>
        <span><b>تاريخ التحرير:</b> {meta.date}</span>
        <span style={{
          border: '2px solid #8b0000',
          color: '#8b0000',
          fontWeight: 700,
          fontSize: '11px',
          padding: '2px 10px',
          letterSpacing: '1px',
          transform: 'rotate(-2deg)',
          display: 'inline-block'
        }}>{meta.classification}</span>
        <span><b>رقم الملف:</b> {meta.fileRef}</span>
      </div>
    </div>
  );

  // ==========================================
  // الفوتر — بيظهر في كل الصفحات
  // ==========================================
  const Footer = () => (
    <div style={{
      background: '#8b0000',
      color: '#f5edd6',
      textAlign: 'center',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '2px',
      padding: '5px',
      marginTop: '16px'
    }}>
      {meta.classification} — يُحظر تداول هذا المحضر خارج النطاق الرسمي — صفحة {currentPage} من {totalPages}
    </div>
  );

  // ==========================================
  // ستايل مشترك
  // ==========================================
  const sectionTitle = {
    fontSize: '12px',
    fontWeight: 700,
    color: '#1a3a5c',
    borderBottom: '1px solid #c9b06a',
    paddingBottom: '3px',
    margin: '16px 0 10px',
    letterSpacing: '1px'
  };

  const articleStyle = {
    fontSize: '13px',
    lineHeight: 2,
    textAlign: 'justify',
    marginBottom: '8px'
  };

  const articleNum = {
    fontWeight: 700,
    color: '#1a3a5c',
    fontSize: '12px'
  };

  const interrogationBlock = {
    background: '#ede0b8',
    border: '1px solid #c9b06a',
    borderRight: '4px solid #1a3a5c',
    padding: '10px 14px',
    margin: '12px 0',
    fontSize: '13px',
    lineHeight: 1.9
  };

  const interrHeader = {
    fontSize: '11px',
    fontWeight: 700,
    color: '#8b0000',
    letterSpacing: '1px',
    marginBottom: '6px',
    borderBottom: '1px dashed #c9b06a',
    paddingBottom: '4px'
  };

  const stateStyle = {
    color: '#5a3e1b',
    fontSize: '11px',
    fontStyle: 'italic',
    marginBottom: '8px',
    display: 'block'
  };

  const digitalBox = {
    background: '#fff8e8',
    border: '1px solid #c9b06a',
    borderRight: '3px solid #8b0000',
    padding: '8px 12px',
    fontSize: '12px',
    lineHeight: 1.8,
    margin: '10px 0',
    direction: 'ltr',
    fontFamily: 'monospace',
    color: '#1a1208',
    whiteSpace: 'pre-line'
  };

  // ==========================================
  // الصفحة الأولى
  // ==========================================
  const Page1 = () => {
    const person = page1?.defendant || page1?.victim || {};
    const fields = [
      ['المحقق المختص', meta.investigator],
      ['تاريخ الحادثة', meta.date],
      ['مكان الحادثة', meta.location],
      person.name && ['الضحية / المتهم', `${person.name} — ${person.job || ''}`],
      person.charges && ['التهم المنسوبة', person.charges],
      person.vehicle && ['المركبة', person.vehicle],
      meta.orderRef && ['أمر الضبط', meta.orderRef],
      meta.referralSource && ['جهة الإحالة', meta.referralSource],
    ].filter(Boolean);

    return (
      <div style={{ padding: '16px 24px' }}>
        <div style={sectionTitle}>{page1.title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: '12px', marginBottom: '12px' }}>
          {fields.map(([label, val], i) => (
            <div key={i} style={{ display: 'flex', gap: '4px' }}>
              <span style={{ color: '#5a3e1b', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '11px' }}>{label}:</span>
              <span style={{ color: '#1a1208', fontSize: '11px' }}>{val}</span>
            </div>
          ))}
        </div>

        {page1.eventNarrative && (
          <>
            <div style={sectionTitle}>ملابسات الحادثة</div>
            <p style={articleStyle}>{page1.eventNarrative}</p>
          </>
        )}

        {page1.arrestNarrative && (
          <>
            <div style={sectionTitle}>ملابسات الضبط والإحراز</div>
            <p style={articleStyle}>{page1.arrestNarrative}</p>
          </>
        )}

        {page1.crimeScene && (
          <>
            <div style={sectionTitle}>مسرح الجريمة</div>
            <p style={articleStyle}>{page1.crimeScene}</p>
          </>
        )}

        {page1.forensicSummary && (
          <>
            <div style={sectionTitle}>ملخص التقرير الجنائي</div>
            <p style={articleStyle}>{page1.forensicSummary}</p>
          </>
        )}

        {page1.evidence && (
          <>
            <div style={sectionTitle}>المضبوطات</div>
            <ul style={{ margin: '6px 0 6px 16px', fontSize: '13px', lineHeight: 2 }}>
              {page1.evidence.map((e, i) => (
                <li key={i}><b>البند ({e.number}):</b> {e.description}</li>
              ))}
            </ul>
          </>
        )}

        {page1.keyQuestions && (
          <>
            <div style={sectionTitle}>تساؤلات التحقيق الأولية</div>
            <ul style={{ margin: '6px 0 6px 16px', fontSize: '13px', lineHeight: 2 }}>
              {page1.keyQuestions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </>
        )}

        {page1.closingNote && (
          <p style={{ ...articleStyle, marginTop: '8px' }}>{page1.closingNote}</p>
        )}

        {page1.legalRefs && (
          <div style={{ fontSize: '11px', color: '#5a3e1b', borderTop: '1px dashed #c9b06a', paddingTop: '6px', marginTop: '10px' }}>
            <b>المستند القانوني: </b>{page1.legalRefs.join(' — ')}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // كومبوننت الاستجواب — مشترك بين ص٢ وص٣
  // ==========================================
  const InterrogationSection = ({ interrogations }) => (
    <div>
      {interrogations.map((person, idx) => (
        <div key={idx} style={interrogationBlock}>
          <div style={interrHeader}>
            استجواب: {person.name} — {person.role} — {person.job}
          </div>
          <span style={stateStyle}>({person.state})</span>
          {person.dialogue.map((line, i) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <p style={{ margin: '2px 0' }}>
                <span style={{ color: '#8b0000', fontWeight: 700 }}>المحقق: </span>
                <span style={{ color: '#1a1208' }}>{line.q}</span>
              </p>
              <p style={{ margin: '2px 0' }}>
                <span style={{ color: '#1a3a5c', fontWeight: 700 }}>{person.name.split(' ')[0]}: </span>
                <span style={{ color: '#1a1208' }}>{line.a}</span>
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // ==========================================
  // الصفحة الثانية
  // ==========================================
  const Page2 = () => (
    <div style={{ padding: '16px 24px' }}>
      <div style={sectionTitle}>{page2.title}</div>
      {page2.interrogations && (
        <InterrogationSection interrogations={page2.interrogations} />
      )}
      {page2.suspects && (
        <div>
          {page2.suspects.map((s, idx) => (
            <div key={idx} style={interrogationBlock}>
              <div style={interrHeader}>
                {s.name} — {s.relation} — {s.job}
              </div>
              <p style={{ fontSize: '12px', color: '#1a1208', lineHeight: 1.9, margin: '6px 0' }}>
                {s.background}
              </p>
              <p style={{ fontSize: '11px', color: '#8b0000', margin: '4px 0' }}>
                <b>الـ Alibi: </b>{s.alibi}
              </p>
              {s.knownFacts && (
                <ul style={{ margin: '4px 0 0 16px', fontSize: '11px', lineHeight: 1.9, color: '#1a3a5c' }}>
                  {s.knownFacts.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================
  // الصفحة الثالثة
  // ==========================================
  const Page3 = () => (
    <div style={{ padding: '16px 24px' }}>
      <div style={sectionTitle}>{page3.title}</div>
      {page3.interrogations && (
        <InterrogationSection interrogations={page3.interrogations} />
      )}
      {page3.suspects && (
        <div>
          {page3.suspects.map((s, idx) => (
            <div key={idx} style={interrogationBlock}>
              <div style={interrHeader}>
                {s.name} — {s.relation} — {s.job}
              </div>
              <p style={{ fontSize: '12px', color: '#1a1208', lineHeight: 1.9, margin: '6px 0' }}>
                {s.background}
              </p>
              <p style={{ fontSize: '11px', color: '#8b0000', margin: '4px 0' }}>
                <b>الـ Alibi: </b>{s.alibi}
              </p>
              {s.knownFacts && (
                <ul style={{ margin: '4px 0 0 16px', fontSize: '11px', lineHeight: 1.9, color: '#1a3a5c' }}>
                  {s.knownFacts.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================
  // الصفحة الرابعة
  // ==========================================
  const Page4 = () => (
    <div style={{ padding: '16px 24px' }}>
      <div style={sectionTitle}>{page4.title}</div>
      {page4.sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: '14px' }}>
          <p style={{ ...articleStyle, marginBottom: '4px' }}>
            <span style={articleNum}>{sec.subtitle} — </span>
            {sec.content}
          </p>
          {sec.digitalEvidence && (
            <div style={digitalBox}>{sec.digitalEvidence}</div>
          )}
        </div>
      ))}
    </div>
  );

  // ==========================================
  // الصفحة الخامسة
  // ==========================================
  const Page5 = ({ page }) => {
    const p = page || page5;
    if (!p) return null;
    return (
      <div style={{ padding: '16px 24px' }}>
        <div style={sectionTitle}>{p.title}</div>
        {p.contradictions?.map((c, i) => (
          <div key={i} style={{
            background: '#ede0b8', border: '1px solid #c9b06a',
            borderRight: '4px solid #8b0000', padding: '8px 12px',
            marginBottom: '10px', fontSize: '12px', lineHeight: 1.9
          }}>
            <p style={{ fontWeight: 700, color: '#8b0000', margin: '0 0 4px', fontSize: '11px' }}>
              التناقض رقم ({c.number}): {c.title}
            </p>
            <p style={{ margin: 0, color: '#1a1208' }}>{c.content}</p>
          </div>
        ))}
        {p.sections?.map((sec, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <p style={{ ...articleStyle, marginBottom: '4px' }}>
              <span style={articleNum}>{sec.subtitle} — </span>
              {sec.content}
            </p>
          </div>
        ))}
        {p.openQuestions && (
          <>
            <div style={sectionTitle}>تساؤلات مفتوحة</div>
            <ul style={{ margin: '6px 0 6px 16px', fontSize: '13px', lineHeight: 2, color: '#1a1208' }}>
              {p.openQuestions.map((q, i) => <li key={i}>{q}</li>)}
            </ul>
          </>
        )}
        {p.closingNote && (
          <p style={{ ...articleStyle, borderTop: '1px dashed #c9b06a', paddingTop: '10px', marginTop: '12px', fontSize: '12px', color: '#5a3e1b' }}>
            <b>توصية المحقق: </b>{p.closingNote}
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '24px', fontSize: '11px', textAlign: 'center' }}>
          {[['المحقق المختص', meta.investigator], ['قائد الفريق', meta.arrestCommander || meta.crimeSceneOfficer || ''], ['الخبير الفني', meta.forensicExpert]].map(([role, name], i) => (
            <div key={i} style={{ borderTop: '1px solid #1a1208', paddingTop: '4px', color: '#5a3e1b' }}>
              {role}<br /><b>{name}</b><br />التوقيع: ____________
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==========================================
  // الـ pages map
  // ==========================================

  const pages = {
    1: <Page1 />,
    2: page2 ? <Page2 /> : null,
    3: page3 ? <Page3 /> : null,
    4: page4 ? <Page4 /> : null,
    5: page5 ? <Page5 /> : null,
    6: page6 ? <Page5 page={page6} /> : null,
  };
  return (
    <div style={{
      background: '#f5edd6',
      color: '#1a1208',
      fontFamily: "'Amiri', 'Cairo', serif",
      direction: 'rtl',
      maxWidth: '680px',
      margin: '0 auto',
      border: '1px solid #c9b06a',
      boxShadow: '2px 2px 8px rgba(0,0,0,0.18)'
    }}>
      <Header />
      <div style={{ minHeight: '400px' }}>
        {pages[currentPage]}
      </div>
      <Footer />

      {/* شريط التنقل */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 20px',
        background: '#ede0b8',
        borderTop: '1px solid #c9b06a'
      }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          style={{
            background: currentPage === 1 ? '#ccc' : '#1a3a5c',
            color: '#f5edd6',
            border: 'none',
            padding: '4px 14px',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'default' : 'pointer',
            fontSize: '12px'
          }}
        >➡️ السابق</button>

        <span style={{ fontSize: '11px', color: '#5a3e1b', fontWeight: 700 }}>
          الصفحة {currentPage} من {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          style={{
            background: currentPage === totalPages ? '#ccc' : '#1a3a5c',
            color: '#f5edd6',
            border: 'none',
            padding: '4px 14px',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'default' : 'pointer',
            fontSize: '12px'
          }}
        >⬅️ التالي</button>
      </div>
    </div>
  );
};

export default CaseReportRenderer;