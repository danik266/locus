'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { localizeContent } from '../lib/localize-react';
import { descriptions, isLocale, languageNames, locales, pageTitles, translateText, type Locale } from '../lib/i18n';

type LanguageContext = { locale: Locale; changeLanguage: (locale: Locale) => void };
const Language = createContext<LanguageContext>({locale:'ru',changeLanguage:()=>{}});
export function LanguageProvider({initialLocale,children}:{initialLocale:Locale;children:ReactNode}) {
 const [locale,setLocale]=useState(initialLocale);
 function changeLanguage(next:Locale){setLocale(next);document.cookie=`continue_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;}
 useEffect(()=>{document.documentElement.lang=locale;document.title=pageTitles[locale];document.querySelector('meta[name="description"]')?.setAttribute('content',descriptions[locale]);},[locale]);
 return <Language.Provider value={{locale,changeLanguage}}>{children}</Language.Provider>;
}
export function useLanguage(){const ctx=useContext(Language);return {...ctx,t:(text:string)=>translateText(text,ctx.locale),localize:(node:ReactNode)=>localizeContent(node,ctx.locale)}}
export function LanguagePicker(){
 const {locale,changeLanguage}=useLanguage();
 const [open,setOpen]=useState(false);
 const ref=useRef<HTMLDivElement>(null);
 const label={en:'Language',ru:'Язык',kk:'Тіл'}[locale];

 useEffect(()=>{
  if(!open)return;
  function handleClick(e:MouseEvent){if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false);}
  function handleKey(e:KeyboardEvent){if(e.key==='Escape')setOpen(false);}
  document.addEventListener('mousedown',handleClick);
  document.addEventListener('keydown',handleKey);
  return()=>{document.removeEventListener('mousedown',handleClick);document.removeEventListener('keydown',handleKey);};
 },[open]);

 return (
  <div ref={ref} className="language-picker" style={{position:'relative'}}>
   <button
    className="lang-trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={label}
    onClick={()=>setOpen(v=>!v)}
   >
    <span className="language-symbol" aria-hidden="true">A<span>а</span></span>
    <span className="lang-trigger-name">{languageNames[locale]}</span>
    <span className="lang-trigger-arrow" aria-hidden="true">{open?'▲':'▾'}</span>
   </button>
   {open&&(
    <ul className="lang-dropdown" role="listbox" aria-label={label}>
     {locales.map(code=>(
      <li key={code} role="option" aria-selected={code===locale}>
       <button
        className={code===locale?'lang-option lang-option--active':'lang-option'}
        lang={code}
        onClick={()=>{if(isLocale(code)){changeLanguage(code);setOpen(false);}}}
       >
        {code===locale&&<span className="lang-check" aria-hidden="true">✓</span>}
        {languageNames[code]}
       </button>
      </li>
     ))}
    </ul>
   )}
  </div>
 );
}
