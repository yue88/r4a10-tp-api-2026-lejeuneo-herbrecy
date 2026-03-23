import { view } from './Views/view.js';
import { Jeu } from "./Model/modeleJeu.js";

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
  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=847C531FE8FB222847926854D016ABA7&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    )}`
  );

  const data = await response.json();

  const vraiJSON = JSON.parse(data.contents);

  return vraiJSON;
}

async function recupererDetailsJeu(appid) {
  const response = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&l=french`
  );

  const data = await response.json();
  return data[appid].data;
}


view.btnLancerRecherche.addEventListener("click", async function () {

  const steamId = view.champRecherche.value.trim();

  try {
    const reponseTotaleParId = await recupererJeux(steamId);

    if (!reponseTotaleParId.response || Object.keys(reponseTotaleParId.response).length === 0) {
      console.log("ID invalide ou aucun jeu");
      return;
    }

    const jeuxPossedes = reponseTotaleParId.response.games.map(jeu =>
      new Jeu(
        jeu.appid,
        jeu.name,
        jeu.playtime_forever
      )
    );

    const top15Jeux = jeuxPossedes
      .filter((jeu) => jeu.getPlaytimeforever() > 0)
      .sort((a, b) => b.getPlaytimeforever() - a.getPlaytimeforever())
      .slice(0, 15);

    console.log(top15Jeux);

    const occurrencesCategories = {};

    for (const jeu of top15Jeux) {
      const details = await recupererDetailsJeu(jeu.getAppid());

      if (details.genres && details.genres.length > 0) {
        const categoriePrincipale = details.genres[0].description;

        if (occurrencesCategories[categoriePrincipale]) {
          occurrencesCategories[categoriePrincipale]++;
        } else {
          occurrencesCategories[categoriePrincipale] = 1;
        }
      }
    }

    console.log(occurrencesCategories);




console.log(occurrencesCategories);


  } catch (error) {
    console.error("Erreur API :", error);
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




import { afficherJeuxProposes } from "./Views/view.js";

const jeuxTest = [
  {
    appid: 570,
    name: "Dota 2",
    categorie: "MOBA"
  },
  {
    appid: 730,
    name: "Counter-Strike 2",
    categorie: "FPS"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  },
  {
    appid: 440,
    name: "Team Fortress 2",
    categorie: "Action"
  }
];

afficherJeuxProposes(jeuxTest);

