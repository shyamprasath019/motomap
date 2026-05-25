import { useRouter } from 'expo-router';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfidenceBar } from '../../../components/ConfidenceBar';
import { RiskBadge } from '../../../components/RiskBadge';
import { getDiagnosisResult } from '../../../lib/diagnosisStore';
import type { DiagnosedPart } from '../../../types';

export default function DiagnosisResultScreen() {
  const router = useRouter();
  const result = getDiagnosisResult();

  if (!result) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>No diagnosis data. Run a diagnosis first.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const safetyColor =
    result.safe_to_ride == null
      ? '#d97706'
      : result.safe_to_ride
      ? '#16a34a'
      : '#dc2626';

  const safetyLabel =
    result.safe_to_ride == null
      ? '⚠ Uncertain – see mechanic'
      : result.safe_to_ride
      ? '✓ Safe to ride'
      : '✕ Do NOT ride – see mechanic now';

  function renderPart({ item }: { item: DiagnosedPart }) {
    return (
      <View style={styles.partCard}>
        <View style={styles.partHeader}>
          <Text style={styles.partName}>{item.name}</Text>
          <RiskBadge level={item.severity} />
        </View>
        <ConfidenceBar value={item.confidence} />
        <Text style={styles.issue}>{item.issue}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Overall confidence */}
        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Confidence</Text>
          <ConfidenceBar value={result.overall_confidence} />
        </View>

        {/* Safety verdict */}
        <View style={[styles.verdictCard, { borderLeftColor: safetyColor }]}>
          <Text style={[styles.verdictText, { color: safetyColor }]}>
            {safetyLabel}
          </Text>
          {result.low_confidence_warning ? (
            <Text style={styles.warningText}>{result.low_confidence_warning}</Text>
          ) : null}
        </View>

        {/* Mechanic prompt */}
        {result.mechanic_prompt ? (
          <View style={styles.mechanicBox}>
            <Text style={styles.mechanicTitle}>🔧 Mechanic Note</Text>
            <Text style={styles.mechanicText}>{result.mechanic_prompt}</Text>
          </View>
        ) : null}

        {/* Diagnosed parts */}
        <Text style={styles.sectionTitle}>Diagnosed Parts</Text>
        {result.diagnosed_parts.length > 0 ? (
          <FlatList
            data={result.diagnosed_parts}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderPart}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        ) : (
          <Text style={styles.emptyText}>No specific parts identified.</Text>
        )}

        {/* Raw analysis */}
        <TouchableOpacity
          style={styles.rawSection}
          onPress={() => {}}
        >
          <Text style={styles.sectionTitle}>AI Raw Analysis</Text>
          <Text style={styles.rawText}>{result.raw_analysis}</Text>
        </TouchableOpacity>

        {/* Retry button */}
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryText}>Diagnose Another</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  scroll: { padding: 20, gap: 16 },
  overallCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    elevation: 1,
  },
  overallLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verdictCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
    gap: 6,
  },
  verdictText: { fontSize: 16, fontWeight: '700' },
  warningText: { fontSize: 13, color: '#d97706', lineHeight: 18 },
  mechanicBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  mechanicTitle: { fontSize: 14, fontWeight: '700', color: '#9a3412' },
  mechanicText: { fontSize: 13, color: '#7c2d12', lineHeight: 19 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  partCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    elevation: 1,
  },
  partHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  partName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  issue: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  rawSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 8,
    elevation: 1,
  },
  rawText: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  emptyText: { fontSize: 13, color: '#9ca3af' },
  retryBtn: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btn: {
    backgroundColor: '#f97316',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  errorText: { fontSize: 14, color: '#374151', textAlign: 'center' },
});
