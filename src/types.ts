export type ModeId = 'classic' | 'photo' | 'family' | 'walk' | 'architecture' | 'free'

export type EvidenceType = 'official' | 'editorial' | 'community'

export type Evidence = {
  type: EvidenceType
  title: string
  organization?: string
  url?: string
  verifiedAt: string
  note?: string
}

export type Place = {
  id: string
  name: string
  mapLabel?: string
  map: { x: number; y: number; priority: 'core' | 'normal' }
  summary: string
  whyVisit?: string
  highlights?: string[]
  photoTips?: string[]
  activities?: string[]
  practical?: { food?: string; rest?: string; toilet?: string; shade?: string }
  weather?: { sunny?: string; rainy?: string }
  access?: { status: 'outdoor' | 'public_building' | 'conditional' | 'unknown'; note?: string }
  image: string
  panorama?: { provider: '720yun'; sceneId: number; url: string }
  navigation?: { name: string }
  evidence?: Evidence[]
  verifiedAt?: string
}

export type Route = {
  id: ModeId
  title: string
  subtitle: string
  durationLabel?: string
  description: string
  placeIds: string[]
  transportNote?: string
}
