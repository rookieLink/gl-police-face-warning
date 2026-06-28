import { Routes, Route, Navigate } from 'react-router-dom'
import BasicLayout from './layouts/BasicLayout'
import Home from './pages/Home'
import User from './pages/User'
import Setting from './pages/Setting'
import Login from './pages/Login/Login'
import './App.scss'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<BasicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/dashboard/overview" element={<Home />} />
        <Route path="/dashboard/analysis" element={<Home />} />
        <Route path="/user" element={<Navigate to="/user/list" replace />} />
        <Route path="/user/list" element={<User />} />
        <Route path="/user/role" element={<User />} />
        <Route path="/user/permission" element={<User />} />
        <Route path="/content" element={<Navigate to="/content/article" replace />} />
        <Route path="/content/article" element={<Home />} />
        <Route path="/content/category" element={<Home />} />
        <Route path="/report" element={<Home />} />
        <Route path="/setting" element={<Setting />} />
      </Route>
    </Routes>
  )
}

export default App
