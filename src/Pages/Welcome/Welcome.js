import React from 'react'
import { Avatar } from '@material-ui/core'
import './Welcome.css';

 function Welcome({currentUserName}) {
    return (
        <div className="welcome_body">
          <Avatar 
            className="welcome_logo">

          </Avatar>
          <h2 className="welcome_Text">
            Welcome To Let'Chat
          </h2>
        </div>
    )
}


export default Welcome;