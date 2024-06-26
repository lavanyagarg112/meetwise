import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Home from './pages/Home';
import SignUp from './pages/SignUp';
import AboutUs from './pages/AboutUs';
import { AuthProvider } from './store/auth-context';

function App() {
  return (
    <AuthProvider>
      <Layout>
          <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/sign-up' element={<SignUp />} />
              <Route path='/about' element={<AboutUs />} />
          </Routes>
      </Layout>
      </AuthProvider>

  );
}

export default App;
