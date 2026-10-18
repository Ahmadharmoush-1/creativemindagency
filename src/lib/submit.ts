export async function submitInquiry(inquiry: {
  name: string
  company: string
  email: string
  phone: string
  message: string
  categories: string[]
  lang: string
}) {
  const body = new URLSearchParams({
    'form-name': 'contact',
    name: inquiry.name,
    company: inquiry.company,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    categories: inquiry.categories.join(', '),
    lang: inquiry.lang,
  })

  const response = await fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error('Your message could not be submitted.')
  }
}