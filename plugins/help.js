export default {
  name: 'help',
  description: 'Muestra el menú de ayuda.',
  handler: async ({ sock, m }) => {
    const helpMessage = `
*Menú de ayuda*

/help - Muestra este menú
/veraudio - Muestra un audio
/verfoto - Muestra una foto
/vervideo - Muestra un video
    `
    await sock.sendMessage(m.key.remoteJid, { text: helpMessage }, { quoted: m })
  }
}
