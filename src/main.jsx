import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { purgeLegacyLearningKeys } from './lib/userScope'

// 사용자 구분 없던 구 형식 학습 상태 키를 앱 시작 시 1회 삭제(계정 전환 시 이전 계정 상태 노출 방지).
purgeLegacyLearningKeys()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
