import { StyleSheet, Text, View } from 'react-native';
import type { RiskLevel } from '../types';

const PALETTE: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  SAFE: { bg: '#dcfce7', text: '#166534', label: '✓ SAFE' },
  CAUTION: { bg: '#fef9c3', text: '#854d0e', label: '⚠ CAUTION' },
  STOP: { bg: '#fee2e2', text: '#991b1b', label: '✕ STOP' },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { bg, text, label } = PALETTE[level];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
