/**
 * Objet constant représentant la vue.
 */
export const view = {
  btnLancerRecherche: document.querySelector("#btn-lancer-recherche"),

  champRecherche: document.querySelector("#section-recherche input[type=text]"),

  btnFavoris: document.querySelector("#btn-favoris"),

  etoileFavoris: document.querySelector("#etoile"),

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
