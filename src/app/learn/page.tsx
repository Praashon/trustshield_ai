'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { FadeIn } from '@/components/animations/FadeIn';
import { getLearningContent, submitQuizAttempt } from '@/services/learnService';
import type { LearningContent } from '@/types/database';

export default function LearnPage() {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('all');
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    contentId: string;
    isCorrect: boolean;
    feedback: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (difficulty !== 'all') params.difficulty = difficulty;
      const data = await getLearningContent(params);
      setContent(data);
    } catch {
      setContent([]);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleQuizAnswer = async (contentId: string, answer: boolean) => {
    setSubmitting(true);
    try {
      const result = await submitQuizAttempt(contentId, answer);
      setQuizResult({
        contentId,
        isCorrect: result.is_correct,
        feedback: result.ai_feedback,
      });
      setActiveQuiz(null);
    } catch {
      setQuizResult({
        contentId,
        isCorrect: false,
        feedback: 'Could not process your answer. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-[var(--safe)]/10 text-[var(--safe)]';
      case 'intermediate': return 'bg-[var(--warning)]/10 text-[var(--warning)]';
      case 'advanced': return 'bg-[var(--danger)]/10 text-[var(--danger)]';
      default: return '';
    }
  };

  const examples = content.filter((c) => c.content_type === 'example');
  const tips = content.filter((c) => c.content_type === 'tip');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Learn Phishing Detection
          </h1>
          <p className="text-muted-foreground">
            Sharpen your skills with real-world examples and interactive quizzes.
          </p>
        </div>
      </FadeIn>

      {/* Difficulty Filter */}
      <FadeIn delay={0.1}>
        <Tabs
          value={difficulty}
          onValueChange={setDifficulty}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </FadeIn>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Tips Section */}
          {tips.length > 0 && (
            <FadeIn delay={0.15}>
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Security Tips</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {tips.map((tip) => (
                    <Card key={tip.id} className="hover:border-[var(--amber)]/40 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{tip.title}</CardTitle>
                          <Badge variant="outline" className={difficultyColor(tip.difficulty)}>
                            {tip.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tip.body}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Quiz Section */}
          {examples.length > 0 && (
            <FadeIn delay={0.2}>
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Phishing Quiz -- Is this a phishing attempt?
                </h2>
                <div className="grid gap-4">
                  {examples.map((item) => (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        quizResult?.contentId === item.id
                          ? quizResult.isCorrect
                            ? 'border-[var(--safe)]'
                            : 'border-[var(--danger)]'
                          : 'hover:border-border/80'
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <Badge variant="outline" className={difficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-md bg-muted/50 border border-border">
                          <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                            {item.body}
                          </p>
                        </div>

                        {quizResult?.contentId === item.id ? (
                          <div
                            className={`p-4 rounded-md text-sm ${
                              quizResult.isCorrect
                                ? 'bg-[var(--safe)]/10 text-[var(--safe)]'
                                : 'bg-[var(--danger)]/10 text-[var(--danger)]'
                            }`}
                          >
                            <p className="font-semibold mb-1">
                              {quizResult.isCorrect ? 'Correct!' : 'Incorrect'}
                            </p>
                            <p className="text-foreground/80">{quizResult.feedback}</p>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={submitting}
                              onClick={() => handleQuizAnswer(item.id, true)}
                            >
                              Yes, this is phishing
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              disabled={submitting}
                              onClick={() => handleQuizAnswer(item.id, false)}
                            >
                              No, this is legitimate
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </>
      )}
    </div>
  );
}
