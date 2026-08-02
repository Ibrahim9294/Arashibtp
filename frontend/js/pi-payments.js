/* ==========================================
   Entreprise ARASHI v4.0
   js/pi-payments.js
========================================== */

import { supabase } from "./supabase.js";

const BACKEND_URL = "https://entreprise-arashi.onrender.com";

export async function createPiPayment(amount, memo, metadata = {}) {

    if (typeof Pi === "undefined") {
        alert("Ouvrez cette application dans Pi Browser.");
        return;
    }

    try {

        await Pi.createPayment(

            {
                amount: Number(amount),
                memo: memo,
                metadata: metadata
            },

            {

                onReadyForServerApproval: async (paymentId) => {

                    console.log("Approval :", paymentId);

                    await supabase
                    .from("orders")
                    .insert([{
                        payment_id: paymentId,
                        amount: amount,
                        memo: memo,
                        status: "pending"
                    }]);

                    const response = await fetch(
                        `${BACKEND_URL}/approve`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":"application/json"
                            },
                            body: JSON.stringify({
                                paymentId
                            })
                        }
                    );

                    const result = await response.json();

                    console.log(result);

                    if (!response.ok) {
                        throw new Error("Approval impossible");
                    }

                },

                onReadyForServerCompletion: async (paymentId, txid) => {

                    console.log("Completion :", paymentId);

                    await fetch(
                        `${BACKEND_URL}/complete`,
                        {
                            method:"POST",
                            headers:{
                                "Content-Type":"application/json"
                            },
                            body:JSON.stringify({
                                paymentId,
                                txid
                            })
                        }
                    );

                    await supabase
                    .from("orders")
                    .update({
                        status:"completed",
                        txid:txid
                    })
                    .eq("payment_id",paymentId);

                    alert("Paiement effectué avec succès.");

                    if(window.loadUserOrders){
                        window.loadUserOrders();
                    }

                },

                onCancel:(paymentId)=>{

                    console.log("Paiement annulé",paymentId);

                    supabase
                    .from("orders")
                    .update({
                        status:"cancelled"
                    })
                    .eq("payment_id",paymentId);

                },

                onError:(error,payment)=>{

                    console.error(error);

                    alert("Erreur pendant le paiement.");

                }

            }

        );

    } catch(err){

        console.error(err);

    }

}

window.createPiPayment=createPiPayment;