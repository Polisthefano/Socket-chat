let usuario = null;
let socketServer = null;
let url = window.location.hostname.includes("localhost")
  ? "http://"
  : "https://"; //contiene el host donde me encuentro
url = `${url}${window.location.host}/api/auth/`;

//HTML REFERENCES
const txtUid = document.querySelector("#txtUid");
const txtMsg = document.querySelector("#txtMsg");
const ulUsuarios = document.querySelector("#ulUsuarios");
const ulMensajes = document.querySelector("#ulMensajes");
const btnLogout = document.querySelector("#btnLogout");

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
  socketServer = io({
    extraHeaders: {
      //para mandar info
      token_access: localStorage.getItem("token"),
    },
  });

  socketServer.on("connect", () => {
    console.log("sockets online");
  });

  socketServer.on("disconnect", () => {
    console.log("sockets offline");
  });

  socketServer.on("recibir-mensajes", dibujarMensajes);

  socketServer.on("usuarios-activos", dibujarUsuarios); //llamamos directamente al callback

  socketServer.on("mensaje-privado", (payload) => {
    console.log(payload);
  });
};

const dibujarUsuarios = (usuarios = []) => {
  let usersHtml = "";
  usuarios.forEach((user) => {
    usersHtml += `<li>
    <p>
    <h5 class="text-success">${user.nombre}</h5>
    <span class="fs-6 text-muted">${user.uid}</span>
    </p>
    </li>`;
  });
  ulUsuarios.innerHTML = usersHtml;
};
const dibujarMensajes = (mensajes = []) => {
  let mensajesHtml = "";
  mensajes.forEach(({ mensaje, nombre }) => {
    mensajesHtml += `<li>
    <p>
    <span class="text-primary">${nombre}:</span>
    <span>${mensaje}</span>
    </p>
    </li>`;
  });
  ulMensajes.innerHTML = mensajesHtml;
};

txtMsg.addEventListener("keyup", ({ keyCode }) => {
  const msg = txtMsg.value;
  const uid = txtUid.value;
  if (keyCode !== 13) return;
  else {
    if (msg.trim().length != 0) {
      socketServer.emit("enviar-mensaje", { msg, uid });
      txtMsg.value = "";
    }
  }
});

const main = async () => {
  await validarJWT();
};

main();
