import { getPantryItems } from './pantry';
import { getUserId } from './auth';

/**
 * Compare recipe ingredients with user's pantry items
 * and return missing ingredients.
 */
export async function generateShoppingListForRecipe(recipeIngredients: string[]) {
  const userId = await getUserId();
  if (!userId) throw new Error('User not logged in');

  //get pantry items from supabase according to user ID
  const pantryItems = await getPantryItems(userId);
  const pantryNames = pantryItems.map(item =>
    item.food_name.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  );

  //normalize recipe ingredients (strip quantities and punctuation)
  const cleanedRecipeIngredients = recipeIngredients.map(ing =>
    ing.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  );

  //compare and find missing ingredients
  const missing = cleanedRecipeIngredients.filter(
    ingredient => !pantryNames.some(p => ingredient.includes(p))
  );

  console.log('🧾 Pantry:', pantryNames);
  console.log('🍳 Recipe ingredients (cleaned):', cleanedRecipeIngredients);
  console.log('🛒 Missing ingredients:', missing);

  return missing;
}
