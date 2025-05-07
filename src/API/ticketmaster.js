import axios from 'axios'

const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/'

export const fetchSpecificFestivals = async () => {
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

  return results
}
