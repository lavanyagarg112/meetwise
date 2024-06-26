import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'

import Card from '../ui/Card'

import classes from './SignUpForm.module.css'

const DUMMY_DATA = {
  id: 0,
  email: 'email@email.com',
  username: 'user1'
}

const LogInForm = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate();

  const { setIsLoggedIn, setUser } = useAuth()

  const handleSubmit = async(event) => {
    event.preventDefault()

    // try {
    //   const response = await fetch(`${process.env.BACKEND_URL}/users/sign_in`, {
    //     method:'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       user: {
    //         email,
    //         password,
    //       }
    //     }),
    //   })

    //   const data = await response.json()

    //   if (response.ok) {
    //     setIsLoggedIn(true)
    //     setUser(data.user)
    //     navigate('/')
    //   } else {
    //     setLoginError(data.error || 'Invalid Credentials')
    //   }
    // } catch (error) {
    //   setLoginError('Login Failed')
    // }
    
    setIsLoggedIn(true)
    setUser(DUMMY_DATA)
    navigate('/')
  }

  return (
    <section>
    <h1>Login</h1>
    <Card>
        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.control}>
            <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
          </div>
          <div className={classes.control}>
            <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
          </div>

          <div className={classes.actions}><button type="submit">Login</button></div>
          {loginError && <div style={{ color: 'red' }}>{loginError}</div>}

        </form>
    </Card>
</section>
  )
}

export default LogInForm
