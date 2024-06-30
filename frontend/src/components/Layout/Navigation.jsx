import React, { useState } from 'react'
import classes from './Layout.module.css'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'

const Navigation = () => {

  const [menuIsOpen, setIsMenuOpen] = useState(true)

  const location = useLocation()

  const toggleMenuHandler = () => {
    setIsMenuOpen(prevState => !prevState)
  }

  const isActive = (path) => location.pathname === path;

  const {activeOrganisation, user} = useAuth() // is it better to use auth && auth.isLoggedIn?

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
        <div className={classes.logo}><Link to="/" className={classes.text}>MeetWise</Link></div>
        <div className={`${classes.navItem} ${isActive('/') ? classes.active : ''}`}>
          <Link to="/" className={classes.text}>Home</Link>
        </div>
        { !user &&  (<div className={`${classes.navItem} ${isActive('/about') ? classes.active : ''}`}>
            <Link to="/about" className={classes.text}>About Us</Link>
          </div>)}
        {!user && (
          <div className={`${classes.navItem} ${isActive('/sign-up') ? classes.active : ''}`}>
            <Link to="/sign-up" className={classes.text}>Sign Up</Link>
          </div>
        )}

        {user && (
          <div className={`${classes.navItem} ${isActive('/meetings') ? classes.active : ''}`}>
            <Link to="/meetings" className={classes.text}>Meetings</Link>
          </div>
        )
        }

        {user && activeOrganisation && (
          <div className={`${classes.navItem} ${isActive(`/organisations/${activeOrganisation}`) ? classes.active : ''}`}>
            <Link to={`/organisations/${activeOrganisation}`} className={classes.text}>{activeOrganisation}</Link>
          </div>
        )
        }

        {user && !activeOrganisation && (
          <div className={`${classes.navItem} ${isActive('/myorganisation') ? classes.active : ''}`}>
            <Link to="/myorganisation" className={classes.text}>My Organisation</Link>
          </div>
        )
        }

        {user && (
          <div className={`${classes.navItem} ${isActive('/settings') ? classes.active : ''}`}>
            <Link to="/settings" className={classes.text}>Settings</Link>
          </div>
        )
        }
        { user &&  (<div className={`${classes.smallNavItem}`}>
          <Link to="/about" className={classes.smallText}>About Us</Link>
        </div>)}

      </nav>
    </header>
  )
}

export default Navigation
