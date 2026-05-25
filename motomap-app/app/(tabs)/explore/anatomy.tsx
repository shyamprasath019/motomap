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
import { RiskBadge } from '../../../components/RiskBadge';
import { fetchBike, fetchParts } from '../../../lib/api';
import { cacheParts } from '../../../lib/offline';
import type { Part } from '../../../types';

const RISK_ORDER = { STOP: 0, CAUTION: 1, SAFE: 2 } as const;

export default function AnatomyScreen() {
  const { bikeId } = useLocalSearchParams<{ bikeId: string }>();
  const router = useRouter();

  const { data: bike } = useQuery({
    queryKey: ['bike', bikeId],
    queryFn: () => fetchBike(bikeId),
    enabled: !!bikeId,
  });

  const { data: parts, isLoading, error, refetch } = useQuery({
    queryKey: ['parts', bikeId],
    queryFn: async () => {
      const result = await fetchParts(bikeId);
      await cacheParts(bikeId, result);
      return result;
    },
    enabled: !!bikeId,
  });

  const grouped = parts
    ? Object.entries(
        parts.reduce<Record<string, Part[]>>((acc, p) => {
          const cat = p.category || 'Other';
          (acc[cat] ??= []).push(p);
          return acc;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b))
    : [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading parts…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Failed to load parts</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const allParts = grouped.flatMap(([, ps]) =>
    [...ps].sort((a, b) => RISK_ORDER[a.risk_level] - RISK_ORDER[b.risk_level]),
  );

  function renderPart({ item }: { item: Part }) {
    return (
      <TouchableOpacity
        style={styles.partCard}
        onPress={() =>
          router.push({
            pathname: '/explore/part',
            params: { bikeId, partId: item.id },
          })
        }
      >
        <View style={styles.partRow}>
          <Text style={styles.partName}>{item.name}</Text>
          <RiskBadge level={item.risk_level} />
        </View>
        <Text style={styles.partCategory}>{item.category}</Text>
        <Text style={styles.partFunction} numberOfLines={2}>
          {item.function}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={allParts}
        keyExtractor={(p) => p.id}
        renderItem={renderPart}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            {bike ? (
              <>
                <Text style={styles.bikeName}>
                  {bike.make} {bike.model}
                </Text>
                <Text style={styles.bikeYear}>
                  {bike.year_start}
                  {bike.year_end ? `–${bike.year_end}` : '+'}
                  {bike.variant ? ` · ${bike.variant}` : ''}
                </Text>
              </>
            ) : null}
            <Text style={styles.count}>{parts?.length ?? 0} parts</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  list: { padding: 16, gap: 10 },
  header: { marginBottom: 8 },
  bikeName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  bikeYear: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  count: { fontSize: 13, color: '#9ca3af', marginTop: 6 },
  partCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  partName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  partCategory: { fontSize: 11, color: '#f97316', fontWeight: '600', letterSpacing: 0.3 },
  partFunction: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  loadingText: { color: '#6b7280', marginTop: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b' },
  retryBtn: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
