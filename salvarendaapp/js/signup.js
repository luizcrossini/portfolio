window.addEventListener('load', () => {
    // Seleciona todos os ícones de olho
    document.querySelectorAll('.toggle-icon').forEach(icon => {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', () => {
        // Encontra o input irmão dentro do mesmo input-group
        const input = icon.closest('.input-group').querySelector('input');
        if (!input) return;
        // Alterna o tipo
        if (input.type === 'password') {
          input.type = 'text';
          icon.src = 'assets/eye.svg';      // ícone aberto
          icon.alt = 'Ocultar senha';
        } else {
          input.type = 'password';
          icon.src = 'assets/eye-off.svg';  // ícone fechado
          icon.alt = 'Mostrar senha';
        }
      });
    });
  });


 const form = document.getElementById('signup-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullname = form.fullname.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (password !== confirmPassword) {
    alert('As senhas não coincidem.');
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ ESSENCIAL
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.error || 'Erro no cadastro.');
    } else {
      alert('Cadastro realizado com sucesso!');
      window.location.href = 'login.html';
    }

  } catch (err) {
    console.error('❌ Erro ao conectar com API:', err);
    alert('Não foi possível conectar à API.');
  }
});