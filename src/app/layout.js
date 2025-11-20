import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'Task Manager',
  description: 'A simple and elegant todo application with authentication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased bg-black text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
