const urlAPI = 'http://localhost:3000/api/v6/uol';
const inputMsg = document.querySelector(".input-msg");
let nomeUsuario = "";

entrarNaSala();

inputMsg.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        enviarMensagem();
    }
});


/*--------------------------------------------- VALIDAÇÂO E ENTRADA NA SALA -------------------------------------------*/

function entrarNaSala() {
    nomeUsuario = prompt("Nome de usuário: ")
    const promise = axios.post(urlAPI + '/participants', { name: nomeUsuario });
    promise.then(function () {
        lerMensagens();
        setInterval(conferirStatus, 5000);
        setInterval(lerMensagens, 3000);
    })
    promise.catch(tratarErro)
}

function tratarErro(error) {
    if (error.response.status === 400) {
        alert('Nome já utilizado, digite outro nome!')
        entrarNaSala();
    }
}

function conferirStatus() {
    const promise = axios.post(urlAPI + '/status', { name: nomeUsuario });
    promise.catch(tratarErroEnvioMsg);
}

/* --------------------------- CARREGAR MENSAGENS DO SERVIDOR E RENDERIZAR ------------------------------ */

function lerMensagens() {
    const promise = axios.get(urlAPI + '/messages')
    promise.then(renderizarMensagens)
}

function scrollParaUltimaMsg() {
    const ultimaMsg = document.querySelector('.container-mensagens li:last-child');
    ultimaMsg.scrollIntoView();
}

function renderizarMensagens(response) {
    const listaMensagens = document.querySelector(".container-mensagens");
    listaMensagens.innerHTML = "";

    for (let i = 0; i < response.data.length; i++) {
        const mensagens = response.data[i];

        if (mensagens.type === 'status') {
            listaMensagens.innerHTML += `
            <li class="entrar-sair">
                <span class="horario">(${mensagens.time})</span>
                <strong>${mensagens.from}</strong>
                <span>${mensagens.text}</span>
            </li>`
        }
        if (mensagens.type === 'private_message' && (nomeUsuario === mensagens.to || nomeUsuario === mensagens.from)) {
            listaMensagens.innerHTML += ` 
            <li class="conversa-reservada">
                <span class="horario">(${mensagens.time})</span>
                <strong>${mensagens.from}</strong>
                <span>reservadamente para</span>
                <strong>${mensagens.to}:</strong>
                <span>${mensagens.text}</span>
            </li>`
        }
        if (mensagens.type === 'message') {
            listaMensagens.innerHTML += `
            <li class="conversa-publica">
                <span class="horario">(${mensagens.time})</span>
                <strong>${mensagens.from}</strong>
                <span>para</span>
                <strong>${mensagens.to}:</strong>
                <span>${mensagens.text}</span>
            </li>`
        }
    }
    scrollParaUltimaMsg();
}

/*------------------------------------- ENVIAR MENSAGEM -------------------------------------*/

function enviarMensagem() {
    const corpoMensagem = {
        from: nomeUsuario,
        to: "Todos",
        text: inputMsg.value,
        type: "message"
    };
    const promise = axios.post(urlAPI + '/messages', corpoMensagem)
    promise.then(function () {
        lerMensagens();
        inputMsg.value = "";
    });
    promise.catch(tratarErroEnvioMsg);
}

function tratarErroEnvioMsg() {
    window.location.reload();
}
