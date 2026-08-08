import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LevelPage } from './pages/LevelPage'
import { SectionPage } from './pages/SectionPage'
import { Layout } from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/level/:level" element={<LevelPage />} />
        <Route path="/section/:sectionId" element={<SectionPage />} />
      </Routes>
    </Layout>
  )
}
