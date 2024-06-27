import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import AboutUs from './pages/AboutUs';
import { AuthProvider } from './store/auth-context';

import Meetings from './pages/LoggedIn/Meetings';
import Organisations from './pages/LoggedIn/Organisations';
import Settings from './pages/LoggedIn/Settings';

import OrganisationPage from './pages/LoggedIn/OrganisationPage';

import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Layout>
          <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/sign-up' element={<SignUp />} />
              <Route path='/about' element={<AboutUs />} />
              <Route path='/meetings' element={<Meetings />} />
              <Route path='/organisations' element={<Organisations />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='/organisation/:name' element={<OrganisationPage />} />
              <Route path='*' element={<NotFoundPage />} /> 
          </Routes>
      </Layout>
      </AuthProvider>

  );
}

export default App;
