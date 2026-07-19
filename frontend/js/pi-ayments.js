// =====================================
// ARASHI v3.0
// pi-payments.js
// Version Finale
// =====================================

import { supabase } from "./supabase.js";

const API_URL = "https://entreprise-arashi.onrender.com";

// Initialisation du SDK Pi
if (window.Pi) {
    Pi.init({
        version: "2.0",
        sandbox: true // mettre false en Mainnet
    });
} else {
    console.error("SDK Pi non chargé.");
}

window.createPiPayment = async function (
    amount,
    memo,
    productId = null
) {

    try {

        const savedUser = localStorage.getItem("pi_user");

        if (!savedUser) {
            alert("Veuillez vous connecter avec Pi.");
            return;
        }

        if (!window.Pi) {
            alert("SDK Pi indisponible.");
            return;
        }

        const user = JSON.parse(savedUser);

        if (!user.uid || !user.username) {
            alert("Utilisateur Pi invalide.");
            return;
        }

        amount = Number(amount);

        if (isNaN(amount) || amount <= 0) {
            alert("Montant invalide.");
            return;
        }

        document.body.style.cursor = "wait";

        const payment = await Pi.createPayment(

            {
                amount,
                memo,
                metadata: {
                    productId
                }
            },

            {

                onReadyForServerApproval: async (paymentId) => {

                    try {

                        await supabase
                            .from("payments")
                            .upsert({
                                pi_payment_id: paymentId,
                                username: user.username,
                                amount: amount,
                                status: "initialized"
                            });

                        const response = await fetch(`${API_URL}/approve`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                paymentId
                            })
                        });

                        if (!response.ok) {
                            throw new Error("Erreur serveur APPROVE");
                        }

                        console.log(await response.json());

                    } catch (err) {

                        console.error(err);

                        alert("Impossible d'approuver le paiement.");

                    }

                },

                onReadyForServerCompletion: async (
                    paymentId,
                    txid
                ) => {

                    try {

                        const response = await fetch(`${API_URL}/complete`, {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({
                                paymentId,
                                txid
                            })

                        });

                        if (!response.ok) {
                            throw new Error("Erreur serveur COMPLETE");
                        }

                        console.log(await response.json());

                        await supabase
                            .from("payments")
                            .update({

                                blockchain_txid: txid,

                                status: "completed",

                                updated_at: new Date().toISOString()

                            })

                            .eq("pi_payment_id", paymentId);

                        console.log({
                            paymentId,
                            txid,
                            amount,
                            username: user.username
                        });

                        document.body.style.cursor = "default";

                        alert("✅ Paiement effectué avec succès.");

                    } catch (err) {

                        console.error(err);

                        document.body.style.cursor = "default";

                        alert("Erreur lors de la finalisation du paiement.");

                    }

                },

                onCancel: async (paymentId) => {

                    document.body.style.cursor = "default";

                    console.log("Paiement annulé :", paymentId);

                    await supabase

                        .from("payments")

                        .update({

                            status: "cancelled",

                            updated_at: new Date().toISOString()

                        })

                        .eq("pi_payment_id", paymentId);

                    alert("Paiement annulé.");

                },

                onError: async (error, payment) => {

                    document.body.style.cursor = "default";

                    console.error(error);

                    if (payment?.identifier) {

                        await supabase

                            .from("payments")

                            .update({

                                status: "error",

                                updated_at: new Date().toISOString()

                            })

                            .eq("pi_payment_id", payment.identifier);

                    }

                    alert("Une erreur est survenue pendant le paiement.");

                }

            }

        );

        return payment;

    }

    catch (err) {

        document.body.style.cursor = "default";

        console.error(err);

        alert("Impossible de lancer le paiement Pi.");

    }

};