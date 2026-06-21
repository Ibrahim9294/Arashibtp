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

async function addProperty(){

let name =
document.getElementById("propertyName").value;

let price =
document.getElementById("propertyPrice").value;

let file =
document.getElementById("propertyImage").files[0];

if(!name || !price || !file){
alert("Remplissez tous les champs");
return;
}

try{

const { ref, uploadBytes, getDownloadURL }
= await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js");

const { collection, addDoc }
= await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");

const fileName =
Date.now() + "_" + file.name;

const imageRef =
ref(window.storage,"immobilier/" + fileName);

await uploadBytes(imageRef,file);

const imageUrl =
await getDownloadURL(imageRef);

await addDoc(
collection(window.db,"immobilier"),
{
name:name,
price:price,
image:imageUrl,
date:new Date().toISOString()
}
);

let div=document.createElement("div");

div.className="card";

div.innerHTML=
`
<h3>${name}</h3>
<img src="${imageUrl}">
<p>${price} Pi</p>
<button onclick="buy('${name}',${price})">
Acheter en Pi
</button>
`;

document
.getElementById("propertyList")
.appendChild(div);

alert("Bien immobilier enregistré");

}
catch(error){

console.error(error);

alert(
"Erreur Firebase : "
+ error.message
);

}
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

// ===================== PAIEMENT PI (avec backend) =====================
async function buy(name, price) {
    if (!window.Pi) {
        alert("❌ Pi Browser requis pour payer");
        return;
    }

    if (!price || price <= 0) {
        alert("❌ Prix invalide");
        return;
    }

    try {
        // 1. Créer la demande de paiement
        const payment = await Pi.createPayment({
            amount: parseFloat(price),
            memo: `Achat ${name} - Arashi BTP`,
            metadata: {
                product: name,
                price: price,
                type: "immobilier"
            }
        });

        // 2. Appeler ton backend Render pour approuver
        const approveResponse = await fetch('https://arashi-btp-backend.onrender.com/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                paymentId: payment.paymentId,
                amount: price,
                item: name
            })
        });

        const approveData = await approveResponse.json();

        if (!approveResponse.ok) {
            throw new Error(approveData.message || "Erreur d'approbation par le serveur");
        }

        // 3. Compléter le paiement côté Pi
        const completed = await Pi.completePayment({
            paymentId: payment.paymentId
        });

        if (completed) {
            alert(`✅ Paiement réussi !\n${price} Pi pour ${name}`);
            // Tu peux ajouter ici : recharger la liste des biens
        } else {
            alert("❌ Le paiement n'a pas été complété");
        }

    } catch (error) {
        console.error("Erreur paiement:", error);
        alert("❌ Erreur lors du paiement :\n" + error.message);
    }
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