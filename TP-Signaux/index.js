let actif = true;

// Fonction générique pour gérer les signaux
async function handleSignal() {
  if (actif){
    clearInterval(interval);
    console.log("Nettoyage en cours...")
    setTimeout(() => {process.exit(0);},5000)
  } else {console.log("il n'est pas possible de l'arreter maitenant, réessayer dans quelques secondes.");}
  }
  
  // Ecoute du signal SIGINT.
  process.on("SIGINT", () => handleSignal());
  
  // Simulation d'une application qui reste active
  console.log("Application en cours d'exécution.");
  console.log(
    "Appuyez sur CTRL+C pour envoyer un signal."
  );
  
  // Execute la fonction toutes les 5 secondes.
  let interval = setInterval(() => {
    console.log("Le processus est toujours actif...");
    actif = !actif;
  }, 5000);