import { supabase } from "./supabase"; 

export type PantryItem = {
    id: string;
    user_id: string;
    food_name: string;
    //ingredient: string;
    expiration_date: string;
    //quantity: number;
}
export async function getPantryItems(userId: string) {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', userId);
          
        if (error) {
        console.error("Error fetching pantry items:", error);
        return [];
        }else{
            return data as PantryItem[]; // Adjust the type as necessary
        }
    }