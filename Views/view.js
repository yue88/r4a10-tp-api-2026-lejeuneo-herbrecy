/**
 * Objet constant représentant la vue.
 */
export const view = {
  

    btnLancerRecherche: document.querySelector("#btn-lancer-recherche"),

    champRecherche: document.querySelector("#section-recherche input[type=text]"),

    btnFavoris: document.querySelector("#btn-favoris"),

    etoileFavoris: document.querySelector("#etoile"),

    blocResultats: document.querySelector("#bloc-resultats")

};



export function afficherJeuxProposes(jeux) {
    view.blocResultats.innerHTML = "";

    jeux.forEach((jeu) => {
    const imageUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${jeu.appid}/header.jpg`;
    const lienSteam = `https://store.steampowered.com/app/${jeu.appid}`;

    view.blocResultats.innerHTML += `
            <article class="carte-jeu">
                <img src="${imageUrl}" alt="Image de ${jeu.name}">
                <h3>${jeu.name}</h3>
                <p>${jeu.categorie}</p>
                <a href="${lienSteam}" target="_blank">Voir sur Steam</a>
            </article>
    `;
    });
}
