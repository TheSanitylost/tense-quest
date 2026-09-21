import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { MapPage } from './pages/Map'
import { LessonPage } from './pages/Lesson'
import { MissionPage } from './pages/Mission'
import { BossPage } from './pages/Boss'
import { ResultsPage } from './pages/Results'
import { SublevelsHubPage } from './pages/SublevelsHub'
import { SublevelSelectPage } from './pages/SublevelSelect'
import { SublevelRunPage } from './pages/SublevelRun'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/podpoziomy" element={<SublevelsHubPage />} />
        <Route path="/podpoziomy/:tenseId" element={<SublevelSelectPage />} />
        <Route path="/podpoziomy/:tenseId/:level" element={<SublevelRunPage />} />
        <Route path="/lekcja/:tenseId" element={<LessonPage />} />
        <Route path="/misja/:tenseId" element={<MissionPage />} />
        <Route path="/boss/:tenseId" element={<BossPage />} />
        <Route path="/wynik" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
