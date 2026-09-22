import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AnchoredToastProvider, ToastProvider } from "./components/ui/toast";

export const metadata = {
  title: "QueueLess SA",
  description: "Join the queue before you leave home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
