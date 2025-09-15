import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getRecipeDetails, type recipeInfo } from "@/lib/spoonacular";
import RecipeDetail from "@/components/RecipeDetail";


export default function Recipe(){
    const { id } = useLocalSearchParams(); // Get the recipe ID from the URL parameters
    const recipeId = Number(id);

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<recipeInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Fetch recipe details from Spoonacular API
  useEffect(() => {
  const fetchRecipeDetails = async (recipeId : number) => {
      try{
          setLoading(true);
          setErr(null);
          const details = await getRecipeDetails(recipeId);
          if (details) {
              setRecipe(details);
              console.log("Fetched recipe details:", details);
          }
          }
      
      catch (error) {
          setErr("Error fetching recipe details");
          console.error("Error fetching recipe details:", error);
      }
      finally {
          setLoading(false);
      }
  };
  fetchRecipeDetails(recipeId);
  }, [recipeId]);

  return <RecipeDetail recipe ={recipe}/>; // Render the RecipeDetail component with the fetched recipe data
    
  
}