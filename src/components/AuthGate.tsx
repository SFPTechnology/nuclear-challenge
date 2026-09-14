import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Props = { children: (user: User) => ReactNode };

export function AuthGate({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(error ? null : data.user);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setMessage(null);
    const result = registering
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (registering && !result.data.session) setMessage('Cadastro criado. Confirme seu email para entrar.');
  };

  if (loading) return <main aria-live="polite">Carregando autenticação…</main>;
  if (user) return <>{children(user)}</>;
  if (!supabase) return <main role="alert">Supabase não configurado. Defina URL e chave pública antes de iniciar.</main>;

  return (
    <main>
      <h1>Identificação da conta</h1>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
        <label>Senha<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} minLength={6} required /></label>
        <button type="submit">{registering ? 'Criar conta' : 'Entrar'}</button>
      </form>
      <button type="button" onClick={() => { setRegistering(value => !value); setMessage(null); }}>
        {registering ? 'Já tenho uma conta' : 'Criar conta'}
      </button>
      {message && <p role="alert">{message}</p>}
    </main>
  );
}
