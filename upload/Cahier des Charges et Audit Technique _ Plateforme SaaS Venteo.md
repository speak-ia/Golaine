# Cahier des Charges et Audit Technique : Plateforme SaaS Venteo

## 1. Présentation du Projet

### 1.1. Description Générale
Venteo (https://www.venteo.boutique/) est une plateforme SaaS (Software as a Service) conçue pour les e-commerçants, principalement en Afrique. Elle permet de déployer un agent conversationnel basé sur l'intelligence artificielle (GPT-4o) directement sur WhatsApp. L'objectif principal est d'automatiser le service client, la présentation des produits et la prise de commandes, 24h/24 et 7j/7, afin d'augmenter les taux de conversion et de réduire la charge de travail manuel des commerçants.

### 1.2. Cible et Marché
La plateforme cible spécifiquement les commerçants et e-commerçants africains (plus de 500 clients revendiqués), en s'adaptant aux réalités locales, notamment par l'intégration de solutions de paiement mobile (Mobile Money) via le partenaire Chariow.

### 1.3. Proposition de Valeur
*   **Automatisation des ventes :** Réponse instantanée (moins de 10 secondes) aux requêtes clients sur WhatsApp.
*   **Gestion des commandes :** Enregistrement automatique des commandes dans un CRM intégré.
*   **Reconnaissance visuelle :** Capacité de l'IA à identifier des produits à partir de photos envoyées par les clients.
*   **Distribution de contenu :** Envoi automatique de catalogues, fiches produits et devis PDF.
*   **Déploiement rapide :** Configuration et activation de l'agent en moins de 10 minutes via un simple scan de QR code.

---

## 2. Architecture et Stack Technologique

L'analyse des requêtes réseau, du code source et des documents légaux (Politique de confidentialité) a permis d'identifier précisément la stack technologique utilisée par Venteo.

### 2.1. Frontend (Interface Utilisateur)
*   **Framework :** Next.js (React). La présence d'en-têtes HTTP spécifiques (`x-nextjs-prerender`, `x-nextjs-stale-time`) et de fichiers JavaScript (`/_next/static/chunks/...`) confirme l'utilisation de Next.js pour le rendu côté serveur (SSR) et la génération de sites statiques (SSG).
*   **Hébergement Frontend :** Vercel. L'en-tête HTTP `server: Vercel` indique que l'application frontend est déployée sur la plateforme Vercel, optimisée pour Next.js.
*   **Stylisation :** Tailwind CSS (fortement probable au vu des classes utilitaires générées par Next.js et des pratiques modernes).

### 2.2. Backend et Base de Données
*   **Backend as a Service (BaaS) :** Supabase. La politique de confidentialité mentionne explicitement Supabase pour la gestion de la base de données (PostgreSQL) et l'authentification des utilisateurs.
*   **Hébergement Backend / Serveurs WhatsApp :** Contabo. Les serveurs gérant les connexions WhatsApp (probablement via l'API WhatsApp Business ou des solutions comme Baileys/WhiskeySockets) sont hébergés chez Contabo (Allemagne / UE).

### 2.3. Intelligence Artificielle
*   **Modèle de Langage (LLM) :** OpenAI GPT-4o. Le traitement des messages, la compréhension du langage naturel et la génération des réponses sont assurés par l'API d'OpenAI, spécifiquement le modèle GPT-4o, reconnu pour ses capacités multimodales (texte et vision).

### 2.4. Paiement et Facturation
*   **Processeur de Paiement :** Chariow. Venteo utilise Chariow, une solution de paiement adaptée au marché ouest-africain, permettant d'accepter les paiements par Mobile Money et carte bancaire.

### 2.5. Architecture Globale (Résumé)
1.  **Client (Commerçant) :** Accède au dashboard (Next.js sur Vercel) pour configurer son agent (prompt, catalogue).
2.  **Authentification & Données :** Gérées par Supabase.
3.  **Client Final (Acheteur) :** Envoie un message sur WhatsApp.
4.  **Serveur WhatsApp (Contabo) :** Reçoit le message via Webhook/Socket.
5.  **Traitement IA :** Le message est envoyé à l'API OpenAI (GPT-4o) avec le contexte du commerçant (prompt système, catalogue).
6.  **Réponse :** L'IA génère une réponse (texte, image, PDF) qui est renvoyée au client final via le serveur WhatsApp.
7.  **CRM :** Si une commande est détectée, elle est enregistrée dans la base de données Supabase et visible sur le dashboard du commerçant.

---

## 3. Analyse Fonctionnelle

### 3.1. Fonctionnalités pour le Commerçant (Tenant)
*   **Inscription et Onboarding :** Création de compte rapide (email/mot de passe ou Google OAuth).
*   **Configuration de l'Agent IA :**
    *   Définition du nom de l'agent.
    *   Rédaction des instructions (System Prompt) pour définir le ton et les règles de l'agent.
    *   Upload de médias (photos de produits, catalogues PDF).
*   **Connexion WhatsApp :** Liaison du numéro WhatsApp du commerçant via le scan d'un QR code.
*   **CRM Intégré :**
    *   Visualisation de l'historique des conversations.
    *   Gestion des commandes générées par l'IA.
    *   Gestion des rendez-vous (pour les plans supérieurs).
*   **Analytique :** Suivi de l'utilisation des crédits IA, du nombre de messages traités et des analyses d'images.

### 3.2. Fonctionnalités de l'Agent IA (Pour le Client Final)
*   **Compréhension du Langage Naturel :** Interprétation des intentions d'achat et des questions.
*   **Réponses Instantanées :** Fourniture d'informations sur les prix, la disponibilité et les caractéristiques des produits.
*   **Analyse d'Images :** Capacité à identifier un produit à partir d'une photo envoyée par le client.
*   **Envoi de Fichiers :** Distribution automatique de catalogues ou de devis au format PDF.
*   **Prise de Commande :** Guidage du client jusqu'à la confirmation de la commande et enregistrement automatique.

### 3.3. Modèle Économique (Pricing)
Venteo propose un modèle d'abonnement mensuel ou annuel (avec 20% de réduction) basé sur des crédits IA et des fonctionnalités :
*   **Starter ($29/mois) :** 1 numéro WhatsApp, 1 500 crédits, CRM commandes, 25 analyses d'images.
*   **Pro ($49/mois) :** 2 numéros WhatsApp, 5 000 crédits, CRM commandes & rendez-vous, 50 analyses d'images.
*   **Business ($199/mois) :** 3 numéros WhatsApp, 25 000 crédits, CRM complet, 250 analyses d'images, support dédié.

---

## 4. Sécurité et Conformité (RGPD / Données)

La politique de confidentialité de Venteo met en évidence plusieurs points cruciaux concernant la sécurité et la gestion des données :

*   **Isolation des Données :** Architecture multi-tenant où les données de chaque client (commerçant) sont isolées.
*   **Chiffrement :** Les mots de passe sont chiffrés et les connexions sécurisées via HTTPS.
*   **Responsabilité du Commerçant :** Le commerçant est considéré comme le responsable du traitement des données de ses propres clients (numéros WhatsApp, conversations). Il doit obtenir leur consentement.
*   **Conservation des Données :** Les conversations sont conservées pendant 12 mois glissants. Les données de compte sont supprimées 30 jours après la résiliation.
*   **Sous-traitants :** Les données transitent par Supabase (US/EU), OpenAI (US), Chariow (Afrique de l'Ouest), Vercel (US/EU) et Contabo (EU).

---

## 5. Recommandations pour le Développement d'une Plateforme Similaire

Si l'objectif est de développer une solution concurrente ou similaire à Venteo, voici les recommandations techniques et fonctionnelles :

### 5.1. Choix Technologiques Recommandés
*   **Frontend :** Next.js avec Tailwind CSS et des composants UI comme Shadcn UI pour un développement rapide et une interface moderne.
*   **Backend / Base de données :** Supabase est un excellent choix pour démarrer rapidement (Auth, PostgreSQL, Row Level Security pour le multi-tenant). Alternative : Firebase ou un backend custom en Node.js (Express/NestJS) avec PostgreSQL.
*   **Intégration WhatsApp :**
    *   *Option Officielle :* Utiliser l'API WhatsApp Business officielle (via Meta ou des providers comme Twilio/MessageBird). Plus stable, mais soumise à validation et coûts par conversation.
    *   *Option Non-Officielle (type Venteo) :* Utiliser des bibliothèques comme `Baileys` (Node.js) ou `whatsapp-web.js` pour simuler une connexion WhatsApp Web via QR code. Moins coûteux, mais risque de bannissement du numéro par Meta.
*   **Intelligence Artificielle :** OpenAI (GPT-4o ou GPT-4o-mini pour réduire les coûts) via l'API Assistants ou LangChain pour gérer le contexte, les outils (ex: fonction "créer_commande") et la mémoire des conversations.

### 5.2. Points d'Attention Critiques
*   **Gestion de l'État (State Management) de WhatsApp :** Maintenir les sessions WhatsApp actives sur les serveurs (Contabo) nécessite une architecture robuste (ex: conteneurisation avec Docker, gestionnaires de processus comme PM2 ou Kubernetes) pour relancer les sessions en cas de déconnexion.
*   **Latence :** L'appel à l'API OpenAI peut introduire de la latence. Il faut optimiser les prompts et utiliser le streaming si possible, bien que WhatsApp ne supporte pas le streaming de texte en temps réel de la même manière qu'une interface web.
*   **Sécurité des Prompts (Prompt Injection) :** Protéger l'agent IA contre les utilisateurs finaux qui tenteraient de lui faire dire des choses inappropriées ou de contourner ses instructions.
*   **Scalabilité :** Prévoir une architecture capable de gérer des pics de messages simultanés (utilisation de files d'attente comme Redis ou RabbitMQ pour traiter les webhooks WhatsApp).

## Conclusion
Venteo est une solution SaaS bien architecturée, utilisant des technologies modernes (Next.js, Supabase, OpenAI) pour répondre à un besoin clair sur le marché africain : l'automatisation du commerce conversationnel sur WhatsApp. Le choix de s'intégrer avec Chariow démontre une forte adaptation aux spécificités locales des paiements.
