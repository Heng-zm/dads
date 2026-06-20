import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/form-elements';
import { EmptyState } from '@/components/common';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApi';
import { getMyGroups } from '@/lib/api';
import { hapticImpact } from '@/lib/telegram';
import { formatChatId, safeArray } from '@/lib/utils';

export function Groups() {
  const navigate = useNavigate();
  const { data: groups, loading, error, refetch } = useApi(getMyGroups);

  const groupList = safeArray(groups);

  return (
    <AppShell
      title="My Groups"
      subtitle={groupList.length > 0 ? `${groupList.length} group${groupList.length !== 1 ? 's' : ''}` : undefined}
      headerRight={
        <Button variant="ghost" size="icon" onClick={() => { hapticImpact(); refetch(); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
    >
      <div className="p-4 space-y-3 animate-slide-in">
        {/* Error state */}
        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && groupList.length === 0 && (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No linked groups yet"
            description="Add the bot to a group and make it admin first, then it will appear here."
            className="mt-8"
          />
        )}

        {/* Group list */}
        {!loading && groupList.map((group) => (
          <button
            key={group.chat_id}
            onClick={() => {
              hapticImpact('light');
              navigate(`/groups/${group.chat_id}`);
            }}
            className="w-full text-left"
          >
            <Card className="transition-all hover:shadow-sm active:scale-[0.99] hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm leading-none truncate">
                      {group.title || 'Unnamed Group'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground font-mono">
                      {formatChatId(group.chat_id)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge
                        variant={group.protection_enabled ? 'safe' : 'danger'}
                        className="text-[10px] py-0"
                      >
                        {group.protection_enabled ? 'Protected' : 'Unprotected'}
                      </Badge>
                      {group.strictness && (
                        <Badge variant="outline" className="text-[10px] py-0">
                          {group.strictness}
                        </Badge>
                      )}
                      {group.silent_mode && (
                        <Badge variant="info" className="text-[10px] py-0">
                          Silent
                        </Badge>
                      )}
                      {!group.bot_is_admin && (
                        <Badge variant="warning" className="text-[10px] py-0">
                          Needs Admin
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-medium text-primary">Manage</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}

        {/* Help text */}
        {!loading && groupList.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Only groups where the bot is active are shown.
          </p>
        )}
      </div>
    </AppShell>
  );
}
