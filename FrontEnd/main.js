//Récupération des travaux eventuellement stockés en local
let works = window.localStorage.getItem('works');

if (works === null){
    //Récupération et stockage des travaux par appel API
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json();
    const stringWorks = JSON.stringify(works);
    window.localStorage.setItem("works", stringWorks);
}else{
    //Transformation de la chaîne stockée en structure json
    works = JSON.parse(works);
}


// création de la galerie
const gallery = document.querySelector('.gallery');
var content = '';
for(let i = 0; i < works.length; i++){
    content += '<figure>';
    content += '<img src=\"'+ works[i].imageUrl + '\" alt=\"' + works[i].title + '\">';
    content += '<figcaption>' + works[i].title + '</figcaption>';
    content += '</figure>\n';
}
gallery.innerHTML=content;

