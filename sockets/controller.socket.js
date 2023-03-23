const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");
const chatMensajes = new ChatMensajes();

const socketController = async (socket, io) => {
  const usuario = await comprobarJWT(socket.handshake.headers.token_access);
  if (!usuario) return socket.disconnect(); //si no existe el usuario o esta inactivo o eliminado lo desconectamos
  console.log("Conectado:", usuario.nombre);
  chatMensajes.conectarUsuario(usuario);
  io.emit("usuarios-activos", chatMensajes.usuariosToArr); //como estoy usando io que es todo el servidor, no tengo que emitir con emit al que me envio la peticion y broadcast a todos los otros
  socket.on("disconnect", () => {
    chatMensajes.desconectarUsuario(usuario.id);
    io.emit("usuarios-activos", chatMensajes.usuariosToArr);
  });
};
module.exports = { socketController };
