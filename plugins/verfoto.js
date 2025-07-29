export default {
  name: 'verfoto',
  description: 'Muestra una foto.',
  handler: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { image: { url: './media/foto.jpg' }, caption: 'Aquí tienes una foto' }, { quoted: m })
  }
}
