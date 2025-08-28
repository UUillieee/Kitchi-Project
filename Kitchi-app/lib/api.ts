//spoonacular

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_KEY;


export async function getRecipesByIngredients(ingredients: string[]){
    try{
        const query = ingredients.join(",");
            const res = await fetch(
                `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=10&apiKey=${API_KEY}` 
        
    );
    if(!res.ok){
        throw new Error("Failed to fetch recipes");
    }
    const data = await res.json();
    console.log(data);
    
    //return data; print res
    }catch(error){
        console.error("Error fetching recipes: ", error);
        return[];
    }
    

}