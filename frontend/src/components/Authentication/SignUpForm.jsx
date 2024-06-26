import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Card from '../ui/Card'

import classes from './SignUpForm.module.css'

const SignUpForm = () => {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signUpError, setSignUpError] = useState('')

  const navigate = useNavigate();

  const handleSubmit = async(event) => {
    event.preventDefault();

  if (password !== confirmPassword) {
    setSignUpError('Passwords dont match')
    return;
  }

  // try {
  //   const response = await fetch(`${process.env.BACKEND_URL}/sign-up`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({
  //       user: {
  //         username,
  //         email,
  //         password
  //       }
  //     })
  //   })

  //   if (!response.ok) {
  //     const errorResponse = await response.json()
  //     const errorText = errorResponse?.errors?.email ? errorResponse.errors.email[0] : 'An error occurred during sign up.'
  //     throw new Error(errorText)
  //   }

  //   const data = await response.json()
  //   navigate('/')
  // } catch (error) {
  //   if (error instanceof Error) {
  //     // Now we know it's an Error instance
  //     setSignUpError(error.message);
  //   } else {
  //     // If we're not sure what the error is, handle accordingly
  //     setSignUpError("An unexpected error occurred.");
  //   }
  // }

  navigate('/')

}

  return (
    <section>
        <h1>Sign Up</h1>
        <Card>
            <div className={classes.content}>
              <form onSubmit={handleSubmit} className={classes.form}>
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
                <div className={classes.actions}><button type="submit">Sign Up</button></div>
                {signUpError && <div style={{ color: 'red' }}>{signUpError}</div>}
              </form>
            </div>
        </Card>
    </section>
  )
}

export default SignUpForm
