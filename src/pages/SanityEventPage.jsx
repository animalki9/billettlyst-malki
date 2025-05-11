// Sidekomponent i Next.js for å vise detaljer om et Sanity-event basert på _id
// Bruker client-side fetch og dynamisk rutehåndtering

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { sanity } from '../../sanityClient'
import '../styles/dashboard.scss'


export default function TestSanityEvent() {
  // Henter query-parametere fra URL (eks. /sanity-event/abc123 gir query.id = "abc123")
  const { query } = useRouter()

  // Tilstand for event-objektet som hentes fra Sanity
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  // useEffect kjører når query.id blir tilgjengelig
  // Henter dokumentet fra Sanity der _id matcher query.id
  useEffect(() => {
    if (query.id) {
      sanity
        .fetch(`*[_id == $id][0]`, { $id: query.id }) // Sanity GROQ-spørring
        .then((data) => {
          if (data) {
            setEvent(data)
          } else {
            setError('Event ikke funnet.')
          }
        })
        .catch(() => setError('Feil ved henting av event-data.'))
    }
  }, [query.id])

  // Viser feilmelding hvis noe gikk galt
  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </main>
    )
  }

  // Viser lastemelding hvis data ikke er hentet enda
  if (!event) {
    return (
      <main style={{ padding: '2rem' }}>
        <p>Laster event...</p>
      </main>
    )
  }

  // Returnerer visning av Sanity-data når eventet er lastet inn
  return (
    <main style={{ padding: '2rem' }}>
      <header>
        <h1 style={color= 'red'}>{event.title}</h1>
      </header>

      <section aria-labelledby="event-apiid">
        <h2 id="event-apiid">API ID</h2>
        <p>{event.apiId}</p>
      </section>

      <section aria-labelledby="event-kategori">
        <h2 id="event-kategori">Kategori</h2>
        <p>{event.kategori}</p>
      </section>
    </main>
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
