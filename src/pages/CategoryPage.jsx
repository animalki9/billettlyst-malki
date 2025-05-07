// Import av nødvendige React-hooks og komponenter
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import AttractionCard from '../components/AttractionCard'
import VenueCard from '../components/VenueCard'
import ArrangementCard from '../components/ArrangementCard'
import '../styles/category.scss'

export default function CategoryPage() {
  const { slug } = useParams()

  const [search, setSearch] = useState('')
  const [events, setEvents] = useState([])
  const [attractions, setAttractions] = useState([])
  const [venues, setVenues] = useState([])
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const [eventWishlist, setEventWishlist] = useState({})
  const [attractionWishlist, setAttractionWishlist] = useState({})
  const [venueWishlist, setVenueWishlist] = useState({})

  const mapSlugToKeyword = (slug) => {
    switch (slug.toLowerCase()) {
      case 'musikk': return 'music'
      case 'sport': return 'sports'
      case 'teater-show': return 'theater'
      default: return slug
    }
  }

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

  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  const fetchCategoryData = async () => {
    try {
      const keyword = mapSlugToKeyword(slug)

      const eventRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const eventData = await eventRes.json()
      const fetchedEvents = eventData._embedded?.events || []
      setEvents(fetchedEvents)

      const foundCountries = fetchedEvents.map(e => e._embedded?.venues?.[0]?.country?.name).filter(Boolean)
      const foundCities = fetchedEvents.map(e => e._embedded?.venues?.[0]?.city?.name).filter(Boolean)
      setCountries([...new Set(foundCountries)].sort())
      setCities([...new Set(foundCities)].sort())

      const attractionRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const attractionData = await attractionRes.json()
      const rawAttractions = attractionData._embedded?.attractions || []
      enrichAttractionsWithEventData(rawAttractions)

      const venueRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=20`
      )
      const venueData = await venueRes.json()
      setVenues(venueData._embedded?.venues || [])

    } catch (error) {
      console.error('Feil ved henting av data:', error)
    }
  }

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
      delete updated[id]
    } else {
      updated[id] = item
    }

    localStorage.setItem(key, JSON.stringify(updated))
    setList(updated)
  }

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? e._embedded?.venues?.[0]?.country?.name === selectedCountry : true
    const matchCity = selectedCity ? e._embedded?.venues?.[0]?.city?.name === selectedCity : true
    const matchDate = selectedDate ? e.dates?.start?.localDate === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  const filteredAttractions = attractions.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? a.country === selectedCountry : true
    const matchCity = selectedCity ? a.city === selectedCity : true
    const matchDate = selectedDate ? a.date === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  const filteredVenues = venues.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? v.country?.name === selectedCountry : true
    const matchCity = selectedCity ? v.city?.name === selectedCity : true
    return matchSearch && matchCountry && matchCity
  })

  const renderEventInfo = (event) => {
    const city = event._embedded?.venues?.[0]?.city?.name
    const country = event._embedded?.venues?.[0]?.country?.name
    return (city || country) && <p>{city && country ? `${city}, ${country}` : city || country}</p>
  }

  return (
    <main className="category-page">
      <h1>{slug.replace('-', ' ')}</h1>

      <section className="filters">
        <h2>Filtrert søk</h2>
        <div className="filters__inputs">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
            <option value="">Velg et land</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option value="">Velg en by</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
          <button onClick={() => {
            setSelectedCountry('')
            setSelectedCity('')
            setSelectedDate('')
            setSearch('')
          }}>
            Nullstill filter
          </button>
        </div>

        <h2>Søk</h2>
        <input
          type="text"
          placeholder="Søk etter event, attraksjon eller spillested"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filters__search"
        />
      </section>
      
      <section>
        <h2>Attraksjoner</h2>
        <div className="card-grid">
          {[...Object.values(attractionWishlist), ...filteredAttractions.filter(a => !attractionWishlist[a.id])]
            .filter(attraction => attraction && attraction.name && attraction.images?.[0]?.url)
            .map((attraction) => (
              <div key={attraction.id} className="card">
                <AttractionCard
                  attraction={attraction}
                  onToggle={() => toggleWishlist(attraction, 'attractions')}
                  isWished={!!attractionWishlist[attraction.id]}
                />
              </div>
            ))}
        </div>
      </section>

      <section>
        <h2>Arrangementer</h2>
        <div className="card-grid">
          {[...Object.values(eventWishlist), ...filteredEvents.filter(e => !eventWishlist[e.id])]
            .filter(event => event && event.name && event.images?.[0]?.url)
            .map((event) => (
              <ArrangementCard
                key={event.id}
                event={event}
                isWishlisted={!!eventWishlist[event.id]}
                onToggleWishlist={toggleWishlist}
                renderInfo={renderEventInfo}
              />
            ))}
        </div>
      </section>


      <section>
        <h2>Spillesteder</h2>
        <div className="card-grid">
          {[...Object.values(venueWishlist), ...filteredVenues.filter(v => !venueWishlist[v.id])]
            .filter(venue => venue && venue.name && venue.images?.[0]?.url)
            .map((venue) => (
              <div key={venue.id} className="card">
                <VenueCard
                  venue={venue}
                  onToggle={() => toggleWishlist(venue, 'venues')}
                  isWished={!!venueWishlist[venue.id]}
                />
              </div>
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
