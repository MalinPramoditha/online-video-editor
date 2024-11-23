import { create } from 'zustand';

const useVideoStore = create((set) => ({
  // Video source
  videoSrc: null,
  setVideoSrc: (src) => set({ videoSrc: src }),

  // Current time in the video
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),

  // Video duration
  duration: 0,
  setDuration: (duration) => set({ duration: duration }),

  // Playback state
  isPlaying: false,
  setIsPlaying: (state) => set({ isPlaying: state }),

  // Selected frame
  selectedFrame: null,
  setSelectedFrame: (frame) => set({ selectedFrame: frame }),

  // Reset store
  reset: () => set({
    videoSrc: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    selectedFrame: null,
  }),
}));

export default useVideoStore;