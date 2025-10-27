import { AuthContext } from '@/lib/authUserprovider';
import { addBookmark, removeBookmark } from '@/lib/bookmark';
import { recipeInfo } from '@/lib/spoonacular';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { generateShoppingListForRecipe } from '@/lib/shoppingList';

export default function RecipeDetail({
  recipe,
  bookmarked,
  onBookmarkChanged,
}: {
  recipe: recipeInfo | null;
  bookmarked: boolean;
  onBookmarkChanged: (value: boolean) => void;
}) {
  const [err, setErr] = useState<string | null>(null);
  const { userId } = useContext(AuthContext);
  const [showSummary, setShowSummary] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const router = useRouter();

  const ToggleDown = <FontAwesome name="toggle-down" size={20} color="black" />;
  const ToggleUp = <FontAwesome name="toggle-up" size={20} color="black" />;

  // toggle bookmark state and update via Supabase
  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        const res = await removeBookmark(recipe!.id, userId!);
        if (res) onBookmarkChanged(false);
      } else {
        const res = await addBookmark(recipe!.id, userId!);
        if (res) onBookmarkChanged(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // get missing ingredients and navigate to ShoppingList screen
  const handleGenerateShoppingList = async () => {
    if (!recipe) return;
    try {
      setLoadingList(true);
      const missingIngredients = await generateShoppingListForRecipe(recipe);
      router.push({
        pathname: '/ShoppingList',
        params: { items: JSON.stringify(missingIngredients) },
      });
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={toggleBookmark}>
              <Ionicons
                name={bookmarked ? 'heart' : 'heart-outline'}
                size={22}
                color={bookmarked ? 'red' : '#333'}
              />
            </TouchableOpacity>
          ),
          title: '',
        }}
      />

      <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff' }}>
        {!recipe ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <ScrollView style={{ width: wp('100%') }}>
            <View style={styles.card}>
              <Image
                source={{ uri: recipe.image }}
                style={{
                  width: '100%',
                  height: '70%',
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              />
              <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
                {recipe.title}
              </Text>
            </View>

            {/* Generate Shopping List Button */}
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleGenerateShoppingList}
                disabled={loadingList}
              >
                <Text style={styles.buttonText}>
                  {loadingList ? 'Generating...' : 'Generate Shopping List'}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <View style={styles.Toggle}>
                <Text className="text-lg mb-2">Servings: {recipe.servings}</Text>
                <Text className="text-lg mb-2">Cooking Minutes: {recipe.readyInMinutes}</Text>
              </View>

              {/* Summary */}
              <TouchableOpacity onPress={() => setShowSummary(!showSummary)} style={styles.Toggle}>
                <Text>Summary</Text>
                <Text>{showSummary ? ToggleUp : ToggleDown}</Text>
              </TouchableOpacity>
              {showSummary && (
                <Text style={{ padding: 16 }}>{recipe.summary.replace(/<[^>]+>/g, '')}</Text>
              )}

              {/* Ingredients */}
              <TouchableOpacity
                onPress={() => setShowIngredients(!showIngredients)}
                style={styles.Toggle}
              >
                <Text>Ingredients</Text>
                <Text>{showIngredients ? ToggleUp : ToggleDown}</Text>
              </TouchableOpacity>
              {showIngredients &&
                recipe.extendedIngredients.map((ingredient, index) => (
                  <Text style={{ padding: 8 }} key={index}>
                    - {ingredient.original}
                  </Text>
                ))}

              {/* Instructions */}
              <TouchableOpacity
                onPress={() => setShowInstructions(!showInstructions)}
                style={styles.Toggle}
              >
                <Text>Instructions</Text>
                <Text>{showInstructions ? ToggleUp : ToggleDown}</Text>
              </TouchableOpacity>
              {showInstructions && (
                <View style={{ padding: 16 }}>
                  {recipe.instructions ? (
                    recipe.instructions
                      .replace(/<[^>]+>/g, '')
                      .split('.')
                      .filter((sentence) => sentence.trim().length > 0)
                      .map((sentence, index) => (
                        <Text style={{ padding: 4 }} key={index}>
                          - {sentence.trim()}.
                        </Text>
                      ))
                  ) : (
                    <Text>No instructions available.</Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}
        {err && <Text className="text-red-500 mt-4">{err}</Text>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: wp('90%'),
    height: hp('30%'),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: wp('90%'),
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  Toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderBottomWidth: 0.3,
  },
});
