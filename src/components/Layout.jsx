import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">{children}</main>
      <Footer />
    </div>
  )
}
