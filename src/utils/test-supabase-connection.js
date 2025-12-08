/**
 * Test de connexion Supabase
 * À utiliser dans la console du navigateur pour diagnostiquer les problèmes
 */

import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  console.log('=== TEST CONNEXION SUPABASE ===');
  
  // 1. Vérifier les variables d'environnement
  console.log('1. Variables d\'environnement:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ MANQUANTE');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ MANQUANTE');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Variables d\'environnement manquantes !');
    return false;
  }
  
  // 2. Tester la connexion à Supabase
  console.log('\n2. Test de connexion Supabase...');
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      console.error('  Message:', error.message);
      console.error('  Détails:', error.details);
      console.error('  Hint:', error.hint);
      return false;
    }
    console.log('✅ Connexion Supabase réussie');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
  
  // 3. Tester l'accès à user_carts
  console.log('\n3. Test d\'accès à la table user_carts...');
  try {
    const testUserId = 'test_user_' + Date.now();
    const { data, error } = await supabase
      .from('user_carts')
      .insert({
        user_id: testUserId,
        items: []
      })
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion dans user_carts:', error);
      console.error('  Message:', error.message);
      console.error('  Détails:', error.details);
      console.error('  Hint:', error.hint);
      console.error('\n⚠️  Vérifiez que:');
      console.error('  1. Le script SQL supabase-schema-fix-anonymous-users.sql a été exécuté');
      console.error('  2. Les politiques RLS permettent les INSERT');
      console.error('  3. La colonne user_id est de type TEXT');
      return false;
    }
    
    console.log('✅ Insertion réussie dans user_carts');
    
    // Nettoyer le test
    await supabase.from('user_carts').delete().eq('user_id', testUserId);
    console.log('✅ Test nettoyé');
  } catch (error) {
    console.error('❌ Erreur lors du test user_carts:', error);
    return false;
  }
  
  // 4. Tester getUserId
  console.log('\n4. Test de getUserId...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('  Session Supabase:', session ? '✅ Connecté' : '❌ Non connecté');
    
    const user = localStorage.getItem('user');
    console.log('  localStorage user:', user ? '✅ Présent' : '❌ Absent');
    
    const guestId = localStorage.getItem('guest_id');
    console.log('  guest_id:', guestId || '❌ Absent');
    
    if (!session && !user && !guestId) {
      console.warn('⚠️  Aucun identifiant utilisateur trouvé - les données resteront locales');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test getUserId:', error);
  }
  
  console.log('\n=== FIN DU TEST ===');
  return true;
}

// Fonction pour tester depuis la console
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
}



