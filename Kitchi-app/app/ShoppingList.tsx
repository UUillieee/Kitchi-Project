//Import necessary React Native components
import { View, Text, FlatList, StyleSheet } from 'react-native';
//Import the hook to access parameters passed through Expo Router navigation
import { useLocalSearchParams } from 'expo-router';

//Define and export the ShoppingList screen component
export default function ShoppingList() {

    //Retrieve parameters passed via navigation (e.g., from another screen)
    const { items } = useLocalSearchParams();

    //Parse the 'items' parameter (expected to be a JSON string) into an array
    //If no items were passed, default to an empty array
    const missing = items ? JSON.parse(items as string) : [];

    return (
        //Main container view for the screen
        <View style={styles.container}>
            {/* Screen title */}
            <Text style={styles.title}>Shopping List 🛍️</Text>

            {/* Display a list of missing ingredients using FlatList for efficiency */}
            <FlatList
                data={missing} // The array of missing ingredients
                keyExtractor={(item, index) => index.toString()} //Unique key for each list item
                renderItem={({ item }) => (
                    //Each item is displayed as a bullet point
                    <Text style={styles.item}>• {item}</Text>
                )}
            />
        </View>
    );
}

//Define and apply styling for the component using React Native’s StyleSheet API
const styles = StyleSheet.create({
    //Outer container style
    container: { 
        flex: 1, 
        backgroundColor: '#fff', 
        padding: 16, 
    },

    //Title style
    title: { 
        fontSize: 30, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        textAlign: 'center', 
    },

    //List item style
    item: { 
        fontSize: 25, 
        marginVertical: 7,
    },
});
