import React, { useState } from 'react'
import classes from './Layout.module.css'
import { Link } from 'react-router-dom'

const Navigation = () => {

  const [menuIsOpen, setIsMenuOpen] = useState(false)

  const toggleMenuHandler = () => {
    setIsMenuOpen(prevState => !prevState)
  }

  return (
    <header className={classes.navigation}>
      <div className={classes.hamburger} onClick={toggleMenuHandler}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={`${classes.navItems} ${menuIsOpen ? classes.show : ''}`}>
        <div className={classes.logo}><Link to="/" className={classes.text}>Meet Space</Link></div>
        <div className={classes.navItem}>
          <Link to="/" className={classes.text}>Home</Link>
        </div>
        <div className={classes.navItem}>
          <Link to="/about" className={classes.text}>About Us</Link>
        </div>
        <div className={classes.navItem}>
          <Link to="/sign-up" className={classes.text}>Sign Up</Link>
        </div>
      </nav>
    </header>
  )
}

export default Navigation
