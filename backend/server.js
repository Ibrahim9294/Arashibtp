// ==========================================
// ENTREPRISE ARASHI - BACKEND
// Pi Network + Supabase
// ==========================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");


const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// CONFIG SUPABASE
// ==========================================

const supabase = createClient(

    process.env.SUPABASE_URL,

    process.env.SUPABASE_SECRET_KEY

);


console.log("✅ Supabase configuré");



// ==========================================
// CONFIG PI NETWORK
// ==========================================

const PI_API_KEY = process.env.PI_API_KEY;

const PI_API_URL = "https://api.minepi.com/v2";


if(!PI_API_KEY){

    console.log("⚠️ PI_API_KEY manquante");

}else{

    console.log("✅ PI_API_KEY chargée");

}



// ==========================================
// TEST SERVEUR
// ==========================================

app.get("/",(req,res)=>{

    res.send(
        "✅ Backend ARASHI Pi + Supabase fonctionne"
    );

});



// ==========================================
// PRODUITS MARKETPLACE
// ==========================================


// Ajouter un produit

app.post("/products", async(req,res)=>{

    try{


        const product = req.body;


        const {data,error}=await supabase

        .from("products")

        .insert([product])

        .select();



        if(error){

            return res.status(400).json(error);

        }


        res.json(data);



    }catch(error){


        res.status(500).json({

            error:error.message

        });


    }

});




// Voir tous les produits

app.get("/products", async(req,res)=>{

    try{


        const {data,error}=await supabase

        .from("products")

        .select("*")

        .order("created_at",
        {ascending:false});



        if(error){

            return res.status(400).json(error);

        }


        res.json(data);



    }catch(error){


        res.status(500).json({

            error:error.message

        });


    }

});




// Supprimer produit

app.delete("/products/:id", async(req,res)=>{


    try{


        const {error}=await supabase

        .from("products")

        .delete()

        .eq(
            "id",
            req.params.id
        );



        if(error){

            return res.status(400).json(error);

        }


        res.json({

            success:true

        });



    }catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});




// ==========================================
// APPROBATION PAIEMENT PI
// ==========================================

app.post("/approve", async(req,res)=>{


try{


const {
paymentId,
product,
amount
}=req.body;



const response = await axios.post(

`${PI_API_URL}/payments/${paymentId}/approve`,

{},

{

headers:{

"Authorization":
`Key ${PI_API_KEY}`,

"Content-Type":
"application/json"

}

}

);



res.json(response.data);



}catch(error){


res.status(500).json({

error:error.response?.data || error.message

});


}



});




// ==========================================
// FINALISATION PAIEMENT PI
// ==========================================

app.post("/complete", async(req,res)=>{


try{


const {

paymentId,

txid

}=req.body;



const response = await axios.post(

`${PI_API_URL}/payments/${paymentId}/complete`,

{

txid

},

{

headers:{

"Authorization":
`Key ${PI_API_KEY}`,

"Content-Type":
"application/json"

}

}

);



res.json(response.data);



}catch(error){


res.status(500).json({

error:error.response?.data || error.message

});


}



});




// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{


console.log(

`🚀 ARASHI Backend lancé sur ${PORT}`

);


});