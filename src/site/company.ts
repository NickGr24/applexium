/**
 * Locale-invariant company identity, shown in the footer of every page and
 * on the trust page (2026-09 audit, item 7). Mirrors public/llms.txt and
 * the Organization JSON-LD; a change here should be made there too.
 */
export const LEGAL_ENTITY = {
  name: 'SCALELAW SOLUTIONS SRL',
  idno: '1025600064372',
  address: 'Mihai Viteazul 2a, Chișinău, Republica Moldova',
  email: 'info@applexium.com',
  phone: '+373 78 76 87 65',
} as const
