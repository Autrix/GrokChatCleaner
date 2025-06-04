document.addEventListener('DOMContentLoaded', function() {
  // Configuration
  const MAX_MESSAGES = 50; // Maximum number of messages before cleanup
  const PRESERVE_MESSAGES = 10; // Number of recent messages to keep
  const CHECK_INTERVAL = 5000; // Check every 5 seconds

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