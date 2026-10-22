import type { Metadata } from 'next';
export const metadata: Metadata = {title:'Level-Up Life',description:'Personal growth and parent-managed quests, with progress saved to your account.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
