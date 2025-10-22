import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SigninUserPage from './pages/signin/signinUser'
import SigninAdminPage from './pages/signin/signinAdmin'

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<SigninUserPage />} />
          <Route path='/admin/signin' element={<SigninAdminPage />}></Route>
        </Routes>
    </BrowserRouter>
  </StrictMode>,
)
