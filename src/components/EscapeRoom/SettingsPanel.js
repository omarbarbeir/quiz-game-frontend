import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEscapeStore from './store/useEscapeStore';
import audioEngine from './audio/AudioEngine';

export default function SettingsPanel() {
  const {
    isSettingsOpen,
    toggleSettings,
    controlMode,
    setControlMode,
    gyroPermission,
    setGyroPermission,
  } = useEscapeStore();

  const requestGyro = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const res = await DeviceOrientationEvent.requestPermission();
        setGyroPermission(res);
        if (res === 'granted') setControlMode('gyro');
      } else {
        setGyroPermission('granted');
        setControlMode('gyro');
      }
    } catch {
      setGyroPermission('denied');
    }
  };

  const updateAudio = (patch) => audioEngine.setSettings(patch);

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleSettings(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-5 space-y-5"
          >
            <h3 className="text-xl font-bold text-amber-400">الإعدادات</h3>

            <div>
              <p className="text-sm text-neutral-400 mb-2">طريقة التحكم</p>
              <div className="grid grid-cols-3 gap-2">
                {['drag', 'gyro', 'both'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      if (m === 'gyro' || m === 'both') requestGyro();
                      else setControlMode(m);
                    }}
                    className={`py-2 rounded-lg text-sm ${
                      controlMode === m
                        ? 'bg-amber-500 text-black'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                    }`}
                  >
                    {m === 'drag' ? 'سحب' : m === 'gyro' ? 'جيروسكوب' : 'الاثنين'}
                  </button>
                ))}
              </div>
              {gyroPermission === 'denied' && (
                <p className="text-xs text-red-400 mt-2">تم رفض إذن الجيروسكوب</p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-neutral-400">الصوت</p>

              <label className="flex items-center gap-3 text-white">
                <span className="text-sm flex-1">الصوت الرئيسي</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  defaultValue={0.9}
                  onChange={(e) =>
                    updateAudio({ masterVolume: parseFloat(e.target.value) })
                  }
                  className="flex-1"
                />
              </label>

              <label className="flex items-center gap-3 text-white">
                <span className="text-sm flex-1">أصوات البيئة</span>
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => updateAudio({ eventsEnabled: e.target.checked })}
                />
              </label>

              <label className="flex items-center gap-3 text-white">
                <span className="text-sm flex-1">Infrasound (ترددات منخفضة)</span>
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) =>
                    updateAudio({ infrasoundEnabled: e.target.checked })
                  }
                />
              </label>
            </div>

            <button
              onClick={() => toggleSettings(false)}
              className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold"
            >
              تم
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}