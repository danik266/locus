'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { localizeContent } from '../lib/localize-react';
import { descriptions, isLocale, languageNames, locales, pageTitles, translateText, type Locale } from '../lib/i18n';

type LanguageContext = { locale: Locale; changeLanguage: (locale: Locale) => void };
const Language = createContext<LanguageContext>({locale:'en',changeLanguage:()=>{}});
export function LanguageProvider({initialLocale,children}:{initialLocale:Locale;children:ReactNode}) {
 const [locale,setLocale]=useState(initialLocale);
 function changeLanguage(next:Locale){setLocale(next);document.cookie=`continue_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;}
 useEffect(()=>{document.documentElement.lang=locale;document.title=pageTitles[locale];document.querySelector('meta[name="description"]')?.setAttribute('content',descriptions[locale]);},[locale]);
 return <Language.Provider value={{locale,changeLanguage}}>{children}</Language.Provider>;
}
export function useLanguage(){const ctx=useContext(Language);return {...ctx,t:(text:string)=>translateText(text,ctx.locale),localize:(node:ReactNode)=>localizeContent(node,ctx.locale)}}
export function LanguagePicker(){
 const {locale,changeLanguage}=useLanguage();
 const label={en:'Language',ru:'Язык',kk:'Тіл'}[locale];
 return <label className="language-picker"><span className="language-symbol" aria-hidden="true">A<span>а</span></span><span className="sr-only">{label}</span><select aria-label={label} value={locale} onChange={e=>{if(isLocale(e.target.value))changeLanguage(e.target.value)}}>{locales.map(code=><option key={code} value={code} lang={code}>{languageNames[code]}</option>)}</select></label>;
}
