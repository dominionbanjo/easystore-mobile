import { Redirect } from 'expo-router';
import PosScreen from '../(vendor)/pos';

export default function StaffPosScreen() {
  return <PosScreen />;
}

export function StaffRedirect() {
  return <Redirect href="/staff/sales-history" />;
}
