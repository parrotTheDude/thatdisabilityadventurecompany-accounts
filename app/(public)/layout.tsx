"use client";

import "../globals.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}

// 🔹 Header Component (Fixed at the Top)
function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 w-full">
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