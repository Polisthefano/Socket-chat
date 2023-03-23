let url = window.location.hostname.includes("localhost")
  ? "http://"
  : "https://"; //contiene el host donde me encuentro
url = `${url}${window.location.host}/api/auth/`;

const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault(); //evita refrescar el navegador web cuando submitea
  const body = {};
  for (let el of form.elements) {
    //itera todos los elementos del formulario
    if (el.name.length > 0) body[el.name] = el.value; //si el elemento tiene name, es decir, solo los inputs van a entrar
  }
  new Promise((resolve, reject) => {
    fetch(url + "login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.ok) resolve(res.json());
        else reject(res);
      })
      .catch((error) => {
        reject(error);
      });
  })

    .then(({ token }) => {
      //al parecer fetch en la primer response devuelve una promise por eso hay que concatenarla
      callBackLogin(token);
    })
    .catch((err) => {
      console.error("Error al autenticar", err);
    });
});

function handleCredentialResponse(response) {
  fetch(`${url}google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: response.credential }), //al enviar en los headers el type el body siempre debe ir con JSON.stringify
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(res);
      }
      return res.json();
    })
    .then(({ token }) => {
      //al parecer fetch en la primer response devuelve una promise por eso hay que concatenarla
      callBackLogin(token);
    })
    .catch((err) => {
      console.error("Error al autenticar con google ", err);
    });
}
const button = document.getElementById("singOutGoogle");
button.onclick = () => {
  console.log(google.accounts.id);
  google.accounts.id.revoke(localStorage.getItem("emailUser"), (done) => {
    //de esta manera google borra el token de sus datos y nosotros del local donde teniamos el email de logueado y recargamos la pagina para eliminar cualquier cache
    localStorage.clear();
    location.reload();
  });
};

const callBackLogin = (token) => {
  localStorage.setItem("token", token);
  window.location = "chat.html";
};
