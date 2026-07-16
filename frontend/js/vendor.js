import { supabase } from './supabase.js';
import { ArashiAuth } from './auth.js';

document.addEventListener("DOMContentLoaded", () => {
    initMenu();
    setupFormSubmission();
});

// Gestion du menu mobile sur la page Vendor
function initMenu() {
    const toggleBtn = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
}

// Gestion de la soumission du formulaire
function setupFormSubmission() {
    const form = document.getElementById("vendorForm");
    const statusDiv = document.getElementById("status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Récupération de la session utilisateur Pi locale
        const currentUser = ArashiAuth.getLocalSession();
        if (!currentUser) {
            showStatus("❌ Erreur : Vous devez être connecté via le Pi Browser pour publier un produit.", "error");
            return;
        }

        // Affichage de l'état de chargement
        showStatus("⏳ Traitement et téléversement des images en cours...", "loading");

        // Récupération des données du formulaire
        const title = document.getElementById("title").value;
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value;
        const price_pi = parseFloat(document.getElementById("price_pi").value);
        const price_fcfa = parseFloat(document.getElementById("price_fcfa").value);
        const stock = parseInt(document.getElementById("stock").value) || 1;
        const country = document.getElementById("country").value;
        const imageFiles = document.getElementById("images").files;

        if (!supabase) {
            showStatus("⚠️ Mode Démo : Supabase non configuré, mais le formulaire est valide !", "success");
            return;
        }

        try {
            let uploadedImagesUrls = [];

            // 1. Upload des images sur Supabase Storage (si des images sont sélectionnées)
            if (imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    // Génère un nom de fichier unique pour éviter les collisions
                    const fileExtension = file.name.split('.').pop();
                    const fileName = `${currentUser.uid}_${Date.now()}_${i}.${fileExtension}`;
                    
                    // Envoi vers le bucket appelé 'product-images' (Assure-toi de le créer sur Supabase)
                    const { data: storageData, error: storageError } = await supabase.storage
                        .from('product-images')
                        .upload(`public/${fileName}`, file);

                    if (storageError) throw storageError;

                    // Récupération de l'URL publique de l'image
                    const { data: publicUrlData } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(`public/${fileName}`);

                    uploadedImagesUrls.push(publicUrlData.publicUrl);
                }
            } else {
                // Image par défaut si aucune photo n'est ajoutée
                uploadedImagesUrls.push('https://via.placeholder.com/600x400?text=ARASHI+v2.0');
            }

            // 2. Insertion de la ligne produit dans la table 'products' de Supabase
            const { data, error: insertError } = await supabase
                .from('products')
                .insert([{
                    seller_id: currentUser.uid, // Relié à l'UID de l'utilisateur Pi
                    title: title,
                    category: category,
                    description: description,
                    price_pi: price_pi,
                    price_fcfa: price_fcfa,
                    stock: stock,
                    country: country,
                    images: uploadedImagesUrls, // Tableau d'URLs d'images
                    status: 'available'
                }]);

            if (insertError) throw insertError;

            // 3. Succès
            showStatus("🚀 Félicitations ! Votre annonce a été publiée avec succès à l'international.", "success");
            form.reset();

        } catch (error) {
            console.error("Erreur lors de la publication :", error);
            showStatus(`❌ Échec de la publication : ${error.message}`, "error");
        }
    });
}

// Fonction utilitaire pour afficher les alertes de statut à l'utilisateur
function showStatus(message, type) {
    const statusDiv = document.getElementById("status");
    if (!statusDiv) return;

    statusDiv.style.display = "block";
    statusDiv.innerText = message;

    if (type === "success") {
        statusDiv.style.background = "#d4edda";
        statusDiv.style.color = "#155724";
        statusDiv.style.border = "1px solid #c3e6cb";
    } else if (type === "error") {
        statusDiv.style.background = "#f8d7da";
        statusDiv.style.color = "#721c24";
        statusDiv.style.border = "1px solid #f5c6cb";
    } else {
        statusDiv.style.background = "#fff3cd";
        statusDiv.style.color = "#856404";
        statusDiv.style.border = "1px solid #ffeeba";
    }
}
