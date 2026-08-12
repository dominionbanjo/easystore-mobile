import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PaginatedList } from '@/components/shared/PaginatedList';
import { useGetSystemLogsQuery } from '@/api/adminApi';

export default function AdminLogsScreen() {
  const { spacing } = useAppTheme();
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetSystemLogsQuery({ page, limit: 30 });

  return (
    <View style={{ flex: 1 }}>
      <PaginatedList
        items={data?.items}
        pagination={data?.pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isLoadingMore={isFetching && page > 1}
        onEndReached={() => setPage((p) => p + 1)}
        onRefresh={() => setPage(1)}
        keyExtractor={(item) => item.id}
        renderItem={(log) => (
          <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.xs }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <StatusBadge status={log.level} />
              <AppText variant="small" color="gray">
                {new Date(log.created_at).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </AppText>
            </Row>
            {log.context ? (
              <AppText variant="small" weight="semibold">
                {log.context}
              </AppText>
            ) : null}
            {log.message ? (
              <AppText variant="small" color="gray">
                {log.message}
              </AppText>
            ) : null}
          </Card>
        )}
        emptyTitle="No logs found"
      />
    </View>
  );
}
