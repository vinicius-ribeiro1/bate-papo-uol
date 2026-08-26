const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

let participants = [];
let messages = [];


// ========================================
// PARTICIPANTES
// ========================================

// Entrar na sala
app.post("/api/v6/uol/participants", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.sendStatus(400);
    }

    const alreadyExists = participants.some(
        participant => participant.name === name
    );

    if (alreadyExists) {
        return res.sendStatus(400);
    }

    participants.push({
        name: name,
        lastStatus: Date.now()
    });

    // Mensagem de entrada
    messages.push({
        from: name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: new Date().toLocaleTimeString("pt-BR")
    });

    res.sendStatus(200);
});


// Buscar participantes
app.get("/api/v6/uol/participants", (req, res) => {
    const participantsList = participants.map(participant => ({
        name: participant.name
    }));

    res.json(participantsList);
});


// Manter usuário online
app.post("/api/v6/uol/status", (req, res) => {
    const { name } = req.body;

    const participant = participants.find(
        participant => participant.name === name
    );

    if (!participant) {
        return res.sendStatus(404);
    }

    participant.lastStatus = Date.now();

    res.sendStatus(200);
});


// Remover usuários offline
setInterval(() => {
    const now = Date.now();

    const offlineParticipants = participants.filter(
        participant => now - participant.lastStatus >= 10000
    );

    offlineParticipants.forEach(participant => {
        messages.push({
            from: participant.name,
            to: "Todos",
            text: "saiu da sala...",
            type: "status",
            time: new Date().toLocaleTimeString("pt-BR")
        });
    });

    participants = participants.filter(
        participant => now - participant.lastStatus < 10000
    );
}, 1000);


// ========================================
// MENSAGENS
// ========================================

// Buscar todas as mensagens
app.get("/api/v6/uol/messages", (req, res) => {
    res.json(messages);
});


// Enviar mensagens
app.post("/api/v6/uol/messages", (req, res) => {
    const { from, to, text, type } = req.body;

    // Verifica se o remetente está online
    const sender = participants.find(
        participant => participant.name === from
    );

    if (!sender) {
        return res.sendStatus(404);
    }

    // Verifica se o destinatário existe
    // quando a mensagem for privada
    if (type === "private_message") {
        const receiver = participants.find(
            participant => participant.name === to
        );

        if (!receiver) {
            return res.sendStatus(404);
        }
    }

    // Validação básica
    if (!to || !text || !type) {
        return res.sendStatus(400);
    }

    messages.push({
        from: from,
        to: to,
        text: text,
        type: type,
        time: new Date().toLocaleTimeString("pt-BR")
    });

    res.sendStatus(201);
});


// ========================================
// SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});