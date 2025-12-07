-- Script SQL pour ajouter le champ password_hash à la table customers
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne password_hash à la table customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN customers.password_hash IS 'Hash SHA-256 du mot de passe du client (stocké en texte pour simplifier, en production utiliser bcrypt)';

-- Créer un index pour améliorer les performances lors de la recherche par email (déjà existant)
-- L'index sur email existe déjà, pas besoin de le recréer

-- Note: Pour une sécurité renforcée en production, considérez:
-- 1. Utiliser Supabase Auth au lieu de stocker les mots de passe dans customers
-- 2. Utiliser bcrypt au lieu de SHA-256
-- 3. Ajouter un champ salt pour chaque utilisateur
-- 4. Implémenter une politique de mots de passe forts

SELECT '✅ Colonne password_hash ajoutée à la table customers' AS status;


