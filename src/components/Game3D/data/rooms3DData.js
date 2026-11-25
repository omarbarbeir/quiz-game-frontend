export const ROOMS = {
  karim_apartment: {
    id: 'karim_apartment',
    name: 'شقة كريم',
    dimensions: { width: 20, depth: 30, height: 4 },
    spawnPosition: [-1, 1.5, -5],
    requiresFlashlight: false,

    audio: {
      fadeTime: 2.0,
      layers: [
        { id: 'room', url: '/audio/ambient/apartment_night.ogg', volume: 0.25 },
      ],
    },

    lighting: {
      ambient: { intensity: 0.02, color: '#ffffff' },
      hemisphere: { sky: '#ffffff', ground: '#000000', intensity: 0.02 },
      points: [
        { position: [0, 3.0, -7.843], intensity: 24, color: '#e0f0ff', distance: 52, decay: 2 },
        { position: [0.4924, 2.5, 0], intensity: 20, color: '#e0f0ff', distance: 10, decay: 2 },
        { position: [0.4924, 2.5, 9.054], intensity: 24, color: '#e0f0ff', distance: 14, decay: 2 },
        { position: [-5.256, 2.158, 3.753], intensity: 13, color: '#ffd090', distance: 20, decay: 2 },
        { position: [5.827, 2.6, 1.357], intensity: 6, color: '#e0f0ff', distance: 6, decay: 2 },
      ],
    },
    interactions: [],
    doors: [],
  },

  apartment_4b: {
    id: 'apartment_4b',
    name: 'شقة 4B',
    spawnPosition: [0, 1.5, -5.5], // عند مدخل الشقة بالظبط
    requiresFlashlight: false,
    audio: {
      fadeTime: 2.0,
      layers: [
        { id: 'room', url: '/audio/ambient/horror_night_ambient.ogg', volume: 0.4 },
      ],
    },
    // إضاءة عامة هادية ومتوزعة على الشقة كلها، والبروجيكتور (Apartment4B.jsx) هو أقوى مصدر نور
    lighting: {
      // ألوان فاتحة نسبيًا عشان الـ ambient يبان فعلًا (الألوان الغامقة كانت بتلغي تأثيره)
      ambient: { intensity: 0.8, color: '#7f90a8' },
      hemisphere: { sky: '#9fb3cc', ground: '#2a2f38', intensity: 0.6 },
      environment: { intensity: 0.3 },
      // 4 نقط خفيفة على أركان الشقة (افتراض: 12x12 متمركزة على 0,0 وسقف حوالي 3 متر)
      // y=2.2 تحت السقف عشان مايحصلش hotspot محروق
      points: [
        { position: [-3.5, 2.2, -3.5], intensity: 18, color: '#a9bddb', distance: 12, decay: 2 },
        { position: [3.5, 2.2, -3.5], intensity: 18, color: '#a9bddb', distance: 12, decay: 2 },
        { position: [-3.5, 2.2, 3.5], intensity: 18, color: '#a9bddb', distance: 12, decay: 2 },
        { position: [3.5, 2.2, 3.5], intensity: 18, color: '#a9bddb', distance: 12, decay: 2 },
      ],
    },
    interactions: [],
    doors: [],
  },

  building_hallway: {
    id: 'building_hallway',
    name: 'ممر العمارة',
    dimensions: { width: 2.5, depth: 10, height: 3 },
    spawnPosition: [0, 1.5, 2],
    requiresFlashlight: true,
    audio: {
      fadeTime: 1.5,
      layers: [
        { id: 'room', url: '/audio/ambient/apartment_night.ogg', volume: 0.3 },
      ],
    },
    lighting: {
      ambient: { intensity: 0.1, color: '#ffffff' },
      hemisphere: { sky: '#ffffff', ground: '#000000', intensity: 0.1 },
      points: [
        { position: [0, 1.3, 5], intensity: 1, color: '#e0f0ff', distance: 8, decay: 2 },
        // لمبة السلم الأولى
        { position: [-7.187, 0.203, 4.94], intensity: 1, color: '#e0f0ff', distance: 6, decay: 2 },
        // لمبة السلم التانية
        { position: [0.4123, -0.4684, 5.019], intensity: 1, color: '#e0f0ff', distance: 1, decay: 0 },
        // لمبة الدور الخامس (بسطة السلم)
        { position: [0.408, 7.9, 5], intensity: 1, color: '#F3A849', distance: 1, decay: 2 },
      ],
    },
    interactions: [],
    doors: [],
  },

  street: {
    id: 'street',
    name: 'شارع العمارة',
    dimensions: { width: 10, depth: 60, height: 20 },
    spawnPosition: [-63.53, 11.44, 23.03925],
    requiresFlashlight: true,
    audio: {
      fadeTime: 2.0,
      layers: [
        { id: 'room', url: '/audio/ambient/street_night.ogg', volume: 0.3 },
      ],
    },
    lighting: {
      // الإضاءة الفعلية للشارع جوه Street.jsx
      ambient: { intensity: 0, color: '#ffffff' },
      hemisphere: { sky: '#000000', ground: '#000000', intensity: 0 },
      points: [],
    },
    interactions: [],
    doors: [],
  },
};