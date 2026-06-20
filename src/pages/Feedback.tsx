import { useState } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form-elements';
import { AppShell } from '@/components/layout/AppShell';
import { submitFeedback } from '@/lib/api';
import { hapticImpact, hapticNotification } from '@/lib/telegram';

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report' },
  { value: 'feature', label: '✨ Feature Request' },
  { value: 'question', label: '❓ Question' },
  { value: 'praise', label: '⭐ Praise' },
  { value: 'other', label: '📝 Other' },
];

export function Feedback() {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!category || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    hapticImpact('medium');
    setLoading(true);
    try {
      await submitFeedback(category, message.trim());
      hapticNotification('success');
      setSubmitted(true);
    } catch (e) {
      hapticNotification('error');
      toast.error(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Feedback">
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center mt-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Thank you!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback has been submitted. We appreciate you taking the time to help improve the bot.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => { setSubmitted(false); setCategory(''); setMessage(''); }}
          >
            Send Another
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Feedback" subtitle="Help us improve">
      <div className="space-y-4 p-4 animate-slide-in">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Send Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what you think, what's broken, or what you'd like to see…"
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length} / 2000
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!category || !message.trim()}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Telegram ID is automatically included with your feedback so we can follow up if needed.
              We read every submission and aim to respond to bugs and questions promptly.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
