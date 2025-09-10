import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity} from 'react-native'
import { useEffect, useState } from 'react';
import React from 'react'
import { recipeInfo} from '@/lib/spoonacular';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { StyleSheet } from 'react-native';




export default function RecipeDetail({recipe}: {recipe: recipeInfo | null}) {

const [err, setErr] = useState<string | null>(null);
const [showSummary, setShowSummary] = useState(false);
const [showIngredients, setShowIngredients] = useState(false);
const [showInstructions, setShowInstructions] = useState(false);


  return (

    <View className = "flex-1 items-center justify-center bg-white">
        {!recipe ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <ScrollView style={{ width: wp('100%')}}>
                <View style={styles.card}>
                    <Image source={{ uri: recipe.image }} style={{ width: '100%', height: '70%', borderRadius: 8, marginBottom: 32 }} />
                    <Text style={{fontSize: 24, fontWeight: "bold", textAlign: 'center'}}>{recipe.title}</Text>
                </View>
                
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 0.3, padding: 16}}>
                        
                        <Text className = "text-lg mb-2">Servings: {recipe.servings}</Text>
                        <Text className = "text-lg mb-2">Cooking Minutes: {recipe.readyInMinutes}</Text>
                    </View>
                <TouchableOpacity onPress={() => {
                    setShowSummary(!showSummary)}}
                    style={{ padding: 16, backgroundColor: "#f0f0f0",borderWidth: 0.3}}
                >
                    <Text>Summary{showSummary? "▼" : "▲"}</Text>
                </TouchableOpacity>
                {showSummary && (
                <Text style={{ padding: 16}}>{recipe.summary.replace(/<[^>]+>/g, '')}</Text>
                )}


                <TouchableOpacity onPress={() => {
                    setShowIngredients(!showIngredients)}}
                    style={{ padding: 16, backgroundColor: "#f0f0f0",borderWidth: 0.3}}
                >
                    <Text>Ingredients{showIngredients? "▼" : "▲"}</Text>
                </TouchableOpacity>
                {showIngredients && (
                recipe.extendedIngredients.map((ingredient, index) => (
                    <Text style={{ padding: 8}} key={index} className = "mb-1">- {ingredient.original}</Text>
                )))}


                <TouchableOpacity onPress={() => {
                    setShowInstructions(!showInstructions)}}
                    style={{ padding: 16, backgroundColor: "#f0f0f0",borderWidth: 0.3}}
                >
                    <Text>instructions{showInstructions? "▼" : "▲"}</Text>
                </TouchableOpacity>
                {showInstructions && (
                <View style={{ padding: 16 }}>
                    {recipe.instructions
                        ? recipe.instructions
                            .replace(/<[^>]+>/g, '')
                            .split('.')
                            .filter(sentence => sentence.trim().length > 0)
                            .map((sentence, index) => (
                                <Text style={{ padding: 4}} key={index}>- {sentence.trim()}.</Text>
                            ))
                        : <Text>No instructions available.</Text>
                    }
                </View>
                )}
                
                
                </View>
                
                
            </ScrollView>
        )}
        {err && <Text className = "text-red-500 mt-4">{err}</Text>}






    </View>
  )
}

const styles = StyleSheet.create({
  card:{
    
    backgroundColor: '#fff',       
    borderRadius: 12,
    width: wp('100%'),
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