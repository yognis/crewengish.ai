import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrewEnglish.ai - AI-Powered English Learning for Aviation',
  description: 'AI-powered English learning platform for aviation professionals. Practice speaking, get instant feedback, and master aviation English with CrewEnglish.ai.',
  keywords: 'CrewEnglish.ai, aviation English, AI English tutor, speaking practice, cabin crew English, pilot English',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

