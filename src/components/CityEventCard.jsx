// Komponent som viser et arrangement (event) i byvisning, brukt i f.eks. "Hva skjer i {by}"
import '../styles/cards.scss'

export default function CityEventCard({ event }) {
  // Returnerer null hvis event ikke er definert – sikrer at komponenten ikke krasjer
  if (!event) return null;

  // Henter ut lokasjonsdata fra eventet (fra Ticketmaster API-struktur)
  const venue = event._embedded?.venues?.[0]
  const city = venue?.city?.name || 'Ukjent by'
  const country = venue?.country?.name || 'Ukjent land'
  const date = event.dates?.start?.localDate || 'Ukjent dato'
  const time = event.dates?.start?.localTime || 'Ukjent tid'
  const place = venue?.name || 'Ukjent spillested'

  return (
    <article className="city-card">
      {/* Viser bilde hvis det finnes i event-data */}
      {event.images?.[0]?.url && (
        <img
          src={event.images[0].url}
          alt={event.name}
          className="city-card__image"
        />
      )}

      {/* Viser tittel og nøkkelinformasjon om eventet */}
      <h3>{event.name}</h3>
      <p>{city}, {country}</p>
      <p>{date} – {time}</p>
      <p>{place}</p>
    </article>
  )
}
// --- KILDER / INSPIRASJON ---

// React dokumentasjon – funksjonelle komponenter og props:
// https://reactjs.org/docs/components-and-props.html

// Ticketmaster Discovery API – Events endpoint:
// https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2

// Betinget rendering i React (f.eks. bilde og fallbackverdier):
// https://reactjs.org/docs/conditional-rendering.html

// Håndtering av usikre objektstier (event._embedded?.venues?.[0]):
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

