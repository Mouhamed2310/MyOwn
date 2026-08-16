// ========================================= //
// CONFIGURATION - À MODIFIER
// ========================================= //
// Remplace ce numéro par ton numéro WhatsApp Business, format international sans "+" ni espaces
// Exemple Maroc : 2126XXXXXXXX
const NUMERO_WHATSAPP = "212603912558";

// ========================================= //
// MENU BURGER
// ========================================= //
const burger = document.querySelector('.burger');
const nav = document.querySelector('nav');

burger.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// ========================================= //
// MINI-PANIER (compteur + articles en mémoire locale)
// ========================================= //
let panier = JSON.parse(localStorage.getItem('myown_panier')) || [];

const compteurEl = document.querySelector('.compteur');

function mettreAJourCompteur() {
    const total = panier.reduce((somme, article) => somme + article.quantite, 0);
    compteurEl.textContent = total;
}

function ajouterAuPanier(nom, prix) {
    const existant = panier.find(item => item.nom === nom);
    if (existant) {
        existant.quantite += 1;
    } else {
        panier.push({ nom, prix, quantite: 1 });
    }
    localStorage.setItem('myown_panier', JSON.stringify(panier));
    mettreAJourCompteur();
}

// Écoute les clics sur "Ajouter au panier" pour chaque produit
document.querySelectorAll('.btn-ajouter').forEach(bouton => {
    bouton.addEventListener('click', () => {
        const produitEl = bouton.closest('.produit');
        const nom = produitEl.dataset.nom;
        const prix = produitEl.dataset.prix;
        ajouterAuPanier(nom, prix);

        // petit feedback visuel
        const texteOriginal = bouton.textContent;
        bouton.textContent = "Ajouté ✓";
        setTimeout(() => { bouton.textContent = texteOriginal; }, 1200);
    });
});

mettreAJourCompteur();

// ========================================= //
// COMMANDE VIA WHATSAPP (par produit)
// ========================================= //
function construireLienWhatsApp(message) {
    return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

document.querySelectorAll('.btn-commander-wa').forEach(lien => {
    const produitEl = lien.closest('.produit');
    const nom = produitEl.dataset.nom;
    const prix = produitEl.dataset.prix;
    const message = `Bonjour, je souhaite commander le ${nom} (${prix} MAD). Est-il disponible ?`;
    lien.href = construireLienWhatsApp(message);
});

// ========================================= //
// BOUTON WHATSAPP FLOTTANT (message générique)
// ========================================= //
const whatsappFlottant = document.getElementById('whatsapp-flottant');
if (whatsappFlottant) {
    const messageGeneral = "Bonjour, je m'intéresse à vos polos MyOwn. Pouvez-vous m'en dire plus ?";
    whatsappFlottant.href = construireLienWhatsApp(messageGeneral);
}

// ========================================= //
// RÉCAPITULATIF DU PANIER + ENVOI DE COMMANDE PAR EMAIL
// ========================================= //
const recapPanierEl = document.getElementById('recap-panier');
const messageCommandeEl = document.getElementById('message-commande');
const formCommandeEl = document.getElementById('form-commande');
const confirmationEl = document.getElementById('confirmation-commande');
const btnAcheterHeader = document.getElementById('btn-acheter-header');

function construireRecapTexte() {
    if (panier.length === 0) return '';
    let total = 0;
    const lignes = panier.map(item => {
        const sousTotal = item.prix * item.quantite;
        total += sousTotal;
        return `- ${item.nom} x${item.quantite} = ${sousTotal} MAD`;
    });
    return `Ma commande :\n${lignes.join('\n')}\n\nTotal : ${total} MAD`;
}

function afficherRecapPanier() {
    if (!recapPanierEl) return;

    if (panier.length === 0) {
        recapPanierEl.style.display = 'none';
        recapPanierEl.innerHTML = '';
        return;
    }

    let total = 0;
    const lignesHtml = panier.map(item => {
        const sousTotal = item.prix * item.quantite;
        total += sousTotal;
        return `<li><span>${item.nom} x${item.quantite}</span><span>${sousTotal} MAD</span></li>`;
    }).join('');

    recapPanierEl.innerHTML = `
        <h4>Récapitulatif de votre commande</h4>
        <ul>${lignesHtml}</ul>
        <p class="recap-total">Total : ${total} MAD</p>
    `;
    recapPanierEl.style.display = 'block';

    if (messageCommandeEl) {
        messageCommandeEl.value = construireRecapTexte();
    }
}

// Clic sur "Acheter" dans le header : va vers le formulaire et le pré-remplit
if (btnAcheterHeader) {
    btnAcheterHeader.addEventListener('click', () => {
        setTimeout(afficherRecapPanier, 300);
    });
}

// Envoi du formulaire de commande vers Formspree (sans recharger la page)
if (formCommandeEl) {
    formCommandeEl.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (panier.length === 0) {
            alert("Votre panier est vide. Ajoutez au moins un produit avant de commander.");
            return;
        }

        // S'assure que le récapitulatif est bien dans le message avant l'envoi
        messageCommandeEl.value = construireRecapTexte() + '\n\n' + (messageCommandeEl.value.includes('Ma commande') ? '' : messageCommandeEl.value);

        const donnees = new FormData(formCommandeEl);
        const boutonEnvoyer = formCommandeEl.querySelector('button[type="submit"]');
        const texteOriginal = boutonEnvoyer.textContent;
        boutonEnvoyer.textContent = "Envoi en cours...";
        boutonEnvoyer.disabled = true;

        try {
            const reponse = await fetch(formCommandeEl.action, {
                method: 'POST',
                body: donnees,
                headers: { 'Accept': 'application/json' }
            });

            if (reponse.ok) {
                formCommandeEl.reset();
                formCommandeEl.style.display = 'none';
                recapPanierEl.style.display = 'none';
                confirmationEl.style.display = 'block';

                // Vide le panier après la commande
                panier = [];
                localStorage.setItem('myown_panier', JSON.stringify(panier));
                mettreAJourCompteur();
            } else {
                alert("Une erreur est survenue. Réessayez ou contactez-nous directement sur WhatsApp.");
                boutonEnvoyer.textContent = texteOriginal;
                boutonEnvoyer.disabled = false;
            }
        } catch (erreur) {
            alert("Impossible d'envoyer la commande. Vérifiez votre connexion et réessayez.");
            boutonEnvoyer.textContent = texteOriginal;
            boutonEnvoyer.disabled = false;
        }
    });
}