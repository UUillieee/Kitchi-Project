import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { getRecipeDetails, type recipeInfo } from "@/lib/spoonacular";
import RecipeDetail from "@/components/RecipeDetail";
import { checkIfBookmarked } from "@/lib/bookmark";
import { useContext } from "react";
import { AuthContext } from "@/lib/authUserprovider";

// Main component to display recipe details
export default function Recipe(){
const { id } = useLocalSearchParams(); // Get the recipe ID from the URL parameters
const recipeId = Number(id);

const {userId} = useContext(AuthContext);
const [loading, setLoading] = useState(true);
const [recipe, setRecipe] = useState<recipeInfo | null>(null);
const [err, setErr] = useState<string | null>(null);
const [bookmark, setBookmark] = useState<boolean>(false);





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
    }

// Fetch bookmark status
  const fetchBookmark = async (recipeId: number, userId: string) => {
        try{
            const isBookmarked = await checkIfBookmarked(recipeId, userId);
            if(isBookmarked){
                setBookmark(true);
            }else{
                setBookmark(false);
            }
        }catch(error){
            console.error("Error checking bookmark status:", error);
        }
    }

  
  fetchRecipeDetails(recipeId);
  fetchBookmark(recipeId, userId!);
  }, [recipeId]);

  // Update bookmark state when it changes
useEffect(() => {
    
}, [bookmark]);
  const handleBookmarkChange = (value: boolean) => {
    setBookmark(value);
  };
  
  return <RecipeDetail recipe ={recipe} bookmarked={bookmark} onBookmarkChanged={setBookmark}/>; // Render the RecipeDetail component with the fetched recipe data
    
  
}
