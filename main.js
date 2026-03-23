import { view } from './Views/view.js';
import { Jeu } from "./Model/modeleJeu.js";

import { afficherJeuxProposes } from "./Views/view.js";
import { afficherTop3Cat } from "./Views/view.js";
import { afficherFavoris} from "./Views/view.js";

const SOURCE_ETOILE_VIDE = "/images/etoile-vide.svg";
const SOURCE_ETOILE_PLEINE = "/images/etoile-pleine.svg";
const CLE_FAVORIS = "steam-favoris";

const favoris = JSON.parse(localStorage.getItem(CLE_FAVORIS) || "[]");
afficherFavoris(favoris);

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



//-----------------------------call favoris quand clic-----------------------------



view.listeFavoris.addEventListener("click", function (event) {
  const favoriClique = event.target.closest("li");

  if (!favoriClique) {
    return;
  }

  const steamId = favoriClique.dataset.steamid;

  if (!steamId) {
    return;
  }

  view.champRecherche.value = steamId;
  view.btnLancerRecherche.disabled = false;
  view.btnFavoris.disabled = false;
  view.btnLancerRecherche.click();
});



//-----------------------------recup jeux-----------------------------


async function recupererJeux(steamId) {
const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=847C531FE8FB222847926854D016ABA7&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;

  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("Le proxy AllOrigins a echoue.");
  }

  const data = await response.json();

  const vraiJSON = JSON.parse(data.contents);

  return vraiJSON;
}


//-----------------------------recup profil-----------------------------


async function recupererProfil(steamId) {
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=847C531FE8FB222847926854D016ABA7&steamids=${steamId}`;

  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("Le proxy AllOrigins a echoue.");
  }

  const data = await response.json();
  const vraiJSON = JSON.parse(data.contents);

  return vraiJSON.response.players[0] || null;
}


//-----------------------------recup details jeu-----------------------------



async function recupererDetailsJeu(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=french`;

  const response = await fetch(
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("Le proxy AllOrigins a echoue.");
  }

  const data = await response.json();
  const vraiJSON = JSON.parse(data.contents);

  return vraiJSON[appid].data;
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

    const top6Jeux = jeuxPossedes
      .filter((jeu) => jeu.getPlaytimeforever() > 0)
      .sort((a, b) => b.getPlaytimeforever() - a.getPlaytimeforever())
      .slice(0, 6);

    console.log(top6Jeux);

    afficherJeuxProposes(top6Jeux);

    const occurrencesCategories = {};

    for (const jeu of top6Jeux) {
      const details = await recupererDetailsJeu(jeu.getAppid());

      if (details.genres && details.genres.length > 0) {
        const categoriePrincipale = details.genres[0].description;
        const categorieId = details.genres[0].id;

        if (occurrencesCategories[categoriePrincipale]) {
          occurrencesCategories[categoriePrincipale].count++;
        } else {
          occurrencesCategories[categoriePrincipale] = {
            count: 1,
            idCategorie: categorieId
          };
        }
      }
    }

    console.log(occurrencesCategories);

    const top3Categories = Object.entries(occurrencesCategories)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    afficherTop3Cat(top3Categories);

  
    
  } catch (error) {
    console.error("Erreur API :", error);
  }

});

// Permet de mettre en favoris

view.btnFavoris.addEventListener("click", async function () {

  const etoile = view.etoileFavoris;
  const steamId = view.champRecherche.value.trim();

  if(etoile.src.includes(SOURCE_ETOILE_VIDE)){
    etoile.src = SOURCE_ETOILE_PLEINE;
  } else {
    etoile.src = SOURCE_ETOILE_VIDE;
  }

  if (steamId === "") {
    return;
  }

  try {
    const profil = await recupererProfil(steamId);

    if (!profil) {
      return;
    }

    const profilFavori = {
      steamid: profil.steamid,
      personaname: profil.personaname,
      avatarfull: profil.avatarfull
    };

    const dejaPresent = favoris.some((fav) => fav.steamid === profilFavori.steamid);

    if (!dejaPresent) {
      favoris.push(profilFavori);
      localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
    }

    afficherFavoris(favoris);
  } catch (error) {
    console.error("Erreur favoris :", error);
  }
  
});


