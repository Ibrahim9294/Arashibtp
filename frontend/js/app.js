import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {

    initMenu();

    checkUser();

    initLogout();

    loadStats();

    loadPopularProducts();

    initSearch();

});

function initMenu(){

const btn=document.getElementById("menuToggle");

const sidebar=document.getElementById("sidebar");

if(btn && sidebar){

btn.onclick=()=>{

sidebar.classList.toggle("active");

}

}

}

function checkUser(){

const saved=localStorage.getItem("pi_user");

const status=document.getElementById("userStatus");

if(!status) return;

if(saved){

const user=JSON.parse(saved);

status.innerHTML="🟢 @"+user.username;

}else{

status.innerHTML="🔴 Non connecté";

}

}
function initLogout(){

const btn=document.getElementById("logoutBtn");

if(!btn) return;

btn.onclick=()=>{

localStorage.removeItem("pi_user");

window.location.reload();

}

}

function initSearch(){

const input=document.getElementById("globalSearch");

if(!input) return;

input.addEventListener("keyup",()=>{

const value=input.value.toLowerCase();

document.querySelectorAll(".service-card").forEach(card=>{

card.style.display=

card.innerText.toLowerCase().includes(value)

?

"block"

:

"none";

});

});

}

async function loadStats(){

if(!supabase) return;

try{

const {count:users}=await supabase

.from("profiles")

.select("*",{count:"exact",head:true});

const {count:vendors}=await supabase

.from("vendors")

.select("*",{count:"exact",head:true});

const {count:products}=await supabase

.from("products")

.select("*",{count:"exact",head:true});

document.getElementById("totalUsers").textContent=users||0;

document.getElementById("totalVendors").textContent=vendors||0;

document.getElementById("totalProperties").textContent=products||0;

document.getElementById("totalPayments").textContent="0 π";

}

catch(e){

console.log(e);

}

}

async function loadPopularProducts(){

const grid=document.getElementById("popularProductsGrid");

if(!grid) return;

try{

const {data}=await supabase

.from("products")

.select("*")

.limit(4);

grid.innerHTML="";

if(!data || data.length===0){

grid.innerHTML="<p>Aucun produit.</p>";

return;

}

data.forEach(product=>{

grid.innerHTML+=`

<div class="service-card">

<img

class="product-image"

src="${product.image_url||'assets/images/placeholder.jpg'}">

<h3>${product.title}</h3>

<p>${product.description||""}</p>

<strong>

${product.price_pi} π

</strong>

</div>

`;

});

}

catch(err){

console.log(err);

}

}

window.scrollToPopular=function(){

const section=document.getElementById("popularSection");

if(section){

section.scrollIntoView({

behavior:"smooth"

});

}

}