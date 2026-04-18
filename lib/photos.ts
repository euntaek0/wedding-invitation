export interface PhotoAsset {
  id: string
  file: string
  width: number
  height: number
}

export const photoAssets: PhotoAsset[] = [
  { id: 'WJ_00117', file: 'WJ_00117.webp', width: 4626, height: 6938 },
  { id: 'WJ_00752', file: 'WJ_00752.webp', width: 6938, height: 4626 },
  { id: 'WJ_01407', file: 'WJ_01407.webp', width: 4280, height: 6420 },
  { id: 'WJ_01672', file: 'WJ_01672.webp', width: 4672, height: 7008 },
  { id: 'WJ_01831', file: 'WJ_01831.webp', width: 4672, height: 7008 },
  { id: 'WJ_02539', file: 'WJ_02539.webp', width: 4016, height: 6025 },
  { id: 'WJ_02884', file: 'WJ_02884.webp', width: 4672, height: 7008 },
  { id: 'WJ_03312', file: 'WJ_03312.webp', width: 4672, height: 7008 },
  { id: 'WJ_05560', file: 'WJ_05560.webp', width: 4672, height: 7008 },
  { id: 'WJ_05888', file: 'WJ_05888.webp', width: 4672, height: 7008 },
  { id: 'WJ_06443', file: 'WJ_06443.webp', width: 4672, height: 7008 },
  { id: 'YJ_00240', file: 'YJ_00240.webp', width: 4672, height: 7008 },
  { id: 'YJ_00249', file: 'YJ_00249.webp', width: 4672, height: 7008 },
  { id: 'YJ_00382', file: 'YJ_00382.webp', width: 4672, height: 7008 },
  { id: 'YJ_00396', file: 'YJ_00396.webp', width: 4672, height: 7008 },
  { id: 'YJ_00416', file: 'YJ_00416.webp', width: 4455, height: 6682 },
  { id: 'YJ_00472', file: 'YJ_00472.webp', width: 4672, height: 7008 },
  { id: 'YJ_00576', file: 'YJ_00576.webp', width: 4672, height: 7008 },
  { id: 'YJ_00679', file: 'YJ_00679.webp', width: 7008, height: 4672 },
  { id: 'YJ_00859', file: 'YJ_00859.webp', width: 4672, height: 7008 },
  { id: 'YJ_01014', file: 'YJ_01014.webp', width: 4672, height: 7008 },
  { id: 'YJ_01156', file: 'YJ_01156.webp', width: 4672, height: 7008 },
  { id: 'YJ_01344', file: 'YJ_01344.webp', width: 4626, height: 6938 },
  { id: 'YJ_01375', file: 'YJ_01375.webp', width: 6938, height: 4626 },
  { id: 'YJ_02213', file: 'YJ_02213.webp', width: 4672, height: 7008 },
  { id: 'YJ_02401', file: 'YJ_02401.webp', width: 4672, height: 7008 },
  { id: 'YJ_02716', file: 'YJ_02716.webp', width: 7008, height: 4672 },
]

export const featuredPhotoIds = ['WJ_06443', 'YJ_00396', 'WJ_05888', 'YJ_01375']

export const featuredPhotos = photoAssets.filter((photo) =>
  featuredPhotoIds.includes(photo.id),
)

export const galleryPhotos = photoAssets.filter(
  (photo) => !featuredPhotoIds.includes(photo.id),
)

export interface MoodGallerySection {
  id: string
  titleKo: string
  titleEn: string
  subtitleKo: string
  subtitleEn: string
  coverId: string
  photoIds: string[]
}

export const moodGallerySections: MoodGallerySection[] = [
  {
    id: 'soft-light',
    titleKo: 'Soft Light',
    titleEn: 'Soft Light',
    subtitleKo: '밝고 부드러운 공기의 순간',
    subtitleEn: 'Moments filled with soft light',
    coverId: 'YJ_00382',
    photoIds: ['YJ_00382', 'YJ_00396', 'YJ_00416', 'YJ_00472', 'YJ_00576', 'YJ_00859'],
  },
  {
    id: 'warm-vows',
    titleKo: 'Warm Vows',
    titleEn: 'Warm Vows',
    subtitleKo: '따뜻한 시선과 약속의 장면',
    subtitleEn: 'Warm gazes and vow moments',
    coverId: 'WJ_05888',
    photoIds: ['WJ_05888', 'WJ_05560', 'WJ_06443', 'YJ_01014', 'YJ_01156', 'YJ_01344'],
  },
  {
    id: 'joyful-frames',
    titleKo: 'Joyful Frames',
    titleEn: 'Joyful Frames',
    subtitleKo: '자연스럽고 경쾌한 무드',
    subtitleEn: 'Natural and joyful frames',
    coverId: 'YJ_01375',
    photoIds: ['YJ_01375', 'YJ_00679', 'YJ_02716', 'WJ_00752', 'WJ_02539', 'WJ_02884', 'WJ_03312'],
  },
]
