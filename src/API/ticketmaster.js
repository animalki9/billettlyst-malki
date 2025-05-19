// src/API/ticketmaster.js
import axios from 'axios'

const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/'

// Henter ett spesifikt arrangement per festivalnavn fra Norge.
// Bruker sessionStorage for å unngå unødvendige kall og CORS-feil.
// Kilde: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
export const fetchSpecificFestivals = async () => {
  const cached = sessionStorage.getItem('specific_festivals')
  if (cached) return JSON.parse(cached)

  const festivalNames = ['Findings', 'Neon', 'Skeikampenfestivalen', 'Tons of Rock']
  const results = []

  for (const name of festivalNames) {
    try {
      const res = await axios.get(`${BASE_URL}events.json`, {
        params: {
          apikey: API_KEY,
          keyword: name,
          countryCode: 'NO',
          size: 1,
        },
      })
      const event = res.data._embedded?.events?.[0]
      if (event) results.push(event)
    } catch (error) {
      console.error(`❌ Feil for ${name}:`, error)
    }
  }

  sessionStorage.setItem('specific_festivals', JSON.stringify(results))
  return results
}