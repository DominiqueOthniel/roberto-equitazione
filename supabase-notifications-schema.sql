-- ============================================
-- Table pour gérer les notifications admin
-- ============================================

-- Créer la table admin_notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('order', 'message', 'customer', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur le type pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);

-- Créer un index sur read pour filtrer les non lues
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);

-- Créer un index sur created_at pour trier par date
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_admin_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_admin_notifications_updated_at ON admin_notifications;
CREATE TRIGGER trigger_update_admin_notifications_updated_at
  BEFORE UPDATE ON admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_notifications_updated_at();

-- RLS (Row Level Security) - Permettre seulement aux admins de voir leurs notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent voir toutes les notifications
CREATE POLICY "Admins can view all notifications"
  ON admin_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@robertoequitazione.it'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Les admins peuvent créer des notifications
CREATE POLICY "Admins can create notifications"
  ON admin_notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@robertoequitazione.it'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Les admins peuvent mettre à jour les notifications
CREATE POLICY "Admins can update notifications"
  ON admin_notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@robertoequitazione.it'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: Les admins peuvent supprimer les notifications
CREATE POLICY "Admins can delete notifications"
  ON admin_notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@robertoequitazione.it'
    )
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Fonction pour nettoyer automatiquement les anciennes notifications (garder seulement les 100 dernières)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_notifications
  WHERE id NOT IN (
    SELECT id
    FROM admin_notifications
    ORDER BY created_at DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre de notifications non lues
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM admin_notifications
    WHERE read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Commentaires sur la table
COMMENT ON TABLE admin_notifications IS 'Table pour stocker les notifications de l''admin';
COMMENT ON COLUMN admin_notifications.type IS 'Type de notification: order, message, customer, system';
COMMENT ON COLUMN admin_notifications.metadata IS 'Métadonnées supplémentaires (orderId, messageId, customerId, etc.)';
COMMENT ON COLUMN admin_notifications.read IS 'Indique si la notification a été lue';

