import React from 'react'
import '../styles/cards.scss'

// Props:
// - venue: objekt med data om et spillested (fra Ticketmaster)
// - onToggle: funksjon som håndterer ønskeliste (legg til/fjern)
// - isWished: boolean som indikerer om venue er ønsket
export default function VenueCard({ venue, onToggle, isWished }) {
  // Bruker første tilgjengelige bilde, eller fallback-bilde om ingen finnes
  // Kilde til fallback: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const imageUrl = venue.images?.[0]?.url || '/fallback-venue.jpg'

  // Henter navn og lokasjonsdata
  const name = venue.name
  const city = venue.city?.name
  const country = venue.country?.name

  return (
    <article className="venue-card">
      {/* Viser bilde hvis tilgjengelig */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="venue-card__image"
        />
      )}

      {/* Navn på spillestedet */}
      <h3 className="venue-card__title">{name}</h3>

      {/* Viser by og land, hvis tilgjengelig */}
      {(city || country) && (
        <p className="venue-card__location">
          {city && country ? `${city}, ${country}` : city || country}
        </p>
      )}

      {/* Ønskeliste-knapp med visuell tilbakemelding */}
      <button
        onClick={() => onToggle(venue.id)}
        className={`wishlist-button ${isWished ? 'active' : ''}`}
      >
        {isWished ? '❤️' : '🤍'}
      </button>
    </article>
  )
}

