export default {
  name: 'user',
  type: 'document',
  title: 'User',
  fields: [
    { name: 'name', type: 'string', title: 'Navn' },
    { name: 'gender', type: 'string', title: 'Kjønn' },
    { name: 'dob', type: 'date', title: 'Fødselsdato' },
    {
      name: 'email',
      type: 'string',
      title: 'E-post',
      validation: (Rule) => Rule.email().error('Ugyldig e-postadresse'),
    },
    {
      name: 'profileImage',
      type: 'image',
      title: 'Profilbilde',
      options: { hotspot: true },
    },
    {
      name: 'previousPurchases',
      type: 'array',
      title: 'Tidligere kjøp',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
    },
    {
      name: 'wishlist',
      type: 'array',
      title: 'Ønskeliste',
      of: [{ type: 'reference', to: [{ type: 'event' }] }],
    },
    {
      name: 'friends',
      type: 'array',
      title: 'Venner',
      of: [{ type: 'reference', to: [{ type: 'user' }] }],
    },
  ],
}
