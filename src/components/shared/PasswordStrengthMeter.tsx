import { View } from 'react-native';
import { useAppTheme } from '@/theme';
import { AppText } from '@/components/ui/Text';

function scorePassword(password: string): number {
  let score = 0;
  if (password.length >= 8) {
    score += 1;
  }
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }
  return score;
}

const LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['', '#ef4444', '#f59e0b', '#84cc16', '#10b981'];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { radius } = useAppTheme();
  const score = password ? scorePassword(password) : 0;

  if (!password) {
    return null;
  }

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4].map((segment) => (
          <View
            key={segment}
            style={{
              flex: 1,
              height: 4,
              borderRadius: radius.sm,
              backgroundColor: segment <= score ? COLORS[score] : '#e4e4e7',
            }}
          />
        ))}
      </View>
      <AppText style={{ fontSize: 11 }} weight="medium" color={COLORS[score] || '#71717a'}>
        {LABELS[score]} password
      </AppText>
    </View>
  );
}
