import AuthProvider from './context/AuthContextProvider.jsx'
import { useAuth } from './context/useAuth.js'
import Login from './components/Login/Login.jsx'
import Chat from './components/Chat/Chat.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { hfToken } = useAuth()
  return hfToken ? <Chat /> : <Login />
}

export default App
