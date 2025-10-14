Project Information 

Project name: Kitchi 

Description: A cross platform built with Expo and SupaBase 

GitHub: https://github.com/UUillieee/Kitchi-Project 

Key features: Image recognition, recipe generator and expiration alerts 

Production Dependencies 

Project Information 

Name: 	kitchi-app 

Main Entry:	expo-router/entry 

Development Platform: Expo 

Routing: Expo Router 

Frontend Language: Typescript 

Backend DB: SupabBase 

Version number 

@expo/vector-icons	^15.0.2 

@react-native-async-storage/async-storage	2.2.0 

@react-navigation/bottom-tabs	^7.3.10 

@react-navigation/elements	^2.3.8 

@react-navigation/native	^7.1.6 

@rneui/base	^4.0.0-rc.8 

@rneui/themed	^4.0.0-rc.8 

@supabase/auth-js	^2.74.0 

@supabase/supabase-js	^2.74.0 

buffer	^6.0.3 

crypto-browserify	^3.12.1 

events-browserify	^0.0.1 

expo	^54.0.12 

expo-blur	~15.0.7 

expo-camera	~17.0.8 

expo-constants	~18.0.9 

expo-device	~8.0.9 

expo-font	~14.0.8 

expo-haptics	~15.0.7 

expo-image	~3.0.8 

expo-image-picker	~17.0.8 

expo-linking	~8.0.8 

expo-media-library	~18.2.0 

expo-notifications	~0.32.12 

expo-router	~6.0.10 

expo-sharing	~14.0.7 

expo-splash-screen	~31.0.10 

expo-status-bar	~3.0.8 

expo-symbols	~1.0.7 

expo-system-ui	~6.0.7 

expo-web-browser	~15.0.8 

https-browserify	^1.0.0 

os-browserify	^0.3.0 

path-browserify	^1.0.1 

process	^0.11.10 

react	19.1.0 

react-dom	19.1.0 

react-native	0.81.4 

react-native-dotenv	^3.4.11 

react-native-gesture-handler	~2.28.0 

react-native-get-random-values	^1.11.0 

react-native-reanimated	~4.1.1 

react-native-responsive-screen	^1.4.2 

react-native-safe-area-context	^5.6.1 

react-native-screens	~4.16.0 

react-native-url-polyfill	^3.0.0 

react-native-web	^0.21.1 

react-native-webview	13.15.0 

react-native-worklets	0.5.1 

stream-browserify	^3.0.0 

stream-http	^3.2.0 

util	^0.12.5 

 
 

Installation Instructions 

##clone repository 

git clone https://github.com/UUillieee/Kitchi-Project.git 

cd Kitchi-app  

 

##Setup supabase functions 

Create a new supabase project 

Create these table in the database 

-- WARNING: This schema is for context only and is not meant to be run. -- Table order and constraints may not be valid for execution. 

CREATE TABLE public.pantry_items ( id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, entry_date timestamp with time zone DEFAULT now(), food_name text NOT NULL, expiry_date date NOT NULL, is_public boolean DEFAULT false, is_expired boolean NOT NULL DEFAULT false, full_name text NOT NULL DEFAULT ''::text, CONSTRAINT pantry_items_pkey PRIMARY KEY (id), CONSTRAINT pantry_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) );  

CREATE TABLE public.personal_bookmark ( id uuid NOT NULL DEFAULT gen_random_uuid(), created_at timestamp with time zone NOT NULL DEFAULT now(), recipe_id json NOT NULL, user_id uuid NOT NULL DEFAULT auth.uid(), CONSTRAINT personal_bookmark_pkey PRIMARY KEY (id) );  

CREATE TABLE public.profiles ( id uuid NOT NULL, username text NOT NULL UNIQUE, full_name text, email text, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now(), avatar_url text, CONSTRAINT profiles_pkey PRIMARY KEY (id), CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) );  

CREATE TABLE public.user_devices ( user_id uuid NOT NULL, device_id text NOT NULL, expo_token text NOT NULL, platform text, app_version text, last_active timestamp with time zone DEFAULT now(), CONSTRAINT user_devices_pkey PRIMARY KEY (user_id, device_id), CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ); 

 

Create Edge Functions in supabase 
 
import { Hono } from 'npm:hono'; 

import { cors } from 'npm:hono/cors'; 

import { logger } from 'npm:hono/logger'; 

import { createClient } from 'npm:@supabase/supabase-js@2'; 

const app = new Hono(); 

app.use('*', cors()); 

app.use('*', logger(console.log)); 

