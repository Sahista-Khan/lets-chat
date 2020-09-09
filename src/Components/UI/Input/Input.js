import React from 'react';

import InputCSS from './Input.module.css';

const input = (props) => {
    
    let inputElement = null;
    const inputCSS = [InputCSS.InputElement];
   
    if(props.invalid && props.shouldValidate && props.touched){
        inputCSS.push(InputCSS.Invalid);
        
    }
    switch(props.elementType) {
        case ('input'):
           
            inputElement = (<input 
                    className={inputCSS.join(' ')}
                    {...props.elementConfig}
                    value= {props.value}
                    onChange = {props.changed}/>)
            break;

        case ('textarea'):
            inputElement = <textarea 
                        className={inputCSS.join(' ')} 
                        {...props.elementConfig} 
                        value= {props.value }
                        onChange = {props.changed}/>
            break;

        case ('select'):
            inputElement = (<select 
                        className={inputCSS.join(' ')}  
                        value= {props.value }
                        onChange = {props.changed}>
                        {props.elementConfig.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.displayValue}
                            </option>
                        ))}
                        </select>
                    );
            break;
        
        default:
            inputElement = <input 
                        className={inputCSS.join(' ')} 
                     
                        {...props.elementConfig} 
                        value= {props.value} 
                        onChange = {props.changed}/>
    }
 

    return (
    <div className={InputCSS.Input}>
        <label className={InputCSS.Label}>{props.label}</label>
        {inputElement}
        
    </div>
)}

export default input;