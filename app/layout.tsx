import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { LanguageProvider } from './language';
import { AuthProvider } from './auth-context';
import { descriptions, localeFromCookie, pageTitles } from '../lib/i18n';
import './globals.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export async function generateMetadata(): Promise<Metadata> {
 const h = await headers();
 const locale = localeFromCookie((await cookies()).get('continue_locale')?.value);
 const host = h.get('host') || 'localhost:3002';
 const origin = `${host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'}://${host}`;
 return { metadataBase:new URL(origin), title:pageTitles[locale], description:descriptions[locale], icons:{icon:'/favicon.svg'}, openGraph:{title:pageTitles[locale],description:descriptions[locale],locale:{en:'en_GB',ru:'ru_RU',kk:'kk_KZ'}[locale],type:'website',images:[{url:new URL('/og-continue.png',origin).href}]}, twitter:{card:'summary_large_image',title:pageTitles[locale],images:[new URL('/og-continue.png',origin).href]} };
}
export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
 const locale=localeFromCookie((await cookies()).get('continue_locale')?.value);
 return <html lang={locale}><body><LanguageProvider initialLocale={locale}><AuthProvider>{children}</AuthProvider></LanguageProvider></body></html>;
}
