import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';
import { EmptyState } from '@/components/ui/EmptyState';
import { List } from 'lucide-react-native';

export default function AdminLogsScreen() {
  const { colors, spacing } = useAppTheme();
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, padding: spacing.xl }}>
      <EmptyState
        icon={<List size={32} color={colors.textMuted} />}
        title="System logs are not yet available"
        description={
          lastChecked
            ? `Last checked ${lastChecked}. Logs will appear here once the endpoint ships.`
            : 'The logs endpoint is not implemented on the server yet.'
        }
        actionLabel="Refresh"
        onAction={() =>
          setLastChecked(new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }))
        }
      />
      <AppText variant="small" color={colors.textMuted} center>
        Request an update from the platform team if you need audit trails.
      </AppText>
    </View>
  );
}
