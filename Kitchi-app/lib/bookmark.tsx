import { supabase } from "./supabase";

// Define the BookmarkItem type
export type BookmarkItem ={
    recipe_id: string;
    user_id: string;
}

// Function to get bookmark items for a user
export async function getbookmarkItems(userId:string){
    const {data, error} = await supabase
    .from ('personal_bookmark')
    .select('recipe_id')
    .eq('user_id', userId)

    if(error){
        console.error("Error fetching bookmark items:", error);
        return [];
    }else{
        console.log("Fetched bookmark items:", data);
            return data as BookmarkItem[];
        }
    }

    // Function to check if a recipe is bookmarked by a user
export async function checkIfBookmarked(recipeId: number, userId: string): Promise<boolean> {

    console.log("checkIfBookmarked userId:", userId);
    try{
        
        if(!userId) return false;

        const {data, error} = await supabase.from('personal_bookmark')
        .select('recipe_id')
        .eq('recipe_id', recipeId.toString())
        .eq('user_id', userId)
        .maybeSingle();
        
        console.log("checkIfBookmarked data:", data);
        

        if (error) {
            console.error("Error checking bookmark status:", error);
            return false;
        } 
        if (data) {
            return true;   //bookmark exists
                } else {
            return false;  // bookmark does not exist
            }

    }catch(error){
        console.error("Error in checkIfBookmarked:", error);
        return false;
    }
    

}

// Function to remove a bookmark
export async function removeBookmark(recipeId: number, userId: string): Promise<boolean>{
    try{
        const {data, error} =
        await supabase.from('personal_bookmark')
        .delete()
        .eq('recipe_id', recipeId.toString())
        .eq('user_id', userId)
        .select();

        if(error){
            console.error("Error removing bookmark:", error);
            return false;
        }
//         } else if (!data || data.length === 0) {
//             console.warn('No rows matched delete filter (nothing deleted).');
//             alert('Nothing deleted: check userId/recipe_id/type/RLS');
//             return false;
//   }
        
        else{
        
            console.log("Bookmark removed", data);
            alert("Bookmark removed!");
            
            return true;
        }
        

    }catch(error){
        console.error("Error removing bookmark:", error);
        return false;
    }
}

// Function to add a bookmark
export async function addBookmark(recipeId: number, userId: string): Promise<boolean>{
    try{
        const {data,error} = await supabase
        .from('personal_bookmark')
        .upsert(
            {recipe_id: recipeId.toString(),
            user_id: userId
            }
        )
        

        if(error){
            console.error("Error adding bookmark:", error);
            return false;
        }else{
            console.log("Bookmark added:", data);
            alert("Recipe bookmarked!");
            return true;
        }
    }catch(error){
        console.error("Error adding bookmark:", error);
        return false;
    }
}
