import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'

import Card from '../ui/Card'

import classes from './SignUpForm.module.css'

const DUMMY_DATA = {
  id: 0,
  email: 'email@email.com',
  username: 'user1',
  firstName: 'Lavanya'
}

const SignUpForm = () => {

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signUpError, setSignUpError] = useState('')

  const { setIsLoggedIn, setUser } = useAuth()

  const navigate = useNavigate();

  const handleSubmit = async(event) => {
    event.preventDefault();

  if (password !== confirmPassword) {
    setSignUpError('Passwords dont match')
    return;
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          firstName,
          lastName,
          username,
          email,
          password
        }
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorResponse = await response.json()
      const errorText = errorResponse?.errors?.email ? errorResponse.errors.email[0] : 'An error occurred during sign up.'
      throw new Error(errorText)
    }

    const data = await response.json()
    setIsLoggedIn(true)
    setUser(data.user)

    navigate('/')
  } catch (error) {
    if (error instanceof Error) {
      // Now we know it's an Error instance
      setSignUpError(error.message);
    } else {
      // If we're not sure what the error is, handle accordingly
      setSignUpError("An unexpected error occurred.");
    }
  }

  setIsLoggedIn(true)
  setUser(DUMMY_DATA)
  navigate('/')

}

// add first name and last name

  return (
    <section>
        <h1>Sign Up</h1>
        <Card>
            <div className={classes.content}>
              <form onSubmit={handleSubmit} className={classes.form}>
                <div className={classes.nameArea}>
                  <div className={classes.control}>
                      <label>First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          required
                        />
                    </div>
                    <div className={classes.control}>
                      <label>Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          required
                        />
                    </div>
                  </div>
                <div className={classes.control}>
                  <label>Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      required
                    />
                </div>
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
                <div className={classes.nameArea}>
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
                  <div className={classes.control}>
                  <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                        />
                  </div>
                </div>
                <div className={classes.actions}><button type="submit">Sign Up</button></div>
                {signUpError && <div style={{ color: 'red' }}>{signUpError}</div>}
              </form>
            </div>
        </Card>
    </section>
  )
}

export default SignUpForm
