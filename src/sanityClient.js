// src/sanityClient.js
import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'quese9pr',   // ← hent fra sanity.config.ts
  dataset: 'production',
  apiVersion: '2023-01-01',      // eller dagens dato
  useCdn: true,
})
