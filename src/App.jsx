// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EventPage from './pages/EventPage'
import CategoryPage from './pages/CategoryPage'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import SanityEventDetails from './pages/SanityEventDetails'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sanity-event/:id" element={<SanityEventDetails />} />
      </Routes>
    </Layout>
  )
}
