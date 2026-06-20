import { Moon, Sun, Info, ExternalLink, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/layout/AppShell';
import { tg } from '@/lib/telegram';

export function Settings() {
  const app = tg();
  const theme = app?.colorScheme ?? 'unknown';
  const platform = app?.platform ?? 'unknown';
  const version = app?.version ?? 'unknown';

  return (
    <AppShell title="Settings">
      <div className="space-y-4 p-4 animate-slide-in">
        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">App Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">EXE Remover Bot</span>
              </div>
              <Badge variant="outline">v1.0</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Theme</span>
              <div className="flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                <span className="capitalize">{theme}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform</span>
              <span className="capitalize">{platform}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">SDK Version</span>
              <span>{version}</span>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { label: 'Add bot to group', href: 'https://t.me' },
              { label: 'Source code', href: 'https://github.com' },
              { label: 'API documentation', href: 'https://exe-file-remover.onrender.com/docs' },
            ].map(link => (
              <button
                key={link.label}
                onClick={() => app?.openLink(link.href)}
                className="flex w-full items-center justify-between rounded-md p-2 text-sm hover:bg-accent transition-colors"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Theme and accessibility settings are managed by Telegram.
                The app automatically follows your Telegram color scheme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
