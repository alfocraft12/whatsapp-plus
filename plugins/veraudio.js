export default {
  name: 'veraudio',
  description: 'Muestra un audio.',
  handler: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { audio: { url: './media/audio.mp3' }, mimetype: 'audio/mp4' }, { quoted: m })
  }
}
