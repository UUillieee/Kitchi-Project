const apiKey= process.env.EXPO_PUBLIC_SPOONACULAR_API// take from .env file
import { Recipe } from '../app/(tabs)/generateRecipes';



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
