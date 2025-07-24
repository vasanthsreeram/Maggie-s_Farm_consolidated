// export const API_URL= 'http://192.168.1.75:4545'
// export const API_URL= 'https://clicmfapi.azurewebsites.net'
// export const API_URL='http://localhost:8080'

// Use environment-based API URL with fallback logic
// If running on localhost in dev mode, use port 8092
// If running on localhost in production, use port 8080
// If running on Azure, use the current origin
// Otherwise, use environment variable or localhost fallback
export const API_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8092' : 'http://localhost:8080') : 
    window.location.origin)
