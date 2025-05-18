import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EventCard from '../components/EventCard'
import ArtistCard from '../components/ArtistCard'
import '../styles/event.scss'

// Hovedkomponent for visning av ett enkelt event
export default function EventPage() {
  // Henter event-ID fra URL
  const { id } = useParams()

  // Tilstander for hovedarrangement, relaterte events og lastestatus
  const [event, setEvent] = useState(null)
  const [relatedEvents, setRelatedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect henter data hver gang ID endres
  // KILDE: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
  useEffect(() => {
    const fetchEvent = async () => {
      try {
      // Henter detaljert informasjon om ett event fra Ticketmaster API
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
        )
        const data = await res.json()
        setEvent(data)

        // Hent relaterte events basert på tilknyttet attraksjon
        const attractionId = data._embedded?.attractions?.[0]?.id
        if (attractionId) {
          const res2 = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&attractionId=${attractionId}&locale=*&countryCode=NO`
          )
          const data2 = await res2.json()
          // Filtrerer bort eventet selv og eventer merket som test
          const allRelated = (data2._embedded?.events || []).filter(e =>
            e.id !== data.id && !e.test
          )
          setRelatedEvents(allRelated)
        } else {
          setRelatedEvents([])
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEvent()
  }, [id])

  // Viser lasteskjerm til data er hentet
  if (loading) {
    return <main className="event"><p>Laster inn arrangement...</p></main>
  }

  // Hvis event ikke finnes
  if (!event) {
    return <main className="event"><p>Fant ikke arrangementet.</p></main>
  }

  // Forbereder variabler for visning
  // Bruker optional chaining for trygg tilgang: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

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

  // Søker etter festivalpass i relaterte eventer
  const festivalPasses = relatedEvents.filter(e =>
    e.name.toLowerCase().includes('pass')
  )
  // Henter eksterne lenker til sosiale medier
  const attraction = event._embedded?.attractions?.[0]
  const externalLinks = attraction?.externalLinks || {}
  const facebookLink = externalLinks.facebook?.[0]?.url
  const instagramLink = externalLinks.instagram?.[0]?.url

  // JSX for visning av arrangementinformasjon og relaterte elementer
  return (
    <main className="event">
      <h1 className="event__title">{event.name}</h1>

      {/* Viser hovedbilde om tilgjengelig */}
      {imageUrl && (
        <img src={imageUrl} alt={event.name} className="event__image" />
      )}

      {/* Sjanger-informasjon */}
      <p><strong>Sjanger:</strong> {allGenres.length > 0 ? allGenres.join(', ') : 'Ukjent'}</p>
      
      {/* Lenker til sosiale medier */}
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

      {/* Tid og sted */}
      <p><strong>Dato:</strong> {date} {time}</p>
      <p><strong>Sted:</strong> {venue?.name} ({venue?.city?.name}, {venue?.country?.name})</p>
      <p><strong>Tidssone:</strong> {timezone}</p>

      {/* Status */}
      {status && (
        <p><strong>Status:</strong> {status === 'onsale' ? 'Billetter tilgjengelig' : 'Ikke i salg'}</p>
      )}

      {/* Billettlenke */}
      {ticketUrl && (
        <p>
          <a href={ticketUrl} target="_blank" rel="noopener noreferrer" className="event__ticket-link">
            Kjøp billetter på Ticketmaster
          </a>
        </p>
      )}

      {/* Festivalpass seksjon */}
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
      
      {/* Artist seksjon */}
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