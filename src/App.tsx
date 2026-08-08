import { Routes, Route, Navigate } from 'react-router-dom'
import BasicLayout from './layouts/BasicLayout'
import Home from './pages/Home'
import User from './pages/User'
import Setting from './pages/Setting'
import Login from './pages/Login/Login'
import WarningMap from './pages/WarningMap'
import HeatMap from './pages/HeatMap'
import Analysis from './pages/Analysis'
import DataAnalysis from './pages/DataAnalysis'
import DataList from './pages/DataList'
import FileUpload from './pages/FileUpload'
import Visualization from './pages/Visualization'
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
        <Route path="/warn" element={<User />} />
        <Route path="/user/permission" element={<User />} />
        <Route path="/warning-map" element={<WarningMap />} />
        <Route path="/heatmap" element={<HeatMap />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/data-analysis" element={<Navigate to="/data-analysis/list" replace />} />
        <Route path="/data-analysis/list" element={<DataAnalysis />} />
        <Route path="/data-analysis/upload" element={<FileUpload />} />
        <Route path="/data-analysis/data" element={<DataList />} />
        <Route path="/data-analysis/visualization" element={<Visualization />} />
        <Route path="/content" element={<Navigate to="/content/article" replace />} />
        <Route path="/content/article" element={<Home />} />
        <Route path="/content/category" element={<Home />} />
        <Route path="/report" element={<Home />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="*" element={<Navigate to="/warn" replace/>} />

      </Route>
    </Routes>
  )
}

export default App
