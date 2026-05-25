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

export default function ExploreIndex() {
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
        <Text style={styles.errorSub}>Make sure the backend is running on port 8000</Text>
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
          router.push({ pathname: '/explore/anatomy', params: { bikeId: item.id } })
        }
      >
        <View style={styles.makePill}>
          <Text style={styles.makeText}>{item.make}</Text>
        </View>
        <Text style={styles.modelText}>{item.model}</Text>
        <Text style={styles.yearText}>{yearRange}</Text>
        {item.variant ? <Text style={styles.variantText}>{item.variant}</Text> : null}
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
            <Text style={styles.title}>Explore Anatomy</Text>
            <Text style={styles.subtitle}>Select your bike to see its parts</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No bikes found in database.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  list: { padding: 16, gap: 12 },
  header: { marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  makePill: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
  },
  makeText: { color: '#f97316', fontWeight: '700', fontSize: 12 },
  modelText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  yearText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  variantText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  loadingText: { color: '#6b7280', marginTop: 8 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: '#991b1b' },
  errorSub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#f97316',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
});
