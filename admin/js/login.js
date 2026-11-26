(() => {
  const client = window.supabaseClient;
  const form = document.getElementById('login-form');
  const button = document.getElementById('login-button');
  const message = document.getElementById('login-message');

  const showMessage = (text) => { message.textContent = text; };

  client.auth.getSession().then(async ({ data }) => {
    if (data.session) {
      const { data: admin } = await client.from('admin_users').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
      if (admin) window.location.replace('./dashboard.html');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    button.textContent = 'Verificando…';
    showMessage('');

    const email = form.email.value.trim();
    const password = form.password.value;
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      showMessage('No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
      button.disabled = false;
      button.textContent = 'Iniciar sesión';
      return;
    }

    const { data: admin, error: adminError } = await client
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await client.auth.signOut();
      showMessage('Esta cuenta no tiene permisos de administración.');
      button.disabled = false;
      button.textContent = 'Iniciar sesión';
      return;
    }

    window.location.replace('./dashboard.html');
  });
})();