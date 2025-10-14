import {supabase} from "./supabase";

export type BookmarkItem ={
    recipe_id: string;

}
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

