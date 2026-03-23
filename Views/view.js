/**
 * Objet constant représentant la vue.
 */
export const view = {
    btnLancerRecherche: document.querySelector("#btn-lancer-recherche"),

    champRecherche: document.querySelector("#section-recherche input[type=text]"),

    btnFavoris: document.querySelector("#btn-favoris"),

    etoileFavoris: document.querySelector("#etoile"),

    categorie1: document.querySelector("#categorie-1"),

    categorie2: document.querySelector("#categorie-2"),

    categorie3: document.querySelector("#categorie-3"),

    blocResultats: document.querySelector("#bloc-resultats"),

    listeFavoris: document.querySelector("#liste-favoris")
};



export function afficherJeuxProposes(jeux) {
    view.blocResultats.innerHTML = "";

    jeux.forEach((jeu) => {
    const imageUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${jeu.getAppid()}/header.jpg`;
    const lienSteam = `https://store.steampowered.com/app/${jeu.getAppid()}`;

    view.blocResultats.innerHTML += `
            <article class="carte-jeu">
                <img src="${imageUrl}" alt="Image de ${jeu.getName()}">
                <h3>${jeu.getName()}</h3>
                <a href="${lienSteam}" target="_blank">Voir sur Steam</a>
            </article>
    `;
    });
}

export async function afficherTop3Cat(categories) {

    let compteur = 1;
  for (const [nom, data] of categories) {

    const bloc = document.querySelector(`#categorie-${compteur}`);

    compteur++;

    const titre = bloc.querySelector(".cat-titre");
    titre.textContent = nom;

    const url = `https://store.steampowered.com/search/results/?json=1&filter=topsellers&category1=${data.id}&supportedlang=french&hidef2p=1&page=1`;

    try {
      const response = await fetch(url);
      const dataApi = await response.json();

      const items = dataApi.items || [];

      const container = bloc.querySelector(".cat-jeux");
      container.innerHTML = "";

      items.slice(0, 5).forEach((jeu, index) => {

        const imageUrl = jeu.logo;
        const lienSteam = `https://store.steampowered.com/search/?term=${encodeURIComponent(jeu.name)}`;

        container.innerHTML += `
          <article class="carte-jeu">
            <img src="${imageUrl}" alt="Image de ${jeu.name}">
            <h3>${jeu.name}${index == 1 ? "!! Incroyable !!" : ""}</h3>
            <a href="${lienSteam}" target="_blank">Voir sur Steam</a>
          </article>
        `;
      });

    } catch (error) {
      console.error(`Erreur API catégorie ${nom}:`, error);
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
