import { View, Text, Image, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useCallback} from 'react'
import { useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {findRecipesByIngredients} from '../../lib/spoonacular';
import { getPantryItems } from '@/lib/pantry';
import { getUserId } from '@/lib/auth';
import { useRouter } from 'expo-router';



type Recipe ={
    id: number;
    title: string;
    image: string;
    
};





export default function GenerateRecipes() {
  //const userIngredients = ["apple", "tomato", "beef"]; // Example user ingredients from database
  const [ingredients, setIngredients] = useState<string[]>([]); // User's ingredients
  const [recipes, setRecipes] = useState<Recipe[]>([]); // set of Recipes from API
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();

  //get user ID from async storage
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      if (id) {
        setUserId(id);
        console.log("Fetched user ID:", id);
      } else {
        console.error("Failed to fetch user ID");
      }
    };
    fetchUserId();
  }, []);
  
  // Fetch pantry items when userId is available
  useEffect(() => {
    if (!userId) return; // Wait until userId is set 
    console.log("User ID available:", userId);
    // Fetch pantry items from Supabase when component mounts
    const fetchPantryItems = async () => {
      //const userId = "11aacc4d-acf5-4cb4-b7e8-3d6e5232955e"; // Replace with actual user ID
      const pantryItems = await getPantryItems(userId);
      const ingredientNames = pantryItems.map(item => item.food_name);
      setIngredients(ingredientNames);
      console.log("Fetched ingredients:", ingredientNames);
    }
    fetchPantryItems();
  }, [userId]);
  // Mock data for demonstration purposes(bc limit exceeded)
//   const MOCK_RECIPES = [
//   {
//     id: 1001,
//     title: "Tomato & Basil Pasta",
//     image: "https://picsum.photos/seed/beef/300/200",
//     usedIngredientCount: 2,
//     missedIngredientCount: 1,
//   },
//   {
//     id: 1002,
//     title: "Beef & Broccoli Stir-fry",
//     image: "https://picsum.photos/seed/beef/300/200",
//     usedIngredientCount: 2,
//     missedIngredientCount: 0,
//   },
//   {
//     id: 1003,
//     title: "Beef & Broccoli Stir-fry",
//     image: "https://picsum.photos/seed/beef/300/200",
//     usedIngredientCount: 2,
//     missedIngredientCount: 0,
//   },
//   {
//     id: 1004,
//     title: "Beef & Broccoli Stir-fry",
//     image: "https://picsum.photos/seed/beef/300/200",
//     usedIngredientCount: 2,
//     missedIngredientCount: 0,
//   },
  
// ];

//Fetch recipes when component mounts or userIngredients change
const fetchRecipes = useCallback(async () => {
  if(!ingredients.length) return; // Wait until ingredients are set{
    setLoading(true);
    try {
      const fetchedRecipes = await findRecipesByIngredients(ingredients, 5);
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
}, [ingredients.join(',')]);

useEffect(() => {
    fetchRecipes();
}, [fetchRecipes]);

  return (
    <View style={{flex: 1,backgroundColor:'#f5f5f7'}}>
      <Text style={{fontWeight: "bold", textAlign:"center" , fontSize: 30, marginTop: hp('7%')}}>Today's Recipes </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{marginTop: hp('50%')}} />
      ) : (
        <FlatList
          style={{flex: 1}}
          data={recipes} // replace with {recipes} when API is working
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              try{
              router.push(`/recipe/${item.id}`);
            console.log("Recipe pressed:", item.id);
          }
            catch(error){
              console.error("Error navigating to recipe details:", error);
            }
            }}>
              
             
            
            <View style={styles.card}>
              <Image 
                source={{uri: item.image }}
                style={styles.image}
              />
              <View style={{flex: 2, justifyContent: "center"}}>

              <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "left", marginLeft: ('5%')}}>{item.title}</Text>
              </View>
            </View>
            </TouchableOpacity>
          )}
          
          contentContainerStyle={{  paddingBottom: hp('10%') }}
          //if no recipes, show message
          ListEmptyComponent={!loading ? <Text style={{textAlign: "center", marginTop:16}}>No recipes.</Text>: null}
          />
      )}
      
    </View>
    
  )
}
const styles = StyleSheet.create({
  card:{
    
    backgroundColor: '#fff',       
    borderRadius: 12,
    marginVertical: 16,
    width: wp('90%'),
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
  }
})