import { getPantryItems } from "./pantry";
import { getUserId } from "./auth";

//compare the users pantry items to the recipe ingredients

export async function generateShoppingListForRecipe(recipeIngredients: string[]) {
    console.log("generating shopping list for recipe with ingredients:", recipeIngredients);
    const userId = await getUserId();
    if (!userId) throw new Error("User not logged in");

    const pantryItems = await getPantryItems(userId);
    const pantryNames = pantryItems.map(item => item.food_name.toLowerCase());

    //find ingredients that are not in the pantry
    const missing = recipeIngredients.filter(ingredient => {
        return !pantryNames.some(pantryItem => ingredient.toLowerCase().includes(pantryItem));
    });
    
    return missing;
}

    