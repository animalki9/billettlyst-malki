import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom' 
import { sanity } from '../sanityClient' 
import '../styles/dashboard.scss' 

// Komponent for å vise detaljer om et event lagret i Sanity
export default function SanityEventDetails() {
  // Henter event-id fra URL-parametere
  const { id } = useParams()

  // Tilstander for Sanity-event, Ticketmaster-event, brukerliste og lastestatus
  const [sanityEvent, setSanityEvent] = useState(null)
  const [ticketmasterEvent, setTicketmasterEvent] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect kjører når id endres, starter innhenting av data
  useEffect(() => {
    fetchSanityEvent()
  }, [id])

  // Henter eventdata fra Sanity basert på apiId
  // Sanity GROQ: https://www.sanity.io/docs/query-cheat-sheet
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

      // Hvis event finnes og har Ticketmaster-id så hent detaljert info
      if (eventData?.apiId) {
        fetchTicketmasterEvent(eventData.apiId)
        fetchUsers(eventData._id)
      }
    } finally {
      setLoading(false)
    }
  }

  // Henter detaljer fra Ticketmaster Discovery API
  // Kilde: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

  const fetchTicketmasterEvent = async (apiId) => {
    try {
      const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${apiId}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`)
      const data = await res.json()
      setTicketmasterEvent(data)
    } catch {}
  }

  // Henter alle brukere fra Sanity og filtrerer hvem som har eventet i ønskeliste/kjøp
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

      const relevantUsers = userData.filter((user) =>
        (user.wishlist || []).includes(String(eventSanityId)) ||
        (user.previousPurchases || []).includes(String(eventSanityId))
      )

      setUsers(relevantUsers)
    } catch {}
  }

  // Viser detaljer om event og brukere
  return (
    <main className="dashboard-event" style={{ flex: 1 }}>
      <header>
        {loading ? (
          <h1 className="dashboard-event__title">Laster...</h1>
        ) : sanityEvent ? (
          <h1 className="dashboard-event__title">{sanityEvent.title}</h1>
        ) : (
          <h1 className="dashboard-event__title">Event ikke funnet</h1>
        )}
      </header>


      {/* Dato og sted fra Ticketmaster */}
      {ticketmasterEvent && (
        <section className="dashboard-event__section" aria-labelledby="dato-sted">
          <h2 id="dato-sted">Dato og sted</h2>
          <p><strong>Dato:</strong> {ticketmasterEvent.dates?.start?.localDate}</p>
          <p><strong>Sted:</strong> {ticketmasterEvent._embedded?.venues?.[0]?.name}</p>
        </section>
      )}

      {/* Sjanger (hvis definert) */}
      {ticketmasterEvent?.classifications?.[0]?.genre?.name && (
        <section className="dashboard-event__section" aria-labelledby="sjanger">
          <h2 id="sjanger">Sjanger</h2>
          <p>{ticketmasterEvent.classifications[0].genre.name}</p>
        </section>
      )}

      {/* Brukere som har dette eventet i ønskeliste eller kjøp */}
      <section className="dashboard-event__section" aria-labelledby="brukere">
        <h2 id="brukere">Hvem har dette i ønskeliste</h2>

        {users.length > 0 ? (
          <div className="dashboard-event__user-grid">
            {users.map((user) => (
              <article key={user._id} className="dashboard-event__user-card">
                {user.image && (
                  <figure>
                    <img
                      src={user.image}
                      alt={user.name}
                      className="dashboard-event__user-img"
                    />
                  </figure>
                )}
                <p className="dashboard-event__user-name">{user.name}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>Ingen brukere har lagret eller kjøpt dette eventet.</p>
        )}
      </section>
    </main>
  )
}