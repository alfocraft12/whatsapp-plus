export default {
  // 👑 Número del dueño del bot (formato internacional sin '+')
  ownerNumber: '573146171942',

  // 🤖 Nombre del bot y del propietario
  botName: 'Whatsapp plus',
  ownerName: 'Alfo',

  // 🔧 Prefijos válidos
  prefixes: ['/', '.', '#'],

  // ➕ Prefijo reservado solo para el propietario
  adminPrefix: '>',

  // 🕓 Tiempo por defecto al registrar un usuario (ej: '10m' para 10 minutos)
  defaultTime: '10m',

  // 📡 ID del canal donde se enviarán logs (reemplazar luego con canal real)
  logsChannel: 'AQUI_VA_EL_ID_DEL_CANAL_@newsletter', // ← Agrega tu canal aquí

  // 📁 Ruta base para almacenamiento de archivos públicos del bot
  storagePath: './storage/',

  // 📂 Ruta base de logs
  logsPath: './logs/',

  // 📊 Ruta de base de datos (JSON)
  dbPath: './db/'
}
