import {useId,useState} from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import {Eye,EyeOff} from './Icons';

export default function PasswordInput({visibilityLabel='senha',id,...rest}) {
  const generatedId=useId();
  const inputId=id||`password-${generatedId}`;
  const [visible,setVisible]=useState(false);
  return <Input {...rest} id={inputId} type={visible?'text':'password'} trailingAction={
    <button type="button" aria-label={`${visible?'Ocultar':'Mostrar'} ${visibilityLabel}`} aria-pressed={visible} aria-controls={inputId} onClick={()=>setVisible(value=>!value)} className="inline-flex h-full min-h-11 min-w-11 items-center justify-center rounded-e-lg px-3 text-on-surface-variant hover:bg-surface-container">
      {visible?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
    </button>
  }/>;
}
PasswordInput.propTypes={visibilityLabel:PropTypes.string,id:PropTypes.string};
