import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from "nitro/vite";
import basicSsl from "@vitejs/plugin-basic-ssl"

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    basicSsl(),
    tailwindcss(), tanstackStart(), viteReact(),
    nitro({ preset: 'aws_amplify' }),
  ],
})
