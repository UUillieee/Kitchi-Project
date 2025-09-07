const apiKey= process.env.EXPO_PUBLIC_SPOONACULAR_API// take from .env file
import { Recipe } from '../app/(tabs)/generateRecipes';

export type recipeInfo ={
    id: number;
    title: string;
    image: string; 
    servings: number;
    cookingMinutes: number;
    summary: string;
    instructions: string;
    extendedIngredients: {original: string}[];
    
}

export async function findRecipesByIngredients(userIngredients: string[], count: number): Promise<Recipe[]> {
  const ingredientStr = encodeURIComponent(userIngredients.join(','));
  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientStr}&number=${count}&apiKey=${apiKey}`);
    const data = await res.json();
    return (data ?? []).map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export async function getRecipeDetails(recipeId: number): Promise<recipeInfo | null> {
  try {
    const res = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    const data = await res.json();
    console.log("Recipe details data:", data);
    return {
      id: data.id,
      title: data.title,
      image: data.image,
      servings: data.servings,
      readyInMinutes: data.readyInMinutes,
      summary: data.summary,
      instructions: data.instructions,
      extendedIngredients: data.extendedIngredients,
    };
    
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return null;
  }


}