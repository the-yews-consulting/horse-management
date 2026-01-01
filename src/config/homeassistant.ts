// Home Assistant Configuration
// Set your Home Assistant URL and Long-Lived Access Token here
// These values will be used if not overridden by localStorage

export const HOME_ASSISTANT_CONFIG = {
  // Your Home Assistant URL (e.g., 'http://homeassistant.local:8123' or 'https://your-ha-instance.duckdns.org')
  url: 'https://ubijd9zvct3uaenhmtl4xihltxgk8bo8.ui.nabu.casa',

  // Your Home Assistant Long-Lived Access Token
  // Generate one at: Profile → Security → Long-Lived Access Tokens
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4OWNkMTJhZDdjMmU0MDc0YTc2ZDg2ODM1NzQ2OGQzMCIsImlhdCI6MTc2NzIzMzY0OSwiZXhwIjoyMDgyNTkzNjQ5fQ.BxGsLdwOmhzklOSbBavFQOU681VaT3um7qZ0x1sRMyo',
} as const;

// Storage keys for localStorage
export const STORAGE_KEYS = {
  HA_URL: 'ha_url',
  HA_TOKEN: 'ha_token',
} as const;
