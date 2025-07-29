const fs = require('fs')
const path = require('path')
const { Boom } = require('@hapi/boom')
const pino = require('pino')
const chalk = require('chalk')
const { usePairingCode, makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const handler = require('./handler.js')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    browser: ['WhatsApp Plus', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true
  })

  if (!fs.existsSync('./session/creds.json')) {
    const numero = '573146171942'
    const jid = numero + '@s.whatsapp.net'
    console.log(`📲 Generando código de emparejamiento para: ${numero}...\n`)
    await usePairingCode(sock, jid)
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('[!] Reconectando...'))
        startBot()
      } else {
        console.log(chalk.red('❌ Sesión cerrada. Reinicia el bot para emparejar de nuevo.'))
      }
    } else if (connection === 'open') {
      console.log(chalk.green('[✅ BOT CONECTADO A WHATSAPP]'))
    }
  })

  sock.ev.on('messages.upsert', async (msg) => {
    await handler(sock, msg)
  })
}

startBot()
