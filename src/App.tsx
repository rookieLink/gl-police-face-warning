import { Routes, Route } from 'react-router-dom'
import BasicLayout from './layouts/BasicLayout'
import Home from './pages/Home'
import User from './pages/User'
import Setting from './pages/Setting'
import './App.scss'

function App() {
  return (
    <Routes>
      <Route element={<BasicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
        <Route path="/setting" element={<Setting />} />
      </Route>
    </Routes>
  )
}

export default App
