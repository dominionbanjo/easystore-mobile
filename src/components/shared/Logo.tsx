import { View } from 'react-native';
import { AppText } from '@/components/ui/Text';
import { useAppTheme } from '@/theme';

export function Logo({
  size = 'md',
  tagline = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  tagline?: boolean;
}) {
  const fontSize = size === 'lg' ? 28 : size === 'md' ? 22 : 17;
  const storeFontSize = size === 'lg' ? 22 : size === 'md' ? 17 : 13;
  const taglineSize = size === 'lg' ? 11 : 9;

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <AppText
          style={{
            fontSize,
            letterSpacing: -1.2,
            fontWeight: '900',
            textTransform: 'uppercase',
          }}
        >
          EAZY
        </AppText>
        <AppText
          style={{
            fontSize: storeFontSize,
            fontWeight: '300',
            letterSpacing: -1.2,
            textTransform: 'uppercase',
            marginLeft: 2,
          }}
          color="#17c06e"
        >
          STORE
        </AppText>
      </View>
      {tagline ? (
        <AppText
          style={{
            fontSize: taglineSize,
            fontWeight: '700',
            letterSpacing: 3.4,
            textTransform: 'uppercase',
            marginTop: 3,
            marginLeft: 3,
          }}
          color="#71717a"
        >
          SIMPLIFIED
        </AppText>
      ) : null}
    </View>
  );
}

export function LogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { radius } = useAppTheme();
  const dimension = size === 'lg' ? 56 : size === 'md' ? 40 : 24;
  const fontSize = size === 'lg' ? 24 : size === 'md' ? 18 : 12;
  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: radius.sm,
        backgroundColor: '#17c06e',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText
        style={{
          fontSize,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: -0.5,
        }}
        color="#ffffff"
      >
        EZ
      </AppText>
    </View>
  );
}
