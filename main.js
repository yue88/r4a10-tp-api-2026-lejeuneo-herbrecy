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

view.btnLancerRecherche.addEventListener("click", async function () {

  const recherche = view.champRecherche.value.trim();

  const url = `https://www.steamwebapi.com/explore/api/profile?key=SAR2GOHT4LEVIOTW&search=${recherche}`;

  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => {
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    })
    .then(data => console.log(data.contents));

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



