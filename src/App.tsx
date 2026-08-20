import { Routes, Route, Navigate } from 'react-router-dom'
import BasicLayout from './layouts/BasicLayout'
import Home from './pages/Home'
import Setting from './pages/Setting'
import Login from './pages/Login/Login'
import User from './pages/WarningControl/User'
import HeatMap from './pages/WarningControl/HeatMap'
import Analysis from './pages/WarningControl/Analysis'
import DataAnalysis from './pages/FileManagement/DataAnalysis'
import DataList from './pages/FileManagement/DataList'
import FileUpload from './pages/FileManagement/FileUpload'
import Visualization from './pages/FileManagement/Visualization'
import DataPreview from './pages/FileManagement/DataPreview'
import AlarmData from './pages/AlarmAnalysis/AlarmData'
import AlarmDataList from './pages/AlarmAnalysis/AlarmDataList'
import AlarmVisualization from './pages/AlarmAnalysis/AlarmVisualization'
import TeamQualityData from './pages/TeamQuality/TeamQualityData'
import TeamQualityVisualization from './pages/TeamQuality/TeamQualityVisualization'
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
        <Route path="/warn" element={<User />} />
        <Route path="/heatmap" element={<HeatMap />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/file-management" element={<Navigate to="/file-management/list" replace />} />
        <Route path="/file-management/list" element={<DataAnalysis />} />
        <Route path="/file-management/upload" element={<FileUpload />} />
        <Route path="/file-management/data" element={<DataList />} />
        <Route path="/file-management/visualization" element={<Visualization />} />
        <Route path="/file-management/preview" element={<DataPreview />} />
        <Route path="/alarm-analysis" element={<Navigate to="/alarm-analysis/data" replace />} />
        <Route path="/alarm-analysis/data" element={<AlarmData />} />
        <Route path="/alarm-analysis/detail" element={<AlarmDataList />} />
        <Route path="/alarm-analysis/visualization" element={<AlarmVisualization />} />
        <Route path="/team-quality" element={<Navigate to="/team-quality/data" replace />} />
        <Route path="/team-quality/data" element={<TeamQualityData />} />
        <Route path="/team-quality/analysis" element={<TeamQualityVisualization />} />
        <Route path="/team-quality/detail" element={<TeamQualityVisualization />} />
        <Route path="/team-quality/visualization" element={<TeamQualityVisualization />} />
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
