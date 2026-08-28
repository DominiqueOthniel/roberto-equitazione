import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const status = {
    configured: isSupabaseConfigured,
    readable: false,
    writable: false,
    productCount: 0,
    error: null,
  };

  if (!isSupabaseConfigured) {
    status.error =
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in Vercel/Render and redeploy.';
    return NextResponse.json(status);
  }

  const supabase = createServerClient();

  const { count, error: readError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (readError) {
    status.error = readError.message;
    return NextResponse.json(status);
  }

  status.readable = true;
  status.productCount = count || 0;

  const testId = `healthcheck_${Date.now()}`;
  const { error: insertError } = await supabase.from('products').insert({
    name: testId,
    brand: 'Healthcheck',
    price: 1,
    images: [],
    stock: 0,
  });

  if (insertError) {
    status.error = insertError.message;
    return NextResponse.json(status);
  }

  status.writable = true;

  await supabase.from('products').delete().eq('name', testId);

  return NextResponse.json(status);
}
