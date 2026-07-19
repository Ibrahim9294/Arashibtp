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