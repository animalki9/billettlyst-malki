// src/components/AttractionCard.jsx
// Komponent som viser én attraksjon i kortvisning med ønskeliste-funksjon

import React from 'react'
import '../styles/cards.scss'

// Props:
// - attraction: objekt med attraksjonsdata fra Ticketmaster
// - onToggle: funksjon som håndterer ønskeliste-til/fra
// - isWished: boolean som sier om attraksjonen er ønsket
export default function AttractionCard({ attraction, onToggle, isWished }) {
  // Navn på attraksjonen
  const name = attraction.name

  // Bruker første tilgjengelige bilde, eller fallback om det mangler
  const imageUrl = attraction.images?.[0]?.url || '/fallback-attraction.jpg'

  return (
    <article className="attraction-card">
      {/* Bildevisning */}
      <img
        src={imageUrl}
        alt={name}
        className="attraction-card__image"
      />

      {/* Tittel */}
      <h3 className="attraction-card__title">{name}</h3>

      {/* Hjerteknapp for ønskeliste-funksjonalitet */}
      <button
        onClick={() => onToggle(attraction.id)}
        className={`wishlist-button ${isWished ? 'active' : ''}`}
      >
        {isWished ? '❤️' : '🤍'}
      </button>
    </article>
  )
}
// --- KILDER / INSPIRASJON ---

// React dokumentasjon – komponenter, props og betinget rendering:
// https://reactjs.org/docs/components-and-props.html
// https://reactjs.org/docs/conditional-rendering.html

// Ticketmaster Discovery API – Attraction response struktur:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-attractions-v2

// Best practice for fallback-bilder og håndtering av tomme verdier:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement

