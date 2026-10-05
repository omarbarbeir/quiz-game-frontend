import React, { useState } from 'react';

const CaseClosureForm = ({ onSubmit, onClose, answerResult, playerName, canStartNewCase, onNewCase, questions }) => {
  const buildFields = (q) => {
    const keys = Object.keys(q || {});
    if (keys.length === 0) return { culprits: '', motive: '', location: '', financier: '' };
    return Object.fromEntries(keys.map(k => [k, '']));
  };
  const [fields, setFields] = useState(() => buildFields(questions));
  const [signature, setSignature] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key, val) => {
    setFields(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = () => {
    const culpritsValue = (fields['culprits'] || '').trim();
    if (!culpritsValue) return;
    onSubmit(fields);
    setSubmitted(true);
  };

  // ألوان المحضر الأساسي
  const colors = {
    pageBg:      '#f5f0dc',   // لون الورقة الكريمي
    headerBg:    '#2c3e6b',   // الأزرق الداكن للهيدر
    headerText:  '#ffffff',
    sectionTitle:'#2c3e6b',   // عنوان القسم أزرق
    fieldBg:     '#fdf8ec',   // خلفية الحقول فاتحة
    fieldBorder: '#c8b87a',   // حدود ذهبية خفيفة
    labelText:   '#5a4a2a',   // لون التسميات بني
    inputText:   '#1a1a1a',
    footerBg:    '#8b1a1a',   // الأحمر الداكن للفوتر
    footerText:  '#ffffff',
    lineColor:   '#c8b87a',
  };

  // ── شاشة النتيجة ─────────────────────────────────────────
  if (answerResult) {
    const { isCorrect, correctAnswer, score } = answerResult;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full shadow-2xl" style={{ backgroundColor: colors.pageBg }}>

          {/* هيدر النتيجة */}
          <div className="px-6 py-4 text-center" style={{ backgroundColor: colors.headerBg }}>
            <p className="text-[9px] tracking-widest font-mono mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              نيابة الشؤون الجنائية الموحدة — تقييم التقرير النهائي
            </p>
            <h2 className="text-base font-black" style={{ color: colors.headerText, fontFamily: 'serif' }}>
              {isCorrect ? '✓ تقرير مقبول' : '✗ تقرير مرفوض'}
            </h2>
          </div>

          {/* النقاط */}
          {score !== undefined && (
            <div className="px-6 py-3 flex items-center justify-between border-b" style={{ borderColor: colors.lineColor }}>
              <p className="text-xs font-mono" style={{ color: colors.labelText }}>مجموع النقاط</p>
              <p className="text-xl font-black font-mono" style={{
                color: score >= 4 ? '#1a5c2a' : score >= 2 ? '#7a5a00' : '#8b1a1a'
              }}>
                {score} / 4
              </p>
            </div>
          )}

          {/* breakdown */}
          <div className="px-6 py-4 space-y-3">
            {correctAnswer?.breakdown?.map((item, idx) => (
              <div key={idx} className="pb-3 border-b" style={{ borderColor: colors.lineColor, borderStyle: 'dashed' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: item.correct ? '#1a5c2a' : '#8b1a1a' }}>
                    {item.correct ? '✓' : '✗'}
                  </span>
                  <p className="text-[10px] font-mono tracking-wider" style={{ color: colors.labelText }}>
                    {item.label}
                  </p>
                </div>
                <p className="text-sm font-mono pb-0.5 border-b" style={{ color: colors.inputText, borderColor: colors.lineColor }}>
                  {item.playerAnswer || '—'}
                </p>
                {!item.correct && (
                  <p className="text-[10px] mt-1 font-mono" style={{ color: '#8b1a1a' }}>
                    الصحيح: {item.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* فوتر */}
          <div className="px-6 py-3 flex gap-3" style={{ backgroundColor: '#e8e0c8' }}>
            <button onClick={onClose}
              className="flex-1 font-bold py-2 text-xs font-mono border transition-colors hover:opacity-80"
              style={{ backgroundColor: 'transparent', color: colors.labelText, borderColor: colors.lineColor }}>
              إغلاق
            </button>
            {isCorrect && canStartNewCase && (
              <button onClick={onNewCase}
                className="flex-1 font-bold py-2 text-xs font-mono transition-colors hover:opacity-90"
                style={{ backgroundColor: colors.headerBg, color: '#fff' }}>
                قضية جديدة ←
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ── الفورم الرئيسي ────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: colors.pageBg }}>

        {/* هيدر — أزرق داكن زي المحضر */}
        <div className="px-6 py-4 text-center" style={{ backgroundColor: colors.headerBg }}>
          <p className="text-[9px] tracking-[0.25em] font-mono mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
            جمهورية مصر العربية — النيابة العامة — إدارة الشؤون الجنائية الموحدة
          </p>
          <h2 className="text-base font-black" style={{ color: '#ffffff', fontFamily: 'serif' }}>
            محضر إغلاق القضية رقم (٨٤٢) لسنة ٢٠٢٦ جنايات
          </h2>
          <p className="text-[9px] tracking-widest mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
            سري للغاية — للاستخدام الرسمي فقط
          </p>
        </div>

        {/* بيانات المحضر */}
        <div className="px-6 py-2 flex justify-between items-center border-b" style={{ borderColor: colors.lineColor, backgroundColor: '#ede8d0' }}>
          <p className="text-[10px] font-mono" style={{ color: colors.labelText }}>
            تاريخ التحرير: {new Date().toLocaleDateString('ar-EG')}
          </p>
          <div className="px-3 py-0.5 border text-[10px] font-bold font-mono"
               style={{ borderColor: '#8b1a1a', color: '#8b1a1a' }}>
            سري للغاية
          </div>
          <p className="text-[10px] font-mono" style={{ color: colors.labelText }}>
            رقم الملف: ج.ش.م/٢٠٢٦/٨٤٢
          </p>
        </div>

        {/* تعليمات */}
        <div className="px-6 py-2 border-b" style={{ borderColor: colors.lineColor, borderStyle: 'dashed' }}>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: colors.labelText }}>
            ⚠ يُرجى تعبئة جميع الحقول بناءً على الأدلة المتوفرة. التقرير الناقص أو المبني على معلومات غير مثبتة سيُرفض.
          </p>
        </div>

        {/* حقول الفورم */}
        {Object.entries(questions).map(([key, q], idx) => (
          <div key={key} className="p-3 border" style={{ backgroundColor: '#fdf8ec', borderColor: '#c8b87a' }}>
            <p className="text-[10px] font-mono mb-2 font-bold" style={{ color: '#2c3e6b' }}>
              {['أولاً', 'ثانياً', 'ثالثاً', 'رابعاً', 'خامساً'][idx]}: {q.label}
            </p>
            <textarea
              rows={2}
              value={fields[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={q.placeholder || '...'}
              className="w-full bg-transparent border-0 border-b outline-none text-sm font-mono resize-none pt-1 pb-0.5 leading-relaxed"
              style={{ borderColor: '#c8b87a', color: '#1a1a1a' }}
            />
          </div>
        ))}

        {/* التوقيع */}
        <div className="px-6 pb-4 border-t pt-4" style={{ borderColor: colors.lineColor, borderStyle: 'dashed' }}>
          <div className="flex items-end justify-between gap-8">

            {/* ختم */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
                   style={{ borderColor: colors.lineColor }}>
                <p className="text-[8px] font-mono text-center leading-tight" style={{ color: colors.labelText }}>
                  ختم<br/>النيابة
                </p>
              </div>
            </div>

            {/* توقيع */}
            <div className="flex-1">
              <p className="text-[10px] font-mono mb-2" style={{ color: colors.labelText }}>
                توقيع المحقق المختص:
              </p>
              <input
                type="text"
                value={signature}
                onChange={e => setSignature(e.target.value)}
                placeholder="اكتب اسمك هنا..."
                className="w-full bg-transparent border-0 border-b outline-none pb-0.5"
                style={{
                  borderColor: colors.lineColor,
                  color: colors.inputText,
                  fontFamily: 'cursive',
                  fontSize: '15px'
                }}
              />
            </div>

          </div>
        </div>

        {/* فوتر — أحمر داكن زي المحضر */}
        <div className="px-6 py-3 flex gap-3" style={{ backgroundColor: colors.footerBg }}>
          <button
            onClick={onClose}
            className="flex-1 font-bold py-2 text-xs font-mono border transition-colors hover:opacity-80"
            style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitted || !(fields['culprits'] || '').trim()}
            className="flex-1 font-bold py-2 text-xs font-mono transition-colors hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: colors.headerBg, color: '#ffffff' }}>
            {submitted ? '⏳ جاري الإرسال...' : 'رفع التقرير النهائي ←'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CaseClosureForm;