const net = require("net");

// Port de la socket pour le serveur
const PORT = 6667;
const clients = [];

// Création du serveur, la socket ouverte par le client est en paramètre.
const server = net.createServer((socket) => {
    let username = null;
    let buffer = "";

    // Message d'invitation pour entrer le pseudo
    socket.write("Bonjour ! Veuillez entrer votre pseudo :\n\r");

    socket.on("data", (data) => {
        buffer += data.toString();

        if (buffer.includes("\n")) {
            const message = buffer.trim();
            buffer = "";

            if (!username) {
                if (!message) {
                    socket.write("Le pseudo ne peut pas être vide. Veuillez réessayer :\n");
                    return;
                }
                username = message;
                clients.push({socket, username});
                socket.write(`Bienvenue, ${username} ! Vous avez rejoint le chat. Appuyez sur CTRL + C pour quitter la messagerie.\n\r`);
                broadcast(`${username} a rejoint le chat.`, socket);
                return;
            }
            else if (message.toUpperCase() === "QUIT") {
                socket.end("Vous avez quitte le chat. Au revoir !\n");
                return;
            }
            else if (message === "/list"){
                broadcast(clients.map(client => client.username).join(", "))
                return;
            } else if (message.startsWith("/whisper ")) {
                const commande = message.split(" ");
                const targetUsername = commande[1];
                const whisperMessage = commande.slice(2).join(" ");
                const targetClient = clients.find(client => client.username === targetUsername);
                
                if (targetClient) {
                    targetClient.socket.write(`[Whisper][${username}] ${whisperMessage}\n\r`);
                } else {
                    socket.write(`Utilisateur ${targetUsername} introuvable.\n\r`);
                }
                return;
            }
            else {
                broadcast(`${username}: ${message}`, socket);
            }
        }
    });

    socket.on("end", () => {
        clients.splice(clients.findIndex(client => client.socket == socket), 1);
        if (username) {
            broadcast(`${username} a quitte le chat.`, socket);
        }
    });

    socket.on("error", (err) => {
        console.error(`Erreur avec un client: ${err.message}`);
    });
});

function broadcast(message, senderSocket) {
    clients.forEach((client) => {
        if (client.socket !== senderSocket) {
            client.socket.write(`${message}\n\r`);
        }
    });
}

async function handleSignal() {
    clients.forEach((client) => {
        client.socket.write(`le serveur va ferme dans 5s\n\r`);
    });
    console.log("Nettoyage en cours...")
    setTimeout(() => {process.exit(0);},5000)
    }

// Démarre le serveur sur le port 6667
server.listen(PORT, () => {
    console.log(`Serveur IRC en écoute sur le port ${PORT}`);
    process.on("SIGINT", () => handleSignal());
});