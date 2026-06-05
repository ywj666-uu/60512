import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchPerformers } from '../services/api';

interface Performer {
  _id: string;
  name: string;
  description: string;
  avatar: string;
}

interface Props {
  navigation: any;
}

export default function PerformerListScreen({ navigation }: Props) {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformers();
  }, []);

  async function loadPerformers() {
    try {
      const data = await fetchPerformers();
      setPerformers(data);
    } catch (err) {
      console.error('Failed to load performers:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>正在演出的艺人</Text>
      <FlatList
        data={performers}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Cheer', { performer: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>{item.description || '正在演出中...'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>暂无艺人在演出</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: '#fff' },
  desc: { fontSize: 14, color: '#aaa', marginTop: 4 },
  empty: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 40 },
});
