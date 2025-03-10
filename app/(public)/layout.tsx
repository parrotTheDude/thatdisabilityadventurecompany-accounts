"use client";

import "../globals.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Header /> {/* 🔹 Logo in the top-left */}
        <main className="flex items-center justify-center min-h-screen p-6">
          {children}
        </main>
      </body>
    </html>
  );
}

// 🔹 Header Component (Logo in Top-Left)
function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6">
      <div className="flex items-center">
        <img
          src="https://thatdisabilityadventurecompany.com.au/icons/logo.webp"
          alt="TDAC Logo"
          className="h-18 w-auto ml-4"
        />
      </div>
    </header>
  );
}