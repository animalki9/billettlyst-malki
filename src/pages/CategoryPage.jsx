// Importerer nødvendige React hooks og komponenter for siden
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AttractionCard from '../components/AttractionCard'
import VenueCard from '../components/VenueCard'
import ArrangementCard from '../components/ArrangementCard'
import '../styles/category.scss' // CSS for utseendet til siden

export default function CategoryPage() {
  // Henter slug fra URL (for eksempel "musikk" eller "sport")
  const { slug } = useParams()

  // Søke- og filterrelaterte tilstander
  const [search, setSearch] = useState('') // Søkeord
  const [selectedCountry, setSelectedCountry] = useState('') // Filtrering etter land
  const [selectedCity, setSelectedCity] = useState('') // Filtrering etter by
  const [selectedDate, setSelectedDate] = useState('') // Filtrering etter dato

  // Rådata for tre ulike kategorier fra API
  const [events, setEvents] = useState([]) // Arrangementer
  const [attractions, setAttractions] = useState([]) // Artister/personer
  const [venues, setVenues] = useState([]) // Spillesteder

  // Unike alternativer for land og by brukt i dropdown-filtre
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  // Brukerens ønskelister – lokal lagring av favoritter
  const [eventWishlist, setEventWishlist] = useState({})
  const [attractionWishlist, setAttractionWishlist] = useState({})
  const [venueWishlist, setVenueWishlist] = useState({})

  // Konverterer norsk kategori til engelsk keyword for API-søk
  const mapSlugToKeyword = (slug) => {
    switch (slug.toLowerCase()) {
      case 'musikk': return 'music'
      case 'sport': return 'sports'
      case 'teater-show': return 'theater'
      default: return slug
    }
  }

  // Henter ønskelister fra localStorage (bevarer favoritter mellom økter)
  useEffect(() => {
    const getMap = (key) => {
      try {
        const saved = localStorage.getItem(key)
        return saved ? JSON.parse(saved) : {}
      } catch {
        return {}
      }
    }
    setEventWishlist(getMap('wishlist_events'))
    setAttractionWishlist(getMap('wishlist_attractions'))
    setVenueWishlist(getMap('wishlist_venues'))
  }, [slug])

  // Henter data når komponenten rendres første gang eller slug endres
  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  // Henter alle tre datatyper fra Ticketmaster API
  const fetchCategoryData = async () => {
    try {
      const keyword = mapSlugToKeyword(slug)

      // === EVENTS ===
      const eventRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const eventData = await eventRes.json()
      const fetchedEvents = eventData._embedded?.events || []
      setEvents(fetchedEvents)

      // Ekstraher unike land og byer for filtrering
      const foundCountries = fetchedEvents.map(e => e._embedded?.venues?.[0]?.country?.name).filter(Boolean)
      const foundCities = fetchedEvents.map(e => e._embedded?.venues?.[0]?.city?.name).filter(Boolean)
      setCountries([...new Set(foundCountries)].sort()) // Fjerner duplikater
      setCities([...new Set(foundCities)].sort())

      // === ATTRACTIONS ===
      const attractionRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const attractionData = await attractionRes.json()
      const rawAttractions = attractionData._embedded?.attractions || []
      enrichAttractionsWithEventData(rawAttractions) // Legg til sted og dato

      // === VENUES ===
      const venueRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const venueData = await venueRes.json()
      setVenues(venueData._embedded?.venues || [])
    } catch (err) {
      console.error('⚠️ Feil under datainnhenting:', err)
    }
  }

  // Enricher attraksjoner med event-relatert info som by og dato
  const enrichAttractionsWithEventData = async (rawAttractions) => {
    const enriched = await Promise.all(
      rawAttractions.map(async (a) => {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&attractionId=${a.id}&size=1`
          )
          const data = await res.json()
          const event = data._embedded?.events?.[0]
          const venue = event?._embedded?.venues?.[0]
          return {
            ...a,
            city: venue?.city?.name || '',
            country: venue?.country?.name || '',
            date: event?.dates?.start?.localDate || '',
          }
        } catch {
          return { ...a, city: '', country: '', date: '' }
        }
      })
    )
    setAttractions(enriched)
  }

  // Legg til/fjern element fra ønskeliste og oppdater localStorage
  const toggleWishlist = (item, type) => {
    const config = {
      events: [eventWishlist, setEventWishlist, 'wishlist_events'],
      attractions: [attractionWishlist, setAttractionWishlist, 'wishlist_attractions'],
      venues: [venueWishlist, setVenueWishlist, 'wishlist_venues']
    }

    const [list, setList, key] = config[type]
    const id = item.id
    const updated = { ...list }

    if (updated[id]) {
      delete updated[id] // Fjern
    } else {
      updated[id] = item // Legg til
    }

    localStorage.setItem(key, JSON.stringify(updated))
    setList(updated)
  }

  // === FILTERING ===
  // Arrangementer
  const filteredEvents = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? e._embedded?.venues?.[0]?.country?.name === selectedCountry : true
    const matchCity = selectedCity ? e._embedded?.venues?.[0]?.city?.name === selectedCity : true
    const matchDate = selectedDate ? e.dates?.start?.localDate === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  // Attraksjoner
  const filteredAttractions = attractions.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? a.country === selectedCountry : true
    const matchCity = selectedCity ? a.city === selectedCity : true
    const matchDate = selectedDate ? a.date === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  // Spillesteder
  const filteredVenues = venues.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? v.country?.name === selectedCountry : true
    const matchCity = selectedCity ? v.city?.name === selectedCity : true
    return matchSearch && matchCountry && matchCity
  })

  // Viser by og land i ArrangementCard-komponenten
  const renderEventInfo = (event) => {
    const city = event._embedded?.venues?.[0]?.city?.name
    const country = event._embedded?.venues?.[0]?.country?.name
    return (city || country) && <p>{city && country ? `${city}, ${country}` : city || country}</p>
  }

  return (
    <main className="category-page">
      <h1>{slug.replace('-', ' ')}</h1>

      {/* === FILTER- OG SØKESEKSJON === */}
      <section className="filters">
        <h2>Filtrert søk</h2>
        <div className="filters__inputs">
          {/* Dato */}
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

          {/* Land */}
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="">Velg et land</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>

          {/* By */}
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">Velg en by</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>

          {/* Nullstill */}
          <button onClick={() => {
            setSelectedCountry('')
            setSelectedCity('')
            setSelectedDate('')
            setSearch('')
          }}>
            Nullstill filter
          </button>
        </div>

        {/* Søkeinput */}
        <h2>Søk</h2>
        <input
          type="text"
          placeholder="Søk etter event, attraksjon eller spillested"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filters__search"
        />
      </section>

      {/* === ATTRAKSJONER === */}
      <section>
        <h2>Attraksjoner</h2>
        <div className="card-grid">
          {/* Vis ønskeliste først, deretter filtrerte */}
          {[...Object.values(attractionWishlist), ...filteredAttractions.filter(a => !attractionWishlist[a.id])]
            .filter(a => a && a.name && a.images?.[0]?.url)
            .map((a) => (
              <AttractionCard
                key={a.id}
                attraction={a}
                onToggle={() => toggleWishlist(a, 'attractions')}
                isWished={!!attractionWishlist[a.id]}
              />
            ))}
        </div>
      </section>

      {/* === ARRANGEMENTER === */}
      <section>
        <h2>Arrangementer</h2>
        <div className="card-grid">
          {[...Object.values(eventWishlist), ...filteredEvents.filter(e => !eventWishlist[e.id])]
            .filter(e => e && e.name && e.images?.[0]?.url)
            .map((e) => (
              <ArrangementCard
                key={e.id}
                event={e}
                isWishlisted={!!eventWishlist[e.id]}
                onToggleWishlist={toggleWishlist}
                renderInfo={renderEventInfo}
              />
            ))}
        </div>
      </section>

      {/* === SPILLESTEDER === */}
      <section>
        <h2>Spillesteder</h2>
        <div className="card-grid">
          {[...Object.values(venueWishlist), ...filteredVenues.filter(v => !venueWishlist[v.id])]
            .filter(v => v && v.name && v.images?.[0]?.url)
            .map((v) => (
              <VenueCard
                key={v.id}
                venue={v}
                onToggle={() => toggleWishlist(v, 'venues')}
                isWished={!!venueWishlist[v.id]}
              />
            ))}
        </div>
      </section>
    </main>
  )
}
// --- KILDER / INSPIRASJON ---

// React Hooks og Routing
// https://reactjs.org/docs/hooks-reference.html
// https://reactrouter.com/en/main/hooks/use-params

// localStorage i nettleseren
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// Fetch API og async/await
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://javascript.info/async-await

// Ticketmaster Discovery API
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

// Array-metoder for filtrering og visning
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

// React komponentstruktur og gjenbruk
// https://reactjs.org/docs/thinking-in-react.html
// Funksjon som beriker hver attraksjon med by, land og dato ved å hente et relatert event
// Bruker Promise.all for å håndtere flere async fetch-kall parallelt
// 📚 Kilder:
// - Promise.all: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
// - fetch API: https://developer.mozilla.org/en-US/docs/Web/API/fetch
// - async/await: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// - Ticketmaster Discovery API (attractionId): https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2
