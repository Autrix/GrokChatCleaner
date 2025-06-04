document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const MAX_MESSAGES = 3; // Maximum number of messages before cleanup
  const PRESERVE_MESSAGES = 2; // Number of recent messages to keep
  const CHECK_INTERVAL = 15000; // Check every 15 seconds

  // Function to clean up old messages
  function cleanUpChat() {
    // Adjust selector to match grok.com's chat message elements
    const chatContainer = document.querySelector('.chat-container') || document.body;
    const messages = chatContainer.querySelectorAll('.chat-message'); // Update selector as needed

    if (messages.length > MAX_MESSAGES) {
      const messagesToRemove = messages.length - PRESERVE_MESSAGES;
      for (let i = 0; i < messagesToRemove; i++) {
        if (messages[i]) {
          messages[i].remove();
        }
      }
      console.log(`Removed ${messagesToRemove} old chat messages to prevent crashes.`);
    }
  }

  // Run cleanup periodically
  setInterval(cleanUpChat, CHECK_INTERVAL);

  // Listen for manual cleanup trigger from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'cleanChat') {
      cleanUpChat();
      sendResponse({ status: 'Chat cleaned manually' });
    }
  });
});