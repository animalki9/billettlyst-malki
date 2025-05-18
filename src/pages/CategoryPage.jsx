// Importerer nødvendige React hooks og komponenter for siden
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import VenueCard from '../components/VenueCard'
import EventCard from '../components/EventCard'
import '../styles/category.scss'


export default function CategoryPage() {
  // Henter slug fra URL (for eksempel "musikk" eller "sport")
  const { slug } = useParams()

  // Søke- og filterrelaterte tilstander
  const [search, setSearch] = useState('') // Søkeord
  const [selectedCountry, setSelectedCountry] = useState('') // Filtrering etter land
  const [selectedCity, setSelectedCity] = useState('') // Filtrering etter by
  const [selectedDate, setSelectedDate] = useState('') // Filtrering etter dato

  // Data for events, attraksjoner og spillesteder
  const [events, setEvents] = useState([])
  const [attractions, setAttractions] = useState([]) 
  const [venues, setVenues] = useState([])

  // Filtreringsvalg hentet fra event-data
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  // Ønskelister lagret lokalt (localStorage)
  const [eventWishlist, setEventWishlist] = useState({})
  const [attractionWishlist, setAttractionWishlist] = useState({})
  const [venueWishlist, setVenueWishlist] = useState({})

  // Oversetter URL-slug til keyword som passer Ticketmaster API
  // Brukes for å oversette norske URL-kategorier til engelsk keyword som API-et forstår.
  // Kilde: https://developer.mozilla.org/en-US/docs/Glossary/Slug
  const mapSlugToKeyword = (slug) => {
    switch (slug.toLowerCase()) {
      case 'musikk': return 'music'
      case 'sport': return 'sports'
      case 'teater-show': return 'theater'
      default: return slug
    }
  }

  // Henter ønskelister fra localStorage for å beholde favoritter mellom økter
  //(litt inspirasjon og ideer): https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

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

  // Henter ny data hver gang slug (kategori) endres
  useEffect(() => {
    fetchCategoryData()
  }, [slug])

  // Henter arrangementer, attraksjoner og spillesteder fra Ticketmaster Discovery API
  // Kilde: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/  
  const fetchCategoryData = async () => {
    try {
      const keyword = mapSlugToKeyword(slug)

      // Arrangement
      const eventRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=30`
      )
      
      const eventData = await eventRes.json()
      const fetchedEvents = eventData._embedded?.events || []
      setEvents(fetchedEvents)

      // Henter unike land og byer fra events for bruk i filter
      const foundCountries = fetchedEvents.map(e => e._embedded?.venues?.[0]?.country?.name).filter(Boolean)
      const foundCities = fetchedEvents.map(e => e._embedded?.venues?.[0]?.city?.name).filter(Boolean)
      setCountries([...new Set(foundCountries)].sort())
      setCities([...new Set(foundCities)].sort())

      // Atraksjoner
      const attractionRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/attractions.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=30`
      )
      const attractionData = await attractionRes.json()
      const rawAttractions = attractionData._embedded?.attractions || []
      enrichAttractionsWithEventData(rawAttractions)

      // Venue
      const venueRes = await fetch(
        `https://app.ticketmaster.com/discovery/v2/venues.json?apikey=${import.meta.env.VITE_TICKETMASTER_API_KEY}&keyword=${keyword}&size=30`
      )
      const venueData = await venueRes.json()
      setVenues(venueData._embedded?.venues || [])
    } catch {
    }
  }

  // Her legger jeg til ekstra info som dato, by og land til hver attraksjon,
  // ved å hente det fra første event som er knyttet til attraksjonen.
  // Kilde: Ticketmaster API + vanlig mønster kalt “enrichment” brukt for å gjøre data mer nyttig
  // https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2
  
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
  // Bruker type ('events', 'attractions' eller 'venues') for å vite hvilken liste som skal oppdateres.
  // Kombinerer ønskeliste-elementer og filtrerte elementer, uten duplikater.
  // Ønskelisten vises øverst.
  // Kilde: Unike verdier fra array med new Set – https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

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

  // Filterer arrangementer basert på søkeord, by, land og dato
  const filteredEvents = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? e._embedded?.venues?.[0]?.country?.name === selectedCountry : true
    const matchCity = selectedCity ? e._embedded?.venues?.[0]?.city?.name === selectedCity : true
    const matchDate = selectedDate ? e.dates?.start?.localDate === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  // Filterer attraksjoner basert på søkeord og enriched data (fra tilknyttet event)
  const filteredAttractions = attractions.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? a.country === selectedCountry : true
    const matchCity = selectedCity ? a.city === selectedCity : true
    const matchDate = selectedDate ? a.date === selectedDate : true
    return matchSearch && matchCountry && matchCity && matchDate
  })

  // Filterer spillesteder basert på navn, land og by
  const filteredVenues = venues.filter((v) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase())
    const matchCountry = selectedCountry ? v.country?.name === selectedCountry : true
    const matchCity = selectedCity ? v.city?.name === selectedCity : true
    return matchSearch && matchCountry && matchCity
  })

  // Brukes i ArrangementCard for å vise by og land til eventet, hvis tilgjengelig.

  const renderEventInfo = (event) => {
    const city = event._embedded?.venues?.[0]?.city?.name
    const country = event._embedded?.venues?.[0]?.country?.name
    return (city || country) && <p>{city && country ? `${city}, ${country}` : city || country}</p>
  }

  return (
    <main className="category-page">
      <h1>{slug.replace('-', ' ')}</h1>

      {/* FILTER- OG SØKESEKSJON */}
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

       {/* Attraksjoner */}
       <section>
          <h2>Attraksjoner</h2>
          <div className="card-grid">
            {[...Object.values(attractionWishlist), ...filteredAttractions.filter(a => !attractionWishlist[a.id])]
              .filter(a => a && a.name)
              .map((a) => (
                <EventCard
                  key={a.id}
                  event={{ name: a.name, images: a.images }}
                  isWished={!!attractionWishlist[a.id]}
                  onToggle={() => toggleWishlist(a, 'attractions')}
                  showButtons={false}
                  showHeart={true}
                  renderInfo={null}
                />
              ))}
          </div>
        </section>


      {/* Arangementer */}
      <section>
        <h2>Arrangementer</h2>
        <div className="card-grid">
          {[...Object.values(eventWishlist), ...filteredEvents.filter(e => !eventWishlist[e.id])]
            .filter(e => e && e.name && e.images?.[0]?.url)
            .map((e) => (
              <EventCard
                key={e.id}
                event={e}
                isWished={!!eventWishlist[e.id]}
                onToggle={() => toggleWishlist(e, 'events')}
                showButtons={false}
                showHeart={true}
                renderInfo={() => {
                  const city = e._embedded?.venues?.[0]?.city?.name
                  const country = e._embedded?.venues?.[0]?.country?.name
                  const date = e.dates?.start?.localDate
                  return (
                    <p>
                      {date ? `${date} – ` : ''}
                      {city && country ? `${city}, ${country}` : city || country || ''}
                    </p>

                  )
                }}
              />
            ))}
        </div>
      </section>

      {/* Spillsteder */}
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