// ==================================================
// ENTREPRISE ARASHI
// SCRIPT PRINCIPAL
// Pi Network + Firebase + Marketplace
// ==================================================



// ================= RETOUR =================

function goBack(){

history.back();

}




// ================= AUTH SIMPLE =================


function register(){


let email =
document.getElementById("email").value;


let password =
document.getElementById("password").value;



if(!email || !password){

alert("Remplissez tous les champs");

return;

}



localStorage.setItem(
"userEmail",
email
);


localStorage.setItem(
"userPassword",
password
);



alert(
"Compte créé avec succès"
);



}




function login(){


let email =
document.getElementById("email").value;



let password =
document.getElementById("password").value;




if(

email === localStorage.getItem("userEmail")

&&

password === localStorage.getItem("userPassword")

){


document.getElementById("userStatus")
.innerText =
"Connecté : "+email;



}

else{


alert(
"Identifiants incorrects"
);


}


}






// ================= CONTACT =================


document.addEventListener(
"DOMContentLoaded",
()=>{


let contact =
document.getElementById("contactBtn");


if(contact){


contact.onclick=function(){


alert(
"Entreprise ARASHI\nNiamey - Niger"
);


};


}



});






// ================= SCROLL MARKETPLACE =================


function scrollToMarketplace(){


document
.getElementById("marketplace")
.scrollIntoView({

behavior:"smooth"

});


}







// ================= CALCULATEUR =================


function calculatePrice(){



let surface =
Number(
document.getElementById("surface").value
);



let prix =
Number(
document.getElementById("prixM2").value
);



let total =
surface * prix;



document.getElementById(
"calculationResult"
)
.innerText =
total.toLocaleString()
+" FCFA";



}








// ================= PROJETS =================


function addProject(){



let name =
document.getElementById("projectName").value;



let client =
document.getElementById("projectClient").value;



let budget =
document.getElementById("projectBudget").value;



let div =
document.createElement("div");



div.className="card";



div.innerHTML=

`

<h3>${name}</h3>

<p>Client : ${client}</p>

<p>Budget : ${budget} FCFA</p>

`;



document
.getElementById("projectList")
.appendChild(div);



}









// ================= PI LOGIN =================



document.addEventListener(
"DOMContentLoaded",
()=>{


if(window.Pi){


Pi.init({

version:"2.0"

});



let btn =
document.getElementById("piLogin");



if(btn){


btn.onclick=function(){



Pi.authenticate(

[
"username",
"payments"
],

function(){}

)

.then(function(auth){


document.getElementById(
"userStatus"
)
.innerText=

"Pi connecté : "
+
auth.user.username;



})


.catch(function(){

alert(
"Erreur connexion Pi"
);


});


};


}



}


});










// ================= PAIEMENT PI =================



async function buy(
productName,
amount
){



if(!window.Pi){


alert(
"Ouvrez l'application Pi Browser"
);


return;


}




const paymentData = {


amount:Number(amount),


memo:

"Achat "
+
productName
+
" - ARASHI",



metadata:{


product:productName,


company:"Entreprise ARASHI"


}


};





const callbacks = {



onReadyForServerApproval:
async function(paymentId){



await fetch(

"https://arashi-btp-backend.onrender.com/approve",

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},



body:JSON.stringify({


paymentId:paymentId,


product:productName,


amount:amount


})


}


);



},





onReadyForServerCompletion:

async function(paymentId,txid){



await fetch(

"https://arashi-btp-backend.onrender.com/complete",

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({


paymentId:paymentId,


txid:txid


})


}


);



alert(

"Paiement réussi : "
+
amount
+
" Pi"

);



},






onCancel:function(){


alert(
"Paiement annulé"
);


},






onError:function(error){


console.error(error);


alert(
"Erreur paiement Pi"
);


}


};






Pi.createPayment(

paymentData,

callbacks

);



}










// ================= MARKETPLACE =================


async function addMarketItem(){



let title =
document.getElementById("marketTitle").value;



let category =
document.getElementById("marketCategory").value;



let price =
document.getElementById("marketPrice").value;



let file =
document.getElementById("marketImage")
.files[0];



if(!title || !price){


alert(
"Informations manquantes"
);


return;

}




try{


let imageUrl="";



if(file){


let imageRef =
firebaseFunctions.ref(

window.storage,

"products/"+Date.now()+"_"+file.name

);



await firebaseFunctions.uploadBytes(

imageRef,

file

);



imageUrl =
await firebaseFunctions.getDownloadURL(

imageRef

);



}




await firebaseFunctions.addDoc(

firebaseFunctions.collection(

window.db,

"products"

),


{


title:title,


category:category,


price:Number(price),


image:imageUrl,


date:new Date()


}



);




let div =
document.createElement("div");



div.className="card";



div.innerHTML=


`

<h3>${title}</h3>

<p>${category}</p>

<p>${price} π</p>


<button onclick="buy('${title}',${price})">

Acheter

</button>

`;



document
.getElementById("marketList")
.appendChild(div);



alert(
"Produit publié"
);



}

catch(error){


console.error(error);


alert(
"Erreur Firebase"
);


}


}