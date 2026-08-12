import { useState } from 'react';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ListSkeleton } from '@/components/ui/Skeleton';
import {
  useGetStoreTemplatesQuery,
  useGetMyStoreQuery,
  useUpdateStoreThemeMutation,
} from '@/api/storeApi';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';

const TEMPLATE_PREVIEW_COLORS = ['#17c06e', '#2563eb', '#a855f7', '#f97316', '#10b981', '#e11d48'];

export default function VendorTemplatesScreen() {
  const { colors, spacing } = useAppTheme();
  const toast = useToast();

  const { data: templates, isLoading } = useGetStoreTemplatesQuery();
  const { data: store } = useGetMyStoreQuery();
  const [updateTheme] = useUpdateStoreThemeMutation();
  const [saving, setSaving] = useState(false);

  const activeTemplateId = store?.theme?.template?.id;

  const handleApply = async (templateId: string) => {
    if (!store) {
      return;
    }
    setSaving(true);
    try {
      await updateTheme({ id: store.id, body: { template_id: templateId } }).unwrap();
      toast.showSuccess('Theme template applied');
    } catch (error) {
      toast.showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ padding: spacing.lg }}>
        <ListSkeleton count={4} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <AppText variant="caption" color={colors.textMuted}>
        Choose a theme template for your storefront. You can customize colors and fonts after applying.
      </AppText>
      {(templates ?? []).map((template, index) => {
        const isActive = template.id === activeTemplateId;
        const accent = TEMPLATE_PREVIEW_COLORS[index % TEMPLATE_PREVIEW_COLORS.length];
        return (
          <Card key={template.id} style={{ gap: spacing.md }}>
            <Row style={{ gap: spacing.md }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 4,
                  backgroundColor: accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText style={{ fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }} color="#ffffff">
                  {template.name.slice(0, 2)}
                </AppText>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="label" weight="bold">
                  {template.name}
                </AppText>
                {template.description ? (
                  <AppText variant="small" color={colors.textMuted}>
                    {template.description}
                  </AppText>
                ) : null}
              </View>
            </Row>
            <Button
              title={isActive ? 'Active Template' : 'Apply Template'}
              variant={isActive ? 'primary' : 'outline'}
              onPress={() => handleApply(template.id)}
              disabled={isActive || saving}
              loading={saving && !isActive}
            />
          </Card>
        );
      })}
      <Spacer height={16} />
    </View>
  );
}
