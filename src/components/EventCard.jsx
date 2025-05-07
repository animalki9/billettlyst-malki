// src/components/EventCard.jsx
// Komponent for å vise enkeltarrangement med ønskeliste-funksjon

import React from 'react'
import '../styles/cards.scss'

// Props:
// - event: objekt med data om arrangementet (fra Ticketmaster)
// - onToggle: funksjon som legger til/fjerner arrangementet fra ønskelisten
// - isWished: boolean som indikerer om eventet er ønsket (❤️ eller 🤍)
export default function EventCard({ event, onToggle, isWished }) {
  // Henter bilde med fallback dersom eventet mangler bilde
  const imageUrl = event.images?.[0]?.url || '/fallback-event.jpg'

  // Henter navn og dato fra eventdata
  const name = event.name
  const date = event.dates?.start?.localDate

  // Henter by og land fra venue-informasjon
  const city = event._embedded?.venues?.[0]?.city?.name
  const country = event._embedded?.venues?.[0]?.country?.name

  return (
    <article className="event-card">
      {/* Bilde av arrangementet */}
      <img
        src={imageUrl}
        alt={name}
        className="event-card__image"
      />

      {/* Tittel og dato */}
      <h3 className="event-card__title">{name}</h3>
      {date && <p className="event-card__date">{date}</p>}

      {/* Lokasjon (by og land hvis tilgjengelig) */}
      {(city || country) && (
        <p className="event-card__location">
          {city && country ? `${city}, ${country}` : city || country}
        </p>
      )}

      {/* Hjerteknapp for å vise ønskestatus og la brukeren klikke for å endre den */}
      <button
        onClick={() => onToggle(event.id)}
        className={`wishlist-button ${isWished ? 'active' : ''}`}
      >
        {isWished ? '❤️' : '🤍'}
      </button>
      <div className="event-card__buttons">
        <span className="btn disabled">Kjøp</span>
        <span className="btn disabled">Legg til i ønskeliste</span>
      </div>
    </article>
  )
}
// --- KILDER / INSPIRASJON ---

// React dokumentasjon – funksjonelle komponenter og props:
// https://reactjs.org/docs/components-and-props.html

// Ticketmaster Discovery API – Event response struktur:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2

// Bruk av optional chaining (?.) i JavaScript:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

// Betinget rendering i React (f.eks. vis kun hvis dato eller bilde finnes):
// https://reactjs.org/docs/conditional-rendering.html

// Eksempel på ønskeliste med hjerteknapp:
// https://uxdesign.cc/the-heart-button-a-love-hate-relationship-in-ux-design-2964572e6f4d

