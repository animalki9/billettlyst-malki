// Importerer React hooks og nødvendige komponenter
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EventCard from '../components/EventCard'
import ArtistCard from '../components/ArtistCard'
import '../styles/event.scss'

export default function EventPage() {
  // Henter event-ID fra URL
  const { id } = useParams()

  // Tilstander for hovedarrangement, relaterte events og innlastingsstatus
  const [event, setEvent] = useState(null)
  const [relatedEvents, setRelatedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Henter arrangementsdata og relaterte events basert på ID
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Henter hovedarrangement basert på ID
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
        )
        const data = await res.json()
        setEvent(data)

        // Henter relaterte arrangementer dersom det finnes en tilknyttet attraksjon
        const attractionId = data._embedded?.attractions?.[0]?.id
        if (attractionId) {
          const res2 = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&attractionId=${attractionId}&locale=*&countryCode=NO`
          )
          const data2 = await res2.json()

          // Filtrerer ut test-arrangementer og selve hovedarrangementet
          const allRelated = (data2._embedded?.events || []).filter(e =>
            e.id !== data.id && !e.test
          )

          setRelatedEvents(allRelated)
        } else {
          setRelatedEvents([])
        }
      } catch (err) {
        console.error('Feil ved henting av event:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEvent()
  }, [id])

  // Viser lastestatus eller feil hvis event ikke finnes
  if (loading) return <p className="event__loading">Laster arrangement...</p>
  if (!event) return <p className="event__error">Fant ikke event med ID: {id}</p>

  // Ekstraherer relevant data fra arrangementsobjektet
  const imageUrl = event.images?.[0]?.url
  const genres = event.classifications?.[0]
  const allGenres = [genres?.segment?.name, genres?.genre?.name, genres?.subGenre?.name]
    .filter(g => g && g.toLowerCase() !== 'undefined')

  const description = event.info || event.description || 'Ingen beskrivelse tilgjengelig.'
  const venue = event._embedded?.venues?.[0]
  const date = event.dates?.start?.localDate
  const time = event.dates?.start?.localTime
  const artists = event._embedded?.attractions?.map(a => a.name).join(', ')

  // Filtrerer relaterte arrangementer som inneholder "pass" i navnet (festivalpass)
  const festivalPasses = relatedEvents.filter(e =>
    e.name.toLowerCase().includes('pass')
  )

  // Henter sosiale medier-lenker fra attraksjon (artist/arrangør)
  const attraction = event._embedded?.attractions?.[0]
  const externalLinks = attraction?.externalLinks || {}
  const facebookLink = externalLinks.facebook?.[0]?.url
  const instagramLink = externalLinks.instagram?.[0]?.url

  // --------------------------------------------
  // JSX: Visning av arrangement og tilleggsinnhold
  // --------------------------------------------
  return (
    <main className="event">
      {/* Arrangementets navn og bilde */}
      <h1 className="event__title">{event.name}</h1>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={event.name}
          className="event__image"
        />
      )}

      {/* Sjanger og metadata */}
      <p><strong>Sjanger:</strong>{' '}
        {allGenres.length > 0 ? allGenres.join(', ') : 'Ukjent'}
      </p>

      {/* Lenker til sosiale medier (hvis tilgjengelig) */}
      {(facebookLink || instagramLink) && (
        <div className="event__social">
          <p><strong>Følg oss på sosiale medier:</strong></p>
          {facebookLink && (
            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="event__social-link">
              Facebook
            </a>
          )}
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="event__social-link">
              Instagram
            </a>
          )}
        </div>
      )}

      {/* Dato, sted og beskrivelse */}
      <p><strong>Dato:</strong> {date} {time}</p>
      <p><strong>Sted:</strong> {venue?.name} ({venue?.city?.name}, {venue?.country?.name})</p>
      <p><strong>Beskrivelse:</strong> {description}</p>

      {/* Seksjon for tilgjengelige festivalpass relatert til arrangementet */}
      <section className="event__section">
        <h2>Festivalpass:</h2>
        {festivalPasses.length > 0 ? (
          <div className="event__grid">
            {festivalPasses.map(evt => (
              <EventCard key={evt.id} event={evt} />
              
            ))}
          </div>
          
        ) : (
          <p>Ingen billetter funnet.</p>
        )}
      </section>

      {/* Seksjon for artister knyttet til arrangementet */}
      {event._embedded?.attractions?.length > 0 && (
        <section className="event__section">
          <h2>Artister:</h2>
          <div className="event__grid event__grid--artists">
            {event._embedded.attractions.map(artist => (
              <ArtistCard key={artist.id} artist={artist} showHeart={false} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
// --- KILDER / INSPIRASJON ---

// React hooks (useState, useEffect):
// https://reactjs.org/docs/hooks-reference.html

// React Router – Bruk av useParams for å hente ID fra URL:
// https://reactrouter.com/en/main/hooks/use-params

// Ticketmaster Discovery API – Hente arrangement og attraksjonsdata:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

// JavaScript Fetch API og async/await:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://javascript.info/async-await

// Bruk av Array.filter og Array.map i visning og filtrering:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

// React – Betinget rendering:
// https://reactjs.org/docs/conditional-rendering.html

