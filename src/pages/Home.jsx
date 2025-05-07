// Import av nødvendige hooks og komponenter
import { Link } from 'react-router-dom'
import CityEventCard from '../components/CityEventCard'
import '../styles/home.scss'
import '../styles/cards.scss'
import { useEffect, useState, useRef } from 'react'


export default function Home() {
  // Tilstand for festivaldata, innlastingsstatus, arrangementer per by og valgt by
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [cityEvents, setCityEvents] = useState([])
  const [selectedCity, setSelectedCity] = useState('Oslo')
  const fullText = 'Sommerens festivaler!'
  const [heading, setHeading] = useState('')
  const [doneTyping, setDoneTyping] = useState(false)
  const indexRef = useRef(0) // Brukes for å holde riktig index mellom renders


  // Henter forhåndsdefinerte festivaler ved førstegangsinnlasting
  useEffect(() => {
    const fetchFestivals = async () => {
      const urls = [
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Findings&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Neon&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Skeikampenfestivalen&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Tons%20of%20Rock&locale=*&countryCode=NO`
      ]

      try {
        // Henter data parallelt fra alle festival-URL-er og filtrerer bort null-verdier
        const results = await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url)
            const data = await res.json()
            return data._embedded?.events?.[0] || null
          })
        )
        setFestivals(results.filter(Boolean))
      } catch (error) {
        console.error('Feil ved henting av festivaler:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFestivals()
  }, [])

  // Henter arrangementer når valgt by endres
  useEffect(() => {
    fetchCityEvents(selectedCity)
  }, [selectedCity])

  // Henter arrangementer fra valgt by ved hjelp av Ticketmaster API
  const fetchCityEvents = async (city) => {
    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&size=10&apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
      )
      const data = await response.json()
      setCityEvents(data._embedded?.events || [])
    } catch (error) {
      console.error('Feil ved henting av by-arrangementer:', error)
    }
  }

  return (
    <main className="home">
      {/* Overskrift for festivalsesongen */}

      <div className="scrolling-text-container">
        <div className="scrolling-text-track">
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>
          <span>Sommerens festivaler! </span>

        </div>
      </div>

      {/* Viser lastestatus før festivaldata er hentet */}
      {loading ? (
        <p className="home__loading">Laster festivaler…</p>
      ) : (
        <div className="home__festival-grid">
          {/* Mapper festivaldata til visuelle kort */}
          {festivals.map((festival) => (
            <article key={festival.id} className="festival-card">
              {festival.images?.[0]?.url && (
                <img
                  src={festival.images[0].url}
                  alt={festival.name}
                  className="festival-card__image"
                />
              )}
              <h2 className="festival-card__title">{festival.name}</h2>
              <Link to={`/event/${festival.id}`} className="festival-card__link">
                Les mer om {festival.name}
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Seksjon for arrangementer i utvalgte storbyer */}
      <section className="home__cities">
        <h1 className="home__subheading">Hva skjer i verdens storbyer!</h1>

        {/* Byvalg-knapper, oppdaterer valgt by */}
        <div className="home__city-buttons">
          {['Oslo', 'Stockholm', 'Berlin', 'London', 'Paris'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`home__city-button ${city === selectedCity ? 'active' : ''}`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Overskrift for valgt by */}
        <h2 className="home__city-title">Hva skjer i {selectedCity}</h2>

        {/* Arrangementskort for valgt by */}
        <div className="home__event-grid">
          {cityEvents.map((event) => (
            <CityEventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  )
}
// --- KILDER / INSPIRASJON ---

// React hooks (useState, useEffect):
// https://reactjs.org/docs/hooks-reference.html

// Ticketmaster Discovery API – søk etter events med by og søkeord:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

// JavaScript Fetch API og bruk av async/await:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://javascript.info/async-await

// Betinget rendering i React (loading vs. visning):
// https://reactjs.org/docs/conditional-rendering.html

// Array-metoder brukt i .map og .filter:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

// MDN Web Docs – @keyframes og animation:
// https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
// https://developer.mozilla.org/en-US/docs/Web/CSS/animation
// Forklarer hvordan CSS-animasjon fungerer med @keyframes, animation-name og  animation-duration.
