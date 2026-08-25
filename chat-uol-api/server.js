const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

let participants = [];
let messages = [];

// ================================
// PARTICIPANTES
// ================================

// Entrar na sala
app.post("/api/v6/uol/participants", (req, res) => {
    const { name } = req.body;

    const userAlreadyExists = participants.some(
        participant => participant.name === name
    );

    if (userAlreadyExists) {
        return res.sendStatus(400);
    }

    participants.push({
        name: name,
        lastStatus: Date.now()
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

    participants = participants.filter(
        participant => now - participant.lastStatus < 10000
    );
}, 1000);


// ================================
// MENSAGENS
// ================================

// Buscar mensagens
app.get("/api/v6/uol/messages", (req, res) => {
    const { user } = req.query;

    const visibleMessages = messages.filter(message => {
        if (message.type === "message") {
            return true;
        }

        if (message.type === "private_message") {
            return message.from === user || message.to === user;
        }

        return false;
    });

    res.json(visibleMessages);
});

// Enviar mensagens
app.post("/api/v6/uol/messages", (req, res) => {
    const { from, to, text, type } = req.body;

    const sender = participants.find(
        participant => participant.name === from
    );

    if (!sender) {
        return res.sendStatus(404);
    }

    if (type === "private_message") {
        const receiver = participants.find(
            participant => participant.name === to
        );

        if (!receiver) {
            return res.sendStatus(404);
        }
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


// ================================
// SERVIDOR
// ================================

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});