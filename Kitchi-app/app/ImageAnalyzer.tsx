import React, { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet, ScrollView, Platform, Modal } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Image } from "expo-image"
import { projectId, publicAnonKey, supabaseFunctions } from "../src/utils/supabase/info"
import { useLocalSearchParams } from "expo-router"
import { useRouter } from "expo-router"

import { supabase } from '../lib/supabase';

// NEW: Utility function to get the date N days from now in YYYY-MM-DD format
const getDefaultExpiryDate = (days: number = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() + days); // Add default days to the current date

  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


type State = {
  ingredients: string
  recipe: string
  isAnalyzing: boolean
  isGenerating: boolean
  error: string
}

export default function ImageAnalyzer() {
  const [state, setState] = useState<State>({
    ingredients: "",
    recipe: "",
    isAnalyzing: false,
    isGenerating: false,
    error: "",
  })
  const [imageUri, setImageUri] = useState<string | null>(null)

  const { imageUri: imageUriFromCamera } = useLocalSearchParams<{ imageUri?: string }>()
  const router = useRouter()
  const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: boolean }>({});
  const [ingredientData, setIngredientData] = useState<{ [key: string]: { selected: boolean; expiry_date: string } }>({});
  
  // NEW: State to manage the visibility of the custom date modal
  const [showDateModalFor, setShowDateModalFor] = useState<string | null>(null);
  // NEW: State to hold the temporary date being selected in the modal
  const [tempSelectedDate, setTempSelectedDate] = useState<string>('');


  useEffect(() => {
    if (imageUriFromCamera) {
      analyzeImage(imageUriFromCamera);
    }
  }, [imageUriFromCamera]);

  const analyzeImage = async (uriFromCamera?: string) => {
    try {
      let uri = uriFromCamera;

      if (!uri) {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission needed", "Please allow photo library access.")
          return
        }
        const picked = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
        })
        if (picked.canceled) return
        uri = picked.assets[0].uri
      }
      setImageUri(uri);

      setState((p) => ({ ...p, isAnalyzing: true, error: "", ingredients: "", recipe: "" }))

      const form = new FormData()
      form.append("image", {
        uri,
        name: "food.jpg",
        type: "image/jpeg",
      } as any)

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/${supabaseFunctions}/analyze-ingredients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`, // anon key
          },
          body: form,
        }
      )

      if (!res.ok) throw new Error(`Failed to analyze image: ${res.status} ${res.statusText}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // NEW: Parse ingredients and set default expiry date
      const ingredientsList: string[] = (data.ingredients || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const defaultDate = getDefaultExpiryDate(7); // Get date 7 days from now

      const initialIngredientData = ingredientsList.reduce((acc, ingredient) => {
        acc[ingredient] = {
          selected: false,
          expiry_date: defaultDate, // Set default date here
        };
        return acc;
      }, {});

      setIngredientData(initialIngredientData); // Set initial data
      setState((p) => ({ ...p, ingredients: data.ingredients || "", isAnalyzing: false }))

    } catch (err: any) {
      console.error("Analyze error:", err)
      setState((p) => ({
        ...p,
        error: err?.message || "Failed to analyze image",
        isAnalyzing: false,
      }))
    }
  }

  // const generateRecipe = async () => { /* ... existing code ... */ }
  
   const toggleSelect = (item: string) => {
    setIngredientData((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        selected: !prev[item].selected,
      },
    }));
  };

  const updateExpiryDate = (item: string, date: string) => {
    setIngredientData((prev) => ({
      ...prev,
      [item]: { ...prev[item], expiry_date: date },
    }));
  };

  // NEW: Functions to control the custom date modal
  const openDateModal = (ingredient: string, current_date: string) => {
    // Load current date or default date into temporary state
    setTempSelectedDate(current_date || getDefaultExpiryDate()); 
    setShowDateModalFor(ingredient); // Show the modal for this ingredient
  };

  const closeDateModal = () => {
    setShowDateModalFor(null);
    setTempSelectedDate('');
  };

  const saveSelectedDate = () => {
    if (showDateModalFor && tempSelectedDate) {
      // Basic validation check for YYYY-MM-DD format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(tempSelectedDate)) {
        Alert.alert("Invalid Date", "Please ensure the date is in YYYY-MM-DD format.");
        return;
      }
      updateExpiryDate(showDateModalFor, tempSelectedDate);
      closeDateModal();
    }
  };


  const goToRecipe = () => {
    const selected = Object.entries(ingredientData)
      .filter(([_, v]) => v.selected)
      .map(([name]) => name);

    if (selected.length === 0) {
      Alert.alert("No Selection", "Please select at least one ingredient.");
      return;
    }

    router.push({
      pathname: "/(tabs)/generateRecipes",
      params: { ingredients: JSON.stringify(selected) },
    });
  };

 const handleSaveToPantry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Not Logged In", "Please sign in first.");
        return;
      }

      // Validate date format YYYY-MM-DD
      const isValidDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

      for (const [name, v] of Object.entries(ingredientData)) {
        if (v.selected && v.expiry_date && !isValidDate(v.expiry_date)) {
          Alert.alert("Invalid Date", `Expiry date for ${name} must be in YYYY-MM-DD format`);
          return;
        }
      }

      const selected = Object.entries(ingredientData)
        .filter(([_, v]) => v.selected)
        .map(([name, v]) => ({
          user_id: user.id,
          food_name: name,
          expiry_date: v.expiry_date || null, // null if empty
        }));

      if (selected.length === 0) {
        Alert.alert("No Selection", "Please select at least one ingredient.");
        return;
      }

      const { error } = await supabase.from("pantry_items").insert(selected);
      if (error) throw error;

      Alert.alert("Saved!", "Ingredients have been added to your pantry.");
    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message);
      else Alert.alert("Error", JSON.stringify(error));
    }
  };



  const reset = () => {
    setImageUri(null)
    setState({ ingredients: "", recipe: "", isAnalyzing: false, isGenerating: false, error: "" })
  }

  // NEW: Custom Date Picker Modal Component (No Library)
  const CustomDatePickerModal = () => {
    if (!showDateModalFor) return null;

    // Determine the ingredient's currently set date
    const currentIngredientData = ingredientData[showDateModalFor];
    
    return (
      <Modal
        transparent={true}
        visible={!!showDateModalFor}
        onRequestClose={closeDateModal}
        animationType="fade"
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <Text style={s.modalTitle}>Set Expiry Date for</Text>
            <Text style={s.modalSubtitle}>{showDateModalFor}</Text>
            
            <Text style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
              Enter date (YYYY-MM-DD)
            </Text>
            
            {/* Calendar Look-alike: Using a focused TextInput */}
            <TextInput
              value={tempSelectedDate}
              onChangeText={setTempSelectedDate}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              placeholder="e.g., 2025-09-03"
              style={s.dateInput}
              maxLength={10}
            />
            
            <View style={s.modalButtonContainer}>
              <Pressable onPress={closeDateModal} style={[s.btn, s.modalCancelBtn]}>
                <Text style={s.btnText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveSelectedDate} style={[s.btn, s.modalSaveBtn]}>
                <Text style={s.btnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
// -------------------------------------------------------------

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Kitchi Recipe Generator</Text>
      <Text style={s.subtitle}>Upload a photo of your ingredients and get a custom recipe</Text>

      {/* Existing UI for image selection and analysis */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={s.image} contentFit="cover" transition={200} />
      ) : (
        <View style={s.placeholder}>
          <Text style={s.placeholderText}>No image selected</Text>
        </View>
      )}

      {state.isAnalyzing && (
        <View style={s.loading}>
          <ActivityIndicator size="large" />
          <Text style={s.loadingText}>Analyzing your ingredients…</Text>
        </View>
      )}
      {/* ---------------------------------------------------------------------------------- */}
      {/* INGREDIENT LIST - MODIFIED FOR DATE SELECTION */}
      {!!state.ingredients && !state.isAnalyzing && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Detected Ingredients</Text>

          {Object.entries(ingredientData).map(([ingredient, data], index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <Pressable
                onPress={() => toggleSelect(ingredient)}
                style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 2,
                    borderColor: "#444",
                    borderRadius: 4,
                    marginRight: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: data.selected ? "#2563EB" : "transparent",
                  }}
                >
                  {data.selected && <Text style={{ color: "white", fontWeight: "bold" }}>✓</Text>}
                </View>
                <Text style={{ fontSize: 16 }}>{ingredient}</Text>
              </Pressable>

              {data.selected && (
                <View style={{ marginLeft: 32 }}>
                  <Text style={{ fontSize: 14, color: "#555" }}>Expiry date</Text>
                  
                  {/* NEW: Pressable to trigger the custom date modal */}
                  <Pressable
                    onPress={() => openDateModal(ingredient, data.expiry_date)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 6,
                      padding: 10,
                      marginTop: 4,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: data.expiry_date ? '#000' : '#888' }}>
                      {/* Display the current date or the default date */}
                      {data.expiry_date || getDefaultExpiryDate()} 
                    </Text>
                  </Pressable>

                </View>
              )}
            </View>
          ))}
          {/* ---------------------------------------------------------------------------------- */}

        <Pressable
          onPress={handleSaveToPantry}
          style={[s.btn, s.secondary, { marginTop: 12 }]}
        >
          <Text style={s.btnText}>Save to Pantry</Text>
        </Pressable>


        <Pressable
          onPress={goToRecipe}
          disabled={state.isGenerating}
          style={[s.btn, s.accent, state.isGenerating && s.disabled, { marginTop: 12 }]}
        >
          <Text style={s.btnText}>Generate Recipe</Text>
        </Pressable>
      </View>
    )}

      {state.isGenerating && (
        <View style={s.loading}>
          <ActivityIndicator size="large" />
          <Text style={s.loadingText}>Creating your custom recipe…</Text>
        </View>
      )}

      {!!state.recipe && !state.isGenerating && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Recipe</Text>
          <Text style={s.body}>{state.recipe}</Text>

          <Pressable onPress={reset} style={[s.btn, s.secondary, { marginTop: 12 }]}>
            <Text style={s.btnText}>Start Over</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 24 }} />

      {/* NEW: Render the custom date picker modal */}
      <CustomDatePickerModal />
    </ScrollView>
  )
}

// -------------------------------------------------------------
// STYLES
// -------------------------------------------------------------

const s = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#6B7280",
  },
  placeholder: {
    height: 200,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#D1D5DB",
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#1D4ED8",
    marginBottom: 10,
  },
  secondary: {
    backgroundColor: "#6B7280",
  },
  accent: {
    backgroundColor: "#2563EB",
  },
  retry: {
    backgroundColor: "#EF4444",
  },
  disabled: {
    opacity: 0.5,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginTop: 10,
    marginBottom: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#4B5563",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 15,
    marginBottom: 10,
  },

  // NEW STYLES FOR MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: "#1F2937"
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelBtn: {
    backgroundColor: '#6B7280', // Gray
    flex: 1,
    marginRight: 10,
  },
  modalSaveBtn: {
    backgroundColor: '#10B981', // Green
    flex: 1,
  },
})