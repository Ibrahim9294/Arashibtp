function changeLanguage(lang){

localStorage.setItem("language", lang);

alert("Langue sélectionnée : " + lang);

window.location.href="../index.html";

}
