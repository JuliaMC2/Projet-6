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
    writeLocalWorks();
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
    document.getElementById('addPhotoForm').style.display = 'flex';
    document.getElementById('back').style.visibility = null;
    document.getElementById('photoGallery').style.display = 'none';

    document.getElementById('addPhotoButton').style.display = 'none';
    document.getElementById('validateButton').style.display = null;

}

const FromAddPhotoToGallery = function(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('addPhotoForm').style.display = 'none';
    document.getElementById('back').style.visibility = 'hidden';
    document.getElementById('photoGallery').style.display = null;
    killThumb();
    document.getElementById('addPhotoButton').style.display = null;
    document.getElementById('validateButton').style.display = 'none';
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

let selectCategory = document.getElementById('category');
function createCategoriesSelectOptions() {
    selectCategory.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    if (selectCategory.options.length === 0) {
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "";
        selectCategory.appendChild(emptyOption);
    
        categories.forEach((category) => {
          const option = document.createElement("option");
          option.textContent = category.name;
          option.setAttribute("value", category.id);
          selectCategory.appendChild(option);
        });
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
    if (rawResponse.status === 204 ) {
        let works_updated = works.filter(work => work.id !== idProject)
        window.localStorage.setItem('works', JSON.stringify(works_updated));
        works=works_updated;
        createGallery(works);
        displayThumbs();
    }
    if (rawResponse.status === 401) {
        loginOk = false;
        toggleDisplays();
    }
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
        document.getElementById("title").removeEventListener('click', handleTextInput);
        document.getElementById('addPhotoFormButton').removeEventListener('click', openFileUploadDialog);
        document.getElementById('hiddenFileInput').removeEventListener('change', handleFileUpload);

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
    document.getElementsByClassName('modalWrapper')[0].addEventListener('click', handleTextInput);
    document.getElementById('exit').addEventListener('click', closeModal);
    document.getElementById('addPhotoButton').addEventListener('click', FromGalleryToAddPhoto);
    document.getElementById('back').addEventListener('click', FromAddPhotoToGallery);
    document.getElementById("title").addEventListener('click', handleTextInput);
    document.getElementById('addPhotoFormButton').addEventListener('click', openFileUploadDialog);
    document.getElementById('hiddenFileInput').addEventListener('change', handleFileUpload);
    document.getElementById('validateButton').setAttribute('disabled', true);
    document.getElementById('validateButton').addEventListener('click', uploadNewWork);
    document.getElementById("title").addEventListener('change', validateFields);
    document.getElementById('category').addEventListener('change', validateFields);
}

document.getElementById("modalOpener").addEventListener('click', openModal);

const handleTextInput = function(e) {
    e.preventDefault();
    e.stopPropagation();
}

const openFileUploadDialog = async function(e) {
    var input = document.getElementById('hiddenFileInput');
    input.click();
}

var isImageInitialized = false;
const killThumb = function(e) {

    document.getElementById('newThumb').style.display = 'none';
    document.getElementById('newThumb').src='';

    document.getElementById('photoPictogram').style.display = null;
    document.getElementById('addPhotoFormButton').style.display = null;
    document.getElementById('fileExpetations').style.display = null;
    isImageInitialized = false;
}

const displayNewThumb = async function(e) {
    var data = e.target.result;
    document.getElementById('newThumb').style.display = null;
    document.getElementById('newThumb').src=data;

    document.getElementById('photoPictogram').style.display = 'none';
    document.getElementById('addPhotoFormButton').style.display = 'none';
    document.getElementById('fileExpetations').style.display = 'none';
    isImageInitialized = true;
    validateFields(e);
 }

const handleFileUpload = async function(e)  {
    var file = e.target.files[0];
    var reader = new FileReader();
    console.log(file.name + ' : ' + file.type +' (' + (file.size / 1024) + ' kb)');
    if (file.size < 4*1024*1024) // taille inférieure à 4 MO (le type est forcément bon à cause du accept dans le html)
        {
            reader.onload = displayNewThumb;
            reader.readAsDataURL(file);
        }
}

const validateFields = function (e) {
    e.stopPropagation();
    const newWorkTitle = document.getElementById('title');
    const newWorkCateg = document.getElementById('category');
    const btnValidate  = document.getElementById('validateButton');

    console.log(isImageInitialized + "/" + newWorkTitle.value.length + "/" + newWorkCateg.value.length );

    if (isImageInitialized && newWorkTitle.value.length > 0 && newWorkCateg.value.length > 0) {
        btnValidate.removeAttribute('disabled');
        btnValidate.style.cursor = 'pointer';
        document.getElementById('missingFields').style.visibility = 'hidden';
    } else {
        btnValidate.setAttribute('disabled', true);
        btnValidate.style.cursor = 'default';
        document.getElementById('missingFields').style.visibility = null;
        document.getElementById('missingFields').innerHTML = 'Tous les champs sont obligatoires.'
    }

}

async function writeLocalWorks() {
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json();
    const stringWorks = JSON.stringify(works);
    window.localStorage.setItem("works", stringWorks);
}

const uploadNewWork = async function (e) {
    const newWorkImage = document.getElementById('hiddenFileInput');
    const newWorkTitle = document.getElementById('title');
    const newWorkCateg = document.getElementById('category');
    const uploadedWork = new FormData();

    uploadedWork.append('title', newWorkTitle.value);
    uploadedWork.append('category', newWorkCateg.value);
    uploadedWork.append('image', newWorkImage.files[0]);

    e.preventDefault();
    e.stopPropagation();

    const rawResponse = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer '+token
            },
            body: uploadedWork
        });
    
        //attente de la réponse
    console.log(rawResponse.status);
    if (rawResponse.status < 400 ) {
        console.log('Tout s\'est bien passé.');

        await writeLocalWorks();
        createGallery(works);
        displayThumbs();
    } else {
        console.log(rawResponse);
        document.getElementById('missingFields').innerHTML = 'Une erreur a eu lieu pendant la création du projet.';
        document.getElementById('missingFields').style.visibility = null;
    }
}

// affichage des projets
createGallery(works);
//afichage des catégories
if (!loginOk)
    createCategories();
createCategoriesSelectOptions();

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