// Initialize Supabase client 

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')); 

// Create storage bucket for temporary image storage 

const bucketName = 'make-f248e63b-images'; 

const initializeStorage = async ()=>{ 

try { 

const { data: buckets, error: listError } = await supabase.storage.listBuckets(); 

if (listError) { 

console.error('Error listing buckets:', listError); 

return; 

} 

const bucketExists = buckets?.some((bucket)=>bucket.name === bucketName); 

if (!bucketExists) { 

const { error: createError } = await supabase.storage.createBucket(bucketName, { 

public: false, 

allowedMimeTypes: [ 

'image/*' 

], 

fileSizeLimit: 10 * 1024 * 1024 

}); 

if (createError) { 

if (createError.message?.includes('already exists') || createError.statusCode === '409') { 

console.log(`Bucket ${bucketName} already exists - continuing`); 

} else { 

console.error('Error creating bucket:', createError); 

} 

} else { 

console.log(`Successfully created bucket: ${bucketName}`); 

} 

} else { 

console.log(`Bucket ${bucketName} already exists - skipping creation`); 

} 

} catch (error) { 

console.error('Error initializing storage:', error); 

} 

}; 

// Convert ArrayBuffer to Base64 safely 

function arrayBufferToBase64(buffer) { 

const bytes = new Uint8Array(buffer); 

const chunkSize = 64 * 1024 // 64KB 

; 

let base64 = ''; 

for(let i = 0; i < bytes.length; i += chunkSize){ 

const chunk = bytes.slice(i, i + chunkSize); 

base64 += btoa(String.fromCharCode(...chunk)); 

} 

if (bytes.length > chunkSize) { 

try { 

const decoder = new TextDecoder('binary'); 

const binaryString = decoder.decode(bytes); 

return btoa(binaryString); 

} catch { 

let result = ''; 

for(let i = 0; i < bytes.length; i += 1024){ 

const end = Math.min(i + 1024, bytes.length); 

const chunk = bytes.slice(i, end); 

result += String.fromCharCode.apply(null, Array.from(chunk)); 

} 

return btoa(result); 

} 

} 

return base64; 

} 

// Initialize storage on startup 

initializeStorage(); 

// ----------------------------- 

// Endpoints 

// ----------------------------- 

// Analyze ingredients from image 

app.post('/make-server-f248e63b/analyze-ingredients', async (c)=>{ 

try { 

const formData = await c.req.formData(); 

const imageFile = formData.get('image'); 

if (!imageFile) return c.json({ 

error: 'No image file provided' 

}, 400); 

if (imageFile.size > 5 * 1024 * 1024) return c.json({ 

error: 'Image too large' 

}, 400); 

const arrayBuffer = await imageFile.arrayBuffer(); 

const base64Image = arrayBufferToBase64(arrayBuffer); 

const mimeType = imageFile.type; 

const openaiApiKey = Deno.env.get('OPENAI_API_KEY'); 

if (!openaiApiKey) return c.json({ 

error: 'OpenAI API key not configured' 

}, 500); 

// Call OpenAI to analyze ingredients 

const response = await fetch('https://api.openai.com/v1/chat/completions', { 

method: 'POST', 

headers: { 

Authorization: `Bearer ${openaiApiKey}`, 

'Content-Type': 'application/json' 

}, 

body: JSON.stringify({ 

model: 'gpt-4o-mini', 

messages: [ 

{ 

role: 'user', 

content: [ 

{ 

type: 'text', 

text: 'Analyze this image and output ONLY the list of ingredients, separated by commas. DO NOT include any introductory or concluding text, such as "The ingredients are" or "Here is the list". Start directly with the first ingredient.' 

}, 

{ 

type: 'image_url', 

image_url: { 

url: `data:${mimeType};base64,${base64Image}` 

} 

} 

] 

} 

], 

max_tokens: 300 

}) 

}); 

if (!response.ok) { 

const errorText = await response.text(); 

console.error('OpenAI API error:', errorText); 

return c.json({ 

error: 'Failed to analyze ingredients' 

}, 500); 

} 

const data = await response.json(); 

const ingredients = data.choices[0].message.content; 

// ✅ Automatically insert into Supabase 

const { error: insertError } = await supabase.from('ingredients').insert([ 

{ 

items: ingredients.split(',').map((i)=>i.trim()) 

} 

]); 

if (insertError) { 

console.error('Failed to save ingredients:', insertError); 

return c.json({ 

error: 'Failed to save ingredients' 

}, 500); 

} 

console.log(`Successfully analyzed and saved ingredients: ${ingredients}`); 

return c.json({ 

ingredients, 

success: true 

}); 

} catch (err) { 

console.error('Error analyzing ingredients:', err); 

return c.json({ 

error: 'Internal server error' 

}, 500); 

} 

}); 

