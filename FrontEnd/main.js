var loginOk = false;

//Récupération du token de connexion s'il existe
let token = window.localStorage.getItem('token');
if (token !== null){
    console.log ("connected with token : "+token);
    loginOk = true;
} else {
    console.log("not connected");
}

//Récupération des travaux eventuellement stockés en local
let works = window.localStorage.getItem('works');
if (works === null){
    //Récupération et stockage des travaux par appel API
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json();
    const stringWorks = JSON.stringify(works);
    window.localStorage.setItem("works", stringWorks);
} else {
    //Transformation de la chaîne en structure json
    works = JSON.parse(works);
}

//Récupération des catégories eventuellement stockées en local
let categories = window.localStorage.getItem('categories');
if (categories === null){
    //Récupération et stockage des catégories par appel API
    const reponse = await fetch('http://localhost:5678/api/categories');
    categories = await reponse.json();
    const stringCategories = JSON.stringify(categories);
    window.localStorage.setItem("categories", stringCategories);
} else {
    //Transformation de la chaîne stockée en structure json
    categories = JSON.parse(categories);
}

//Gestion de la modale
const closeModal = function (e) {
    if (modal !== null) {
        e.preventDefault();
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-modal', 'false');
        modal.removeEventListener('click', closeModal);
        document.getElementById('exit').removeEventListener('click', closeModal);
        modal = null;
        }
}

const openModal = function (e) {
    e.preventDefault();
    const target = document.getElementById("modal");
    target.style.display = null;
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    modal.addEventListener('click', closeModal);
    document.getElementById('exit').addEventListener('click', closeModal);
}

document.getElementById("modalOpener").addEventListener('click', openModal);

// affichages initiaux
createCategories();
// affichage des projets
createGallery(works);



// affichage des filtres de catégories
function createCategories() {
    //récupération de l'élément du DOM
    const filtersSection = document.querySelector('.filters');
    //vidage du contenu éventuel
    filtersSection.innerHTML = '';

    //création du bouton "Tous"
    var element = document.createElement('div');
    element.classList.add('categoryFilterButton');
    element.innerHTML='Tous';
    element.addEventListener("click", function() {filterWorks("-1");});

    //ajout au DOM
    filtersSection.appendChild(element);

    //parcours de l'ensemble des catégories et création des boutons associés
    for (let i = 0; i < categories.length; i++) {
        element = document.createElement('div');
        element.classList.add('categoryFilterButton');
        element.innerHTML=categories[i].name;
        element.addEventListener("click", function() {filterWorks(categories[i].id);});

        //ajout au DOM
        filtersSection.appendChild(element);
    }
}

//fonction de filtrage des projets sur catégorie
function filterWorks(categoryId) {
    const filteredWorks = works.filter((work) => categoryId === "-1" ? true : work.categoryId === categoryId);
    createGallery(filteredWorks);
}

// création de la galerie à partir du json passé en paramètre
function createGallery(worksToBeDisplayed) {
    console.log(worksToBeDisplayed);
    const gallery = document.querySelector('.gallery');
    var content = '';
    for(let i = 0; i < worksToBeDisplayed.length; i++){
        content += '<figure>';
        content += '<img src=\"'+ worksToBeDisplayed[i].imageUrl + '\" alt=\"' + worksToBeDisplayed[i].title + '\">';
        content += '<figcaption>' + worksToBeDisplayed[i].title + '</figcaption>';
        content += '</figure>\n';
    }
    gallery.innerHTML=content;
}
