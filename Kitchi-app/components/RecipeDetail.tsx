import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native'
import { useEffect, useState } from 'react';
import React from 'react'
import { recipeInfo} from '@/lib/spoonacular';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { generateShoppingListForRecipe } from '@/lib/shoppingList';
import { useRouter } from 'expo-router';





export default function RecipeDetail({recipe}: {recipe: recipeInfo | null}) {

const [err, setErr] = useState<string | null>(null);
const [showSummary, setShowSummary] = useState(false); // State to toggle summary visibility
const [showIngredients, setShowIngredients] = useState(false); // State to toggle ingredients visibility
const [showInstructions, setShowInstructions] = useState(false); // State to toggle instructions visibility
const [loadingList, setLoadingList] = useState(false);
const router = useRouter();

const ToggleDown = <FontAwesome name="toggle-down" size={20} color="black" />;
const ToggleUp = <FontAwesome name="toggle-up" size={20} color="black" />;

const handleGenerateShoppingList = async () => {
  if (!recipe) return;
  try {
    setLoadingList(true);

    // ✅ Pass the full recipe object (with extendedIngredientsNames)
    const missingIngredients = await generateShoppingListForRecipe(recipe);

    // Navigate to ShoppingList screen with missing ingredients
    router.push({
      pathname: "/ShoppingList",
      params: { items: JSON.stringify(missingIngredients) },
    });
  } catch (error: any) {
    setErr(error.message);
  } finally {
    setLoadingList(false);
  }
};

  return (

    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff' }}>
        {!recipe ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <ScrollView style={{ width: wp('100%')}}>
                <View style={styles.card}>
                    <Image source={{ uri: recipe.image }} style={{ width: '100%', height: '70%', borderRadius: 8, marginBottom: 32 }} />
                    <Text style={{fontSize: 24, fontWeight: "bold", textAlign: 'center'}}>{recipe.title}</Text>
                </View>
                
                {/*Generate Shopping List Button */}
                <View style={{ alignItems: 'center', marginVertical: 10 }}>
                    <TouchableOpacity
                    style={{
                        backgroundColor: '#007AFF',
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        width: wp('90%'),
                        alignItems: 'center'
                    }}
                    onPress={handleGenerateShoppingList}
                    disabled={loadingList}
                    >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {loadingList ? 'Generating...' : 'Generate Shopping List'}
                    </Text>
                    </TouchableOpacity>
                </View>
                
                <View>
                    <View style={styles.Toggle}>
                        
                        <Text className = "text-lg mb-2">Servings: {recipe.servings}</Text>
                        <Text className = "text-lg mb-2">Cooking Minutes: {recipe.readyInMinutes}</Text>
                    </View>
                    {/* summary */}
                <TouchableOpacity onPress={() => {
                    setShowSummary(!showSummary)}}
                    style={styles.Toggle}
                >
                    <Text>Summary</Text>
                    <Text>{showSummary? ToggleUp: ToggleDown}</Text>
                </TouchableOpacity>
                {showSummary && (
                <Text style={{ padding: 16}}>{recipe.summary.replace(/<[^>]+>/g, '')}</Text>
                )}

                {/* ingredients */}
                <TouchableOpacity onPress={() => {
                    setShowIngredients(!showIngredients)}}
                    style={styles.Toggle}
                >
                    <Text>Ingredients</Text>
                    <Text>{showIngredients? ToggleUp: ToggleDown}</Text>
                </TouchableOpacity>
                {showIngredients && (
                recipe.extendedIngredients.map((ingredient, index) => (
                    <Text style={{ padding: 8}} key={index} className = "mb-1">- {ingredient.original}</Text>
                )))}

                {/* instructions */}
                <TouchableOpacity onPress={() => {
                    setShowInstructions(!showInstructions)}}
                    style={styles.Toggle}
                >
                    <Text>instructions</Text>
                    <Text>{showInstructions? ToggleUp: ToggleDown}</Text>
                </TouchableOpacity>
                {showInstructions && (
                <View style={{ padding: 16 }}>
                    {recipe.instructions
                        ? recipe.instructions
                            .replace(/<[^>]+>/g, '')
                            .split('.')
                            .filter(sentence => sentence.trim().length > 0)
                            .map((sentence, index) => (
                                <Text style={{ padding: 4}} key={index}>- {sentence.trim()}.</Text>
                            ))
                        : <Text>No instructions available.</Text>
                    }
                </View>
                )}
                
                
                </View>
                
                
            </ScrollView>
        )}
        {err && <Text className = "text-red-500 mt-4">{err}</Text>}






    </View>
  )
}

const styles = StyleSheet.create({
  card:{
    
    backgroundColor: '#fff',       
    borderRadius: 12,
    width: wp('100%'),
    height: hp('30%'),
    alignSelf: 'center',

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    // Android Shadow
    elevation: 5,
  },
  image:{
    flex: 8,
    width: '90%',
    alignSelf: 'center',
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: hp('2%'),
  },

  Toggle:{
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 16,
    backgroundColor: "#ffffffff",
    marginTop: 16,
    marginHorizontal: 16,
    borderBottomWidth: 0.3,
  }

})