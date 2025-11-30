# FTP/SFTP/SSH Senkronizasyonu 

> Hızlı kod senkronizasyon aracı

[🔥 İndirme Linki](https://marketplace.visualstudio.com/items?itemName=oorzc.ssh-tools)

## 🎉 Desteklenen Diller

<h3 align="center">
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/en.md">English</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/zh.md">简体中文</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/zh-tw.md">繁体中文</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/es.md">Español</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/fr.md">Français</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/de.md">Deutsch</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/it.md">Italiano</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ko.md">한국어</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/pt.md">Português</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ru.md">Pусский</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/tr.md">Türkçe</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/pl.md">Polski</a> |
    <a target="_blank" href="https://github.com/oorzc/vscode_sync_tool/blob/main/lang/ja.md">日本語</a> 
</h3>


## ✨ Eklenti Özellikleri

- [x] Birden fazla geliştirme ortamının özelleştirilmiş yapılandırmasını destekler  
- [x] Gerçek zamanlı kod senkronizasyonunu destekler  
- [x] Kod değişikliklerini izlemeyi ve manuel kod yüklemeyi destekler  
- [x] Front-end projelerinin otomatik olarak oluşturulmasını ve paketlenmesini destekler  
- [x] Kod sıkıştırmayı ve yüklemeyi destekler (ancak yalnızca SSH, yükleme sonrası uzaktan açmayı destekler)  
- [x] Yükleme sırasında Git'e commit yapmayı destekler  
- [x] Özel yükleme dizinlerini ve belirli dizinlerin yüklenmesini hariç tutmayı destekler  
- [x] Eşzamanlı yükleme ve indirmeyi destekler  
- [x] Yükleme ve indirmeyi duraklatmayı, devam ettirmeyi ve durdurmayı destekler  
- [x] Yerel ve uzak dosyaları karşılaştırmayı destekler  
- [x] Uzak kodu görüntülemeyi destekler; ekleme, silme, değiştirme, izinleri değiştirme, kodu taşıma, yeniden adlandırma ve dosya indirme gibi işlemleri destekler  
- [x] Proxy ayarlarını destekler  
- [x] Dosya veya klasörleri sunucunun belirli dizinlerine sürükleyip bırakarak yüklemeyi destekler  
- [x] 👍👍👍 Yapılandırma dosyalarındaki hesapların ve şifrelerin şifrelenmesini destekler, sunucu hesap sızıntılarını önler 👍👍👍 

## 📖 Kullanım Kılavuzu

1. Eklenti Yapılandırması

    - Varsayılan olarak .git, .svn, .DS_Store, Thumbs.db, .idea, node_modules, runtime, sync_config.jsonc dosyaları ve klasörleri hariç tutulur, diğerleri kullanıcı tarafından eklenebilir.
    - Eğer .gitignore yapılandırma dosyası varsa, varsayılan olarak bu yapılandırma kullanılır ve yüklenmeyen içerikler hariç tutulur.
      ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F2a2b4adc7305c7b1c84d796da57cfe81.png)

2. Proje Yapılandırması Ekleme
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F0aba393b99df91a094fac6c14a2aebe1.gif)

3. Proxy Ayarı, aşağıdaki proje yapılandırmasında proxy = true olarak ayarlanması durumunda geçerlidir.
   ![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F9f00f0451dd2c558ad469178d0058713.png)

sync_config.jsonc yapılandırma referansı

