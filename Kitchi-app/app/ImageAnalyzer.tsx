import React, { useState, useEffect } from "react"
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet, ScrollView, Platform } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Image } from "expo-image"
import { projectId, publicAnonKey, supabaseFunctions } from "../src/utils/supabase/info"
import { useLocalSearchParams } from "expo-router"

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

  const generateRecipe = async () => {
    if (!state.ingredients) return
    try {
      setState((p) => ({ ...p, isGenerating: true, error: "", recipe: "" }))

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/${supabaseFunctions}/generate-recipe`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`, // anon key
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients: state.ingredients }),
        }
      )

      if (!res.ok) throw new Error(`Failed to generate recipe: ${res.status} ${res.statusText}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setState((p) => ({ ...p, recipe: data.recipe || "", isGenerating: false }))
    } catch (err: any) {
      console.error("Generate error:", err)
      setState((p) => ({
        ...p,
        error: err?.message || "Failed to generate recipe",
        isGenerating: false,
      }))
    }
  }

  const reset = () => {
    setImageUri(null)
    setState({ ingredients: "", recipe: "", isAnalyzing: false, isGenerating: false, error: "" })
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>🍳 Kitchi Recipe Generator</Text>
      <Text style={s.subtitle}>Upload a photo of your ingredients and get a custom recipe</Text>

      {!!state.error && (
        <View style={s.errorBox}>
          <Text style={s.errorText}> {state.error}</Text>
          <Pressable onPress={reset} style={[s.btn, s.retry]}>
            <Text style={s.btnText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => analyzeImage()}
        disabled={state.isAnalyzing || state.isGenerating}
        style={[s.btn, s.primary, (state.isAnalyzing || state.isGenerating) && s.disabled]}
      >
        <Text style={s.btnText}>Pick Image</Text>
      </Pressable>

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

      {!!state.ingredients && !state.isAnalyzing && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Detected Ingredients</Text>
          <Text style={s.mono}>{state.ingredients}</Text>

          <Pressable
            onPress={generateRecipe}
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
      {/* <Text style={s.footer}>Using Supabase Functions on project: {projectId}</Text> */}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, gap: 12 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#555", marginBottom: 8 },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "white", fontWeight: "700" },
  primary: { backgroundColor: "#111827" },
  secondary: { backgroundColor: "#374151" },
  accent: { backgroundColor: "#2563EB" },
  retry: { backgroundColor: "#B91C1C" },
  disabled: { opacity: 0.6 },
  image: { width: "100%", height: 540, borderRadius: 12, backgroundColor: "#eee" },
  placeholder: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: "#777" },
  loading: { alignItems: "center", gap: 8, marginTop: 8 },
  loadingText: { color: "#555" },
  card: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 12 },
  cardTitle: { fontWeight: "800", marginBottom: 6, fontSize: 16 },
  mono: { fontFamily: (Platform.select({ ios: "Menlo", android: "monospace" }) as any) },
  body: { fontSize: 16, lineHeight: 22 },
  errorBox: { backgroundColor: "#FEE2E2", borderRadius: 12, padding: 12, gap: 8 },
  errorText: { color: "#991B1B", fontWeight: "600" },
  footer: { textAlign: "center", color: "#6B7280", fontSize: 12 },
})
