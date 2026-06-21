const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
res.send("ARASHI BTP Backend OK");
});

app.post("/approve-payment",(req,res)=>{

const paymentId = req.body.paymentId;

console.log("Paiement :",paymentId);

res.json({
success:true,
message:"Paiement approuvé"
});

});

app.post("/complete-payment",(req,res)=>{

const paymentId = req.body.paymentId;

console.log("Paiement terminé :",paymentId);

res.json({
success:true
});

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Serveur démarré");
});