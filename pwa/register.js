(() => {
  if (!['https:', 'http:'].includes(location.protocol)) return;
  const button = document.getElementById('installButton');
  const status = document.getElementById('pwaStatus');
  let installPrompt;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) button.hidden = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event;
    if (!standalone) button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt; installPrompt = null; button.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { status.textContent = 'Pasang game melalui menu browser.'; }
  });
  window.addEventListener('appinstalled', () => { button.hidden = true; installPrompt = null; });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Buka melalui HTTPS untuk mengaktifkan mode offline.'; return;
  }
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const readyText = () => 'Siap dimainkan offline.' + (ios && !standalone ? ' Pasang: Bagikan → Tambahkan ke Layar Utama.' : '');
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      const showUpdate = () => { status.textContent = 'Versi baru siap. Tutup semua jendela game lalu buka kembali untuk memperbarui.'; };
      if (registration.waiting) showUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
      await navigator.serviceWorker.ready;
      if (!registration.waiting) status.textContent = readyText();
    } catch {
      status.textContent = 'Mode offline belum tersedia. Hubungkan internet dan buka ulang game.';
    }
  });
})();
