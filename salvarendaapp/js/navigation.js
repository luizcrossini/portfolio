const form = document.getElementById('recovery-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;

  try {
    const res = await fetch('https://api.luizrossini.com.br/auth/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) throw new Error('Erro ao enviar o e-mail.');

    const data = await res.json();
    alert(data.message); // ✅ mostra mensagem ao usuário
    window.location.href = 'login.html'; // ✅ redireciona de fato

  } catch (err) {
    alert('Erro: ' + err.message);
  }
});