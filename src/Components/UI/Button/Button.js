import React from 'react';
import ButtonCSS from '../Button/ButtonCSS.module.css';
const button = (props) => (
<button 
    className = {[ButtonCSS.Button,ButtonCSS[props.btnType]].join(' ')}
    onClick={props.clicked}
    disabled={props.disabled}>{props.children}</button>
);

export default button;