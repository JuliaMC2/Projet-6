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

// masquage du bouton modifier si on n'est pas connecté
let editGalleryButton = document.getElementById('editGallery');
let filtersSection = document.querySelector('.filters');
toggleDisplays();

function toggleDisplays() {
    if (loginOk) {
        editGalleryButton.style.display = null;
        filtersSection.style.display ='none';
    } else {
        editGalleryButton.style.display = 'none';
        filtersSection.style.display ='flex';
    }
}
//Gestion de la modale
let modal = null;

const FromGalleryToAddPhoto = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('addPhotoForm').style.display = null;
    document.getElementById('back').style.visibility = null;
    document.getElementById('photoGallery').style.display = 'none';
}

const FromAddPhotoToGallery = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('addPhotoForm').style.display = 'none';
    document.getElementById('back').style.visibility = 'hidden';
    document.getElementById('photoGallery').style.display = null;
}

function displayThumbs() {
    const gallery = document.querySelector('.photoThumbsList');
    var figure;
    var img;
    var item;

    gallery.innerHTML = '';
    //parcourir works et créer les éléments HTML correspondants
    for(let i = 0; i < works.length; i++){
        //créer la balise figure qui encapsule un élément
        figure = document.createElement('figure');
        //créer la balise img avec sa source et son affichage alternatif
        img = document.createElement('img');
        img.src=works[i].imageUrl;
        img.alt=works[i].title;
        //créer la poubelle, y ajouter le comportement attendu
        item = document.createElement('i');
        item.classList.add('fa');
        item.classList.add('fa-trash-o');
        item.classList.add('trashHandler');
        item.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            (deleteProject(works[i].id));
            if (!loginOk) {
                window.localStorage.removeItem('token');
            }
        });
        // ajouter les fils à l'élément figure
        figure.appendChild(img);
        figure.appendChild(item);
        //ajouter figure à la galerie de miniatures
        gallery.appendChild(figure);
    }
}

async function deleteProject(idProject) {

    const rawResponse = await fetch('http://localhost:5678/api/works/'+idProject, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+token
        },
    });

    //attente de la réponse
    console.log(rawResponse.status);
    if (rawResponse.status === 204 ) {
        deleteLocalProject(idProject);
        createGallery(works);
        displayThumbs();
    }
    if (rawResponse.status === 401) {
        loginOk = false;
        toggleDisplays();
    }
}

function deleteLocalProject (idProject) {
    var tempWorks = new Array(works.length-1);
    var offset=0;
    for (var i=0; i<works.length; i++)
        if (works[i].id !== idProject) {
            tempWorks[i+offset] = works[i];
        } else {
            offset = -1;
        }
    works=tempWorks;
}

const closeModal = function (e) {
    if (modal !== null) {
        e.preventDefault();
        e.stopPropagation();
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('aria-modal', 'false');
        modal.removeEventListener('click', closeModal);
        document.getElementById('exit').removeEventListener('click', closeModal);
        modal = null;
        createCategories();
    }
}

const openModal = function (e) {
    e.preventDefault();
    e.stopPropagation();
    displayThumbs();
    const target = document.getElementById("modal");
    target.style.display = null;
    target.removeAttribute('aria-hidden');
    target.setAttribute('aria-modal', 'true');
    modal = target;
    modal.addEventListener('click', closeModal);
    document.getElementById('exit').addEventListener('click', closeModal);
    document.getElementById('addPhotoButton').addEventListener('click', FromGalleryToAddPhoto);
    document.getElementById('back').addEventListener('click', FromAddPhotoToGallery);
}

document.getElementById("modalOpener").addEventListener('click', openModal);

// affichage des projets
createGallery(works);
//afichage des catégories
if (!loginOk)
    createCategories();

// affichage des filtres de catégories
function createCategories() {
    //récupération de l'élément du DOM
    const filtersSection = document.querySelector('.filters');
    //vidage du contenu éventuel
    filtersSection.innerHTML = '';

    //création du bouton "Tous"
    var element = document.createElement('div');
    element.classList.add('greenButton');
    element.innerHTML='Tous';
    element.addEventListener("click", function() {filterWorks("-1");});

    //ajout au DOM
    filtersSection.appendChild(element);

    //parcours de l'ensemble des catégories et création des boutons associés
    for (let i = 0; i < categories.length; i++) {
        element = document.createElement('div');
        element.classList.add('greenButton');
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
