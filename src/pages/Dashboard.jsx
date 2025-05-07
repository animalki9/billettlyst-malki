// Importerer nødvendige React-hooks og klient for Sanity CMS
import { useState, useEffect } from 'react'
import { sanity } from '../sanityClient'
import '../styles/dashboard.scss'

export default function Dashboard() {
  // Tilstand for innloggingsstatus og brukernavn, initialisert fra localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || ''
  })

  // Tilstand for brukerdetaljer og eventuelle feilmeldinger
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  // Henter brukerdata fra Sanity når bruker er innlogget og brukernavn finnes
  useEffect(() => {
    if (isLoggedIn && username) {
      fetchDashboardData()
    }
  }, [isLoggedIn, username])

  // Spørring til Sanity for å hente all brukerdata
  const fetchDashboardData = async () => {
    try {
      const userData = await sanity.fetch(
        `*[_type == "user" && name == $username][0]{
          _id,
          name,
          email,
          dob,
          gender,
          "image": profileImage.asset->url,
          wishlist[]-> { _id, title, apiId },
          previousPurchases[]-> { _id, title, apiId },
          friends[]-> {
            _id,
            name,
            "image": profileImage.asset->url,
            wishlist[]-> { _id, title, apiId }
          }
        }`,
        { username }
      )

      if (!userData) {
        setError(`Fant ingen bruker med brukernavn "${username}".`)
      } else {
        setUser(userData)
        setError(null)
      }
    } catch (err) {
      console.error('Feil ved henting fra Sanity:', err)
      setError('Noe gikk galt under lasting av dashboard-data.')
    }
  }

  // Håndterer innlogging: oppdaterer state og lagrer i localStorage
  const handleLogin = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setIsLoggedIn(true)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
    }
  }

  // Håndterer utlogging: nullstiller all brukerdata og fjerner fra localStorage
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }

  // Viser innloggingsskjema dersom bruker ikke er innlogget
  if (!isLoggedIn) {
    return (
      <main className="dashboard">
        <h1 className="dashboard__heading">Dashboard - Logg inn</h1>
        <form onSubmit={handleLogin} className="dashboard__form">
          <label htmlFor="username" className="dashboard__label">Skriv brukernavn</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Animalki"
            className="dashboard__input"
          />
          <button type="submit" className="dashboard__button">Logg inn</button>
        </form>
      </main>
    )
  }

  // Viser feilmelding dersom henting av brukerdata feiler
  if (error) return <p className="dashboard__error">{error}</p>

  // Viser lastemelding mens brukerdata hentes
  if (!user) return <p className="dashboard__loading">Laster dashboard...</p>

  // Viser innhold når bruker er innlogget og data er hentet
  return (
    <main className="dashboard">
      <h1 className="dashboard__heading">Min side</h1>
      <button onClick={handleLogout} className="dashboard__logout">Logg ut</button>

      <div className="dashboard__wrapper">
        <div className="dashboard__layout">
          {/* Profilseksjon (venstre kolonne) */}
          <section className="dashboard__profile">
            <h2>{user.name}</h2>
            {user.image && (
              <img src={user.image} alt={user.name} className="dashboard__profile-img-large" />
            )}
            <p>{user.email}</p>
            <p>{user.dob}</p>
            <p>{user.gender}</p>
          </section>

          {/* Høyre kolonne med venner, kjøp og ønskeliste */}
          <div className="dashboard__right">
            {/* Venneliste med sjekk for felles ønsker */}
            <section className="dashboard__section">
              <h2>Venner</h2>
              {user.friends?.length > 0 ? (
                user.friends.map((friend) => {
                  // Finner felles arrangementer kun i ønskelista
                  const shared = friend.wishlist?.filter(e =>
                    user.wishlist?.some(own => own._id === e._id)
                  )

                  // Sjekker at de ikke har kjøpt det
                  const isInPurchases = user.previousPurchases?.some(p =>
                    shared?.some(s => s._id === p._id)
                  )

                  // Kun vis om det er i ønskeliste og ikke kjøpt
                  return (
                    <div key={friend._id} className="dashboard__friend">
                      {friend.image && (
                        <img src={friend.image} alt={friend.name} className="dashboard__friend-img" />
                      )}
                      <p className="dashboard__friend-name">{friend.name}</p>
                      {shared?.length > 0 && !isInPurchases && (
                        <p className="dashboard__shared-msg">
                          Du og {friend.name} ønsker begge å dra på <strong>{shared[0].title}</strong>, hva med å dra sammen?
                        </p>
                      )}
                    </div>
                  )
                })
              ) : (
                <p>Ingen venner funnet.</p>
              )}

            </section>

            {/* Tidligere kjøp (lenker til detaljerte arrangementssider) */}
            <section className="dashboard__section">
              <h2>Min kjøp</h2>
              {user.previousPurchases?.length > 0 ? (
                user.previousPurchases.map((event) => (
                  <div key={event._id} className="dashboard__event">
                    <p>{event.title}</p>
                    <a href={`/sanity-event/${event.apiId}`}>Se mer om dette kjøpet</a>
                  </div>
                ))
              ) : (
                <p>Ingen kjøp.</p>
              )}
            </section>

            {/* Ønskeliste med arrangementer brukeren er interessert i */}
            <section className="dashboard__section">
              <h2>Min ønskeliste</h2>
              {user.wishlist?.length > 0 ? (
                user.wishlist.map((event) => (
                  <div key={event._id} className="dashboard__event">
                    <p>{event.title}</p>
                    <a href={`/sanity-event/${event.apiId}`}>Se mer om dette kjøpet</a>
                  </div>
                ))
              ) : (
                <p>Ingen ønskeliste.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
// --- KILDER / INSPIRASJON ---

// React Hooks (useState, useEffect):
// https://reactjs.org/docs/hooks-reference.html

// localStorage for lagring av innloggingsstatus:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

// Sanity CMS: henting av data via GROQ-spørringer:
// https://www.sanity.io/docs/query-cheat-sheet
// https://www.sanity.io/docs/how-queries-work

// JavaScript async/await og fetch:
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// https://javascript.info/async-await

// Dynamisk visning med betinget rendering i React:
// https://reactjs.org/docs/conditional-rendering.html
