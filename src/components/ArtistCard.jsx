// Komponent som viser artistinformasjon i et kortformat
import React from 'react'
import '../styles/cards.scss'

// Props:
// - artist: objekt med artistdata fra Ticketmaster
// - onToggle: funksjon for å legge til/fjerne fra ønskeliste
// - isWished: boolean som indikerer om artisten er ønsket
// - showHeart: boolean for å vise/skjule hjerte-knappen
export default function ArtistCard({ artist, onToggle, isWished, showHeart = true }) {
  // Bruker fallback-bilde dersom ingen bilde er tilgjengelig
  const imageUrl = artist.images?.[0]?.url || '/fallback-artist.jpg'

  // Henter artistens navn og sjanger (hvis tilgjengelig)
  const name = artist.name
  const genre = artist.classifications?.[0]?.genre?.name

  return (
    <article className="artist-card">
      {/* Viser bilde av artisten */}
      <img
        src={imageUrl}
        alt={name}
        className="artist-card__image"
      />

      {/* Artistnavn og eventuell sjanger */}
      <h3 className="artist-card__title">{name}</h3>
      {genre && <p className="artist-card__genre">{genre}</p>}

      {/* Betinget rendering av hjerte-knapp basert på showHeart-prop */}
      {showHeart && (
        <button
          onClick={() => onToggle(artist.id)}
          className={`wishlist-button ${isWished ? 'active' : ''}`}
        >
          {isWished ? '❤️' : '🤍'}
        </button>
      )}
    </article>
  )
}

// --- KILDER / INSPIRASJON ---

// React – Props og betinget rendering av elementer:
// https://reactjs.org/docs/components-and-props.html
// https://reactjs.org/docs/conditional-rendering.html

// Ticketmaster Discovery API – Attraction / Artist JSON struktur:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-attractions-v2

// Bruk av fallback-bilder i React:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement