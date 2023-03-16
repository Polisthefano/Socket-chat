const { comprobarJWT } = require("../helpers");

const socketController = async (socket) => {
  const usuario = await comprobarJWT(socket.handshake.headers.token_access);
  if (!usuario) return socket.disconnect(); //si no existe el usuario o esta inactivo o eliminado lo desconectamos
  console.log("Conectado:", usuario.nombre);
};
module.exports = { socketController };