```jsonc
{
    // Ortam adı, özelleştirilebilir
    "test": {
        // Test ortamı
        "type": "ftp", // (Zorunlu) Transfer tipi, ftp, sftp, ssh desteklenir
        "host": "0.0.0.0", // (Zorunlu) Sunucu adresi
        "port": 22, // (Opsiyonel) Port numarası, ftp varsayılan 21, sftp, ssh varsayılan 22
        "username": "username", // (Zorunlu) Giriş kullanıcı adı
        "password": "password", // Giriş şifresi (veya özel anahtar yolu, ikisinden biri)
        // "privateKeyPath": "/your_path/id_rsa", // (sftp, ssh yapılandırması) Özel anahtar yolu (veya giriş şifresi, ikisinden biri), dikkat: Anahtarları kodun kök dizinine koymayın
      //   "secretKeyPath": "/your_path/secret_key.txt", // Şifreleme özel anahtar yolu, kullanıcı adlarını ve şifreleri şifrelemek için kullanılır. Not: Anahtarı kod dizinine yerleştirmemek en iyisidir.
        "proxy": false, // Proxy kullanılıp kullanılmayacağı, varsayılan false
        "upload_on_save": false, // Kaydedildikten sonra anında yükleme, tek kişilik geliştirme için önerilir, upload_on_save true olarak ayarlandığında, watch, submit_git_before_upload, compress, deleteRemote geçersiz olur, varsayılan false
        "watch": false, // Yüklenecek dizindeki dosya değişikliklerini izleme, varsayılan true, eğer upload_on_save true ise bu ayar geçersiz olur. Eğer distPath dizini yapılandırılmışsa, sadece distPath dizinindeki dosya değişiklikleri izlenir.
        "submit_git_before_upload": true, // Takım geliştirmesi için, yükleme öncesi yerel git deposuna kayıt yapma, uzak kodun üzerine yazılmasını önler, varsayılan false
        "submit_git_msg": "", // Git kayıt mesajı yapılandırması, varsayılan boş. submit_git_before_upload true ise, boş bırakıldığında bir mesaj kutusu açılır ve manuel olarak mesaj girilebilir.
        // "build": "yarn build:test", // (Opsiyonel) Derleme komutu, eğer ön uç projesi ise bu ayarı açın
        "compress": true, // Yükleme sırasında sıkıştırma yapılacak mı, varsayılan false
        //"remote_unpacked": true, // Sıkıştırılmış dosya yüklendikten sonra uzakta açılacak mı (ssh destekli olmalı), ssh varsayılan true, diğerleri varsayılan false
        //"delete_remote_compress": true, // Uzakta sıkıştırılmış dosya yüklendikten sonra silinecek mi, ssh varsayılan true, diğerleri varsayılan false
        //"delete_local_compress": true, // Yerelde sıkıştırılmış dosya yüklendikten sonra silinecek mi, varsayılan true
        "distPath": [], // (Opsiyonel) Yüklenecek yerel dizinler, dize veya dizi desteklenir, varsayılan olarak kök dizin yüklenir
        "upload_to_root": false, // Eğer distPath dizini tek bir dizin ise, remotePath'in kök dizinine yüklenir, genellikle ön uç kodunun dağıtımı için kullanılır, varsayılan false
        "deleteRemote": false, // Yükleme öncesi uzak distPath dizini silinecek mi, genellikle ön uç dağıtım kodunun temizlenmesi için kullanılır, varsayılan false
        "remotePath": "/www/wwwroot/test", // (sftp, ssh yapılandırması) Sunucudaki yükleme adresi
        "excludePath": [], // (Opsiyonel) Bu ortamda hariç tutulacak dosyalar ve dizinler, eklenti yapılandırmasındaki excludePath ile birleştirilir, eklenti yapılandırması gitignore kullanıyorsa, .gitignore yapılandırma dosyası ile birleştirilir
        // "downloadPath": "" // (Opsiyonel) İndirme yolu, varsayılan olarak mevcut projenin kök dizini, manuel olarak dosya veya klasör indirme işlemi için kullanılır, belirli bir indirme yolu belirtilebilir
        // "downloadExcludePath": [], //  (Opsiyonel) İndirme sırasında hariç tutulacak dosyalar ve dizinler
        "default": true // Varsayılan ortam mı, true ise sağ tıklama menüsü kullanılarak dosya veya klasör hızlıca yüklenebilir, uzak dosya ile karşılaştırılabilir, varsayılan false
    },
    "online": {
        // Canlı ortam
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
// excludePath, downloadExcludePath hariç tutma kuralları, joker karakterleri destekler
[
    "**/*.mp4",
    "aaa/bbb", // aaa/bbb hariç tutulur
    "!aaa/bbb/ccc", // aaa/bbb altındaki ccc klasörü hariç tutulmaz
]
```

## Yükleme Demosu

Yükleme Demosu
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F8f85ff0142ef082749b55f7db3c8bf13.gif)

Dosya Karşılaştırma Demosu
![](https://cdn.jsdelivr.net/gh/oorzc/public_img@main/img/2024%2F11%2F12%2F6cbd149ae7959c8097ce288fb91ed800.gif)

## Sıkça Sorulan Sorular

1. Sunucuya bağlanamıyorsanız, xftp, filezilla gibi diğer bağlantı araçlarını kullanarak sunucuya bağlanmayı deneyebilirsiniz. Onaylandıktan sonra tekrar bağlanmayı deneyebilirsiniz.
2. Dosyaları yükledikten sonra ağaç menüsü güncellenmezse, sağ tıklama menüsünü kullanarak dosya ağacını yenileyebilirsiniz.
3. Dosya yeniden açıldığında neden sunucudan indirilmiyor? Kaynakları korumak için eklenti, açılan dosyaları önbelleğe alır. Dosyayı güncellemeniz gerekiyorsa, sağ tıklama menüsünü kullanın ve yenileyin.
4. Kullanıcı adı veya şifre neden şifresi çözülemiyor? Anahtarınız değiştirildi. Lütfen başlangıç hesap şifresini yeniden girin ve şifreleme/şifre çözme işlemini tekrar yapın.
5. Yapılandırma dosyasını her düzenlediğinizde, tüm görevler otomatik olarak durdurulur. Bu nedenle, yükleme sırasında yapılandırma dosyasını rastgele değiştirmeyin.

## Sorun Bildirimi

Bu proje boş zamanlarda geliştirilmektedir, sorunlarınızı buradan bildirebilirsiniz, ancak hızlı bir şekilde çözülme garantisi yoktur.

[Sorun Bildir](https://github.com/oorzc/vscode_sync_tool/issues)