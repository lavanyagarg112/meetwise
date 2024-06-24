import classes from './Layout.module.css'

import Navigation from './Navigation'


const Layout = (props) => {
return (
    <div className={classes.container}>
        <div>
            <Navigation />
        </div>
        <div>
            <main className={classes.main}>
                {props.children} 
            </main>
        </div>
    
    </div>
)
}

export default Layout
  