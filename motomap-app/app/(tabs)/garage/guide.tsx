import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGuide } from '../../../lib/api';
import type { GuideStep } from '../../../types';

const DIFFICULTY_COLORS = {
  BEGINNER: { bg: '#dcfce7', text: '#166534' },
  INTERMEDIATE: { bg: '#fef9c3', text: '#854d0e' },
  ADVANCED: { bg: '#fee2e2', text: '#991b1b' },
} as const;

export default function GuideViewerScreen() {
  const { guideId } = useLocalSearchParams<{ guideId: string }>();

  const { data: guide, isLoading, error } = useQuery({
    queryKey: ['guide', guideId],
    queryFn: () => fetchGuide(guideId),
    enabled: !!guideId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading guide…</Text>
      </SafeAreaView>
    );
  }

  if (error || !guide) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Failed to load guide.</Text>
      </SafeAreaView>
    );
  }

  const { bg, text: textColor } = DIFFICULTY_COLORS[guide.difficulty];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Guide header */}
        <Text style={styles.title}>{guide.title}</Text>
        <View style={styles.meta}>
          <View style={[styles.diffBadge, { backgroundColor: bg }]}>
            <Text style={[styles.diffText, { color: textColor }]}>{guide.difficulty}</Text>
          </View>
          {guide.estimated_minutes ? (
            <Text style={styles.time}>⏱ {guide.estimated_minutes} min</Text>
          ) : null}
        </View>

        {/* Tools required */}
        {guide.tools_required && guide.tools_required.length > 0 ? (
          <View style={styles.toolsBox}>
            <Text style={styles.sectionLabel}>Tools Required</Text>
            {guide.tools_required.map((tool, i) => (
              <Text key={i} style={styles.toolItem}>
                • {tool}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Steps */}
        <Text style={styles.sectionLabel}>
          Steps ({guide.steps?.length ?? 0})
        </Text>
        {guide.steps && guide.steps.length > 0 ? (
          guide.steps.map((step) => <StepCard key={step.id} step={step} />)
        ) : (
          <Text style={styles.emptyText}>No steps available.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StepCard({ step }: { step: GuideStep }) {
  return (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNum}>
          <Text style={styles.stepNumText}>{step.step_number}</Text>
        </View>
        <Text style={styles.stepTitle}>{step.title}</Text>
      </View>

      {step.photo_url ? (
        <Image source={{ uri: step.photo_url }} style={styles.stepPhoto} resizeMode="cover" />
      ) : null}

      <Text style={styles.stepDesc}>{step.description}</Text>

      {step.warning ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠ {step.warning}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  diffBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  diffText: { fontSize: 11, fontWeight: '700' },
  time: { fontSize: 13, color: '#6b7280' },
  toolsBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 4,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  toolItem: { fontSize: 14, color: '#374151' },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  stepTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  stepPhoto: { width: '100%', height: 180, borderRadius: 8 },
  stepDesc: { fontSize: 14, color: '#374151', lineHeight: 21 },
  warningBox: {
    backgroundColor: '#fef9c3',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#d97706',
  },
  warningText: { fontSize: 13, color: '#854d0e' },
  loadingText: { color: '#6b7280', marginTop: 8 },
  errorText: { fontSize: 14, color: '#991b1b' },
  emptyText: { fontSize: 13, color: '#9ca3af' },
});
