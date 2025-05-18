import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { sanity } from '../../sanityClient'
import '../styles/dashboard.scss'


export default function TestSanityEvent() {
  // Henter query-parametere fra URL
  const { query } = useRouter()

  // Tilstand for event objektet som hentes fra Sanity
  const [event, setEvent] = useState(null)
  const [error, setError] = useState(null)

  // useEffect kjører når query.id blir tilgjengelig
  // Sanity GROQ: https://www.sanity.io/docs/query-cheat-sheet
  useEffect(() => {
    if (query.id) {
      sanity
        .fetch(`*[_id == $id][0]`, { $id: query.id })
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

  // Viser eventinformasjon fra Sanity når de blir hentet
  return (
    <main style={{ padding: '2rem' }}>
      <header>
        <h1>{event.title}</h1>
      </header>

      {/* Viser Ticketmaster API ID fra Sanity */}
      <section aria-labelledby="event-apiid">
        <h2 id="event-apiid">API ID</h2>
        <p>{event.apiId}</p>
      </section>

      {/* Viser kategori hvis definert */}
      <section aria-labelledby="event-kategori">
        <h2 id="event-kategori">Kategori</h2>
        <p>{event.kategori}</p>
      </section>
    </main>
  )
}
