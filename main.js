import { view } from './Views/view.js';

const SOURCE_ETOILE_VIDE = "/images/etoile-vide.svg";
const SOURCE_ETOILE_PLEINE = "/images/etoile-pleine.svg";

// Gestion de la recherche

// A chaque lettre rentrée on vérifie si le champ est vide, si il l'est on empêche le clique sur le btn recherche et sur le bouton favori

view.champRecherche.addEventListener("keyup", (evt) => {

  if (view.champRecherche.value.trim() !== "") {
    view.btnLancerRecherche.disabled = false;
    view.btnFavoris.disabled = false;
  } else {
    view.btnLancerRecherche.disabled = true;
    view.btnFavoris.disabled = true;
  }

});

// Permet de faire l'appel API lors du clique sur la loupe

async function recupererJeux(steamId) {
  const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=847C531FE8FB222847926854D016ABA7&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`)}`)
                    .then(response => {
                      if (response.ok) return response.json()
                      throw new Error('Network response was not ok.')
                    })
                    .then(data => console.log(data.contents));
}

view.btnLancerRecherche.addEventListener("click", async function () {

  const steamId = view.champRecherche.value.trim();

  const reponseTotaleParId = await recupererJeux(steamId);

  if(Object.keys(reponseTotaleParId.response).length === 0){
    // Action de si l'id est mauvais
  } else {
    const jeuxPossedes = reponseTotaleParId.response.games.map(jeu => {
      return new Jeu(
        jeu.appid,
        jeu.name,
        jeu.playtime_forever,
        jeu.img_icon_url
      );
    });

    console.log(jeuxPossedes);
  }

  

});

// Permet de mettre en favoris

view.btnFavoris.addEventListener("click", function () {

  const etoile = view.etoileFavoris;

  if(etoile.src.includes(SOURCE_ETOILE_VIDE)){
    etoile.src = SOURCE_ETOILE_PLEINE;
  } else {
    etoile.src = SOURCE_ETOILE_VIDE;
  }
  
});



