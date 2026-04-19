import "./globals.css";

export const metadata = {
  title: "Punctoo Partner",
  description: "Partnerportaal voor Punctoo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}