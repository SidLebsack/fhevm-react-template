import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FhevmProvider } from '@fhevm/sdk/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Privacy Fitness Tracker - FHEVM SDK Showcase',
  description: 'Confidential fitness tracking powered by Zama FHEVM and @fhevm/sdk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FhevmProvider
          config={{
            provider: typeof window !== 'undefined' ? window.ethereum : null,
            network: 'sepolia',
            contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x6Bbf52494089ce94859414D82d03f7c8a4cF1844'
          }}
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <nav className="bg-white shadow-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <h1 className="text-2xl font-bold text-indigo-600">
                  🔐 Privacy Fitness Tracker
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Powered by FHEVM SDK & Zama
                </p>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
                Built for Zama FHE Challenge • Powered by @fhevm/sdk
              </div>
            </footer>
          </div>
        </FhevmProvider>
      </body>
    </html>
  );
}
