document.getElementById('cleanNow').addEventListener('click', () => {
  console.log('Clean Now button clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.error('No active tab found');
      alert('Error: No active tab found.');
      return;
    }

    const tabId = tabs[0].id;
    console.log(`Sending cleanChat message to tab ID: ${tabId}`);

    chrome.tabs.sendMessage(tabId, { action: 'cleanChat' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError.message);
        alert(`Error: Could not communicate with the tab. Ensure you are on grok.com.\nDetails: ${chrome.runtime.lastError.message}`);
        return;
      }

      if (response && response.status === '200') {
        console.log('Chat cleaned successfully');
        alert('Chat cleaned successfully!');
      } else {
        console.error('Invalid or no response:', response);
        alert('Error: Could not clean chat. Ensure you are on grok.com.');
      }
    });
  });
});