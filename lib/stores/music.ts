import { create } from 'zustand'

interface MusicStore {
  isPlaying: boolean
  toggle: () => void
  pause: () => void
}

export const useMusicStore = create<MusicStore>((set) => ({
  isPlaying: false,
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  pause: () => set({ isPlaying: false }),
}))
