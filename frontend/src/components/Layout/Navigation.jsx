import React, { useState } from 'react'
import classes from './Layout.module.css'
import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {

  const [menuIsOpen, setIsMenuOpen] = useState(true)

  const location = useLocation()

  const toggleMenuHandler = () => {
    setIsMenuOpen(prevState => !prevState)
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className={classes.navigation}>
      <div className={classes.hamburger} onClick={toggleMenuHandler}>
        {/* {menuIsOpen && <div>Close Menu</div>}
        {!menuIsOpen && <div>Menu</div>} */}
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={`${classes.navItems} ${menuIsOpen ? classes.show : ''}`}>
        <div className={classes.logo}><Link to="/" className={classes.text}>Meet Space</Link></div>
        <div className={`${classes.navItem} ${isActive('/') ? classes.active : ''}`}>
          <Link to="/" className={classes.text}>Home</Link>
        </div>
        <div className={`${classes.navItem} ${isActive('/about') ? classes.active : ''}`}>
          <Link to="/about" className={classes.text}>About Us</Link>
        </div>
        <div className={`${classes.navItem} ${isActive('/sign-up') ? classes.active : ''}`}>
          <Link to="/sign-up" className={classes.text}>Sign Up</Link>
        </div>
      </nav>
    </header>
  )
}

export default Navigation
