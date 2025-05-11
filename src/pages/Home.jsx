import { Link } from 'react-router-dom'
import CityEventCard from '../components/CityEventCard'
import '../styles/home.scss'
import '../styles/cards.scss'
import { useEffect, useState } from 'react'

export default function Home() {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [cityEvents, setCityEvents] = useState([])
  const [selectedCity, setSelectedCity] = useState('Oslo')

  useEffect(() => {
    const fetchFestivals = async () => {
      const urls = [
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Findings&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Neon&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Skeikampenfestivalen&locale=*&countryCode=NO`,
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=Tons%20of%20Rock&locale=*&countryCode=NO`
      ]

      try {
        const results = await Promise.all(
          urls.map(async (url) => {
            const res = await fetch(url)
            const data = await res.json()
            return data._embedded?.events?.[0] || null
          })
        )
        setFestivals(results.filter(Boolean))
      } catch {}
      finally {
        setLoading(false)
      }
    }

    fetchFestivals()
  }, [])

  useEffect(() => {
    fetchCityEvents(selectedCity)
  }, [selectedCity])

  const fetchCityEvents = async (city) => {
    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?city=${city}&size=10&apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
      )
      const data = await response.json()
      setCityEvents(data._embedded?.events || [])
    } catch {}
  }

  return (
    <main className="home">
      <div className="scrolling-text-container">
        <div className="scrolling-text-track">
          {Array(7).fill('Sommerens festivaler!').map((text, idx) => (
            <span key={idx}>{text} </span>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="home__loading">Laster festivaler…</p>
      ) : (
        <div className="home__festival-grid">
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

      <section className="home__cities">
        <h1 className="home__subheading">Hva skjer i verdens storbyer!</h1>

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

        <h2 className="home__city-title">Hva skjer i {selectedCity}</h2>

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
