(() => {
  const client = window.supabaseClient;
  const $ = (id) => document.getElementById(id);
  const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));
  const date = (value) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  const statusLabels = { pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando', ready: 'Listo', completed: 'Completado', cancelled: 'Cancelado' };

  async function guard() {
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) { window.location.replace('./index.html'); return null; }

    const { data: admin, error } = await client.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    if (error || !admin) {
      await client.auth.signOut();
      window.location.replace('./index.html');
      return null;
    }
    $('admin-email').textContent = user.email || 'Administrador';
    return user;
  }

  async function loadDashboard() {
    const [products, categories, orders, recent] = await Promise.all([
      client.from('products').select('id', { count: 'exact', head: true }),
      client.from('categories').select('id', { count: 'exact', head: true }).eq('is_active', true),
      client.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
      client.from('orders').select('order_number,customer_name,created_at,status,total').order('created_at', { ascending: false }).limit(6)
    ]);

    if (products.error || categories.error || orders.error || recent.error) {
      $('dashboard-message').textContent = 'No se pudieron cargar algunos datos. Revisa la conexión y las políticas de acceso.';
      return;
    }

    $('products-count').textContent = products.count ?? 0;
    $('categories-count').textContent = categories.count ?? 0;
    $('orders-count').textContent = orders.count ?? 0;

    const tbody = $('recent-orders');
    tbody.replaceChildren();
    if (!recent.data?.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.className = 'empty-state';
      cell.textContent = 'Todavía no hay pedidos registrados.';
      row.append(cell);
      tbody.append(row);
      return;
    }

    recent.data.forEach((order) => {
      const row = document.createElement('tr');
      const values = [
        '#' + order.order_number,
        order.customer_name,
        date(order.created_at),
        statusLabels[order.status] || order.status,
        money(order.total)
      ];
      values.forEach((value, index) => {
        const cell = document.createElement('td');
        if (index === 3) {
          const pill = document.createElement('span');
          pill.className = 'status-pill ' + (order.status || '');
          pill.textContent = value;
          cell.append(pill);
        } else {
          cell.textContent = value;
        }
        row.append(cell);
      });
      tbody.append(row);
    });
  }

  $('current-date').textContent = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full' }).format(new Date());
  $('logout-button').addEventListener('click', async () => {
    await client.auth.signOut();
    window.location.replace('./index.html');
  });

  guard().then((user) => { if (user) loadDashboard(); });
})();