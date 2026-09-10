import { API_BASE } from './config.js';

const form = document.getElementById('login-form');
 form.addEventListener('submit', async e => {
  e.preventDefault();

  const email    = form.email.value.trim();
  const password = form.password.value;
  console.log('🔐 Enviando login:', email);

  try {
    const res = await fetch(`https://api.luizrossini.com.br/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json'  },
      body: JSON.stringify({ email, password })
    });

    console.log('📩 Status:', res.status);

    const data = await res.json();
    console.log('📦 Resposta:', data);

    if (!res.ok) {
      throw new Error(data.error || 'Erro de login');
    }

    if (!data.token) {
      console.warn('❌ Token ausente na resposta');
      return alert('Token não recebido. Verifique o servidor.');
    }

    localStorage.setItem('token', data.token);
    console.log('✅ Token salvo no localStorage');

    window.location.href = '/salvarendaapp/main.html';
  } catch (err) {
    console.error('❌ Erro no login:', err);
    alert('Falha no login: ' + err.message);
  }
});

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