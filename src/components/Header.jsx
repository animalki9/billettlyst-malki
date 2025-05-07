// Header.jsx
// Komponent for visning av toppnavigasjon med logo, meny og innloggingsstatus

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/layout.scss'

export default function Header() {
  // Tilstand for å holde styr på om brukeren er logget inn
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Ved lasting av komponenten: leser lagret innloggingsstatus fra localStorage
  useEffect(() => {
    const storedStatus = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(storedStatus)
  }, [])

  return (
    <header className="header">
      {/* Logo med link til forsiden */}
      <div className="header__logo">
        <Link to="/"><strong>Billett</strong>Lyst</Link>
      </div>

      {/* Navigasjonsmeny med tre kategorilenker */}
      <nav className="header__nav">
        <Link to="/category/musikk">Musikk</Link>
        <Link to="/category/sport">Sport</Link>
        <Link to="/category/teater-show">Teater/Show</Link>
      </nav>

      {/* Link til brukerens dashboard eller innloggingsside, avhengig av status */}
      <div className="header__auth">
        <Link to="/dashboard">{isLoggedIn ? 'Min side' : 'Logg inn'}</Link>
      </div>
    </header>
  )
}
// --- KILDER / INSPIRASJON ---

// React dokumentasjon: useState og useEffect hooks:
// https://reactjs.org/docs/hooks-state.html
// https://reactjs.org/docs/hooks-effect.html

// React Router DOM: Link-komponent for navigasjon:
// https://reactrouter.com/en/main/components/link

// Lagring og henting fra localStorage i nettleseren:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// BEM-navngivning (Block-Element-Modifier) brukt i CSS-klassenavn:
// https://getbem.com/naming/

// Inspirasjon til responsiv header:
// https://css-tricks.com/snippets/css/a-guide-to-flexbox/

