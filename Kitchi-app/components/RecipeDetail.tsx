import { View, Text, Image, ActivityIndicator, ScrollView} from 'react-native'
import { useEffect, useState } from 'react';
import React from 'react'
import { recipeInfo} from '@/lib/spoonacular';




export default function RecipeDetail({recipe}: {recipe: recipeInfo | null}) {

const [err, setErr] = useState<string | null>(null);


  return (

    <View className = "flex-1 items-center justify-center bg-white">
        {!recipe ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className = "text-2xl font-bold mb-4">{recipe.title}</Text>
                <Image source={{ uri: recipe.image }} style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 16 }} />
                <Text className = "text-lg mb-2">Servings: {recipe.servings}</Text>
                <Text className = "text-lg mb-2">Cooking Minutes: {recipe.cookingMinutes}</Text>
                <Text className = "text-lg font-semibold mb-2">Summary:</Text>
                <Text className = "mb-4">{recipe.summary.replace(/<[^>]+>/g, '')}</Text>
                <Text className = "text-lg font-semibold mb-2">Ingredients:</Text>
                {recipe.extendedIngredients.map((ingredient, index) => (
                    <Text key={index} className = "mb-1">- {ingredient.original}</Text>
                ))}
                <Text className = "text-lg font-semibold mb-2 mt-4">Instructions:</Text>
                <Text>{recipe.instructions ? recipe.instructions.replace(/<[^>]+>/g, '') : 'No instructions available.'}</Text>
            </ScrollView>
        )}
        {err && <Text className = "text-red-500 mt-4">{err}</Text>}






    </View>
  )
}