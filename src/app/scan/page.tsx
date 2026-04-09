'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanResultSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { useScanStore } from '@/stores/scanStore';
import { submitScan } from '@/services/scanService';
import { MAX_INPUT_LENGTH, SCAN_STEPS } from '@/lib/utils/constants';
import type { InputType } from '@/types/database';
import type { AIAnalysisResult } from '@/types/scan';

function RiskBadge({ level }: { level: string }) {
  const styles = {
    safe: 'bg-[var(--safe)] text-white',
    suspicious: 'bg-[var(--warning)] text-[var(--warning-foreground)]',
    dangerous: 'bg-[var(--danger)] text-white',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${
        styles[level as keyof typeof styles] || styles.safe
      }`}
    >
      {level}
    </span>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 60
      ? 'var(--danger)'
      : score >= 30
      ? 'var(--warning)'
      : 'var(--safe)';

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 264} 264`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold">{score}</span>
      </div>
    </div>
  );
}

export default function ScanPage() {
  const {
    input,
    inputType,
    scanStatus,
    progress,
    result,
    ruleResult,
    error,
    setInput,
    setInputType,
    setScanStatus,
    setProgress,
    setResult,
    setRuleResult,
    setError,
    setScanId,
    reset,
  } = useScanStore();

  const [isSaved, setIsSaved] = useState(false);
  const [usePureJs, setUsePureJs] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const simulateProgress = useCallback(() => {
    let step = 0;
    progressInterval.current = setInterval(() => {
      if (step < SCAN_STEPS.length) {
        const percent = Math.round(((step + 1) / SCAN_STEPS.length) * 100);
        setProgress({ step: SCAN_STEPS[step], percent });
        step++;
      } else {
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
    }, 800);
  }, [setProgress]);

  const handleScan = async () => {
    if (!input.trim()) {
      setError('Please enter a URL, message, or email to scan.');
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    reset();
    setInput(input);
    setInputType(inputType);
    setScanStatus('scanning');
    setError(null);
    simulateProgress();

    try {
      const response = await submitScan(
        { input: input.trim(), input_type: inputType, use_pure_js: usePureJs },
        abortRef.current.signal
      );

      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress({ step: 'Complete', percent: 100 });

      setScanId(response.scan_id);

      const aiResult: AIAnalysisResult = {
        risk: response.risk_level,
        score: 0,
        reasons: response.rule_flags || [],
        explanation: response.ai_explanation || 'Analysis completed.',
        advice: [],
      };

      setResult(aiResult);
      setScanStatus('complete');
    } catch (err) {
      if (progressInterval.current) clearInterval(progressInterval.current);

      if (err instanceof DOMException && err.name === 'AbortError') return;

      const message = err instanceof Error ? err.message : 'Scan failed. Please try again.';
      setError(message);
      setScanStatus('error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Phishing Scanner
          </h1>
          <p className="text-muted-foreground">
            Paste a URL, message, or email body below for AI-powered phishing analysis.
          </p>
        </div>
      </FadeIn>

      {/* Input Section */}
      <FadeIn delay={0.1}>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Tabs
              value={inputType}
              onValueChange={(v) => setInputType(v as InputType)}
              className="mb-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">Text / Message</TabsTrigger>
                <TabsTrigger value="email">Email Body</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Textarea
                id="scan-input"
                placeholder={
                  inputType === 'url'
                    ? 'https://example.com/suspicious-link'
                    : inputType === 'email'
                    ? 'Paste the full email body here...'
                    : 'Paste a suspicious message or text...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                maxLength={MAX_INPUT_LENGTH}
                className="resize-none font-mono text-sm"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {input.length}/{MAX_INPUT_LENGTH}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="purejs-mode" 
                  checked={usePureJs} 
                  onCheckedChange={setUsePureJs} 
                />
                <Label htmlFor="purejs-mode" className="text-sm font-medium">
                  Fast Scan (Local Pure JS Engine)
                </Label>
              </div>

              <div className="flex gap-2">
                {scanStatus !== 'idle' && (
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Clear
                  </Button>
                )}
                <Button
                  id="scan-button"
                  onClick={handleScan}
                  disabled={scanStatus === 'scanning' || !input.trim()}
                  className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90 h-10 px-6 shrink-0"
                >
                  {scanStatus === 'scanning' ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Scanning...
                    </span>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Progress Section */}
      {scanStatus === 'scanning' && progress && (
        <FadeIn>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium scan-pulse">
                  {progress.step}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress.percent}%
                </span>
              </div>
              <Progress value={progress.percent} className="h-2" />
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Error State */}
      {error && (
        <FadeIn>
          <Card className="mb-6 border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive">Scan failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Loading State */}
      {scanStatus === 'scanning' && !result && (
        <ScanResultSkeleton />
      )}

      {/* Result Section */}
      {result && scanStatus === 'complete' && (
        <FadeIn>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Analysis Result</CardTitle>
                <RiskBadge level={result.risk} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Gauge */}
              {result.score > 0 && (
                <div className="flex items-center gap-6">
                  <ScoreGauge score={result.score} />
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className="text-2xl font-bold">{result.score}/100</p>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Explanation
                </h3>
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </div>

              {/* Reasons */}
              {result.reasons.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Indicators Found
                  </h3>
                  <ul className="space-y-2">
                    {result.reasons.map((reason, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mt-0.5 shrink-0 text-[var(--amber)]"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advice */}
              {result.advice.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Recommendations
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {result.advice.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mt-0.5 shrink-0 text-[var(--safe)]"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
