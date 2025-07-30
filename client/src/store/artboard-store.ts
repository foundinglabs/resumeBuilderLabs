// Artboard Store for ResumeGenius
// This provides the same interface as Reactive-Resume's artboard store
import { create } from 'zustand';

export type ArtboardStore = {
  resume: any; // Reactive-Resume format data
  setResume: (resume: any) => void;
};

export const useArtboardStore = create<ArtboardStore>()((set) => ({
  resume: null as any,
  setResume: (resume) => {
    set({ resume });
  },
}));

export default useArtboardStore;