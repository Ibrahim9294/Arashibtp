// ======================================
// ARASHI v3.0
// Pi Payments
// ======================================

import { supabase } from "./supabase.js";

const API_URL = "https://entreprise-arashi.onrender.com";
// Remplace TON-SERVICE-RENDER par l'URL de ton backend Render

window.createPiPayment = async function(amount, memo, productId = null) {

    try {

        const saved = localStorage.getItem("pi_user");

        if (!saved) {
            alert("Veuillez vous connecter avec Pi.");
            return;
        }

        if (!window.Pi) {
            alert("SDK Pi indisponible.");
            return;
        }

        const payment = await Pi.createPayment(

            {
                amount: Number(amount),
                memo: memo,
                metadata: {
                    productId
                }
            },

            {

                onReadyForServerApproval: async function(paymentId) {

                    await fetch(`${API_URL}/approve`, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            paymentId
                        })

                    });

                },

                onReadyForServerCompletion: async function(paymentId, txid) {

                    await fetch(`${API_URL}/complete`, {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            paymentId,
                            txid
                        })

                    });

                    const user = JSON.parse(saved);

                    await supabase.from("payments").insert({

                        pi_payment_id: paymentId,

                        username: user.username,

                        amount: amount,

                        blockchain_txid: txid,

                        status: "completed"

                    });

                    alert("Paiement effectué avec succès.");

                },

                onCancel: function(paymentId) {

                    console.log("Paiement annulé :", paymentId);

                    alert("Paiement annulé.");

                },

                onError: function(error) {

                    console.error(error);

                    alert("Erreur lors du paiement.");

                }

            }

        );

        return payment;

    } catch (err) {

        console.error(err);

        alert("Impossible de créer le paiement.");

    }

};
