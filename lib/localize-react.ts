import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { translateText, type Locale } from './i18n.ts';

/** Translate React content, never the DOM. Values, handlers, keys and state remain canonical. */
export function localizeContent(content:ReactNode,locale:Locale):ReactNode {
 if(typeof content==='string') return translateText(content,locale);
 if(!content || typeof content==='number' || typeof content==='boolean') return content;
 if(Array.isArray(content)) return Children.map(content,item=>localizeContent(item,locale));
 if(!isValidElement(content)) return content;
 const element=content as ReactElement<Record<string,unknown>>;
 if(element.props['data-no-translate']) return element;
 const props:Record<string,unknown>={};
 for(const name of ['aria-label','placeholder','title','alt']) if(typeof element.props[name]==='string') props[name]=translateText(element.props[name] as string,locale);
 // Native option values default to their text; retain the original before translating it.
 if(element.type==='option' && element.props.value===undefined && typeof element.props.children==='string') props.value=element.props.children;
 if('children' in element.props) props.children=localizeContent(element.props.children as ReactNode,locale);
 return cloneElement(element,props);
}
