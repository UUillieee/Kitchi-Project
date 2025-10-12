import {supabase} from "./supabase";

export type BookmarkItem ={
    id: string;
    user_id: string;
    recipe_id: string;
    created_at: string;
}
export async function getbookmarkItems(userId:string){
    const {data, error} = await supabase
    .from ('personal_bookmark')
    .select('*')
    .eq('user_id', userId)

    if(error){
        console.error("Error fetching bookmark items:", error);
        return [];
    }else{
            return data as BookmarkItem[];
        }
    }

