import { ScrollView } from 'react-native';
import { ProductForm } from '@/components/shared/ProductForm';

export default function ProductNewScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ProductForm mode="create" />
    </ScrollView>
  );
}
