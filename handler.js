import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const folders = ['plugins', 'plugins_admin']
const plugins = {}

for (const folder of folders) {
  const files = fs.readdirSync(path.join(__dirname, folder)).filter(file => file.endsWith('.js'))
  for (const file of files) {
    const pluginPath = path.join(__dirname, folder, file)
    const plugin = await import(`file://${pluginPath}`)
    const name = file.replace('.js', '')
    plugins[name] = plugin.default || plugin
  }
}

export default plugins

