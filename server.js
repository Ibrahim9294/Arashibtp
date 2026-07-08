// ==================================================
// ENTREPRISE ARASHI
// BACKEND PI NETWORK PAYMENT
// Node.js + Express
// ==================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");


const app = express();


const PORT = process.env.PORT || 3000;



app.use(cors());

app.use(express.json());



// ================= CONFIG PI =================


const PI_API_KEY = process.env.PI_API_KEY;


const PI_API_URL =
"https://api.minepi.com/v2";





// ================= TEST =================


app.get("/", (req,res)=>{


res.json({

status:"OK",

message:
"🚀 ARASHI Backend Pi Network actif"

});


});








// ================= APPROVE PAYMENT =================


app.post("/approve", async(req,res)=>{


try{


const {

paymentId,

product,

amount


}=req.body;



if(!paymentId){


return res.status(400).json({

success:false,

message:
"paymentId manquant"

});


}





await axios.post(

`${PI_API_URL}/payments/${paymentId}/approve`,

{},

{

headers:{


Authorization:

`Key ${PI_API_KEY}`,


"Content-Type":

"application/json"


}


}


);




console.log(

"Paiement approuvé:",

product,

amount,

"Pi"

);




res.json({

success:true,

message:
"Paiement approuvé"

});



}

catch(error){


console.error(

error.response?.data ||

error.message

);



res.status(500).json({

success:false,

message:
"Erreur approbation paiement"

});


}



});









// ================= COMPLETE PAYMENT =================


app.post("/complete", async(req,res)=>{


try{


const {


paymentId,

txid


}=req.body;



if(!paymentId || !txid){


return res.status(400).json({

success:false,

message:
"Données manquantes"

});


}





await axios.post(

`${PI_API_URL}/payments/${paymentId}/complete`,

{

txid:txid

},


{

headers:{


Authorization:

`Key ${PI_API_KEY}`,


"Content-Type":

"application/json"


}


}


);





console.log(

"Paiement terminé:",

txid

);





res.json({

success:true,

message:
"Paiement complété"

});



}

catch(error){


console.error(

error.response?.data ||

error.message

);



res.status(500).json({

success:false,

message:
"Erreur completion paiement"

});


}



});








// ================= START SERVER =================



app.listen(PORT,()=>{


console.log(

`🚀 ARASHI Backend lancé sur port ${PORT}`

);


});