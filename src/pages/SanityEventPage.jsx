// Sidekomponent i Next.js for å vise detaljer om et Sanity-event basert på _id
// Bruker client-side fetch og dynamisk rutehåndtering

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { sanity } from '../../sanityClient'

export default function TestSanityEvent() {
  // Henter query-parametere fra URL (eks. /sanity-event/abc123 gir query.id = "abc123")
  const { query } = useRouter()

  // Tilstand for event-objektet som hentes fra Sanity
  const [event, setEvent] = useState(null)

  // useEffect kjører når query.id blir tilgjengelig
  // Henter dokumentet fra Sanity der _id matcher query.id
  useEffect(() => {
    if (query.id) {
      sanity
        .fetch(`*[_id == $id][0]`, { $id: query.id }) // Sanity GROQ-spørring
        .then(setEvent)
        .catch(console.error) // Logger feil til konsoll hvis henting mislykkes
    }
  }, [query.id])

  // Viser lastemelding hvis data ikke er hentet enda
  if (!event) return <p>Laster event...</p>

  // Returnerer visning av Sanity-data når eventet er lastet inn
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{event.title}</h1>
      <p><strong>API ID:</strong> {event.apiId}</p>
      <p><strong>Kategori:</strong> {event.kategori}</p>
    </div>
  )
}
// --- KILDER / INSPIRASJON ---

// Next.js - useRouter (for å hente ruteparametere):
// https://nextjs.org/docs/pages/api-reference/functions/use-router

// React Hooks: useEffect og useState:
// https://reactjs.org/docs/hooks-reference.html

// Sanity.io - GROQ-spørring og klientoppsett:
// https://www.sanity.io/docs/how-queries-work
// https://www.sanity.io/docs/query-cheat-sheet
