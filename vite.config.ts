import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function findAsset(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const found = findAsset(fullPath, filename)
      if (found) return found
    } else if (entry.name === filename) {
      return fullPath
    }
  }
  return null
}

const assetAliases: Record<string, string> = {
  'ae6a7e7f13c9ae1b225e9bffbdb7bdbbc30ae815.png': 'birthday_cake.png',
  'dce3a06c12ec0085d9475c93b7d16c6ebe24b984.png': 'love_mailbox.png',
  '95475e6b4b15913fe94abd4cfdad002f3e120dce.png': 'love_envelope.png',
}

const figmaAssetPlugin = {
  name: 'figma-asset-resolver',
  resolveId(id: string) {
    if (id.startsWith('figma:asset/')) {
      const filename = id.replace('figma:asset/', '')
      const targetName = assetAliases[filename] || filename
      const importsDir = path.resolve(__dirname, 'src/imports')
      const localFile = findAsset(importsDir, targetName)
      if (localFile) {
        return localFile
      }
      return '\0figma-fallback:' + filename
    }
  },
  load(id: string) {
    if (id.startsWith('\0figma-fallback:')) {
      return `export default "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4K";`
    }
  },
}

export default defineConfig({
  base: './',
  plugins: [
    figmaAssetPlugin,
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.mp3', '**/*.wav', '**/*.ogg'],
})