// Save ingredients into Supabase table 

// save-ingredients handler (no auth) 

app.post('/make-server-f248e63b/save-ingredients', async (c)=>{ 

try { 

const body = await c.req.json(); 

console.log('Received body:', body); 

const { items } = body; 

if (!items || !Array.isArray(items)) { 

return c.json({ 

error: 'Invalid payload: items must be an array of strings' 

}, 400); 

} 

const { data, error } = await supabase.from('ingredients').insert([ 

{ 

items 

} 

]); 

console.log('Supabase insert result:', { 

data, 

error 

}); 

if (error) { 

return c.json({ 

error: error.message 

}, 500); 

} 

return c.json({ 

success: true 

}); 

} catch (err) { 

console.error('Error in save-ingredients function:', err); 

return c.json({ 

error: err.message || 'Internal server error' 

}, 500); 

} 

}); 

app.get("/make-server-f248e63b/fetch-ingredients", async (c)=>{ 

try { 

const { data, error } = await supabase.from("ingredients").select("*").order("created_at", { 

ascending: false 

}); 

if (error) throw error; 

return c.json({ 

ingredients: data 

}); 

} catch (err) { 

console.error(err); 

return c.json({ 

error: "Failed to fetch ingredients" 

}, 500); 

} 

}); 

// Generate recipe from ingredients 

app.post('/make-server-f248e63b/generate-recipe', async (c)=>{ 

try { 

const { ingredients } = await c.req.json(); 

if (!ingredients) return c.json({ 

error: 'No ingredients provided' 

}, 400); 

const openaiApiKey = Deno.env.get('OPENAI_API_KEY'); 

if (!openaiApiKey) return c.json({ 

error: 'OpenAI API key not configured' 

}, 500); 

console.log(`Generating recipe for ingredients: ${ingredients}`); 

const response = await fetch('https://api.openai.com/v1/chat/completions', { 

method: 'POST', 

headers: { 

Authorization: `Bearer ${openaiApiKey}`, 

'Content-Type': 'application/json' 

}, 

body: JSON.stringify({ 

model: 'gpt-4o-mini', 

messages: [ 

{ 

role: 'system', 

content: 'You are a professional chef assistant. Create delicious, practical recipes using the provided ingredients. Format your response with a clear recipe title, ingredient list, and step-by-step instructions.' 

}, 

{ 

role: 'user', 

content: `Create a recipe using these ingredients: ${ingredients}. If some common pantry items (like salt, pepper, oil, etc.) are needed but not listed, feel free to include them. Make it practical and delicious!` 

} 

], 

max_tokens: 800 

}) 

}); 

if (!response.ok) { 

const errorText = await response.text(); 

console.error('OpenAI API error for recipe generation:', errorText); 

return c.json({ 

error: 'Failed to generate recipe' 

}, 500); 

} 

const data = await response.json(); 

const recipe = data.choices[0].message.content; 

console.log(`Successfully generated recipe`); 

return c.json({ 

recipe 

}); 

} catch (error) { 

console.error('Error generating recipe:', error); 

return c.json({ 

error: 'Internal server error during recipe generation' 

}, 500); 

} 

}); 

// Health check endpoint 

app.get('/make-server-f248e63b/health', (c)=>{ 

return c.json({ 

status: 'healthy', 

timestamp: new Date().toISOString() 

}); 

}); 

// Start the Deno server 

Deno.serve(app.fetch); 

 

 

 

 

##Set up environmental variables 

Create a .env file under Kitchi-app with the variables below 

 

 

EXPO_PUBLIC_SUPABASE_PROJECT_ID=<your-supabase-project-ID> 

EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key> 

EXPO_PUBLIC_SPOONACULAR_API=<your-spoonacular-api-key> 

EXPO_PUBLIC_SUPABASE_FUNCTIONS=<your-supabase-function-name-for-chatgpt-api> 

 

Usage Instructions 

 

##Start the server 

	Run npx expo start in Kitchi-app terminal 

	 

Choose between andriod or ios simulator, only macbooks can run ios simulator	i to run ios 

a to run android 

	 

To run on a physical device download the expo go app from the app store 

Login or create an account		 

 

Scan the qr code in the terminal window of Kitchi-app 

 

Authors 

William Bindon  

Shawn Park 

 

 

 

 

 

 