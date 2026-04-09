import { create } from 'zustand';
import type { AIAnalysisResult, RuleEngineResult, ScanProgressEvent } from '@/types/scan';
import type { InputType, RiskLevel, ScanWithAnalysis } from '@/types/database';
import { SCAN_CACHE_SIZE } from '@/lib/utils/constants';

interface ScanStore {
  input: string;
  inputType: InputType;
  scanStatus: 'idle' | 'scanning' | 'complete' | 'error';
  progress: ScanProgressEvent | null;
  result: AIAnalysisResult | null;
  ruleResult: RuleEngineResult | null;
  error: string | null;
  scanId: string | null;
  recentScans: ScanWithAnalysis[];
  setInput: (input: string) => void;
  setInputType: (inputType: InputType) => void;
  setScanStatus: (status: ScanStore['scanStatus']) => void;
  setProgress: (progress: ScanProgressEvent | null) => void;
  setResult: (result: AIAnalysisResult | null) => void;
  setRuleResult: (ruleResult: RuleEngineResult | null) => void;
  setError: (error: string | null) => void;
  setScanId: (scanId: string | null) => void;
  addRecentScan: (scan: ScanWithAnalysis) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  input: '',
  inputType: 'url',
  scanStatus: 'idle',
  progress: null,
  result: null,
  ruleResult: null,
  error: null,
  scanId: null,
  recentScans: [],
  setInput: (input) => set({ input }),
  setInputType: (inputType) => set({ inputType }),
  setScanStatus: (scanStatus) => set({ scanStatus }),
  setProgress: (progress) => set({ progress }),
  setResult: (result) => set({ result }),
  setRuleResult: (ruleResult) => set({ ruleResult }),
  setError: (error) => set({ error }),
  setScanId: (scanId) => set({ scanId }),
  addRecentScan: (scan) => {
    const current = get().recentScans;
    const updated = [scan, ...current].slice(0, SCAN_CACHE_SIZE);
    set({ recentScans: updated });
  },
  reset: () =>
    set({
      input: '',
      scanStatus: 'idle',
      progress: null,
      result: null,
      ruleResult: null,
      error: null,
      scanId: null,
    }),
}));
