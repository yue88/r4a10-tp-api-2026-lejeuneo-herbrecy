import { view, afficherChargement, afficherErreur, afficherFavoris, afficherJeuxProposes, afficherTop3Cat, masquerChargement, reinitialiserCategories } from "./Views/view.js";
import { Jeu } from "./Model/modeleJeu.js";

const SOURCE_ETOILE_VIDE = "/images/etoile-vide.svg";
const SOURCE_ETOILE_PLEINE = "/images/etoile-pleine.svg";
const CLE_FAVORIS = "steam-favoris";

const favoris = JSON.parse(localStorage.getItem(CLE_FAVORIS) || "[]");
afficherFavoris(favoris);
reinitialiserCategories();

view.champRecherche.addEventListener("keyup", () => {
  const actif = view.champRecherche.value.trim() !== "";
  view.btnLancerRecherche.disabled = !actif;
  view.btnFavoris.disabled = !actif;
});

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

async function recupererJeux(steamId) {
  const response = await fetch(`api.php?action=owned-games&steamid=${encodeURIComponent(steamId)}`);

  if (!response.ok) {
    throw new Error("Le backend n'a pas pu recuperer les jeux.");
  }

  return await response.json();
}

async function recupererProfil(steamId) {
  const response = await fetch(`api.php?action=profile&steamid=${encodeURIComponent(steamId)}`);

  if (!response.ok) {
    throw new Error("Le backend n'a pas pu recuperer le profil.");
  }

  return await response.json();
}

async function recupererDetailsJeu(appid) {
  const response = await fetch(`api.php?action=app-details&appid=${encodeURIComponent(appid)}`);

  if (!response.ok) {
    throw new Error("Le backend n'a pas pu recuperer les details du jeu.");
  }

  return await response.json();
}

view.btnLancerRecherche.addEventListener("click", async function () {
  const steamId = view.champRecherche.value.trim();

  if (steamId === "") {
    return;
  }

  afficherChargement();
  reinitialiserCategories();

  try {
    const profil = await recupererProfil(steamId);

    if (!profil) {
      afficherErreur("Aucun profil Steam trouve pour cet identifiant.");
      return;
    }

    const reponseTotaleParId = await recupererJeux(steamId);
    const jeuxApi = reponseTotaleParId.response?.games || [];

    if (jeuxApi.length === 0) {
      afficherErreur("Bibliotheque privee, vide ou identifiant Steam invalide.");
      return;
    }

    const jeuxPossedes = jeuxApi.map((jeu) =>
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

    if (top6Jeux.length === 0) {
      afficherErreur("Aucun jeu avec du temps de jeu visible pour ce compte.");
      return;
    }

    afficherJeuxProposes(top6Jeux);

    const occurrencesCategories = {};

    for (const jeu of top6Jeux) {
      const details = await recupererDetailsJeu(jeu.getAppid());

      if (details?.genres && details.genres.length > 0) {
        const categoriePrincipale = details.genres[0].description;

        if (occurrencesCategories[categoriePrincipale]) {
          occurrencesCategories[categoriePrincipale].count++;
        } else {
          occurrencesCategories[categoriePrincipale] = { count: 1 };
        }
      }
    }

    const top3Categories = Object.entries(occurrencesCategories)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    await afficherTop3Cat(top3Categories);
  } catch (error) {
    console.error("Erreur API :", error);
    afficherErreur("Une erreur est survenue pendant le chargement des donnees Steam.");
  } finally {
    masquerChargement();
  }
});

view.btnFavoris.addEventListener("click", async function () {
  const etoile = view.etoileFavoris;
  const steamId = view.champRecherche.value.trim();

  etoile.src = etoile.src.includes(SOURCE_ETOILE_VIDE)
    ? SOURCE_ETOILE_PLEINE
    : SOURCE_ETOILE_VIDE;

  if (steamId === "") {
    return;
  }

  try {
    const profil = await recupererProfil(steamId);

    if (!profil) {
      afficherErreur("Impossible d'ajouter ce favori : profil introuvable.");
      return;
    }

    const profilFavori = {
      steamid: profil.steamid,
      personaname: profil.personaname,
      avatarfull: profil.avatarfull,
    };

    const dejaPresent = favoris.some((fav) => fav.steamid === profilFavori.steamid);

    if (!dejaPresent) {
      favoris.push(profilFavori);
      localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris));
    }

    afficherFavoris(favoris);
  } catch (error) {
    console.error("Erreur favoris :", error);
    afficherErreur("Impossible d'ajouter ce favori pour le moment.");
  }
});
