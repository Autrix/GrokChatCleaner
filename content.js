// Configuration
const MAX_MESSAGES = 3; // Maximum number of messages before cleanup
const PRESERVE_MESSAGES = 2; // Number of recent messages to keep
const CHECK_INTERVAL = 15000; // Check every 15 seconds

console.log('Grok Chat Cleaner content script loaded on', window.location.href);

// Function to extract messages from HTML
function extractMessages(doc) {
  console.log('Extracting messages from document');
  const messageBubbles = doc.querySelectorAll('.message-bubble');
  console.log(`Found ${messageBubbles.length} message bubbles`);

  const messages = [];

  messageBubbles.forEach((bubble, index) => {
    const parent = bubble.closest('.items-end, .items-start');
    if (!parent) {
      console.log(`Bubble ${index}: No parent with items-end or items-start found`);
      return;
    }

    let role, content;

    if (parent.classList.contains('items-end')) {
      const userSpan = bubble.querySelector('span.whitespace-pre-wrap');
      if (userSpan) {
        role = 'user';
        content = userSpan.textContent.trim();
      }
    } else if (parent.classList.contains('items-start')) {
      const assistantPara = bubble.querySelector('.response-content-markdown p.break-words');
      if (assistantPara) {
        role = 'assistant';
        content = assistantPara.textContent.trim();
      }
    }

    if (role && content) {
      messages.push({ role, content, element: parent });
      console.log(`Bubble ${index}: ${role} - "${content.substring(0, 20)}..."`);
    } else {
      console.log(`Bubble ${index}: No valid message content found`);
    }
  });

  return messages;
}

function cleanUpChat() {
  console.log('Running cleanUpChat');
  const chatContainer = document.querySelector('.w-full.flex.flex-col.max-w-3xl') || document.body;
  if (!chatContainer) {
    console.log('Chat container not found');
    return;
  }

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
    console.log(`Removed ${messagesToRemove} old chat messages to prevent crashes`);
  } else {
    console.log('No messages to remove or insufficient messages');
  }
}

// Run cleanup initially
cleanUpChat();
setInterval(cleanUpChat, CHECK_INTERVAL);

// Observe dynamic chat updates
const observer = new MutationObserver(() => {
  console.log('Mutation detected, running cleanUpChat');
  cleanUpChat();
});
const chatContainer = document.querySelector('.w-full.flex.flex-col.max-w-3xl') || document.body;
observer.observe(chatContainer, { childList: true, subtree: true });

// Handle manual cleanup requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === 'cleanChat') {
    cleanUpChat();
    sendResponse({ status: '200' });
  }
});