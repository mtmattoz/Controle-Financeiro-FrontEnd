import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A porta 5173 é a única origem liberada no CorsConfig do backend.
// strictPort impede que o Vite suba em outra porta e as requisições sejam bloqueadas por CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
