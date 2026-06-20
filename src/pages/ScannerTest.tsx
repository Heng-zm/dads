import { useState } from 'react';
import { ScanLine, ShieldCheck, ShieldX, AlertCircle, FileX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label, Alert, AlertDescription } from '@/components/ui/form-elements';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { scanFilename, type ScanResult } from '@/lib/api';
import { hapticImpact, hapticNotification } from '@/lib/telegram';

const EXAMPLES = [
  'invoice.pdf',
  'report.docx',
  'setup.exe',
  'photo.jpg.exe',
  'document.pdf.scr',
  'update.apk',
];

export function ScannerTest() {
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!filename.trim()) return;
    hapticImpact('medium');
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await scanFilename(filename.trim());
      setResult(res);
      hapticNotification(res.blocked ? 'error' : 'success');
    } catch (e) {
      hapticNotification('error');
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const isSafe = result && !result.blocked;
  const isBlocked = result && result.blocked;

  return (
    <AppShell title="Scanner Test" subtitle="Test file name detection">
      <div className="space-y-4 p-4 animate-slide-in">
        {/* Scan Input */}
        <Card>
          <CardHeader><CardTitle className="text-sm">File Name Scanner</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>File Name</Label>
              <Input
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="e.g. invoice.pdf.exe"
                className="font-mono"
                onKeyDown={e => e.key === 'Enter' && handleScan()}
              />
              <p className="text-xs text-muted-foreground">
                Enter a file name to check if the bot would block it.
              </p>
            </div>

            <Button
              onClick={handleScan}
              loading={loading}
              disabled={!filename.trim()}
              className="w-full gap-2"
            >
              <ScanLine className="h-4 w-4" />
              Scan File Name
            </Button>
          </CardContent>
        </Card>

        {/* Quick examples */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => { hapticImpact('light'); setFilename(ex); setResult(null); }}
                  className="rounded-md border px-2 py-1 text-xs font-mono hover:bg-accent transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {result && (
          <Card className={`border-2 transition-all ${isSafe ? 'border-green-200 dark:border-green-900/50' : 'border-red-200 dark:border-red-900/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${isSafe ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                  {isSafe ? (
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <ShieldX className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${isSafe ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {isSafe ? 'File Allowed' : 'File Blocked'}
                    </h3>
                    <Badge variant={isSafe ? 'safe' : 'danger'}>
                      {isSafe ? 'SAFE' : 'BLOCKED'}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0">File:</span>
                      <span className="text-xs font-mono break-all">{result.filename ?? filename}</span>
                    </div>

                    {result.reason && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Reason:</span>
                        <span className="text-xs">{result.reason}</span>
                      </div>
                    )}

                    {result.matched_extension && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Matched:</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {result.matched_extension}
                        </Badge>
                      </div>
                    )}

                    {result.risk_level && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Risk:</span>
                        <Badge variant={result.risk_level === 'high' ? 'danger' : 'warning'} className="text-xs">
                          {result.risk_level}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Alert variant="info">
          <AlertDescription className="text-xs">
            This scanner uses the same rules as the live bot. Results may vary if you have custom blocked/allowed formats set per group.
          </AlertDescription>
        </Alert>
      </div>
    </AppShell>
  );
}
