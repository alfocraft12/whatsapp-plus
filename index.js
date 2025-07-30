import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import makeWASocket from '@whiskeysockets/baileys/lib/Socket'
import chalk from 'chalk'
import pino from 'pino'
import config from './config.js'
import plugins from './handler.js'

console.clear()
console.log(chalk.blueBright(`\n🚀 ${config.botName} por ${config.ownerName}`))
console.log(chalk.green('Iniciando...\n'))

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log(chalk.redBright('\n❌ Conexión cerrada'), shouldReconnect ? '— Reintentando...' : '')
      if (shouldReconnect) startBot()
    } else if (connection === 'open') {
      console.log(chalk.greenBright('\n✅ ¡Bot conectado correctamente!'))
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const msg = m.message.conversation || m.message.extendedTextMessage?.text || ''
    const prefix = config.prefixes.find(p => msg.startsWith(p))
    if (!prefix) return

    const commandBody = msg.slice(prefix.length).trim().split(/\s+/)
    const commandName = commandBody.shift().toLowerCase()

    const plugin = plugins[commandName]
    if (plugin) {
      try {
        await plugin.handler({ sock, m, commandBody })
      } catch (err) {
        console.log(chalk.redBright('❌ Error en el comando:'), err)
      }
    }
  })
}

startBot()
