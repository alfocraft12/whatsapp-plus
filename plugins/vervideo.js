export default {
  name: 'vervideo',
  description: 'Muestra un video.',
  handler: async ({ sock, m }) => {
    await sock.sendMessage(m.key.remoteJid, { video: { url: './media/video.mp4' }, caption: 'Aquí tienes un video' }, { quoted: m })
  }
}
