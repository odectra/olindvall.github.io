export type CountryCode = 'SE' | 'GB' | 'US' | 'ES' | 'BE' | 'CN' | 'NO';

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  SE: 'Sweden',
  GB: 'United Kingdom',
  US: 'USA',
  ES: 'Spain',
  BE: 'Belgium',
  CN: 'China',
  NO: 'Norway',
};

/** How a role connected to a country. Order here is display order. */
export type Involvement = 'based' | 'team' | 'visits' | 'customers';

export const INVOLVEMENTS: Involvement[] = ['based', 'team', 'visits', 'customers'];

export const INVOLVEMENT_LABELS: Record<Involvement, string> = {
  based: 'Based there',
  team: 'Led team members / direct reports there',
  visits: 'Business visits there',
  customers: 'Customers there',
};

/** Short labels for the legend under the Experience heading. */
export const INVOLVEMENT_SHORT: Record<Involvement, string> = {
  based: 'Based',
  team: 'Led team',
  visits: 'Business visits',
  customers: 'Customers',
};
