export default {
  name: 'event',
  type: 'document',
  title: 'Event',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Tittel'
    },
    {
      name: 'apiId',
      type: 'string',
      title: 'API ID'
    },
    {
      name: 'category',
      type: 'string',
      title: 'Kategori',
      options: {
        list: ['Festival', 'Sport', 'Show'],
        layout: 'dropdown'
      }
    }
  ]
}
