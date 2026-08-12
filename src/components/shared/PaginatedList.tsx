import { FlatList, RefreshControl, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { ListSkeleton } from '../ui/Skeleton';
import { EmptyState , ListFooter } from '../ui/EmptyState';
import type { IPagination } from '@/types/api';

export interface PaginatedListProps<T> {
  items: T[] | undefined;
  pagination?: IPagination;
  isLoading: boolean;
  isFetching: boolean;
  isLoadingMore?: boolean;
  renderItem: (item: T, index: number) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  skeletonCount?: number;
  contentContainerStyle?: object;
  showsVerticalScrollIndicator?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
}

export function PaginatedList<T>({
  items,
  pagination,
  isLoading,
  isFetching,
  isLoadingMore = false,
  renderItem,
  keyExtractor,
  onEndReached,
  onRefresh,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  skeletonCount = 6,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ListHeaderComponent,
  ListEmptyComponent,
}: PaginatedListProps<T>) {
  const { colors, spacing } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={skeletonCount} />
      </View>
    );
  }

  const isEmpty = !items || items.length === 0;

  return (
    <FlatList
      data={items ?? []}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (onEndReached && pagination?.hasNext && !isLoadingMore) {
          onEndReached();
        }
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        ListEmptyComponent ?? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        )
      }
      ListFooterComponent={
        isEmpty ? null : <ListFooter loading={isLoadingMore} hasMore={Boolean(pagination?.hasNext)} />
      }
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    />
  );
}
