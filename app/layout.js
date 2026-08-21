import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata = {
  title: "QueueLess SA",
  description: "Join the queue before you leave home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
