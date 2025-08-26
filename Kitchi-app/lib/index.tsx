import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";
const app = new Hono()

app.use('*', cors())
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Create storage bucket for temporary image storage
const bucketName = 'make-f248e63b-images'

const initializeStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        // Check if the error is because bucket already exists (409 conflict)
        // if (createError.message?.includes('already exists') || createError.statusCode === '409') {
        //   console.log(`Bucket ${bucketName} already exists - continuing`)
        // } else {
        //   console.error('Error creating bucket:', createError)
        // }
        if (
          createError.message?.includes("already exists") ||
          (typeof (createError as any).statusCode === "string" &&
            (createError as any).statusCode === "409")
        ) {
          console.log(`Bucket ${bucketName} already exists - continuing`);
        }
        
      } else {
        console.log(`Successfully created bucket: ${bucketName}`)
      }
    } else {
      console.log(`Bucket ${bucketName} already exists - skipping creation`)
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
  }
}

// Helper function to convert ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 1024 * 64 // 64KB chunks to avoid stack overflow
  let base64 = ''
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize)
    // const chunkString = String.fromCharCode(...chunk)
    const chunkString = String.fromCharCode.apply(null, Array.from(chunk))
    base64 += btoa(chunkString)
  }
  
  // If we processed in chunks, we need to decode and re-encode the whole thing
  if (bytes.length > chunkSize) {
    try {
      // For large files, use a different approach
      const decoder = new TextDecoder('binary')
      const binaryString = decoder.decode(bytes)
      return btoa(binaryString)
    } catch {
      // Fallback: process in smaller chunks
      let result = ''
      for (let i = 0; i < bytes.length; i += 1024) {
        const end = Math.min(i + 1024, bytes.length)
        const chunk = bytes.slice(i, end)
        result += String.fromCharCode.apply(null, Array.from(chunk))
      }
      return btoa(result)
    }
  }
  
  return base64
}

// Initialize storage on startup
initializeStorage()

// Analyze ingredients from image
app.post('/make-server-f248e63b/analyze-ingredients', async (c) => {
  try {
    const formData = await c.req.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return c.json({ error: 'No image file provided' }, 400)
    }

    // Validate file size (5MB max to avoid issues)
    if (imageFile.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Image file must be smaller than 5MB' }, 400)
    }

    // Convert image to base64 using safe method
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = arrayBufferToBase64(arrayBuffer)
    const mimeType = imageFile.type

    const openaiApiKey = process.env.OPENAI_API_KEY!
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500)
    }

    console.log(`Processing image: ${imageFile.name}, size: ${imageFile.size} bytes, type: ${mimeType}`)

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and identify all the ingredients you can see. List them in a simple, comma-separated format. Focus only on food ingredients that could be used for cooking. Be specific but concise.'
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error for ingredient analysis:', errorText)
      return c.json({ error: 'Failed to analyze ingredients' }, 500)
    }

    const data = await response.json()
    const ingredients = data.choices[0].message.content

    console.log(`Successfully analyzed ingredients: ${ingredients}`)
    return c.json({ ingredients })
  } catch (error) {
    console.error('Error analyzing ingredients:', error)
    return c.json({ error: 'Internal server error during ingredient analysis' }, 500)
  }
})

// Generate recipe from ingredients
app.post('/make-server-f248e63b/generate-recipe', async (c) => {
  try {
    const { ingredients } = await c.req.json()
    
    if (!ingredients) {
      return c.json({ error: 'No ingredients provided' }, 400)
    }

    const openaiApiKey = process.env.OPENAI_API_KEY!
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500)
    }

    console.log(`Generating recipe for ingredients: ${ingredients}`)

    // Call OpenAI text generation API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
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
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error for recipe generation:', errorText)
      return c.json({ error: 'Failed to generate recipe' }, 500)
    }

    const data = await response.json()
    const recipe = data.choices[0].message.content

    console.log(`Successfully generated recipe`)
    return c.json({ recipe })
  } catch (error) {
    console.error('Error generating recipe:', error)
    return c.json({ error: 'Internal server error during recipe generation' }, 500)
  }
})

// Health check endpoint
app.get('/make-server-f248e63b/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Deno.serve(app.fetch)