import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AnchoredToastProvider, ToastProvider } from "./components/ui/toast";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

export const metadata = {
  title: "QueueLess SA",
  description: "Join the queue before you leave home.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "QueueLess SA",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#0e3b32",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}