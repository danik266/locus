import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';
export async function generateMetadata(): Promise<Metadata> {
 const h = await headers();
 const host = h.get('host') || 'localhost:3002';
 const origin = `${host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'}://${host}`;
 return { metadataBase: new URL(origin), title: 'Далее — твой маршрут поступления', description: 'От интересов и выбора программы до понятного плана поступления. Твои цели, твой темп, твой следующий шаг.', icons: {icon:'/favicon.ico'}, openGraph: { title:'Далее — твой маршрут поступления', description:'Куда поступать. С чего начать.', locale:'ru_RU', type:'website', images:[{url:new URL('/og.png',origin).href}] }, twitter: {card:'summary_large_image',title:'Далее — твой маршрут поступления',images:[new URL('/og.png',origin).href]} };
}
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }
