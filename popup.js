document.getElementById('cleanNow').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'cleanChat' }, (response) => {
      if (response && response.status) {
        alert(response.status);
      } else {
        alert('Error: Could not clean chat. Ensure you are on grok.com.');
      }
    });
  });
});