import { StyleSheet, Text, View } from 'react-native';

interface Props {
  value: number; // 0–1
}

export function ConfidenceBar({ value }: Props) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Confidence: {pct}%</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { color: '#6b7280', fontSize: 13 },
  track: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  fill: { borderRadius: 4, height: '100%' },
});
