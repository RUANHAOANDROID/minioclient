import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import MinioExplorer from '@/components/minio-explorer/minio-explorer';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/language-context';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light" storageKey="minio-browser-theme">
          <div className="h-screen w-screen overflow-hidden">
            <MinioExplorer />
            <Toaster />
          </div>
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;