import { ScrollView } from 'react-native';
import { ProductForm } from '@/components/shared/ProductForm';

export default function StaffProductNewScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ProductForm mode="create" />
    </ScrollView>
  );
}
