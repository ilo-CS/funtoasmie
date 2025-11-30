# Instructions pour créer les tables des docteurs

## Exécution de la migration SQL

Pour créer les tables nécessaires aux fonctionnalités des docteurs, vous devez exécuter le script de migration SQL.

### Option 1 : Via la ligne de commande MySQL

```bash
mysql -u votre_utilisateur -p votre_base_de_donnees < backend/migrations/001_create_consultations_tables.sql
```

### Option 2 : Via phpMyAdmin

1. Ouvrir phpMyAdmin
2. Sélectionner votre base de données (`db_funtoasmie`)
3. Aller dans l'onglet "SQL"
4. Copier-coller le contenu du fichier `backend/migrations/001_create_consultations_tables.sql`
5. Cliquer sur "Exécuter"

### Option 3 : Via un client MySQL (MySQL Workbench, DBeaver, etc.)

1. Ouvrir votre client MySQL
2. Se connecter à votre base de données
3. Ouvrir le fichier `backend/migrations/001_create_consultations_tables.sql`
4. Exécuter le script

## Vérification

Après l'exécution, vous devriez voir ces nouvelles tables dans votre base de données :

- `consultations`
- `medical_prescriptions`
- `medical_prescription_items`

Vous pouvez vérifier en exécutant :

```sql
SHOW TABLES LIKE '%consultation%';
SHOW TABLES LIKE '%medical_prescription%';
```

## En cas d'erreur

Si vous obtenez une erreur lors de la création des tables, vérifiez :

1. Que vous avez les permissions nécessaires (CREATE TABLE)
2. Que les tables `users` et `sites` existent déjà (pour les clés étrangères)
3. Que la table `medications` existe (pour les clés étrangères dans medical_prescription_items)

