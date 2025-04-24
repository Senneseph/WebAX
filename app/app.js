// WebAX Demo App

document.addEventListener('DOMContentLoaded', () => {
  // Initialize buttons
  const webaxpBtn = document.getElementById('webaxp-btn');
  const webaxdBtn = document.getElementById('webaxd-btn');
  const webaxdnBtn = document.getElementById('webaxdn-btn');
  const webaxLibBtn = document.getElementById('webax-lib-btn');
  
  // Add event listeners
  webaxpBtn.addEventListener('click', () => {
    window.open('../docs/webaxp-format.md', '_blank');
  });
  
  webaxdBtn.addEventListener('click', () => {
    window.open('../docs/webaxd-distribution.md', '_blank');
  });
  
  webaxdnBtn.addEventListener('click', () => {
    window.open('../docs/webaxdn-network.md', '_blank');
  });
  
  webaxLibBtn.addEventListener('click', () => {
    window.open('../docs/webax-lib.md', '_blank');
  });
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service worker registered:', registration);
      })
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  }
});
