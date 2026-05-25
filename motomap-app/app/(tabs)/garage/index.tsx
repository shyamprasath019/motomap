import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchBikes } from '../../../lib/api';
import type { Bike } from '../../../types';

export default function GarageIndex() {
  const router = useRouter();
  const { data: bikes, isLoading, error, refetch } = useQuery({
    queryKey: ['bikes'],
    queryFn: fetchBikes,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading bikes…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't reach API</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  function renderBike({ item }: { item: Bike }) {
    const yearRange = item.year_end
      ? `${item.year_start}–${item.year_end}`
      : `${item.year_start}+`;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/garage/guides', params: { bikeId: item.id } })
        }
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔧</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.makeText}>{item.make}</Text>
          <Text style={styles.modelText}>{item.model}</Text>
          <Text style={styles.yearText}>{yearRange}</Text>
          {item.variant ? <Text style={styles.variantText}>{item.variant}</Text> : null}
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bikes}
        keyExtractor={(b) => b.id}
        renderItem={renderBike}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Garage</Text>
            <Text style={styles.subtitle}>
              Select a bike to see its DIY maintenance guides
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bikes found.</Text>
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
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  makeText: { fontSize: 11, color: '#f97316', fontWeight: '700', letterSpacing: 0.3 },
  modelText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  yearText: { fontSize: 12, color: '#6b7280' },
  variantText: { fontSize: 11, color: '#9ca3af' },
  arrow: { fontSize: 22, color: '#d1d5db' },
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
