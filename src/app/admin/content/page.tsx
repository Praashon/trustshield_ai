'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FadeIn } from '@/components/animations/FadeIn';
import { createLearningContent } from '@/services/adminService';
import { toast } from 'sonner';

export default function AdminContentPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [contentType, setContentType] = useState<string>('example');
  const [difficulty, setDifficulty] = useState<string>('beginner');
  const [isPhishing, setIsPhishing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createLearningContent({
        title,
        body,
        content_type: contentType as 'example' | 'simulation' | 'tip',
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
        is_phishing: isPhishing,
      });

      toast.success('Content created successfully');
      setTitle('');
      setBody('');
      setContentType('example');
      setDifficulty('beginner');
      setIsPhishing(false);
    } catch {
      toast.error('Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FadeIn>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Manage Learning Content
        </h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Suspicious PayPal Email"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={contentType} onValueChange={(val) => val && setContentType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="example">Example</SelectItem>
                      <SelectItem value="simulation">Simulation</SelectItem>
                      <SelectItem value="tip">Tip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-body">Body</Label>
                <Textarea
                  id="content-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter the content body..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPhishing}
                    onChange={(e) => setIsPhishing(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">This is a phishing example</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[var(--amber)] text-[var(--amber-foreground)] hover:bg-[var(--amber)]/90"
              >
                {loading ? 'Creating...' : 'Create Content'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
