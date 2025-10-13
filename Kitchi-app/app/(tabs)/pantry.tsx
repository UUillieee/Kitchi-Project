import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker'; 
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { usePushNotifications } from '@/components/usePushNotifications';

type PantryItem = {
  full_name: string;
  food_name: string;
  expiry_date: string;
};

export default function PantryScreen() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); 

  const { expoPushToken, notification } = usePushNotifications();

  async function fetchPantryItems(order: 'asc' | 'desc' = sortOrder) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('⚠️ No user logged in');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('pantry_items')
        .select('full_name, food_name, expiry_date')
        .eq('user_id', user.id)
        .order('expiry_date', { ascending: order === 'asc' }); 

      if (error) throw error;

      setItems(data || []);
    } catch (err: any) {
      console.error('Error fetching pantry items:', err.message);
      Alert.alert('Error', 'Failed to load pantry items');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign Out Failed', error.message);
    } else {
      router.replace('/');
    }
  }

  useEffect(() => {
    fetchPantryItems();
  }, [sortOrder]); 

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`pantry_updates_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pantry_items',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchPantryItems()
      )
      .subscribe();

    const interval = setInterval(fetchPantryItems, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId]);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.cell, styles.headerText]}>Full Name</Text>
      <Text style={[styles.cell, styles.headerText]}>Food</Text>
      <Text style={[styles.cell, styles.headerText]}>Expiry</Text>
    </View>
  );

  const renderPantryItem = ({ item }: { item: PantryItem }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cell}>{item.full_name}</Text>
      <Text style={styles.cell}>{item.food_name}</Text>
      <Text style={styles.cell}>{item.expiry_date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Notifications Section
        <View style={styles.notificationContainer}>
          <Text style={styles.subheading}>📬 Notification Data:</Text>
          <Text selectable style={styles.notificationText}>
            {notificationData}
          </Text>
          <Text style={styles.tokenText}>
            Token: {expoPushToken?.data ?? 'N/A'}
          </Text>
        </View> */}

        <Text style={styles.heading}>My Pantry</Text>

        {/* 🆕 Sorting Dropdown */}
        <View style={styles.sortContainer}>
  <Text style={styles.sortLabel}>Sort by Expiry:</Text>
  <Button
    type="outline"
    title={sortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}
    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
    buttonStyle={styles.sortButton}
    titleStyle={styles.sortButtonText}
  />
</View>


        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No pantry items found.</Text>
        ) : (
          <View style={styles.tableContainer}>
            {renderTableHeader()}
            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item.food_name}-${index}`}
              renderItem={renderPantryItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          buttonStyle={styles.signOutButton}
          titleStyle={styles.signOutText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 26,
  },
  subheading: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationContainer: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  notificationText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#555',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  tableContainer: {
    marginTop: 8,
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#ccc',
    paddingBottom: 8,
    paddingTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  signOutContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 80,
  },
  signOutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  signOutText: {
    color: 'white',
    fontWeight: 'bold',
  },

  sortButton: {
  borderColor: '#007BFF',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 6,
},
sortButtonText: {
  color: '#007BFF',
  fontSize: 14,
  fontWeight: '600',
},

});
