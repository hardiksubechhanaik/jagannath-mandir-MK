import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const adminBase = process.env.VITE_ADMIN_BASE || '/';

export default defineConfig({
  plugins: [react()],
  base: adminBase,
});
