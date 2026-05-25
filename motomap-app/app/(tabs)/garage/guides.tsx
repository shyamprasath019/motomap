import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchGuides } from '../../../lib/api';
import type { Guide } from '../../../types';

const DIFFICULTY_COLORS = {
  BEGINNER: { bg: '#dcfce7', text: '#166534' },
  INTERMEDIATE: { bg: '#fef9c3', text: '#854d0e' },
  ADVANCED: { bg: '#fee2e2', text: '#991b1b' },
} as const;

export default function GuidesScreen() {
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  const router = useRouter();

  const { data: guides, isLoading, error, refetch } = useQuery({
    queryKey: ['guides', bikeId],
    queryFn: () => fetchGuides(bikeId),
    enabled: !!bikeId,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading guides…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Failed to load guides</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  function renderGuide({ item }: { item: Guide }) {
    const { bg, text } = DIFFICULTY_COLORS[item.difficulty];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/garage/guide', params: { guideId: item.id } })
        }
      >
        <View style={styles.cardTop}>
          <Text style={styles.guideTitle}>{item.title}</Text>
          <View style={[styles.diffBadge, { backgroundColor: bg }]}>
            <Text style={[styles.diffText, { color: text }]}>{item.difficulty}</Text>
          </View>
        </View>
        {item.estimated_minutes ? (
          <Text style={styles.time}>⏱ {item.estimated_minutes} min</Text>
        ) : null}
        {item.tools_required && item.tools_required.length > 0 ? (
          <Text style={styles.tools} numberOfLines={1}>
            🔧 {item.tools_required.join(', ')}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={guides}
        keyExtractor={(g) => g.id}
        renderItem={renderGuide}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.count}>{guides?.length ?? 0} guides available</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No guides yet for this bike.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  list: { padding: 16, gap: 10 },
  count: { fontSize: 13, color: '#9ca3af', marginBottom: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  guideTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  diffBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  diffText: { fontSize: 11, fontWeight: '700' },
  time: { fontSize: 12, color: '#6b7280' },
  tools: { fontSize: 12, color: '#6b7280' },
  loadingText: { color: '#6b7280', marginTop: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b' },
  retryBtn: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
});
