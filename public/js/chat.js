let usuario = null;
let socket = null;
let url = window.location.hostname.includes("localhost")
  ? "http://"
  : "https://"; //contiene el host donde me encuentro
url = `${url}${window.location.host}/api/auth/`;

//HTML REFERENCES
const txtUid = document.querySelector(txtUid);
const txtMsg = document.querySelector(txtMsg);
const ulUsuarios = document.querySelector(ulUsuarios);
const ulMensajes = document.querySelector(ulMensajes);
const btnLogout = document.querySelector(btnLogout);

const validarJWT = async () => {
  const token = localStorage.getItem("token") || "";
  if (token.length <= 10) {
    window.location = "index.html";
    throw new Error("There is not token");
  }

  try {
    const resp = await fetch(url, {
      headers: { token_access: token },
    });

    if (resp.ok) {
      const { user, token: newToken } = await resp.json();
      document.title = user.nombre;
      await conectarSocket();
      return;
    }
    throw new Error(await resp.json());
  } catch (err) {
    window.location = "index.html";
    throw new Error(err.message || err.statusText);
  }
};

const conectarSocket = async () => {
  const socketServer = io({
    extraHeaders: {
      //para mandar info
      token_access: localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("sockets online");
  });

  socket.on("disconnect", () => {
    console.log("sockets offline");
  });

  socket.on("recibir-mensajes", () => {});

  socket.on("usuarios-activos", () => {});

  socket.on("mensaje-privado", () => {});
};

const main = async () => {
  await validarJWT();
};

main();
