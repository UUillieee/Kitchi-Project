import { AuthContext } from '@/lib/authUserprovider';
import { addBookmark, removeBookmark } from '@/lib/bookmark';
import { recipeInfo } from '@/lib/spoonacular';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


// Component to display detailed information about a recipe
export default function RecipeDetail({recipe, bookmarked, onBookmarkChanged}: {recipe: recipeInfo | null}& {bookmarked: boolean}& {onBookmarkChanged: (value: boolean) => void}) {

const [err, setErr] = useState<string | null>(null);
const {userId} = useContext(AuthContext);
const [showSummary, setShowSummary] = useState(false); // State to toggle summary visibility
const [showIngredients, setShowIngredients] = useState(false); // State to toggle ingredients visibility
const [showInstructions, setShowInstructions] = useState(false); // State to toggle instructions visibility
const ToggleDown = <FontAwesome name="toggle-down" size={20} color="black" />;
const ToggleUp = <FontAwesome name="toggle-up" size={20} color="black" />;

// Function to handle bookmark toggle
const toggleBookmark = async () => {
    try{
        if(bookmarked){
            const res = await removeBookmark(recipe!.id, userId!);
            if(res)onBookmarkChanged(false);

        }else{
            const res=await addBookmark(recipe!.id, userId!);
            if(res)onBookmarkChanged(true);
        }
    }catch(error){
        console.error("Error toggling bookmark:", error);
    }
    
  }

  return (

    
    <><Stack.Screen
          options={{
              headerRight: () => (
                  <TouchableOpacity onPress={() => {toggleBookmark()} }>
                      <Ionicons name={bookmarked ? "heart" : "heart-outline"} size={22} color={bookmarked ? "red": "#333"} />

                  </TouchableOpacity>),
              title: "",
          }}></Stack.Screen>
          
          <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff' }}>
              {!recipe ? (
                  <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                  <ScrollView style={{ width: wp('100%') }}>
                      <View style={styles.card}>
                          <Image source={{ uri: recipe.image }} style={{ width: '100%', height: '70%', borderRadius: 8, marginBottom: 24 }} />
                          <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: 'center' }}>{recipe.title}</Text>
                      </View>

                      <View>
                          <View style={styles.Toggle}>

                              <Text className="text-lg mb-2">Servings: {recipe.servings}</Text>
                              <Text className="text-lg mb-2">Cooking Minutes: {recipe.readyInMinutes}</Text>
                          </View>
                          {/* summary */}
                          <TouchableOpacity onPress={() => {
                              setShowSummary(!showSummary);
                          } }
                              style={styles.Toggle}
                          >
                              <Text>Summary</Text>
                              <Text>{showSummary ? ToggleUp : ToggleDown}</Text>
                          </TouchableOpacity>
                          {showSummary && (
                              <Text style={{ padding: 16 }}>{recipe.summary.replace(/<[^>]+>/g, '')}</Text>
                          )}

                          {/* ingredients */}
                          <TouchableOpacity onPress={() => {
                              setShowIngredients(!showIngredients);
                          } }
                              style={styles.Toggle}
                          >
                              <Text>Ingredients</Text>
                              <Text>{showIngredients ? ToggleUp : ToggleDown}</Text>
                          </TouchableOpacity>
                          {showIngredients && (
                              recipe.extendedIngredients.map((ingredient, index) => (
                                  <Text style={{ padding: 8 }} key={index} className="mb-1">- {ingredient.original}</Text>
                              )))}

                          {/* instructions */}
                          <TouchableOpacity onPress={() => {
                              setShowInstructions(!showInstructions);
                          } }
                              style={styles.Toggle}
                          >
                              <Text>instructions</Text>
                              <Text>{showInstructions ? ToggleUp : ToggleDown}</Text>
                          </TouchableOpacity>
                          {showInstructions && (
                              <View style={{ padding: 16 }}>
                                  {recipe.instructions
                                      ? recipe.instructions
                                          .replace(/<[^>]+>/g, '')
                                          .split('.')
                                          .filter(sentence => sentence.trim().length > 0)
                                          .map((sentence, index) => (
                                              <Text style={{ padding: 4 }} key={index}>- {sentence.trim()}.</Text>
                                          ))
                                      : <Text>No instructions available.</Text>}
                              </View>
                          )}


                      </View>


                  </ScrollView>
              )}
              {err && <Text className="text-red-500 mt-4">{err}</Text>}






          </View></>
  )
}

const styles = StyleSheet.create({
  card:{
    
    backgroundColor: '#fff',       
    borderRadius: 12,
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
  },

  Toggle:{
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 16,
    backgroundColor: "#ffffffff",
    marginTop: 16,
    marginHorizontal: 16,
    borderBottomWidth: 0.3,
  }

})