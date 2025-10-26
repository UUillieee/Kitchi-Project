import { getPantryItems } from './pantry';
import { getUserId } from './auth';
import { recipeInfo } from './spoonacular';

/**
 * Compare recipe ingredients (from extendedIngredientsNames)
 * with user's pantry items and return missing ingredients.
 */
export async function generateShoppingListForRecipe(recipe: recipeInfo) {
  const userId = await getUserId();
  if (!userId) throw new Error('User not logged in');

  console.log("📥 Recipe input received in comparison:", recipe.extendedIngredientsNames);


  // Get pantry items from Supabase for this user
  const pantryItems = await getPantryItems(userId);
  const pantryNames = pantryItems.map(item => item.food_name.toLowerCase().trim());

  // Safely handle missing or undefined arrays
  const recipeNames = (recipe?.extendedIngredientsNames ?? [])
    .filter(Boolean)
    .map(ing => ing.name?.toLowerCase().replace(/[^a-z\s]/g, '').trim());

  // Compare directly — only ingredients not in pantryNames are missing
  const missing = recipeNames.filter(ing => !pantryNames.includes(ing));

  console.log('🧺 Pantry items:', pantryNames);
  console.log('🥘 Recipe ingredients:', recipeNames);
  console.log('❌ Missing ingredients:', missing);

  return missing;
}
