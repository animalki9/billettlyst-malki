// src/components/EventCard.jsx
// Komponent for å vise enkeltarrangement med ønskeliste-funksjon

import React from 'react'
import '../styles/cards.scss'

// Props:
// - event: objekt med data om arrangementet (fra Ticketmaster)
// - onToggle: funksjon som legger til/fjerner arrangementet fra ønskelisten
// - isWished: boolean som indikerer om eventet er ønsket
// - showHeart: boolean for å vise/skjule hjerteknapp (default: true)
export default function EventCard({ event, onToggle, isWished, showHeart = true, showButtons = true }) {
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

      {/* Hjerteknapp for ønskeliste (vises kun hvis showHeart er true og onToggle er definert) */}
      {showHeart && onToggle && (
        <button
        onClick={onToggle}
        className={`wishlist-button ${isWished ? 'active' : ''}`}
        >
          {isWished ? '❤️' : '🤍'}
        </button>
      )}

      {/* Vis knappene bare hvis showButtons = true */}
      {showButtons && (
        <div className="event-card__buttons">
          <span className="btn disabled">Kjøp</span>
          <span className="btn disabled">Legg til i ønskeliste</span>
        </div>
      )}
    </article>
  )
}