/**
 * Expo Metro serves static files from public/. MapLibre GL JS v6's worker
 * imports a sibling shared chunk, so both must be copied next to each other
 * before web start / export. See:
 * https://www.maplibre.org/maplibre-gl-js/docs/guides/v5-to-v6-migration-guide/
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'node_modules', 'maplibre-gl', 'dist')
const publicDir = join(projectRoot, 'public')

const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'] as const

mkdirSync(publicDir, { recursive: true })

for (const file of files) {
	copyFileSync(join(distDir, file), join(publicDir, file))
	console.log(`synced ${file} → public/${file}`)
}
