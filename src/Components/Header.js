import React from 'react';
import './Header.css';
import LetsChat from '../Logo/LetsChat.PNG'

function Header () {
    return (
        <header className="header-login-signup">
                <img src={LetsChat} alt="" className="header_image"/>     
        </header>
    )
}



export default Header;
