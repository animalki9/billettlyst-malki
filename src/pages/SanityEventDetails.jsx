// Import av nødvendige React hooks, verktøy for ruteparametere og Sanity-klient
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sanity } from '../sanityClient'
import '../styles/dashboard.scss'

export default function SanityEventDetails() {
  // Henter ID fra URL-parametere
  const { id } = useParams()

  // Tilstand for event-data fra Sanity og Ticketmaster
  const [sanityEvent, setSanityEvent] = useState(null)
  const [ticketmasterEvent, setTicketmasterEvent] = useState(null)

  // Brukere som har lagret eller kjøpt dette arrangementet
  const [users, setUsers] = useState([])

  // Laster-status for å kontrollere visning
  const [loading, setLoading] = useState(true)

  // Kjøres når komponenten mountes eller ID-en endres
  useEffect(() => {
    fetchSanityEvent()
  }, [id])

  // Henter arrangement fra Sanity basert på apiId
  const fetchSanityEvent = async () => {
    try {
      const eventData = await sanity.fetch(
        `*[_type == "event" && apiId == $id][0]{
          _id,
          title,
          apiId
        }`,
        { id }
      )
      setSanityEvent(eventData)

      // Henter tilleggdata fra Ticketmaster og tilknyttede brukere
      if (eventData?.apiId) {
        fetchTicketmasterEvent(eventData.apiId)
        fetchUsers(eventData._id)
      }
    } catch (error) {
      console.error('❌ Feil ved henting fra Sanity:', error)
    } finally {
      setLoading(false)
    }
  }

  // Henter arrangementsdetaljer fra Ticketmaster basert på apiId
  const fetchTicketmasterEvent = async (apiId) => {
    try {
      const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${apiId}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`)
      const data = await res.json()
      setTicketmasterEvent(data)
    } catch (error) {
      console.error('❌ Feil ved henting fra Ticketmaster:', error)
    }
  }

  // Henter alle brukere fra Sanity og filtrerer ut de som har eventet i ønskeliste eller kjøp
  const fetchUsers = async (eventSanityId) => {
    try {
      const userData = await sanity.fetch(
        `*[_type == "user"]{
          _id,
          name,
          "image": profileImage.asset->url,
          "wishlist": wishlist[]->_id,
          "previousPurchases": previousPurchases[]->_id
        }`
      )

      // Filtrerer ut relevante brukere som har dette eventet i ønskeliste eller kjøp
      const relevantUsers = userData.filter((user) =>
        (user.wishlist || []).includes(String(eventSanityId)) ||
        (user.previousPurchases || []).includes(String(eventSanityId))
      )

      setUsers(relevantUsers)
    } catch (error) {
      console.error('❌ Feil ved henting av brukere:', error)
    }
  }

  // Viser lastemelding mens data hentes
  if (loading) return <p className="dashboard__loading">Laster data...</p>

  // Viser feilmelding dersom event ikke ble funnet
  if (!sanityEvent) return <p className="dashboard__error">Event ikke funnet.</p>

  // --------------------------------------------
  // JSX: Viser detaljert informasjon om event
  // --------------------------------------------
  return (
    <main className="dashboard-event">
      <h1 className="dashboard-event__title">{sanityEvent.title}</h1>

      {/* Viser sted og dato fra Ticketmaster-data hvis tilgjengelig */}
      {ticketmasterEvent && (
        <section className="dashboard-event__section">
          <h2>Dato og sted</h2>
          <p><strong>Dato:</strong> {ticketmasterEvent.dates?.start?.localDate}</p>
          <p><strong>Sted:</strong> {ticketmasterEvent._embedded?.venues?.[0]?.name}</p>
        </section>
      )}

      {/* Viser sjanger dersom tilgjengelig i dataen */}
      {ticketmasterEvent?.classifications?.[0]?.genre?.name && (
        <section className="dashboard-event__section">
          <h2>Sjanger</h2>
          <p>{ticketmasterEvent.classifications[0].genre.name}</p>
        </section>
      )}

      {/* Viser brukere som har eventet i ønskeliste eller kjøp */}
      <section className="dashboard-event__section">
        <h2>Hvem har dette i ønskeliste</h2>
        {users.length > 0 ? (
          <div className="dashboard-event__user-grid">
            {users.map((user) => (
              <div key={user._id} className="dashboard-event__user-card">
                {user.image && (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="dashboard-event__user-img"
                  />
                )}
                <p className="dashboard-event__user-name">{user.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Ingen brukere har lagret eller kjøpt dette eventet.</p>
        )}
      </section>
    </main>
  )
}
// --- KILDER / INSPIRASJON ---

// React Hooks: useEffect og useState
// https://reactjs.org/docs/hooks-reference.html

// React Router DOM – useParams:
// https://reactrouter.com/en/main/hooks/use-params

// Sanity.io – Spørring med GROQ og klientoppsett:
// https://www.sanity.io/docs/how-queries-work
// https://www.sanity.io/docs/query-cheat-sheet

// Ticketmaster Discovery API – Event Details:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2

// JavaScript Fetch API:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

