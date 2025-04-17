import { Hono } from 'npm:hono@4'
import { cors } from 'npm:hono@4/cors'

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

    const { email, username, formID } = await c.req.json()

    if (!email || !username || !formID) {
      return c.json(
        { error: 'Missing required fields: email, username, and formID are required' },
        400
      )
    }

    // Get form details from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const formResponse = await fetch(`${supabaseUrl}/rest/v1/forms?id=eq.${formID}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    })

    if (!formResponse.ok) {
      throw new Error('Failed to fetch form details')
    }

    const [form] = await formResponse.json()
    
    if (!form) {
      return c.json({ error: 'Form not found' }, 404)
    }

    // Send notification email using Discord's email
    const emailEndpoint = `${Deno.env.get('EMAIL_API_URL')}/send`
    const emailResponse = await fetch(emailEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('EMAIL_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: `New Form Submission: ${form.title}`,
        message: {
          title: 'New Form Submission',
          greeting: `Hello ${username},`,
          body: `You have received a new submission for your form "${form.title}".`,
          actionUrl: `${Deno.env.get('NEXT_PUBLIC_APP_URL')}/forms/${formID}/results`,
          actionText: 'View Response',
          signature: 'Best regards,\nFluidForms Team'
        }
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      throw new Error(`Failed to send notification email: ${errorData.error || 'Unknown error'}`)
    }

    return c.json({ 
      success: true, 
      message: 'Notification sent successfully' 
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to send notification' 
    }, 500)
  }
})

Deno.serve(app.fetch)