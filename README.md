# Démarrage  
Prérequis
- Docker Desktop (Windows) ou Docker Engine + Compose

Configurer (optionnel)
- Créez un fichier `.env` à côté de `docker-compose.yml` si vous voulez définir l'emplacement des données Mongo :

```
MONGO_VOLUME=C:/Users/yasse/Bureau/DB
```

Ne mettez pas de guillemets autour du chemin dans `.env`.

Démarrer l'application (PowerShell)

1. Depuis la racine du projet :

```powershell
docker-compose up -d --build
```

2. Vérifier que les conteneurs tournent :

```powershell
docker-compose ps
```

Arrêter l'application :

```powershell
docker-compose down
```

Remarque 
- Pour que Docker gère le stockage via un volume nommé, mettez `MONGO_VOLUME=mongo_data`.
 
