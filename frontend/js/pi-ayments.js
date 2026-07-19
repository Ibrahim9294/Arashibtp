// =====================================
// ARASHI v3.0
// pi-payments.js
// Version corrigée
// =====================================

import { supabase } from "./supabase.js";

const API_URL = "https://entreprise-arashi.onrender.com";

window.createPiPayment = async function (
    amount,
    memo,
    productId = null
) {

    try {

        const savedUser = localStorage.getItem("pi_user");

        if (!savedUser) {
            alert("Veuillez d'abord vous connecter avec Pi.");
            return;
        }

        if (!window.Pi) {
            alert("Le SDK Pi Network est introuvable.");
            return;
        }

        amount = Number(amount);

        if (isNaN(amount) || amount <= 0) {
            alert("Montant invalide.");
            return;
        }

        const user = JSON.parse(savedUser);

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
                                amount,
                                status: "initialized"
                            });

                        const response = await fetch(
                            `${API_URL}/approve`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    paymentId
                                })
                            }
                        );

                        if (!response.ok) {
                            throw new Error(
                                "Erreur serveur APPROVE"
                            );
                        }

                    } catch (err) {

                        console.error(err);

                        alert(
                            "Impossible d'approuver le paiement."
                        );

                    }

                },

                onReadyForServerCompletion: async (
                    paymentId,
                    txid
                ) => {

                    try {

                        const response = await fetch(
                            `${API_URL}/complete`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    paymentId,
                                    txid
                                })
                            }
                        );

                        if (!response.ok) {
                            throw new Error(
                                "Erreur serveur COMPLETE"
                            );
                        }

                        await supabase
                            .from("payments")
                            .update({
                                blockchain_txid: txid,
                                status: "completed",
                                updated_at:
                                    new Date().toISOString()
                            })
                            .eq(
                                "pi_payment_id",
                                paymentId
                            );

                        alert(
                            "✅ Paiement Pi effectué avec succès."
                        );

                    } catch (err) {

                        console.error(err);

                        alert(
                            "Erreur pendant la finalisation du paiement."
                        );

                    }

                },

                onCancel: async (paymentId) => {

                    console.log(
                        "Paiement annulé",
                        paymentId
                    );

                    await supabase
                        .from("payments")
                        .update({
                            status: "cancelled",
                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            "pi_payment_id",
                            paymentId
                        );

                    alert("Paiement annulé.");

                },

                onError: async (error, payment) => {

                    console.error(error);

                    if (payment?.identifier) {

                        await supabase
                            .from("payments")
                            .update({
                                status: "error",
                                updated_at:
                                    new Date().toISOString()
                            })
                            .eq(
                                "pi_payment_id",
                                payment.identifier
                            );

                    }

                    alert(
                        "Une erreur est survenue pendant le paiement."
                    );

                }

            }

        );

        return payment;

    } catch (err) {

        console.error(err);

        alert(
            "Impossible de lancer le paiement Pi."
        );

    }

};
