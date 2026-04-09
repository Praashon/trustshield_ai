'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/FadeIn';
import { StaggerReveal } from '@/components/animations/StaggerReveal';
import { CountUp } from '@/components/animations/CountUp';

const FEATURES = [
  {
    title: 'AI-Powered Detection',
    description:
      'Advanced language models analyze URLs, messages, and emails for phishing indicators with detailed explanations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Z"/>
        <path d="M10 14a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/>
      </svg>
    ),
  },
  {
    title: 'Real-Time Scanning',
    description:
      'Instant rule-based checks followed by AI reasoning, delivered through live progress updates as the analysis runs.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    title: 'Interactive Learning',
    description:
      'Test your phishing detection skills with real-world examples, quizzes, and AI-generated feedback on every answer.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    title: 'Security Dashboard',
    description:
      'Track your scan history, monitor risk trends, and review detailed analytics across all your scanned content.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="M7 16l4-8 4 4 4-6"/>
      </svg>
    ),
  },
];

const STATS = [
  { label: 'Threats Detected', value: 12847 },
  { label: 'URLs Scanned', value: 48293 },
  { label: 'Users Protected', value: 3210 },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40 dark:opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-sm text-muted-foreground mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
                AI-Powered Phishing Detection
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Detect threats{' '}
                <span className="text-[var(--amber)]">before</span> they reach
                you
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                TrustShield AI combines rule-based analysis with large language models to identify
                phishing URLs, messages, and emails. Get clear explanations, not just
                verdicts.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-3">
                <Link href="/scan">
                  <Button
                    size="lg"
                    className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90 h-12 px-8 text-base font-semibold"
                  >
                    Start scanning
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base"
                  >
                    Learn about phishing
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Stats */}
          <FadeIn delay={0.7}>
            <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-8 max-w-xl">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold">
                    <CountUp end={stat.value} delay={0.8} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Scanner Preview Strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <FadeIn>
            <div className="rounded-lg border border-border bg-background p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--safe)]" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  trustshield.ai/scan
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 px-4 py-3 rounded-md border border-border bg-muted/30 text-muted-foreground text-sm font-mono">
                  https://secure-paypa1-login.tk/verify?id=a83jd
                </div>
                <Button className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90 shrink-0">
                  Analyze
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--danger)] text-white">
                  DANGEROUS
                </span>
                <span className="text-sm text-muted-foreground">
                  Homoglyph attack detected, link shortener domain, urgency keywords present
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How TrustShield protects you
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A layered detection system that combines deterministic rules with AI reasoning
              to deliver accurate, explainable results.
            </p>
          </div>
        </FadeIn>

        <StaggerReveal className="grid sm:grid-cols-2 gap-6" staggerDelay={0.12}>
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-lg border border-border bg-card p-6 hover:border-[var(--amber)]/40 transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-md bg-[var(--amber)]/10 flex items-center justify-center text-[var(--amber)] mb-4 group-hover:bg-[var(--amber)]/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <FadeIn>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Ready to secure your inbox?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Start scanning URLs and messages for free. No credit card required.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90 h-12 px-10 text-base font-semibold"
                >
                  Create free account
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
