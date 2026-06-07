# 🚀 Projet de Télémétrie Industrielle - Approche Standard

Ce dépôt présente l'implémentation de l'**Approche Standard** pour notre système de gestion des flux et de télémétrie industrielle. Cette architecture modulaire permet de simuler, collecter et centraliser les données opérationnelles provenant de différents ateliers (machines, terminaux) vers un serveur central.

---

## 🏗️ Architecture du Projet

Le projet est structuré de manière modulaire pour respecter les principes de séparation des responsabilités :

*   **`src/filialserver/`** : Le runtime du serveur filiale chargé de centraliser les flux locaux, de gérer la logique métier et de persister/traiter les données reçues.
*   **`src/gateway/`** : Le script de la passerelle Edge (`gateway edge`). Elle fait le pont entre le réseau de l'atelier et le serveur, optimisant l'acheminement des messages.
*   **`src/scripts_js/`** : Un ensemble de scripts JavaScript (clients, utilitaires, simulateurs) permettant d'interagir avec le système et de générer les flux de données.

---

## 📊 Présentation & Documentation

Pour comprendre les enjeux métier, l'architecture technique et les cas d'usage de l'application, une présentation complète est disponible dans le dossier `docs/` :

*   [Télécharger la présentation au format PDF](./docs/presentation.pdf) *(Recommandé pour une lecture rapide directement sur GitHub)*
*   [Télécharger la présentation au format PowerPoint (PPTX)](./docs/presentation.pptx)

---

## 🛠️ Technologies & Concepts Clés

*   **Architecture Modulaire / Orientée Objet** : Séparation stricte entre les couches de contrôle et de présentation.
*   **Gestion des Flux & Télémétrie** : Collecte de données en temps réel.
*   **Edge Gateway** : Routage intelligent des données depuis la périphérie du réseau (Ateliers).