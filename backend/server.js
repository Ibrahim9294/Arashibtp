// ==========================================
// ENTREPRISE ARASHI - BACKEND PI NETWORK
// Production Backend
// ==========================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// CONFIG PI NETWORK
// ==========================================

const PI_API_KEY = process.env.PI_API_KEY;

const PI_API_URL = "https://api.minepi.com/v2";


// Vérification clé API

if (!PI_API_KEY) {

    console.log("⚠️ PI_API_KEY manquante dans Render");

} else {

    console.log("✅ PI_API_KEY chargée");

}



// ==========================================
// TEST SERVEUR
// ==========================================

app.get("/", (req,res)=>{

    res.send(
        "✅ Backend ARASHI Pi Network fonctionne"
    );

});



// ==========================================
// APPROBATION PAIEMENT PI
// ==========================================

app.post("/approve", async(req,res)=>{


    try {


        const {
            paymentId,
            product,
            amount
        } = req.body;


        console.log("Paiement reçu :",paymentId);

        console.log("Produit :",product);

        console.log("Montant :",amount);



        if(!paymentId){

            return res.status(400).json({

                error:"paymentId manquant"

            });

        }



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



        console.log(
            "Paiement approuvé",
            response.data
        );



        res.json({

            success:true,

            data:response.data

        });



    }

    catch(error){


        console.error(

            "Erreur approbation :",

            error.response?.data || error.message

        );


        res.status(500).json({

            success:false,

            error:
            error.response?.data ||
            error.message

        });


    }


});




// ==========================================
// FINALISATION PAIEMENT PI
// ==========================================

app.post("/complete", async(req,res)=>{


    try {


        const {

            paymentId,

            txid

        } = req.body;



        console.log(
            "Finalisation paiement",
            paymentId
        );


        if(!paymentId || !txid){


            return res.status(400).json({

                error:
                "paymentId ou txid manquant"

            });


        }



        const response = await axios.post(


            `${PI_API_URL}/payments/${paymentId}/complete`,


            {

                txid:txid

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



        console.log(

            "Paiement terminé",

            response.data

        );



        res.json({

            success:true,

            data:response.data

        });



    }


    catch(error){


        console.error(

            "Erreur completion :",

            error.response?.data || error.message

        );



        res.status(500).json({

            success:false,

            error:
            error.response?.data ||
            error.message

        });



    }



});




// ==========================================
// PORT RENDER
// ==========================================


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{


    console.log(

        `🚀 Serveur ARASHI lancé sur port ${PORT}`

    );


});