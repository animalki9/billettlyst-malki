import { useState, useEffect } from 'react'
import { sanity } from '../sanityClient'
import '../styles/dashboard.scss'

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('username') || ''
  })
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isLoggedIn && username) {
      fetchDashboardData()
    }
  }, [isLoggedIn, username])

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
    } catch {
      setError('Noe gikk galt under lasting av dashboard-data.')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (username.trim()) {
      try {
        const userExists = await sanity.fetch(
          `*[_type == "user" && name == $username][0]`,
          { username }
        )

        if (userExists) {
          setIsLoggedIn(true)
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('username', username)
          setError(null)
        } else {
          setError(`Fant ingen bruker med brukernavn "${username}".`)
          setIsLoggedIn(false)
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('username')
        }
      } catch {
        setError('Noe gikk galt under innlogging.')
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setUser(null)
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }

  if (!isLoggedIn) {
    return (
      <main className="dashboard">
        <h1 className="dashboard__heading">Dashboard – Logg inn</h1>
        <form onSubmit={handleLogin} className="dashboard__form">
          <label htmlFor="username" className="dashboard__label">
            Skriv brukernavn
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Animalki"
            className="dashboard__input"
          />
          <button type="submit" className="dashboard__button">Logg inn</button>
          {error && <p className="dashboard__error">{error}</p>}
        </form>
      </main>
    )
  }

  if (error) return <p className="dashboard__error">{error}</p>
  if (!user) return <p className="dashboard__loading">Laster dashboard...</p>

  // 🔒 Fjerner duplikater i ønskeliste og overlapp med kjøp
  const purchaseIds = new Set(user.previousPurchases?.map(p => String(p._id)))
  const seenWishlistIds = new Set()
  const filteredWishlist = user.wishlist?.filter(w => {
    const id = String(w._id)
    if (purchaseIds.has(id)) return false
    if (seenWishlistIds.has(id)) return false
    seenWishlistIds.add(id)
    return true
  })

  return (
    <main className="dashboard">
      <h1 className="dashboard__heading">Min side</h1>
      <button onClick={handleLogout} className="dashboard__logout">Logg ut</button>

      <div className="dashboard__wrapper">
        <div className="dashboard__layout">
          {/* VENSTRE: Profil */}
          <section className="dashboard__profile">
            <h2>{user.name}</h2>
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                className="dashboard__profile-img-large"
              />
            )}
            <p>{user.email}</p>
            <p>{user.dob}</p>
            <p>{user.gender}</p>
          </section>

          {/* HØYRE: Venner, ønskeliste og kjøp */}
          <div className="dashboard__right">
            <section className="dashboard__section">
              <h2>Venner</h2>
              {user.friends?.length > 0 ? (
                user.friends.map((friend) => {
                  const shared = friend.wishlist?.filter(e =>
                    user.wishlist?.some(own => own._id === e._id)
                  )
                  const isInPurchases = user.previousPurchases?.some(p =>
                    shared?.some(s => s._id === p._id)
                  )
                  return (
                    <div key={friend._id} className="dashboard__friend">
                      {friend.image && (
                        <img
                          src={friend.image}
                          alt={friend.name}
                          className="dashboard__friend-img"
                        />
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

            <section className="dashboard__section">
              <h2>Min ønskeliste</h2>
              {filteredWishlist?.length > 0 ? (
                filteredWishlist.map((event) => (
                  <div key={`wishlist-${event._id}-wl`} className="dashboard__event">
                    <p>{event.title}</p>
                    <a href={`/sanity-event/${event.apiId}`}>Se mer om dette ønsket</a>
                  </div>
                ))
              ) : (
                <p>Ingen ønskeliste.</p>
              )}
            </section>

            <section className="dashboard__section">
              <h2>Mine kjøp</h2>
              {user.previousPurchases?.length > 0 ? (
                user.previousPurchases.map((event) => (
                  <div key={`purchase-${event._id}-pp`} className="dashboard__event">
                    <p>{event.title}</p>
                    <a href={`/sanity-event/${event.apiId}`}>Se mer om dette kjøpet</a>
                  </div>
                ))
              ) : (
                <p>Ingen kjøp.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
