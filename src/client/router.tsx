import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AppV2 from './AppV2.tsx'
import AdminMain from './components/AdminMain'
import AdminPage from './components/AdminPage.tsx'
import CoursesPage from './components/CoursesPage.tsx'
import LoginAsPage from './components/LoginAsPage.tsx'
import RootMain from './components/RootMain'
import StatsPage from './components/admin/StatsPage.tsx'
import UserFeedbackPage from './components/admin/UserFeedbackPage.tsx'

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootMain />}>
          <Route index element={<AppV2 />} />
         
        </Route>
        <Route path="/admin" element={<AdminMain />}>
          <Route index element={<AdminPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="login-as" element={<LoginAsPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="feedback" element={<UserFeedbackPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouter