import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sanity } from '../sanityClient'
import '../styles/dashboard.scss'

export default function SanityEventDetails() {
  const { id } = useParams()

  const [sanityEvent, setSanityEvent] = useState(null)
  const [ticketmasterEvent, setTicketmasterEvent] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSanityEvent()
  }, [id])

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

      if (eventData?.apiId) {
        fetchTicketmasterEvent(eventData.apiId)
        fetchUsers(eventData._id)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketmasterEvent = async (apiId) => {
    try {
      const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events/${apiId}.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`)
      const data = await res.json()
      setTicketmasterEvent(data)
    } catch {}
  }

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

  if (loading) return <p className="dashboard__loading">Laster data...</p>
  if (!sanityEvent) return <p className="dashboard__error">Event ikke funnet.</p>

  return (
    <main className="dashboard-event" style={{ flex: 1 }}>
      <header>
        <h1 className="dashboard-event__title">{sanityEvent.title}</h1>
      </header>

      {ticketmasterEvent && (
        <section className="dashboard-event__section" aria-labelledby="dato-sted">
          <h2 id="dato-sted">Dato og sted</h2>
          <p><strong>Dato:</strong> {ticketmasterEvent.dates?.start?.localDate}</p>
          <p><strong>Sted:</strong> {ticketmasterEvent._embedded?.venues?.[0]?.name}</p>
        </section>
      )}

      {ticketmasterEvent?.classifications?.[0]?.genre?.name && (
        <section className="dashboard-event__section" aria-labelledby="sjanger">
          <h2 id="sjanger">Sjanger</h2>
          <p>{ticketmasterEvent.classifications[0].genre.name}</p>
        </section>
      )}

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
