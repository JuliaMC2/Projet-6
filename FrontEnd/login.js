

const badCredentials = document.querySelector('.badCredentials');
const tryToLogin = async function (e) {
    //récupération des champs e-mail et mot de passe
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    var loginOk = false;
    var content;

    badCredentials.style.visibility = 'hidden';
    e.preventDefault();

    if (email !== null) {
    //envoi du fetch
    const rawResponse = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: email, password: password})
    });

    //attente de la réponse
    content = await rawResponse.json();
    console.log(rawResponse.status + ":\n" + content);
    if (rawResponse.status === 200 )
        loginOk = true;
    }

    if (loginOk) {
    //200 => ok, utilisateur connecté
    //stockage du token en local storage
    const token = content.token;
    console.log(token);
    window.localStorage.setItem("token", token);
    //retour à la page des projets
    window.open("./index.html");    
    } else {
    //401 / 404 => ko, utilisateur non connecté
    //affichage du message d'erreur de connexion
    badCredentials.style.visibility = 'visible';
    }
}

document.getElementById('loginButton').addEventListener('click', tryToLogin);

