# Synchronisation FTP/SFTP/SSH

> Outil de synchronisation rapide de code

[🔥 Télécharger ici](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 Langues supportées

<h3 align="center">
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/en.md">English</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/zh.md">简体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/zh-tw.md">繁体中文</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/es.md">Español</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/fr.md">Français</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/de.md">Deutsch</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/it.md">Italiano</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ko.md">한국어</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/pt.md">Português</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ru.md">Pусский</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/tr.md">Türkçe</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/pl.md">Polski</a> |
    <a href="https://github.com/oorzc/vscode_sync_tool/lang/ja.md">日本語</a> 
</h3>


## ✨ Fonctionnalités de l'extension

- [x] Prend en charge la configuration personnalisée de plusieurs environnements de développement  
- [x] Prend en charge la synchronisation de code en temps réel  
- [x] Prend en charge le suivi des modifications de code et le téléchargement manuel de code  
- [x] Prend en charge la construction et l'empaquetage automatiques de projets front-end  
- [x] Prend en charge la compression et le téléchargement de code (mais seul SSH prend en charge la décompression à distance après téléchargement)  
- [x] Prend en charge la validation dans Git lors du téléchargement  
- [x] Prend en charge les répertoires de téléchargement personnalisés et l'exclusion de répertoires spécifiques du téléchargement  
- [x] Prend en charge le téléchargement et le téléversement simultanés  
- [x] Prend en charge la mise en pause, la reprise et l'arrêt des téléchargements et téléversements  
- [x] Prend en charge la comparaison de fichiers locaux et distants  
- [x] Prend en charge la visualisation de code distant, avec des opérations comme ajouter, supprimer, modifier, changer les permissions, déplacer le code, renommer et télécharger des fichiers  
- [x] Prend en charge la configuration de proxy  
- [x] Prend en charge le téléversement de fichiers ou dossiers par glisser-déposer vers des répertoires spécifiques du serveur  
- [x] 👍👍👍 Prend en charge le chiffrement des comptes et mots de passe dans les fichiers de configuration pour prévenir les fuites de comptes serveur 👍👍👍  

## 📖 Guide d'utilisation

1. Configuration de l'extension

    - Par défaut, les fichiers et dossiers suivants sont ignorés : .git, .svn, .DS_Store, Thumbs.db, .idea, node_modules, runtime, sync_config.jsonc. Ajoutez d'autres fichiers ou dossiers si nécessaire.
    - Si un fichier .gitignore est présent, il sera utilisé par défaut pour ignorer les fichiers lors du téléversement.
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. Ajouter une configuration de projet
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. Configuration du proxy, nécessite également de définir proxy = true dans la configuration du projet pour être activé.
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

Exemple de configuration sync_config.jsonc

```jsonc
{
	// Nom de l'environnement, nom personnalisé possible
	"test": {
		// Environnement de test
		"type": "ftp", // (obligatoire) Type de transfert, supporte ftp, sftp, ssh
		"host": "0.0.0.0", // (obligatoire) Adresse du serveur
		"port": 22, // (optionnel) Port, par défaut 21 pour ftp, 22 pour sftp et ssh
		"username": "username", // (obligatoire) Nom d'utilisateur
		"password": "password", // Mot de passe (ou chemin de la clé privée, un seul des deux)
		// "privateKeyPath": "/your_path/id_rsa", // (configuration sftp/ssh) Chemin de la clé privée (ou mot de passe, un seul des deux), attention : ne pas mettre la clé dans le répertoire racine du code
		// "secretKeyPath": "/your_path/secret_key.txt", // Chemin de la clé privée de chiffrement, utilisée pour chiffrer les noms d'utilisateur et les mots de passe. Remarque: Il est préférable de ne pas placer la clé dans le répertoire du code.
		"proxy": false, // Utiliser un proxy, par défaut false
		"upload_on_save": false, // Téléverser automatiquement après sauvegarde, recommandé pour le développement en solo. Si true, watch, submit_git_before_upload, compress, deleteRemote sont ignorés. Par défaut false
		"watch": false, // Surveiller les modifications des fichiers dans le répertoire de téléversement, par défaut true. Si upload_on_save est true, cette option est ignorée. Si distPath est configuré, seuls les fichiers dans distPath sont surveillés
		"submit_git_before_upload": true, // Pour le travail en équipe, soumettre les modifications locales à git avant le téléversement pour éviter d'écraser le code distant. Par défaut false
		"submit_git_msg": "", // Message de commit pour git, par défaut vide. Si submit_git_before_upload est true et que ce champ est vide, une boîte de dialogue apparaîtra pour saisir le message
		// "build": "yarn build:test", // (optionnel) Commande de construction pour les projets frontaux
		"compress": true, // Compresser avant téléversement, par défaut false
		//"remote_unpacked": true, // Décompresser après téléversement (nécessite ssh), par défaut true pour ssh, false pour les autres
		//"delete_remote_compress": true, // Supprimer le fichier compressé distant après téléversement, par défaut true pour ssh, false pour les autres
		//"delete_local_compress": true, // Supprimer le fichier compressé local après téléversement, par défaut true
		"distPath": [], // (optionnel) Répertoire local à téléverser, supporte une chaîne ou un tableau, par défaut le répertoire racine
		"upload_to_root": false, // Si distPath ne contient qu'un seul répertoire, téléverser à la racine de remotePath, généralement utilisé pour déployer du code frontal. Par défaut false
		"deleteRemote": false, // Supprimer le répertoire distant configuré dans distPath avant téléversement, généralement utilisé pour nettoyer le code de déploiement frontal. Par défaut false
		"remotePath": "/www/wwwroot/test", // (configuration sftp/ssh) Répertoire de téléversement sur le serveur
		"excludePath": [], // (optionnel) Fichiers et répertoires à exclure pour cet environnement, fusionné avec excludePath de l'extension. Si gitignore est utilisé, fusionné avec .gitignore
		// "downloadPath": "" // (optionnel) Répertoire de téléchargement, par défaut le répertoire racine du projet, utilisé pour télécharger manuellement des fichiers ou dossiers
		// "downloadExcludePath": [], //  (optionnel) Fichiers et répertoires à exclure lors du téléchargement
		"default": true // Environnement par défaut, si true, permet d'utiliser le menu contextuel pour téléverser rapidement des fichiers ou dossiers, comparer avec les fichiers distants. Par défaut false
	},
	"online": {
		// Environnement de production
		"type": "sftp",
		"host": "0.0.0.0",
		"port": 22,
		"proxy": true,
		"username": "username",
		"password": "password",
		// "privateKeyPath": "/your_path/id_rsa",
		"upload_on_save": false,
		"watch": false,
		"submit_git_before_upload": true,
		"submit_git_msg": "",
		// "build": "yarn build:online",
		"compress": false,
		//"remote_unpacked": false,
		//"delete_remote_compress": true,
		"upload_to_root": false,
		"deleteRemote": false,
		"distPath": [],
		"remotePath": "/www/wwwroot/online",
		"excludePath": [],
		// "downloadPath": "",
	   // "downloadExcludePath": [],
		"default": false
	}
}
```

```js
// excludePath, downloadExcludePath règles d'exclusion, supporte les jokers
[
	"**/*.mp4",
	"aaa/bbb", // Exclure aaa/bbb
	"!aaa/bbb/ccc", // Ne pas exclure le dossier ccc sous aaa/bbb
]
```

## Démonstration de téléversement

Démonstration de téléversement
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

Démonstration de comparaison de fichiers
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## Rappel Amical

1. Si vous ne parvenez pas à vous connecter au serveur, vous pouvez essayer d'utiliser d'autres outils de connexion tels que xftp, filezilla, etc. pour vous connecter au serveur. Une fois confirmé, vous pouvez essayer de vous connecter à nouveau.
2. Après avoir téléchargé des fichiers, si le menu arborescent n'est pas mis à jour, vous pouvez utiliser le menu contextuel pour actualiser l'arborescence des fichiers.
3. Pourquoi le fichier n'est-il pas téléchargé depuis le serveur lors de sa réouverture ? Pour économiser des ressources, le plugin met en cache les fichiers ouverts. Si vous devez mettre à jour le fichier, utilisez le menu contextuel et actualisez-le.
4. Pourquoi le nom d'utilisateur ou le mot de passe ne peut-il pas être déchiffré ? Votre clé a été modifiée. Veuillez réinitialiser le mot de passe du compte initial et chiffrer/déchiffrer à nouveau.
5. Chaque fois que vous modifiez le fichier de configuration, toutes les tâches sont automatiquement arrêtées. Par conséquent, ne modifiez pas le fichier de configuration pendant le processus de téléchargement.

## Signaler un problème

Ce projet est développé pendant mon temps libre. Vous pouvez signaler des problèmes ici, mais je ne garantis pas de les corriger rapidement.

[Signaler un problème](https://github.com/oorzc/vscode_sync_tool/issues)