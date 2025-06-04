// Configuration
const MAX_MESSAGES = 3; // Maximum number of messages before cleanup
const PRESERVE_MESSAGES = 2; // Number of recent messages to keep
const CHECK_INTERVAL = 15000; // Check every 15 seconds

console.log('Grok Chat Cleaner content script loaded on', window.location.href);

// Function to extract messages from HTML
function extractMessages(doc) {
  // Select all message bubble containers
  const messageBubbles = doc.querySelectorAll('.message-bubble');

  // Array to store extracted messages with their DOM elements
  const messages = [];

  messageBubbles.forEach((bubble) => {
    // Determine if it's a user or assistant message based on parent alignment
    const parent = bubble.closest('.items-end, .items-start');
    if (!parent) return; // Skip if no alignment class found

    let role, content;

    if (parent.classList.contains('items-end')) {
      // User message: Look for span with whitespace-pre-wrap
      const userSpan = bubble.querySelector('span.whitespace-pre-wrap');
      if (userSpan) {
        role = 'user';
        content = userSpan.textContent.trim();
      }
    } else if (parent.classList.contains('items-start')) {
      // Assistant message: Look for p within response-content-markdown
      const assistantPara = bubble.querySelector('.response-content-markdown p.break-words');
      if (assistantPara) {
        role = 'assistant';
        content = assistantPara.textContent.trim();
      }
    }

    // Add valid message to array with reference to parent element
    if (role && content) {
      messages.push({ role, content, element: parent });
    }
  });

  return messages;
}

function cleanUpChat() {
  // Use the current document as the DOM context
  const chatContainer = document.querySelector('.w-full.flex.flex-col.max-w-3xl') || document.body;
  if (!chatContainer) {
    console.log('Chat container not found.');
    return;
  }

  // Extract messages using the provided function
  const messages = extractMessages(document);
  console.log(`Found ${messages.length} chat messages`);

  if (messages.length > MAX_MESSAGES) {
    const messagesToRemove = messages.length - PRESERVE_MESSAGES;
    for (let i = 0; i < messagesToRemove; i++) {
      if (messages[i] && messages[i].element) {
        messages[i].element.remove();
        console.log(`Removed message ${i + 1}: ${messages[i].role} - "${messages[i].content.substring(0, 20)}..."`);
      }
    }
    console.log(`Removed ${messagesToRemove} old chat messages to prevent crashes.`);
  } else {
    console.log('No messages to remove or insufficient messages.');
  }
}

// Run cleanup periodically
cleanUpChat();
setInterval(cleanUpChat, CHECK_INTERVAL);

// Observe dynamic chat updates
const observer = new MutationObserver(cleanUpChat);
observer.observe(chatContainer, { childList: true, subtree: true });

// Handle manual cleanup requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'cleanChat') {
    cleanUpChat();
    sendResponse({ status: '200' });
  }
});