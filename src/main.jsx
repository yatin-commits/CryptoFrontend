import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Footer from './Components/Footer.jsx'
import { UserProvider } from '../Context/UserContext.jsx'
import ContextProvider from '../Context/Context.jsx'

createRoot(document.getElementById('root')).render(
    <ContextProvider>
        <UserProvider>
            <App />
        </UserProvider>
        <Footer/>
    </ContextProvider> 
)
