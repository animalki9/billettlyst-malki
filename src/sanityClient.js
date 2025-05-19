import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: 'quese9pr',
  dataset: 'production',
  apiVersion: '2023-01-01',   
  useCdn: true,
})
