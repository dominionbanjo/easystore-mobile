import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/theme';
import { AppText, Row, Spacer } from '@/components/ui/Text';
import { Button, Chip } from '@/components/ui/Button';
import { AppInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { AppImage } from '@/components/shared/AppImage';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { useGetCloudinarySignatureQuery } from '@/api/uploadApi';
import { useGetInstallmentConfigQuery } from '@/api/installmentApi';
import { useCreateProductMutation, useUpdateProductMutation } from '@/api/productApi';
import { pickAndUploadImage } from '@/utils/upload';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/utils/error';
import { nairaToKobo } from '@/utils/money';
import type { ICreateProductPayload, IProductImage, IProductOption, IProductVariantInput, IProductDetails } from '@/types/product';

interface ProductFormValues {
  name: string;
  categoryId: string;
  description: string;
  barcode: string;
  priceNaira: string;
  discountPriceNaira: string;
  stock: string;
  tags: string;
  highlights: string[];
  installmentEnabled: boolean;
  installmentPresetId: string;
}

export interface ProductFormProps {
  initial?: IProductDetails;
  mode: 'create' | 'edit';
}

export function ProductForm({ initial, mode }: ProductFormProps) {
  const { colors, spacing } = useAppTheme();
  const router = useRouter();
  const toast = useToast();

  const { data: categories } = useGetCategoriesQuery();
  const { data: signature } = useGetCloudinarySignatureQuery({ subfolder: 'products' });
  const { data: installmentConfig } = useGetInstallmentConfigQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    categoryId: initial?.category_id ?? '',
    description: initial?.description ?? '',
    barcode: initial?.barcode ?? '',
    priceNaira: initial ? String(initial.price / 100) : '',
    discountPriceNaira: initial?.discount_price ? String(initial.discount_price / 100) : '',
    stock: initial?.stock !== undefined ? String(initial.stock) : '',
    tags: (initial?.tags ?? []).join(', '),
    highlights: initial?.highlights ?? [],
    installmentEnabled: initial?.installment_enabled ?? false,
    installmentPresetId: initial?.installment_preset_id ?? '',
  });

  const [image, setImage] = useState<IProductImage | null>(
    typeof initial?.image === 'string' ? { url: initial.image } : null,
  );
  const [gallery, setGallery] = useState<IProductImage[]>(initial?.gallery ?? []);
  const [options, setOptions] = useState<IProductOption[]>(initial?.options ?? []);
  const [variants] = useState<IProductVariantInput[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const addOption = () => {
    const name = newOptionName.trim();
    const optionValues = newOptionValues
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (!name || optionValues.length === 0) {
      toast.showError('Option name and at least one value are required');
      return;
    }
    setOptions((current) => [...current, { name, values: optionValues }]);
    setNewOptionName('');
    setNewOptionValues('');
  };

  const addHighlight = () => {
    const highlight = highlightInput.trim();
    if (!highlight) {
      return;
    }
    setValues((current) => ({ ...current, highlights: [...current.highlights, highlight] }));
    setHighlightInput('');
  };

  const uploadNewImage = async (): Promise<IProductImage | null> => {
    if (!signature) {
      toast.showError('Upload service unavailable');
      return null;
    }
    try {
      return await pickAndUploadImage(async () => signature);
    } catch {
      toast.showError('Image upload failed');
      return null;
    }
  };

  const handleAddImage = async () => {
    const uploaded = await uploadNewImage();
    if (uploaded) {
      if (!image) {
        setImage(uploaded);
      } else {
        setGallery((current) => [...current, uploaded]);
      }
    }
  };

  const handleAddGalleryImage = async () => {
    const uploaded = await uploadNewImage();
    if (uploaded) {
      setGallery((current) => [...current, uploaded]);
    }
  };

  const handleSubmit = async () => {
    if (!values.name.trim()) {
      toast.showError('Product name is required');
      return;
    }
    if (!values.categoryId) {
      toast.showError('Select a category');
      return;
    }
    const priceKobo = nairaToKobo(Number(values.priceNaira) || 0);
    if (priceKobo <= 0) {
      toast.showError('Enter a valid price');
      return;
    }

    const payload: ICreateProductPayload = {
      category_id: values.categoryId,
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      barcode: values.barcode.trim() || undefined,
      price: priceKobo,
      discount_price: values.discountPriceNaira ? nairaToKobo(Number(values.discountPriceNaira)) : undefined,
      stock: values.stock ? Number(values.stock) : 0,
      tags: values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      highlights: values.highlights,
      image: image ?? undefined,
      gallery: gallery.length > 0 ? gallery : undefined,
      options: options.length > 0 ? options : undefined,
      variants: variants.length > 0 ? variants : undefined,
      installment_enabled: values.installmentEnabled,
      installment_presets: values.installmentPresetId
        ? [values.installmentPresetId]
        : undefined,
    };

    try {
      if (mode === 'create') {
        await createProduct(payload).unwrap();
        toast.showSuccess('Product created');
      } else if (initial) {
        await updateProduct({ id: initial.id, body: payload }).unwrap();
        toast.showSuccess('Product updated');
      }
      router.back();
    } catch (error) {
      toast.showError(getErrorMessage(error));
    }
  };

  const categoryOptions =
    categories?.map((category) => ({ label: category.name, value: category.id })) ?? [];
  const presetOptions =
    installmentConfig?.presets.map((preset) => ({
      label: `${preset.name} (${preset.count} payments)`,
      value: preset.id,
    })) ?? [];

  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
      <Select
        label="Category *"
        value={values.categoryId}
        onChange={(categoryId) => set('categoryId', categoryId)}
        options={categoryOptions}
        placeholder="Select a category"
      />
      <AppInput
        label="Product name *"
        value={values.name}
        onChangeText={(name) => set('name', name)}
        placeholder="e.g. Premium Sneakers"
      />
      <AppInput
        label="Description"
        value={values.description}
        onChangeText={(description) => set('description', description)}
        multiline
        numberOfLines={4}
        placeholder="Describe your product…"
      />
      <AppInput
        label="Barcode / SKU (optional)"
        value={values.barcode}
        onChangeText={(barcode) => set('barcode', barcode)}
        placeholder="e.g. 8901234567890"
      />

      <Row style={{ gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppInput
            label="Price (₦) *"
            value={values.priceNaira}
            onChangeText={(priceNaira) => set('priceNaira', priceNaira.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppInput
            label="Discount price (₦)"
            value={values.discountPriceNaira}
            onChangeText={(discountPriceNaira) =>
              set('discountPriceNaira', discountPriceNaira.replace(/[^0-9.]/g, ''))
            }
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
      </Row>
      <AppInput
        label="Stock quantity"
        value={values.stock}
        onChangeText={(stock) => set('stock', stock.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="0"
      />
      <AppInput
        label="Tags (comma separated)"
        value={values.tags}
        onChangeText={(tags) => set('tags', tags)}
        placeholder="sneakers, fashion, nike"
      />

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Product image *
        </AppText>
        {image ? (
          <View style={{ gap: spacing.sm }}>
            <AppImage uri={image.url} style={{ width: '100%', aspectRatio: 1 }} />
            <Row style={{ gap: spacing.md }}>
              <Button
                title="Replace"
                variant="outline"
                size="sm"
                fullWidth={false}
                onPress={handleAddImage}
              />
              <Button
                title="Remove"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setImage(null)}
              />
            </Row>
          </View>
        ) : (
          <Button title="Upload image" variant="outline" size="sm" fullWidth={false} onPress={handleAddImage} />
        )}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Gallery ({gallery.length})
        </AppText>
        <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
          {gallery.map((item, index) => (
            <View key={`${item.url}-${index}`} style={{ width: 80 }}>
              <AppImage uri={item.url} style={{ width: 80, height: 80 }} />
              <Button
                title="✕"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setGallery((current) => current.filter((_, i) => i !== index))}
              />
            </View>
          ))}
        </Row>
        <Button title="Add gallery image" variant="outline" size="sm" fullWidth={false} onPress={handleAddGalleryImage} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Highlights
        </AppText>
        {values.highlights.map((highlight, index) => (
          <Row key={`${highlight}-${index}`} style={{ justifyContent: 'space-between' }}>
            <AppText variant="small" style={{ flex: 1 }}>
              • {highlight}
            </AppText>
            <Button
              title="✕"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={() =>
                setValues((current) => ({
                  ...current,
                  highlights: current.highlights.filter((_, i) => i !== index),
                }))
              }
            />
          </Row>
        ))}
        <Row style={{ gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppInput
              value={highlightInput}
              onChangeText={setHighlightInput}
              placeholder="Add a highlight…"
            />
          </View>
          <Button title="Add" variant="outline" size="sm" fullWidth={false} onPress={addHighlight} />
        </Row>
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label" weight="bold">
          Options & Variants
        </AppText>
        {options.map((option) => (
          <View key={option.name} style={{ gap: 4 }}>
            <AppText variant="small" weight="semibold">
              {option.name}: {option.values.join(', ')}
            </AppText>
          </View>
        ))}
        <AppInput
          value={newOptionName}
          onChangeText={setNewOptionName}
          placeholder="Option name (e.g. Size, Color)"
        />
        <AppInput
          value={newOptionValues}
          onChangeText={setNewOptionValues}
          placeholder="Values, comma separated (e.g. S, M, L)"
        />
        <Button title="Add Option" variant="outline" size="sm" fullWidth={false} onPress={addOption} />
        {options.length > 0 ? (
          <AppText variant="small" color={colors.textSubtle}>
            Variant pricing is configured from the web dashboard in this version.
          </AppText>
        ) : null}
      </Card>

      {installmentConfig?.enabled ? (
        <Card style={{ gap: spacing.sm }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="label" weight="bold">
              Pay in installments
            </AppText>
            <Chip
              label={values.installmentEnabled ? 'Enabled' : 'Disabled'}
              selected={values.installmentEnabled}
              onPress={() => set('installmentEnabled', !values.installmentEnabled)}
            />
          </Row>
          {values.installmentEnabled ? (
            <Select
              label="Preset"
              value={values.installmentPresetId}
              onChange={(installmentPresetId) => set('installmentPresetId', installmentPresetId)}
              options={presetOptions}
              placeholder="Select a preset"
            />
          ) : null}
        </Card>
      ) : null}

      <Spacer height={8} />
      <Button
        title={mode === 'create' ? 'Create Product' : 'Save Changes'}
        onPress={handleSubmit}
        loading={creating || updating}
      />
    </View>
  );
}
