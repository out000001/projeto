import PropTypes from "prop-types";
import {useEffect,useRef} from "react";
import {createPortal} from "react-dom";
import {Close} from "./Icons";

export default function Modal({open,onClose,title,titleId,children,className="w-full max-w-2xl",showCloseButton=true}) {
  const panelRef=useRef(null);
  const closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  useEffect(()=>{
    if(!open)return undefined;
    const previousFocus=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    panelRef.current?.focus({preventScroll:true});
    const onKeyDown=event=>{
      const panel=panelRef.current;
      if(!panel)return;
      const dialogs=document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if(dialogs[dialogs.length-1]!==panel)return;
      if(event.key==="Escape") {event.preventDefault();event.stopPropagation();closeRef.current();return;}
      if(event.key!=="Tab")return;
      const targets=[...panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
        .filter(node=>node.tabIndex>=0&&!node.matches(':disabled')&&!node.hidden&&node.getAttribute('aria-hidden')!=='true'&&window.getComputedStyle(node).display!=='none'&&window.getComputedStyle(node).visibility!=='hidden');
      const first=targets[0],last=targets[targets.length-1],active=document.activeElement;
      if(!first){event.preventDefault();panel.focus();return;}
      if(event.shiftKey&&(active===first||active===panel||!panel.contains(active))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(active===last||active===panel||!panel.contains(active))){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',onKeyDown);
    return()=>{document.removeEventListener('keydown',onKeyDown);document.body.style.overflow=previousOverflow;if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});};
  },[open]);
  if(!open)return null;
  // A portal avoids fixed-position clipping caused by the sticky header's backdrop filter.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div role="presentation" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-inverse-surface/40 backdrop-blur-sm"/>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId||undefined} aria-label={titleId?undefined:title} tabIndex={-1}
        className={`modal-panel relative z-10 flex min-w-0 max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl outline-none ${className}`}>
        {showCloseButton&&<button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Close className="h-5 w-5"/></button>}
        {children}
      </div>
    </div>,document.body
  );
}
Modal.propTypes={open:PropTypes.bool.isRequired,onClose:PropTypes.func.isRequired,title:PropTypes.string.isRequired,titleId:PropTypes.string,children:PropTypes.node,className:PropTypes.string,showCloseButton:PropTypes.bool};
