import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RiskBadge } from '../../../components/RiskBadge';
import { fetchPart, fetchPartConnections } from '../../../lib/api';

export default function PartDetailScreen() {
  const { bikeId, partId } = useLocalSearchParams<{ bikeId: string; partId: string }>();
  const router = useRouter();

  const { data: part, isLoading: loadingPart } = useQuery({
    queryKey: ['part', bikeId, partId],
    queryFn: () => fetchPart(bikeId, partId),
    enabled: !!bikeId && !!partId,
  });

  const { data: connections, isLoading: loadingConn } = useQuery({
    queryKey: ['connections', partId],
    queryFn: () => fetchPartConnections(partId),
    enabled: !!partId,
  });

  if (loadingPart) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  if (!part) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Part not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.titleRow}>
          <Text style={styles.partName}>{part.name}</Text>
          <RiskBadge level={part.risk_level} />
        </View>
        <Text style={styles.category}>{part.category}</Text>

        {/* Function */}
        <Section title="Function">
          <Text style={styles.bodyText}>{part.function}</Text>
        </Section>

        {/* Failure Consequences */}
        <Section title="Failure Consequences">
          <Text style={styles.bodyText}>{part.failure_consequences}</Text>
        </Section>

        {/* Quick Fix */}
        {part.quick_fix ? (
          <Section title="Quick Fix">
            <View style={styles.fixBox}>
              <Text style={styles.fixText}>{part.quick_fix}</Text>
            </View>
          </Section>
        ) : null}

        {/* Cost Range */}
        {part.cost_range_min != null ? (
          <Section title="Repair Cost">
            <Text style={styles.bodyText}>
              ₹{part.cost_range_min.toLocaleString()}
              {part.cost_range_max != null
                ? ` – ₹${part.cost_range_max.toLocaleString()}`
                : '+'}
            </Text>
          </Section>
        ) : null}

        {/* DIY Fixable */}
        <Section title="DIY Fixable">
          <Text style={[styles.bodyText, { color: part.diy_fixable ? '#16a34a' : '#dc2626' }]}>
            {part.diy_fixable ? 'Yes — rider can fix' : 'No — visit a mechanic'}
          </Text>
        </Section>

        {/* Connected Parts */}
        <Section title="Connected Parts">
          {loadingConn ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : connections && connections.length > 0 ? (
            connections.map((conn) =>
              conn.connected_part ? (
                <TouchableOpacity
                  key={conn.id}
                  style={styles.connCard}
                  onPress={() =>
                    router.push({
                      pathname: '/explore/part',
                      params: { bikeId, partId: conn.connected_part!.id },
                    })
                  }
                >
                  <View style={styles.connRow}>
                    <Text style={styles.connName}>{conn.connected_part.name}</Text>
                    <RiskBadge level={conn.connected_part.risk_level} />
                  </View>
                  <Text style={styles.connType}>{conn.connection_type}</Text>
                </TouchableOpacity>
              ) : null,
            )
          ) : (
            <Text style={styles.emptyText}>No connections found.</Text>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, gap: 4 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  partName: { flex: 1, fontSize: 22, fontWeight: '800', color: '#111827' },
  category: { fontSize: 12, color: '#f97316', fontWeight: '600', marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bodyText: { fontSize: 14, color: '#374151', lineHeight: 21 },
  fixBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
    padding: 12,
  },
  fixText: { fontSize: 14, color: '#166534', lineHeight: 20 },
  connCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    elevation: 1,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  connName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  connType: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  emptyText: { fontSize: 13, color: '#9ca3af' },
  errorText: { fontSize: 16, color: '#991b1b' },
});
