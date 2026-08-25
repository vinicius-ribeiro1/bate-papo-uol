const BASE_URL = "http://localhost:3000/api/v6/uol";

async function request(url, options = {}) {
    const response = await fetch(`${BASE_URL}${url}`, options);

    console.log(`${options.method || "GET"} ${url} → ${response.status}`);

    if (!response.ok) {
        console.log("Resposta:", await response.text());
    }

    return response;
}

async function main() {
    console.log("=== TESTE DA API CHAT UOL ===\n");

    // 1. Maria entra
    await request("/participants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Maria"
        })
    });

    // 2. Joao entra
    await request("/participants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Joao"
        })
    });

    // 3. Maria tenta entrar novamente
    await request("/participants", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Maria"
        })
    });

    // 4. Buscar participantes
    const participantsResponse = await request("/participants");
    console.log(
        "Participantes:",
        await participantsResponse.json()
    );

    // 5. Maria envia mensagem pública
    await request("/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "Maria",
            to: "Todos",
            text: "Olá pessoal!",
            type: "message"
        })
    });

    // 6. Maria envia mensagem privada para Joao
    await request("/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: "Maria",
            to: "Joao",
            text: "Oi Joao!",
            type: "private_message"
        })
    });

    // 7. Maria envia status
    await request("/status", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: "Maria"
        })
    });

    // 8. Buscar mensagens da Maria
    const messagesResponse = await request("/messages?user=Maria");
    console.log(
        "Mensagens da Maria:",
        await messagesResponse.json()
    );

    console.log("\n=== TESTE FINALIZADO ===");
}

main();