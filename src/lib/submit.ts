export type Inquiry = {
  name: string
  company: string
  email: string
  phone: string
  categories: string[]
  message: string
  lang: string
}

/**
 * Sends the contact form.
 * Set VITE_FORM_ENDPOINT (see .env.example) to a URL that accepts a JSON POST.
 * Without it, nothing is sent anywhere: the form only simulates a successful submit
 * so the flow can be reviewed.
 */
export async function submitInquiry(data: Inquiry): Promise<void> {
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 900))
    return
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`)
}
