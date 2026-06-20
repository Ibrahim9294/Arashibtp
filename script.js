// RETOUR

function goBack(){
history.back();
}

// AUTH

function register(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

localStorage.setItem("userEmail",email);
localStorage.setItem("userPassword",password);

alert("Inscription réussie");
}

function login(){

let email=document.getElementById("email").value;
let password=document.getElementById("password").value;

if(
email===localStorage.getItem("userEmail")
&&
password===localStorage.getItem("userPassword")
){
document.getElementById("userStatus").innerText=
"Connecté : "+email;
}
else{
alert("Identifiants incorrects");
}
}

// CONTACT

document.getElementById("contactBtn").onclick=function(){

alert("ARASHI BTP\nNiamey - Niger");
};

// CALCULATEUR

document.getElementById("calculate").onclick=function(){

let s=parseFloat(
document.getElementById("surface").value
);

let p=parseFloat(
document.getElementById("prix").value
);

if(!s || !p) return;

let total=s*p;

document.getElementById("result").innerText=
total.toLocaleString()+" FCFA";
};

// PROJETS

function addProject(){

let name=
document.getElementById("projectName").value;

let client=
document.getElementById("projectClient").value;

let budget=
document.getElementById("projectBudget").value;

let div=document.createElement("div");

div.className="card";

div.innerHTML=
"<h3>"+name+"</h3>"+
"<p>Client : "+client+"</p>"+
"<p>Budget : "+budget+" FCFA</p>";

document.getElementById("projectList")
.appendChild(div);
}

// PARCELLES

function addParcel(){

let number=
document.getElementById("parcelNumber").value;

let area=
document.getElementById("parcelArea").value;

let owner=
document.getElementById("parcelOwner").value;

let div=document.createElement("div");

div.className="card";

div.innerHTML=
"<h3>Parcelle "+number+"</h3>"+
"<p>Superficie : "+area+" m²</p>"+
"<p>Propriétaire : "+owner+"</p>";

document.getElementById("parcelList")
.appendChild(div);
}

// CHANTIERS

function addSite(){

let name=
document.getElementById("siteName").value;

let progress=
document.getElementById("siteProgress").value;

let div=document.createElement("div");

div.className="card";

div.innerHTML=
"<h3>"+name+"</h3>"+
"<progress value='"+progress+"' max='100'></progress>"+
"<p>"+progress+"%</p>";

document.getElementById("siteList")
.appendChild(div);
}

// IMMOBILIER

function addProperty(){

let name=
document.getElementById("propertyName").value;

let price=
document.getElementById("propertyPrice").value;

let file=
document.getElementById("propertyImage").files[0];

if(!file) return;

let reader=new FileReader();

reader.onload=function(){

let div=document.createElement("div");

div.className="card";

div.innerHTML=
"<h3>"+name+"</h3>"+
"<img src='"+reader.result+"'>"+
"<p>"+price+" Pi</p>"+
"<button onclick=\"buy('"+name+"',"+price+")\">Acheter en Pi</button>";

document.getElementById("propertyList")
.appendChild(div);
};

reader.readAsDataURL(file);
}

// PI LOGIN

let Pi=null;

document.addEventListener("DOMContentLoaded",()=>{

if(window.Pi){

Pi=window.Pi;

Pi.init({
version:"2.0"
});

document.getElementById("piLogin")
.onclick=()=>{

Pi.authenticate(
['username','payments'],
()=>{}
)
.then(user=>{
alert("Bienvenue "+user.user.username);
})
.catch(()=>{
alert("Erreur Pi");
});
};
}
});

// PAIEMENT

function buy(name,price){

if(!Pi){
alert("Pi Browser requis");
return;
}

alert(
"Paiement de "+
price+
" Pi pour "+
name
);
}

// FACTURATION

function createQuote(){
alert("Devis PDF à développer");
}

function createInvoice(){
alert("Facture PDF à développer");
}

function addMarketItem(){

let title =
document.getElementById("marketTitle").value;

let price =
document.getElementById("marketPrice").value;

let file =
document.getElementById("marketImage").files[0];

if(!title || !price || !file){
alert("Remplissez tous les champs");
return;
}

let reader = new FileReader();

reader.onload = function(){

let div = document.createElement("div");

div.className = "card";

div.innerHTML = `
<h3>${title}</h3>

<img src="${reader.result}">

<p>${price} Pi</p>

<button onclick="buy('${title}',${price})">
Acheter
</button>
`;

document
.getElementById("marketList")
.appendChild(div);

};

reader.readAsDataURL(file);
}