// frontend/public/js/main.js
import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Recupera token do localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('🔒 Token não encontrado: redirecionando para login');
    return window.location.href = 'login.html'
  }
fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Token inválido ou expirado');
      }
      return res.json();
    })
    .then(data => {
      console.log('✅ Usuário autenticado:', data.user);
      document.getElementById('user-info').textContent = `Olá, ${data.user.fullname} !`;
      const userInfoEl = document.getElementById('user-info');
userInfoEl.style.textAlign = 'center';  // Centraliza o texto
userInfoEl.style.color = '#2E8C6C';     // Cor verde
userInfoEl.style.fontWeight = 'bold';   // (opcional) deixa o texto em negrito
userInfoEl.style.margin = '0 0 15px 0';
      localStorage.setItem('user_id', data.user.id);
    })
    .catch(err => {
      console.error('❌ Falha na autenticação:', err.message);
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
});
  

