import React, { useState } from 'react'
import classes from './Layout.module.css'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../store/auth-context'
import { useNavigate } from 'react-router-dom'

const Navigation = () => {

  const [menuIsOpen, setIsMenuOpen] = useState(true)
  const navigate = useNavigate()

  const location = useLocation()

  const toggleMenuHandler = () => {
    setIsMenuOpen(prevState => !prevState)
  }

  const handleLink = (path) => {
    navigate(path);
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
        <div className={`${classes.navItem} ${isActive('/') ? classes.active : ''}`} onClick={() => handleLink("/")}>
          <Link to="/" className={classes.text}>Home</Link>
        </div>
        { !user &&  (<div className={`${classes.navItem} ${isActive('/about') ? classes.active : ''}`} onClick={() => handleLink("/about")}>
            <Link to="/about" className={classes.text}>About Us</Link>
          </div>)}
        {!user && (
          <div className={`${classes.navItem} ${isActive('/sign-up') ? classes.active : ''}`} onClick={() => handleLink("/sign-up")}>
            <Link to="/sign-up" className={classes.text}>Sign Up</Link>
          </div>
        )}

        {user && (
          <div className={`${classes.navItem} ${isActive('/meetings') ? classes.active : ''}`} onClick={() => handleLink("/meetings")}>
            <Link to="/meetings" className={classes.text}>Meetings</Link>
          </div>
        )
        }

        {user && activeOrganisation && (
          <div className={`${classes.navItem} ${isActive(`/organisations/${activeOrganisation}`) ? classes.active : ''}`} onClick={() => handleLink(`/organisations/${activeOrganisation}`)}>
            <Link to={`/organisations/${activeOrganisation}`} className={classes.text}>{activeOrganisation}</Link>
          </div>
        )
        }

        {user && !activeOrganisation && (
          <div className={`${classes.navItem} ${isActive('/myorganisation') ? classes.active : ''}`} onClick={() => handleLink("/myorganisation")}>
            <Link to="/myorganisation" className={classes.text}>Organisations</Link>
          </div>
        )
        }

        {user && (
          <div className={`${classes.navItem} ${isActive('/settings') ? classes.active : ''}`} onClick={() => handleLink("/settings")}>
            <Link to="/settings" className={classes.text}>Settings</Link>
          </div>
        )
        }
        { user &&  (<div className={`${classes.smallNavItem}`} onClick={() => handleLink("/about")}>
          <Link to="/about" className={classes.smallText}>About Us</Link>
        </div>)}

      </nav>
    </header>
  )
}

export default Navigation
