/**
 * Objet constant representant la vue.
 */
export const view = {
  btnLancerRecherche: document.querySelector("#btn-lancer-recherche"),
  champRecherche: document.querySelector("#section-recherche input[type=text]"),
  btnFavoris: document.querySelector("#btn-favoris"),
  etoileFavoris: document.querySelector("#etoile"),
  blocResultats: document.querySelector("#bloc-resultats"),
  blocGifAttente: document.querySelector("#bloc-gif-attente"),
  listeFavoris: document.querySelector("#liste-favoris"),
  categories: [
    document.querySelector("#categorie-1"),
    document.querySelector("#categorie-2"),
    document.querySelector("#categorie-3"),
  ],
};

export function afficherChargement() {
  view.blocGifAttente.style.display = "block";
  view.blocResultats.innerHTML = "";
}

export function masquerChargement() {
  view.blocGifAttente.style.display = "none";
}

export function afficherErreur(message) {
  view.blocResultats.innerHTML = `
    <p class="msg-erreur">${message}</p>
  `;
}

export function reinitialiserCategories() {
  view.categories.forEach((bloc, index) => {
    if (!bloc) {
      return;
    }

    const titre = bloc.querySelector(".cat-titre");
    const container = bloc.querySelector(".cat-jeux");

    titre.textContent = `Categorie ${index + 1}`;
    container.innerHTML = `<p class="cat-vide">Aucune recommandation pour le moment.</p>`;
  });
}

export function afficherJeuxProposes(jeux) {
  view.blocResultats.innerHTML = "";

  jeux.forEach((jeu) => {
    const imageUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${jeu.getAppid()}/header.jpg`;
    const lienSteam = `https://store.steampowered.com/app/${jeu.getAppid()}`;

    view.blocResultats.innerHTML += `
      <article class="carte-jeu">
        <img src="${imageUrl}" alt="Image de ${jeu.getName()}">
        <h3>${jeu.getName()}</h3>
        <a href="${lienSteam}" target="_blank" rel="noopener noreferrer">Voir sur Steam</a>
      </article>
    `;
  });
}

export async function afficherTop3Cat(categories) {
  reinitialiserCategories();

  let compteur = 0;
  const jeuxDejaAffiches = new Set();

  for (const [nom] of categories) {
    const bloc = view.categories[compteur];
    compteur++;

    if (!bloc) {
      continue;
    }

    const titre = bloc.querySelector(".cat-titre");
    const container = bloc.querySelector(".cat-jeux");
    titre.textContent = nom;
    container.innerHTML = `<p class="cat-vide">Chargement...</p>`;

    try {
      const response = await fetch(`api.php?action=top-category&genre=${encodeURIComponent(nom)}`);

      if (!response.ok) {
        throw new Error("Le backend n'a pas pu recuperer la categorie.");
      }

      const dataApi = await response.json();
      const items = dataApi.items || [];
      container.innerHTML = "";

      const itemsUniques = items.filter((jeu) => {
        const appId = jeu.id ?? jeu.appid ?? null;
        const cle = appId ? `appid-${appId}` : `name-${(jeu.name || "").toLowerCase()}`;

        if (jeuxDejaAffiches.has(cle)) {
          return false;
        }

        jeuxDejaAffiches.add(cle);
        return true;
      });

      const itemsAffiches = itemsUniques.length > 0 ? itemsUniques : items;

      if (itemsAffiches.length === 0) {
        container.innerHTML = `<p class="cat-vide">Aucun jeu trouve pour cette categorie.</p>`;
        continue;
      }

      itemsAffiches.slice(0, 5).forEach((jeu) => {
        const imageUrl = jeu.image_url || jeu.logo || "";
        const lienSteam = jeu.steam_url || `https://store.steampowered.com/search/?term=${encodeURIComponent(jeu.name)}`;

        container.innerHTML += `
          <article class="carte-jeu">
            <img src="${imageUrl}" alt="Image de ${jeu.name}">
            <h3>${jeu.name}</h3>
            <a href="${lienSteam}" target="_blank" rel="noopener noreferrer">Voir sur Steam</a>
          </article>
        `;
      });
    } catch (error) {
      console.error(`Erreur API categorie ${nom}:`, error);
      container.innerHTML = `<p class="cat-vide">Impossible de charger cette categorie.</p>`;
    }
  }
}

export function afficherFavoris(fav) {
  view.listeFavoris.innerHTML = "";

  fav.forEach((profil) => {
    view.listeFavoris.innerHTML += `
      <li data-steamid="${profil.steamid}">
        <span class="fav-item">
          <img src="${profil.avatarfull}" alt="Avatar de ${profil.personaname}" width="32" height="32">
          <span class="nom-profil-fav">${profil.personaname}</span>
        </span>
      </li>
    `;
  });
}
