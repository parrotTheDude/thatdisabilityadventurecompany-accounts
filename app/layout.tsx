export const metadata = {
    title: "TDAC Admin",
    description: "Admin dashboard for TDAC",
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="bg-white text-gray-900">{children}</body>
      </html>
    );
  }