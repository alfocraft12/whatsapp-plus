import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import config from './config.js'

// 📂 Cargar plugins de una carpeta
const loadPlugins = async (folder) => {
  const plugins = {}
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'))

  for (const file of files) {
    const pluginPath = path.join(folder, file)
    const plugin = await import(`file://${path.resolve(pluginPath)}`)
    const name = file.replace('.js', '')
    plugins[name] = plugin.default || plugin
  }

  return plugins
}

// 📌 Formatear tiempo
const msToTime = (ms) => {
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${min}m ${sec}s`
}

// 💬 Manejo de mensajes
export default async function handler(sock, msg) {
  try {
    const m = msg.messages?.[0]
    if (!m || !m.message || m.key.fromMe) return

    const from = m.key.remoteJid
    const sender = m.key.participant || m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const body = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const prefixes = config.prefixes
    const adminPrefix = config.adminPrefix

    const prefix = [...prefixes, adminPrefix].find(p => body.startsWith(p))
    if (!prefix) return

    const isOwner = sender.replace(/[^0-9]/g, '') === config.ownerNumber
    const commandRaw = body.slice(prefix.length).trim().split(/ +/)
    const commandName = commandRaw.shift().toLowerCase()
    const args = commandRaw

    // 📥 Cargar plugins dinámicamente
    const userPlugins = await loadPlugins('./plugins')
    const adminPlugins = await loadPlugins('./plugins_admin')
    const commandSet = prefix === adminPrefix ? adminPlugins : userPlugins
    const command = commandSet[commandName]

    if (!command) return

    // ⚠️ Comando admin no autorizado
    if (prefix === adminPrefix && !isOwner) {
      return sock.sendMessage(from, { text: '🚫 Este comando es exclusivo del propietario del bot.' }, { quoted: m })
    }

    // 🔐 Validación de subbots (usuarios)
    if (!isOwner) {
      const dbPath = './db/usuarios.json'
      const usuarios = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : {}

      if (!usuarios[sender]) {
        return sock.sendMessage(from, { text: '❗ No estás registrado. Contacta al admin para obtener acceso.' }, { quoted: m })
      }

      const tiempoRestante = usuarios[sender].expira - Date.now()
      if (tiempoRestante <= 0) {
        return sock.sendMessage(from, { text: '⏰ Tu acceso ha expirado. Pide una renovación al administrador.' }, { quoted: m })
      }
    }

    // ✅ Ejecutar comando
    await command(sock, m, {
      args,
      prefix,
      sender,
      from,
      isOwner
    })

    // 📝 Registrar uso en logs
    const logData = {
      numero: sender,
      fecha: new Date().toLocaleString(),
      tipo: prefix === adminPrefix ? 'admin' : 'usuario'
    }

    const logFile = './logs/usage.json'
    const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile)) : []
    logs.push(logData)
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2))

    // 📨 (Opcional) Enviar a canal de logs
    // await sock.sendMessage(config.logsChannel, { text: `📌 Comando usado: ${logData.numero} - ${logData.fecha}` })

  } catch (e) {
    console.log(chalk.redBright('[❌ ERROR EN HANDLER]'), e)
  }
}
