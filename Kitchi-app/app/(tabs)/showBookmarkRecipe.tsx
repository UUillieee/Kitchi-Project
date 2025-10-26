
import { AuthContext } from "@/lib/authUserprovider";
import { getbookmarkItems } from "@/lib/bookmark";
import { getRecipesById } from "@/lib/spoonacular";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from 'react-native-gesture-handler';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Recipe } from "./generateRecipes";

export default function ShowBookmarkRecipe(){
    const {userId} = useContext(AuthContext);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipeList, setRecipeList] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const isFocused = useIsFocused();
    const router = useRouter();

    const fetchBookmarkItems = useCallback(async () => {
          if(!userId) return;
        try{
            setLoading(true);
        
            const bookmarkItems = await getbookmarkItems(userId);
            //list of recipe ids in number format
            const recipeIds = bookmarkItems.map(list => parseInt(list.recipe_id, 10));
            console.log("Fetched bookmark recipe IDs:", recipeIds);
            setRecipeList(recipeIds);
            console.log("recipeList state updated:", recipeIds);
        }
        catch(error){
            console.error("Error fetching bookmark items:", error);
        }finally{
            setLoading(false);
        }},
    [userId]);
    
    useEffect(()=>{ 
    if(isFocused){
      fetchBookmarkItems();
    }
    
}, [isFocused, fetchBookmarkItems]);


const fetchRecipes = useCallback(async () => {
  
    if(recipeList.length === 0) return;
    setLoading(true);
    try {
      const fetchedRecipes = await getRecipesById(recipeList);
      
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
}, [recipeList]);

useEffect(() => {
    fetchRecipes();
}, [fetchRecipes]);
    



   return (
       <View style={{flex: 1,backgroundColor:'#f5f5f7'}}>
         <Text style={{fontWeight: "bold", textAlign:"center" , fontSize: 30, marginTop: hp('7%')}}>Bookmark</Text>
         {loading ? (
           <ActivityIndicator size="large" color="#0000ff" style={{marginTop: hp('50%')}} />
         ) : (
           <FlatList
             style={{flex: 1}}
             data={recipes} 
             keyExtractor={(item) => item?.id?.toString()}
             renderItem={({ item }) => (
               <TouchableOpacity onPress={() => {
                 try{
                 router.push(`/recipe/${item.id}`);
               console.log("Recipe pressed:", item.id);
             }
               catch(error){
                 console.error("Error navigating to recipe details:", error);
               }
               }}>
                 
                
               
               <View style={styles.card}>
                 <Image 
                   source={{uri: item.image }}
                   style={styles.image}
                 />
                 <View style={{flex: 2, justifyContent: "center"}}>
   
                 <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "left", marginLeft: ('5%')}}>{item.title}</Text>
                 </View>
               </View>
               </TouchableOpacity>
             )}
             
             contentContainerStyle={{  paddingBottom: hp('10%') }}
             //if no recipes, show message
             ListEmptyComponent={!loading ? <Text style={{textAlign: "center", marginTop:16}}>No recipes.</Text>: null}
             />
         )}
         
       </View>
       
     )
   }
   const styles = StyleSheet.create({
     card:{
       
       backgroundColor: '#fff',       
       borderRadius: 12,
       marginVertical: 16,
       width: wp('90%'),
       height: hp('30%'),
       alignSelf: 'center',
   
       // iOS Shadow
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 4 },
       shadowOpacity: 0.2,
       shadowRadius: 5,
   
       // Android Shadow
       elevation: 5,
     },
     image:{
       flex: 8,
       width: '90%',
       alignSelf: 'center',
       resizeMode: 'cover',
       borderRadius: 10,
       marginTop: hp('2%'),
     }
   })
