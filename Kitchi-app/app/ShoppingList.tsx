import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ShoppingList() {
    const { items } = useLocalSearchParams();
    const missing = items ? JSON.parse(items as string) : [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shopping List 🛍️</Text>
            <FlatList
                data={missing}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.item}>• {item}</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, 
        backgroundColor: '#fff', 
        padding: 16 },
    title: { fontSize: 30, 
        fontWeight: 'bold', 
        marginBottom: 20,
        textAlign: 'center' },
    item: { fontSize: 25, 
        marginVertical: 7 },
});