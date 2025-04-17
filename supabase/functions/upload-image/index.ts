import { Hono } from 'npm:hono@4'
import { cors } from 'npm:hono@4/cors'
import { createClient } from 'npm:@supabase/supabase-js'

const app = new Hono()
app.use('/*', cors())

app.post('/', async (c) => {
  try {
    // Get the authorization header
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization token' }, 401)
    }
    const token = authHeader.split(' ')[1]

    // Verify the Discord token by fetching user info
    const discordResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!discordResponse.ok) {
      return c.json({ error: 'Invalid Discord token' }, 401)
    }

    const userData = await discordResponse.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    )

    // Get the file data from the request
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'images'
    const path = formData.get('path') as string || ''

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const fileName = `${path}/${crypto.randomUUID()}-${file.name}`
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Upload error:', error)
      return c.json({ error: 'Failed to upload file' }, 500)
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return c.json({ 
      success: true,
      url: publicUrl
    })

  } catch (error) {
    console.error('Error handling upload:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to upload image' 
    }, 500)
  }
})

Deno.serve(app.fetch)