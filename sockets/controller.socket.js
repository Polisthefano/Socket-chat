const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");
const chatMensajes = new ChatMensajes();

const socketController = async (socket, io) => {
  const usuario = await comprobarJWT(socket.handshake.headers.token_access);
  if (!usuario) return socket.disconnect(); //si no existe el usuario o esta inactivo o eliminado lo desconectamos

  //agregar usuario
  chatMensajes.conectarUsuario(usuario);
  io.emit("usuarios-activos", chatMensajes.usuariosToArr); //como estoy usando io que es todo el servidor, no tengo que emitir con emit al que me envio la peticion y broadcast a todos los otros
  socket.emit("recibir-mensajes", chatMensajes.last10);

  //socket join crea una sala privada, porque ya por default se crea una sola sala global donde estan todos los eventos
  //donde el primer parametro es el identificador de la sala
  socket.join(usuario.id);

  socket.on("disconnect", () => {
    chatMensajes.desconectarUsuario(usuario.id);
    io.emit("usuarios-activos", chatMensajes.usuariosToArr);
  });

  socket.on("enviar-mensaje", ({ uid, msg }) => {
    if (uid) {
      //mensaje privado
      socket
        .to(uid)
        .emit("mensaje-privado", { from: usuario.nombre, mensaje: msg }); //el to permite enviar por nombre a una sala en particular, la definimos en la linea 15
    } else {
      chatMensajes.enviarMensaje(usuario.id, usuario.nombre, msg);
      io.emit("recibir-mensajes", chatMensajes.last10);
    }
  });
};
module.exports = { socketController };
