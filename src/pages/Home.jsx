import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EventCard from '../components/EventCard'
import '../styles/home.scss'
import '../styles/cards.scss'

export default function Home() {
  // Tilstand for festivaler og lastestatus
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)

  // Tilstand for dynamisk storbyseksjon
  const [exploreCity, setExploreCity] = useState('Berlin') // Starter med Berlin
  const [exploreEvents, setExploreEvents] = useState([])

  // useEffect som henter festivaler fra Norge basert på forhåndsdefinerte søkeord
  useEffect(() => {
    const fetchFestivals = async () => {
      const urls = [
        // Hver URL henter ett spesifikt festivalnavn fra Ticketmaster i Norge
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
            // Henter kun det første eventet fra hver festival-søk for å unngå duplikater og forenkle visningen.
            // Alternativt kunne man vist flere events per festival, men det ville gitt et mer uoversiktlig grid.            
            // KILDE: Ticketmaster API-struktur – https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
            return data._embedded?.events?.[0] || null 
          })
        )
        // Fjerner alle null-verdier fra arrayen
        // KILDE: https://stackoverflow.com/a/43182073 (bruk av filter(Boolean))
        setFestivals(results.filter(Boolean))
      } catch {} 
      finally {
        setLoading(false) // Uansett resultat, avslutt loading
      }
    }

    fetchFestivals()
  }, [])

  // useEffect som henter arrangementer fra valgt by (exploreCity)
  useEffect(() => {
    const fetchExploreEvents = async () => {
      try {
        const res = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?city=${exploreCity}&size=10&apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}`
        )
        const data = await res.json()
        setExploreEvents(data._embedded?.events || []) // Lagrer eventene eller tom liste
      } catch (err) {
      // Feilhåndtering utelatt her, men kunne vært utvidet for å vise feilmelding til bruker
        }
    }
  
    fetchExploreEvents()
  }, [exploreCity]) // Kjøres hver gang exploreCity endres

  return (
    <main className="home">
      {/* Skrollende tekst øverst på siden for visuell effekt */}
      <div className="scrolling-text-container">
        <div className="scrolling-text-track">
          {Array(7).fill('Sommerens festivaler!').map((text, idx) => (
            <span key={idx}>{text} </span>
          ))}
          {/* Skrollende tekst inspirert av CSS Tricks – https://css-tricks.com/infinite-all-css-scrolling-slideshow/ */}
        </div>
      </div>

      {/* Viser spinner/tekst hvis festivalene lastes inn */}
      {loading ? (
        <p className="home__loading">Laster festivaler…</p>
      ) : (
        <div className="home__festival-grid">
          {festivals.map((festival) => (
            <article key={festival.id} className="festival-card">
              {/* Viser festivalbilde hvis det finnes */}
              {festival.images?.[0]?.url && (
                <img
                  src={festival.images[0].url}
                  alt={festival.name}
                  className="festival-card__image"
                />
              )}
              <h2 className="festival-card__title">{festival.name}</h2>
              {/* Lenke til detaljside for festivalen */}
              <Link to={`/event/${festival.id}`} className="festival-card__link">
                Les mer om {festival.name}
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Dynamisk seksjon for å utforske arrangementer i storbyer */}
      <section className="home__explore">
        <h1 className="home__subheading">Utforsk arrangementer i kjente storbyer</h1>

        {/* By-knapper – når en knapp trykkes hentes arrangementer for den byen */}
        <div className="home__city-buttons">
          {['Oslo', 'Stockholm', 'Berlin', 'London', 'Paris'].map((city) => (
            <button
              key={city}
              onClick={() => setExploreCity(city)}
              className={`home__city-button ${city === exploreCity ? 'active' : ''}`}

            >
              {city}
            </button>
          ))}
        </div>

        {/* Overskrift som oppdateres etter valgt by */}
        <h2 className="home__city-title">I {exploreCity} kan du oppleve:</h2>

        {/* Grid med arrangementer fra valgt by – viser EventCard-komponenter uten interaktivitet */}
        <div className="home__event-grid">
          {exploreEvents.map((event) => (
            <EventCard 
            key={event.id} 
            event={event} 
            showHeart={false}
            showButtons={false} 
            />
          ))}
          {/* Bruk av props for å styre visning av hjerteikon og handlingsknapper i gjenbrukt komponent.
            Kilde: React – Passing props to a component
            https://react.dev/learn/passing-props-to-a-component */}
        </div>
      </section>
    </main>
  )
}
