import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ShoppingList() {
    const { data } = useLocalSearchParams();
    const missing = data ? JSON.parse(data as string) : [];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shopping List</Text>
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
    title: { fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 10 },
    item: { fontSize: 18, 
        marginVertical: 6 },
});