/**
 * ARASHI AI Module - v4.0
 * Gère l'interaction entre l'utilisateur et l'assistant IA
 */

import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    const askButton = document.getElementById('askAI');
    const promptInput = document.getElementById('aiPrompt');
    const responseContainer = document.getElementById('aiResponse');

    if (askButton) {
        askButton.addEventListener('click', async () => {
            const userPrompt = promptInput.value.trim();

            if (!userPrompt) {
                alert("Veuillez entrer une question.");
                return;
            }

            // État de chargement
            responseContainer.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyse en cours...';
            askButton.disabled = true;

            try {
                // Simulation d'appel à une API IA (Remplacez par votre endpoint réel)
                // Exemple avec une fonction edge Supabase :
                /*
                const { data, error } = await supabase.functions.invoke('chat-ai', {
                    body: { prompt: userPrompt }
                });
                */

                // Simulation de réponse pour démonstration
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                
                const aiResponse = `<strong>Réponse ARASHI AI :</strong><br><br> 
                Merci pour votre question sur le projet. En tant qu'assistant de l'Entreprise ARASHI, 
                je traite votre demande concernant <em>"${userPrompt}"</em>. 
                Veuillez contacter le support technique pour une validation précise par nos ingénieurs.`;

                responseContainer.innerHTML = aiResponse;
            } catch (error) {
                console.error("Erreur IA:", error);
                responseContainer.innerHTML = "❌ Une erreur est survenue lors de la communication avec l'IA.";
            } finally {
                askButton.disabled = false;
            }
        });
    }
});

/**
 * Fonction utilitaire pour nettoyer les messages (si nécessaire)
 */
export const clearAIResponse = () => {
    document.getElementById('aiResponse').innerHTML = "Aucune réponse pour le moment.";
};