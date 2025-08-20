import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Welcome, {user.email}</h2>
      <p>Your chemical watch list goes here.</p>
    </div>
  );
}
