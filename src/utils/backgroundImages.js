// Preset background images for books
// Using data URIs for small patterns/gradients

export const BACKGROUND_IMAGES = {
  nature: [
    {
      id: 'nature1',
      name: 'Forest Green',
      uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=150&fit=crop',
    },
    {
      id: 'nature2',
      name: 'Ocean Blue',
      uri: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=100&h=150&fit=crop',
    },
    {
      id: 'nature3',
      name: 'Mountain Vista',
      uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=150&fit=crop',
    },
    {
      id: 'nature4',
      name: 'Sunset Sky',
      uri: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=100&h=150&fit=crop',
    },
    {
      id: 'nature5',
      name: 'Cherry Blossom',
      uri: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=100&h=150&fit=crop',
    },
  ],
  pets: [
    {
      id: 'pets1',
      name: 'Cute Dog',
      uri: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=150&fit=crop',
    },
    {
      id: 'pets2',
      name: 'Playful Cat',
      uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=150&fit=crop',
    },
    {
      id: 'pets3',
      name: 'Happy Puppy',
      uri: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=150&fit=crop',
    },
    {
      id: 'pets4',
      name: 'Cute Kitten',
      uri: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=150&fit=crop',
    },
    {
      id: 'pets5',
      name: 'Golden Retriever',
      uri: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=100&h=150&fit=crop',
    },
  ],
  gods: [
    {
      id: 'god1',
      name: 'Lord Murugan',
      uri: 'https://images.unsplash.com/photo-1583151296149-b6d6d3b7f21e?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1583151296149-b6d6d3b7f21e?w=100&h=150&fit=crop',
    },
    {
      id: 'god2',
      name: 'Goddess Lakshmi',
      uri: 'https://images.unsplash.com/photo-1588969551950-9c0b9d2c6cc2?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1588969551950-9c0b9d2c6cc2?w=100&h=150&fit=crop',
    },
    {
      id: 'god3',
      name: 'Lord Perumal',
      uri: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=100&h=150&fit=crop',
    },
    {
      id: 'god4',
      name: 'Jesus Christ',
      uri: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=100&h=150&fit=crop',
    },
    {
      id: 'god5',
      name: 'Islamic Art',
      uri: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=100&h=150&fit=crop',
    },
  ],
  patterns: [
    {
      id: 'pattern1',
      name: 'Gradient Blue',
      color: '#2196F3',
    },
    {
      id: 'pattern2',
      name: 'Gradient Green',
      color: '#4CAF50',
    },
    {
      id: 'pattern3',
      name: 'Gradient Orange',
      color: '#FF9800',
    },
    {
      id: 'pattern4',
      name: 'Gradient Purple',
      color: '#9C27B0',
    },
    {
      id: 'pattern5',
      name: 'Gradient Red',
      color: '#F44336',
    },
  ],
};

export const getAllImages = () => {
  return [
    ...BACKGROUND_IMAGES.nature,
    ...BACKGROUND_IMAGES.pets,
    ...BACKGROUND_IMAGES.gods,
    ...BACKGROUND_IMAGES.patterns,
  ];
};

// Get default background image (Forest Green)
export const getDefaultBackgroundImage = () => {
  return BACKGROUND_IMAGES.nature[0]; // Forest Green
};

export const getImagesByCategory = (category) => {
  return BACKGROUND_IMAGES[category] || [];
};

