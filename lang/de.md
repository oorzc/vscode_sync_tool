# FTP/SFTP/SSH Sync 

> Tool zur schnellen Codesynchronisierung

[🔥 Download-Link](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 Unterstützte Sprachen

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

## ✨ Plugin-Funktionen

- [x] Unterstützt die benutzerdefinierte Konfiguration mehrerer Entwicklungsumgebungen  
- [x] Unterstützt die Echtzeit-Synchronisierung von Code  
- [x] Unterstützt die Nachverfolgung von Codeänderungen und das manuelle Hochladen von Code  
- [x] Unterstützt das automatische Erstellen und Packen von Frontend-Projekten  
- [x] Unterstützt die Komprimierung und das Hochladen von Code (aber nur SSH unterstützt die Remote-Entpackung nach dem Hochladen)  
- [x] Unterstützt das Committen in Git während des Hochladens  
- [x] Unterstützt benutzerdefinierte Upload-Verzeichnisse und das Ausschließen bestimmter Verzeichnisse vom Upload  
- [x] Unterstützt gleichzeitiges Hoch- und Herunterladen  
- [x] Unterstützt das Pausieren, Fortsetzen und Stoppen von Uploads und Downloads  
- [x] Unterstützt den Vergleich lokaler und entfernter Dateien  
- [x] Unterstützt das Anzeigen von entferntem Code mit Operationen wie Hinzufügen, Löschen, Ändern, Berechtigungen ändern, Code verschieben, Umbenennen und Herunterladen von Dateien  
- [x] Unterstützt Proxy-Einstellungen  
- [x] Unterstützt das Hochladen von Dateien oder Ordnern per Drag-and-Drop in bestimmte Serververzeichnisse  
- [x] 👍👍👍 Unterstützt die Verschlüsselung von Konten und Passwörtern in Konfigurationsdateien, um Serverkontenlecks zu verhindern 👍👍👍  

## 📖 Benutzerhandbuch

1. Plugin-Konfiguration

    - Standardmäßig werden .git, .svn, .DS_Store, Thumbs.db, .idea, node_modules, runtime, sync_config.jsonc Dateien und Ordner ignoriert. Andere können manuell hinzugefügt werden.
    - Wenn eine .gitignore Konfigurationsdatei vorhanden ist, wird diese standardmäßig verwendet, um Inhalte vom Upload auszuschließen.
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. Projektkonfiguration hinzufügen
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. Proxy-Einstellungen. Diese werden nur wirksam, wenn in der Projektkonfiguration proxy = true gesetzt ist.
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

sync_config.jsonc Konfigurationsreferenz

```jsonc
{
	// Umgebungsname, benutzerdefinierter Name unterstützt
	"test": {
		// Testumgebung
		"type": "ftp", // (erforderlich) Übertragungstyp, unterstützt ftp, sftp, ssh
		"host": "0.0.0.0", // (erforderlich) Serveradresse
		"port": 22, // (optional) Portnummer, ftp standardmäßig 21, sftp, ssh standardmäßig 22
		"username": "username", // (erforderlich) Benutzername
		"password": "password", // Passwort (entweder Passwort oder privater Schlüssel)
		// "privateKeyPath": "/your_path/id_rsa", // (sftp, ssh Konfiguration) Pfad zum privaten Schlüssel (entweder Passwort oder privater Schlüssel), Hinweis: Schlüssel nicht im Stammverzeichnis des Codes speichern
		// "secretKeyPath": "/your_path/secret_key.txt", // Pfad zum Verschlüsselungsprivatschlüssel, verwendet zur Verschlüsselung von Benutzernamen und Passwörtern. Hinweis: Es ist am besten, den Schlüssel nicht im Code-Verzeichnis zu platzieren.
		"proxy": false, // Proxy verwenden, standardmäßig false
		"upload_on_save": false, // Automatisches Hochladen nach Speichern, empfohlen für Einzelentwickler. Wenn upload_on_save auf true gesetzt ist, sind watch, submit_git_before_upload, compress, deleteRemote ungültig, standardmäßig false
		"watch": false, // Überwachen von Dateiänderungen im Upload-Verzeichnis, standardmäßig true. Wenn upload_on_save true ist, ist diese Einstellung ungültig. Wenn distPath konfiguriert ist, werden nur Änderungen in diesem Verzeichnis überwacht
		"submit_git_before_upload": true, // Für Teamarbeit, vor dem Hochladen lokale Git-Änderungen committen, um Überschreiben von Remote-Code zu verhindern, standardmäßig false
		"submit_git_msg": "", // Git-Commit-Nachricht, standardmäßig leer. Wenn submit_git_before_upload true ist und keine Nachricht angegeben ist, wird ein Eingabefeld angezeigt
		// "build": "yarn build:test", // (optional) Build-Befehl, für Frontend-Projekte aktivieren
		"compress": true, //  Komprimiertes Hochladen, standardmäßig false
		//"remote_unpacked": true, // Nach komprimiertem Hochladen Remote-Entpacken (nur mit SSH), ssh standardmäßig true, andere standardmäßig false
		//"delete_remote_compress": true, // Nach komprimiertem Hochladen Remote-Kompressionsdatei löschen, ssh standardmäßig true, andere standardmäßig false
		//"delete_local_compress": true, // Nach komprimiertem Hochladen lokale Kompressionsdatei löschen, standardmäßig true
		"distPath": [], // (optional) Lokales Upload-Verzeichnis, unterstützt Zeichenketten oder Arrays, standardmäßig Stammverzeichnis
		"upload_to_root": false, // Wenn distPath nur ein Verzeichnis enthält, wird in das remotePath-Stammverzeichnis hochgeladen, normalerweise für Frontend-Code, standardmäßig false
		"deleteRemote": false, // Vor dem Hochladen Remote-distPath-Verzeichnis löschen, normalerweise für Frontend-Code, standardmäßig false
		"remotePath": "/www/wwwroot/test", // (sftp, ssh Konfiguration) Upload-Serveradresse
		"excludePath": [], // (optional) Ausgeschlossene Dateien und Verzeichnisse für diese Umgebung, wird mit der Plugin-Konfiguration excludePath zusammengeführt. Wenn gitignore verwendet wird, wird es mit der .gitignore-Datei zusammengeführt
		// "downloadPath": "" // (optional) Download-Pfad, standardmäßig Projektstammverzeichnis, für manuelles Herunterladen von Dateien und Ordnern
		// "downloadExcludePath": [], //  (optional) Ausgeschlossene Dateien und Verzeichnisse für den Download
		"default": true // Standardumgebung, wenn true, können Rechtsklick-Menüs zum schnellen Hochladen von Dateien oder Ordnern verwendet werden, standardmäßig false
	},
	"online": {
		// Produktionsumgebung
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
// excludePath, downloadExcludePath Ausschlussregeln, unterstützt Wildcards
[
	"**/*.mp4",
	"aaa/bbb", // aaa/bbb ausschließen
	"!aaa/bbb/ccc", // aaa/bbb/ccc nicht ausschließen
]
```

## Upload-Demo

Upload-Demo
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

Dateivergleichs-Demo
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## Freundliche Erinnerung

1. Wenn Sie keine Verbindung zum Server herstellen können, können Sie versuchen, andere Verbindungstools wie xftp, filezilla usw. zu verwenden, um eine Verbindung zum Server herzustellen. Sobald dies bestätigt ist, können Sie erneut versuchen, eine Verbindung herzustellen.
2. Nach dem Hochladen von Dateien, wenn das Baummenü nicht aktualisiert wird, können Sie das Kontextmenü verwenden, um die Dateistruktur zu aktualisieren.
3. Warum wird die Datei nicht vom Server heruntergeladen, wenn sie erneut geöffnet wird? Um Ressourcen zu sparen, speichert das Plugin geöffnete Dateien zwischen. Wenn Sie die Datei aktualisieren müssen, verwenden Sie das Kontextmenü und aktualisieren Sie sie.
4. Warum können Benutzername oder Passwort nicht entschlüsselt werden? Ihr Schlüssel wurde geändert. Bitte geben Sie das ursprüngliche Kontopasswort erneut ein und verschlüsseln/entschlüsseln Sie es erneut.
5. Jedes Mal, wenn Sie die Konfigurationsdatei bearbeiten, werden alle Aufgaben automatisch gestoppt. Ändern Sie daher die Konfigurationsdatei nicht während des Uploads.

## Problemberichte

Dieses Projekt wird in der Freizeit entwickelt. Probleme können hier gemeldet werden, aber es gibt keine Garantie auf eine schnelle Behebung.

[Problem melden](https://github.com/oorzc/vscode_sync_tool/issues)