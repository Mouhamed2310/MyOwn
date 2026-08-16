const NUMERO_WHATSAPP = "212603912558"; // même numéro que script.js — à mettre à jour aux deux endroits

// Menu burger (identique à index.html)
const burger = document.querySelector('.burger');
const nav = document.querySelector('nav');
if (burger) {
    burger.addEventListener('click', () => nav.classList.toggle('active'));
}

// ========================================= //
// RÉCUPÉRATION DU PRODUIT DEPUIS L'URL
// ========================================= //
const parametres = new URLSearchParams(window.location.search);
const idProduit = parametres.get('produit');
const produit = PRODUITS[idProduit];

const conteneurDetail = document.querySelector('.detail-produit');

if (!produit) {
    // Produit inconnu ou lien mal formé : message clair au lieu d'une page cassée
    conteneurDetail.innerHTML = `
        <div class="produit-introuvable">
            <h1>Produit introuvable</h1>
            <p>Ce produit n'existe pas ou le lien est incorrect.</p>
            <a href="index.html#catalogue" class="btn">Voir le catalogue</a>
        </div>
    `;
} else {
    // Remplissage de la page avec les infos du produit
    document.title = `MyOwn – ${produit.nom}`;
    document.getElementById('fil-nom-produit').textContent = produit.nom;
    document.getElementById('produit-image').src = produit.image;
    document.getElementById('produit-image').alt = produit.nom;
    document.getElementById('produit-nom').textContent = produit.nom;
    document.getElementById('produit-prix').textContent = `${produit.prix} MAD`;
    document.getElementById('produit-description').textContent = produit.description;

    // Tailles disponibles
    const taillesEl = document.getElementById('tailles-liste');
    let tailleChoisie = produit.tailles[0];
    produit.tailles.forEach((taille, index) => {
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'taille-bouton' + (index === 0 ? ' active' : '');
        bouton.textContent = taille;
        bouton.addEventListener('click', () => {
            tailleChoisie = taille;
            document.querySelectorAll('.taille-bouton').forEach(b => b.classList.remove('active'));
            bouton.classList.add('active');
        });
        taillesEl.appendChild(bouton);
    });

    // Sélecteur de quantité
    let quantite = 1;
    const qteValeurEl = document.getElementById('qte-valeur');
    document.getElementById('qte-moins').addEventListener('click', () => {
        if (quantite > 1) {
            quantite -= 1;
            qteValeurEl.textContent = quantite;
        }
    });
    document.getElementById('qte-plus').addEventListener('click', () => {
        quantite += 1;
        qteValeurEl.textContent = quantite;
    });

    // Panier partagé avec index.html (même clé localStorage)
    let panier = JSON.parse(localStorage.getItem('myown_panier')) || [];
    function mettreAJourCompteur() {
        const total = panier.reduce((s, a) => s + a.quantite, 0);
        const compteurEl = document.querySelector('.compteur');
        if (compteurEl) compteurEl.textContent = total;
    }
    mettreAJourCompteur();

    // Ajouter au panier (avec taille choisie dans le nom pour la garder visible dans le récap)
    document.getElementById('btn-ajouter-detail').addEventListener('click', function () {
        const nomAvecTaille = `${produit.nom} (Taille ${tailleChoisie})`;
        const existant = panier.find(item => item.nom === nomAvecTaille);
        if (existant) {
            existant.quantite += quantite;
        } else {
            panier.push({ nom: nomAvecTaille, prix: produit.prix, quantite: quantite });
        }
        localStorage.setItem('myown_panier', JSON.stringify(panier));
        mettreAJourCompteur();

        const texteOriginal = this.textContent;
        this.textContent = "Ajouté ✓";
        setTimeout(() => { this.textContent = texteOriginal; }, 1200);
    });

    // Commander directement sur WhatsApp
    const lienWhatsApp = document.getElementById('btn-whatsapp-detail');
    function mettreAJourLienWhatsApp() {
        const message = `Bonjour, je souhaite commander : ${produit.nom}, taille ${tailleChoisie}, quantité ${quantite} (${produit.prix * quantite} MAD). Est-il disponible ?`;
        lienWhatsApp.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
    }
    mettreAJourLienWhatsApp();
    document.querySelectorAll('.taille-bouton, #qte-moins, #qte-plus').forEach(el => {
        el.addEventListener('click', mettreAJourLienWhatsApp);
    });
}

// Bouton WhatsApp flottant (message général)
const whatsappFlottant = document.getElementById('whatsapp-flottant');
if (whatsappFlottant) {
    const messageGeneral = "Bonjour, je m'intéresse à vos polos MyOwn. Pouvez-vous m'en dire plus ?";
    whatsappFlottant.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(messageGeneral)}`;
}