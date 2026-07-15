// ==========================================
// ENTREPRISE ARASHI V2.0
// APPLICATION CORE
// ==========================================


// ==========================================
// MENU MOBILE
// ==========================================


function toggleMenu(){

    const sidebar =
    document.getElementById("sidebar");


    if(sidebar){

        sidebar.classList.toggle("active");

    }

}





// ==========================================
// STATISTIQUES DASHBOARD
// ==========================================


function loadStats(){


    const users =
    document.getElementById("totalUsers");


    const vendors =
    document.getElementById("totalVendors");


    const properties =
    document.getElementById("totalProperties");


    const payments =
    document.getElementById("totalPayments");



    if(users){

        users.innerHTML="0";

    }


    if(vendors){

        vendors.innerHTML="0";

    }


    if(properties){

        properties.innerHTML="0";

    }


    if(payments){

        payments.innerHTML="0 π";

    }


}





// ==========================================
// RECHERCHE GLOBALE
// ==========================================


const search =
document.getElementById("globalSearch");


if(search){


search.addEventListener(

"input",

()=>{


console.log(
"Recherche :",
search.value
);


});


}






// ==========================================
// INITIALISATION
// ==========================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    loadStats();


    console.log(
    "✅ ARASHI V2.0 chargé"
    );


});
