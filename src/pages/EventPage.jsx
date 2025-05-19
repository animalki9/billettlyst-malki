import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EventCard from '../components/EventCard'
import ArtistCard from '../components/ArtistCard'
import '../styles/event.scss'

// Hovedkomponent for visning av ett enkelt event
export default function EventPage() {
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [relatedEvents, setRelatedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const cached = sessionStorage.getItem(`event_${id}`)
        if (cached) {
          const parsed = JSON.parse(cached)
          setEvent(parsed.event)
          setRelatedEvents(parsed.related || [])
          setLoading(false)
          return
        }

        // Henter hovedarrangement
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
        )
        const data = await res.json()
        setEvent(data)

        // Henter relaterte eventer via attractionId
        const attractionId = data._embedded?.attractions?.[0]?.id
        let related = []
        if (attractionId) {
          const res2 = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&attractionId=${attractionId}&locale=*&countryCode=NO`
          )
          const data2 = await res2.json()
          related = (data2._embedded?.events || []).filter(e =>
            e.id !== data.id && !e.test
          )
          setRelatedEvents(related)
        }

        // Lagre alt i sessionStorage
        sessionStorage.setItem(`event_${id}`, JSON.stringify({
          event: data,
          related: related
        }))
      } catch (err) {
        console.error('❌ Klarte ikke hente event:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEvent()
  }, [id])

  if (loading) return <main className="event"><p>Laster inn arrangement...</p></main>
  if (!event) return <main className="event"><p>Fant ikke arrangementet.</p></main>

  const imageUrl = event.images?.[0]?.url
  const genres = event.classifications?.[0]
  const allGenres = [genres?.segment?.name, genres?.genre?.name, genres?.subGenre?.name]
    .filter(g => g && g.toLowerCase() !== 'undefined')
  const ticketUrl = event.url 
  const timezone = event.dates?.timezone || ''
  const status = event.dates?.status?.code
  const venue = event._embedded?.venues?.[0]
  const date = event.dates?.start?.localDate
  const time = event.dates?.start?.localTime

  const festivalPasses = relatedEvents.filter(e =>
    e.name.toLowerCase().includes('pass')
  )

  const attraction = event._embedded?.attractions?.[0]
  const externalLinks = attraction?.externalLinks || {}
  const facebookLink = externalLinks.facebook?.[0]?.url
  const instagramLink = externalLinks.instagram?.[0]?.url

  return (
    <main className="event">
      <h1 className="event__title">{event.name}</h1>

      {imageUrl && (
        <img src={imageUrl} alt={event.name} className="event__image" />
      )}

      <p><strong>Sjanger:</strong> {allGenres.length > 0 ? allGenres.join(', ') : 'Ukjent'}</p>

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

      <p><strong>Dato:</strong> {date} {time}</p>
      <p><strong>Sted:</strong> {venue?.name} ({venue?.city?.name}, {venue?.country?.name})</p>
      <p><strong>Tidssone:</strong> {timezone}</p>

      {status && (
        <p><strong>Status:</strong> {status === 'onsale' ? 'Billetter tilgjengelig' : 'Ikke i salg'}</p>
      )}

      {ticketUrl && (
        <p>
          <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="event__ticket-link">
            Kjøp billetter på Ticketmaster
          </a>
        </p>
      )}

      <section className="event__section">
        <h2>Festivalpass:</h2>
        {festivalPasses.length > 0 ? (
          <div className="event__grid">
            {festivalPasses.map(evt => (
              <EventCard key={evt.id} event={evt} showHeart={false} />
            ))}
          </div>
        ) : (
          <p>Ingen billetter funnet.</p>
        )}
      </section>

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
