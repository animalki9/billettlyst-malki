// Import av nødvendige stilark og React
import '../styles/category.scss'
import '../styles/cards.scss'
import React from 'react'

// Funksjonell komponent som viser et enkelt arrangementskort
export default function ArrangementCard({ event, isWishlisted, onToggleWishlist, renderInfo }) {
  // Returnerer null dersom event mangler nødvendig data
  if (!event || !event.name || !event.images?.[0]?.url) return null

  // Henter dato for arrangementet, dersom tilgjengelig
  const date = event.dates?.start?.localDate

  return (
    <div className="card">
      {/* Viser bilde av arrangementet */}
      <img
        src={event.images[0].url}
        alt={event.name}
        className="card__image"
      />

      {/* Navn og dato for arrangementet */}
      <h3>{event.name}</h3>
      {date && <p>{date}</p>}

      {/* Ekstra informasjon som by/land, levert via ekstern render-funksjon */}
      {renderInfo && renderInfo(event)}

      {/* Ønskeliste-knapp med visuell tilbakemelding */}
      <button
        onClick={() => onToggleWishlist(event, 'events')}
        className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
      >
        {isWishlisted ? '❤️' : '🤍'}
      </button>
    </div>
  )
}
// --- KILDER / INSPIRASJON ---

// React – Component Props og betinget rendering:
// https://reactjs.org/docs/components-and-props.html
// https://reactjs.org/docs/conditional-rendering.html

// Ticketmaster Discovery API - Event JSON struktur:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2

// Bruk av CSS Modules / SCSS for styling React-komponenter:
// https://sass-lang.com/guide

