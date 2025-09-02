import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';




type Recipe ={
    id: number;
    title: string;
    image: string;
    
};



const apiKey= process.env.EXPO_PUBLIC_SPOONACULAR_API// take from .env file

export default function GenerateRecipes() {
  const userIngredients = ["apple", "tomato", "beef"]; // Example user ingredients from database
  const [ingredients, setIngredients] = useState<string[]>([]); // User's ingredients
  const [recipes, setRecipes] = useState<Recipe[]>([]); // set of Recipes from API
  const [loading, setLoading] = useState<boolean>(false); // Loading state

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
  useEffect(() => {
  
  const fetchRecipes = async () => {
    setLoading(true);
    const ingredientStr = userIngredients.join(','); // Replace with actual user ingredients
    
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientStr}&number=5&apiKey=${apiKey}`);
      const data = await res.json();
        //Filter recipes to only include those that can be made with available ingredients
      
      setRecipes(data);

    }catch(error){
      console.error("Error fetching recipes:" , error);
    }
    setLoading(false);
  };
  fetchRecipes();
}, []);

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
            <View style={styles.card}>
              <Image 
                source={{uri: item.image }}
                style={styles.image}
              />
              <View style={{flex: 2, justifyContent: "center"}}>

              <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "left", marginLeft: ('5%')}}>{item.title}</Text>
              </View>
            </View>
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