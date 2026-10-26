import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface InventoryItem {
  unit_barcode: string;
  component_type: string;
  current_status: string;
  blood_group_segregation_zone: string;
  expiration_date_time: string;
}

// ⚠️ REPLACE WITH YOUR COMPUTER'S LOCAL IP ADDRESS (e.g. 10.5.17.39)
const API_URL = 'https://foothold-barrack-regulate.ngrok-free.dev';

export default function Index() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory`);
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Blood Bank</Text>
          <Text style={styles.subTitle}>Live MySQL Storage Monitor</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.barcode}>{item.unit_barcode}</Text>
                <View style={[styles.statusBadge, styles.approvedBadge]}>
                  <Text style={[styles.statusText, styles.approvedText]}>
                    {item.current_status}
                  </Text>
                </View>
              </View>
              <Text style={styles.type}>{item.component_type}</Text>
              <View style={styles.footerRow}>
                <Text style={styles.details}>📍 {item.blood_group_segregation_zone}</Text>
                <Text style={styles.details}>⏳ Expires: {item.expiration_date_time?.split('T')[0]}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', paddingHorizontal: 16, paddingTop: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  subTitle: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  listContainer: { paddingBottom: 24 },
  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  barcode: { fontSize: 15, fontWeight: '700', color: '#ef4444' },
  type: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8, marginTop: 4 },
  details: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  approvedBadge: { backgroundColor: '#e0f2fe' },
  statusText: { fontSize: 11, fontWeight: '700' },
  approvedText: { color: '#0369a1' },
});
