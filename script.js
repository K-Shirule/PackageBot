const chatMessages = document.getElementById("messages");
const stateDisplay = document.getElementById("state");

let currentState = "greet"; //State to track flow of program and debug
let hasOfferedHelp = false; // Flag to prevent looping on "don't know"

let failedAttempts = 0; // Track failed attempts so that agent can be auto-called after certain number
const maxAttempts = 3; // Maximum failed attempts before suggesting an agent

// Dummy data for orders and phone numbers - this can later be filled by data from DB or even more dummy datta if needed
const orderRecords = [
  { orderId: "123456", phoneNumber: "1234567890", status: "Shipped" },
  { orderId: "654321", phoneNumber: "9123456789", status: "In Transit" },
  { orderId: "789012", phoneNumber: "9123456789", status: "Delivered" },
  { orderId: "345678", phoneNumber: "9988776655", status: "Delivered" }
];

//These are the key phrases I had mentioned in the flowchart.
//Certain phrases will trigger specific action else the default will be invalid
const responsePatterns = [
  { pattern: /^.*\b\d{6}\b.*$/, action: "check_order_id", description: "6+ digit order ID" },
  { pattern: /^.*\b\d{10}\b.*$/, action: "check_phone", description: "10-digit phone number" },
  { pattern: /\b(hi|hello|hey)\b/i, action: "greeting", description: "greeting" },
  { pattern: /\b(agent|representative|human)\b/i, action: "talk_to_agent", description: "ask for agent" },
  { pattern: /\b(don'?t know|no idea|not sure|can't)\b/i, action: "don't_know", description: "doesn't know ID" },
  { pattern: /\b(what is that|how do i|where do i|where can i)\b/i, action: "confusion", description: "confused about order ID" },
  { pattern: /\b(status|track)\b/i, action: "track_order", description: "tracking" },
  { pattern: /\b(bye|goodbye|end|quit)\b/i, action: "end_chat", description: "end chat" }
];

//This function is to dynamically display the message from the bot in the chatbox
function addMessage(text, from = "bot") {
  const div = document.createElement("div");
  div.className = from;
  div.innerText = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Function to allow changing states and show the current state
function updateState(newState) {
  currentState = newState;
  stateDisplay.innerHTML = `State: <strong>${newState}</strong>`;
}

//Function to suggest user to talk to agent because they are not getting the right order ID after multiple tries
function checkFailedAttempts() {
  if (failedAttempts >= maxAttempts) {
    addMessage("It looks like we're having trouble finding your order after multiple attempts. Would you like to speak to an agent?");
    updateState("confirm_transfer");
    return true;
  }
  return false;
}

//Clears the chat
function resetChat() {
  chatMessages.innerHTML = '<div class="bot">Hello! Please enter your order ID.</div>';
  currentState = "greet";
  failedAttempts = 0;
  hasOfferedHelp = false;
  updateState("greet");
}

//Main function to get user input and make decisions
function handleInput() {
  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  addMessage(userInput, "user");
  document.getElementById("userInput").value = "";

  let action = "invalid";

  // Check if the current state is confirming transfer
  if (currentState === "confirm_transfer") {
    handleConfirmation(userInput);
    return;
  }

  //Compare patterns in input with our list and set the action to be performed accordingly
  for (let item of responsePatterns) {
    if (item.pattern.test(userInput)) {
      action = item.action;
      // Extract the number for use in the case logic
      if (action === "check_order_id") {
        userInput.match(/\b\d{6}\b/)[0];
      } else if (action === "check_phone") {
        userInput.match(/\b\d{10}\b/)[0];
      }
      break;
    }
  }

  //Add messages to chatbox appropriate to the action
  switch (action) {
    case "greeting":
      updateState("greeting_user");
      addMessage("Hello! Please enter your Order ID so I can help track your package.");
      break;
      
    //Here we are checking the array directly but we could incorporate checking DBs here as well
    case "check_order_id":
      updateState("checking_order_id");
      failedAttempts++;
      const orderId = userInput.match(/\b\d{6}\b/)[0];
      addMessage("Thanks! Checking your order status...");
      setTimeout(() => {
        const order = orderRecords.find(o => o.orderId === orderId);
        if (order) {
          addMessage(`Your order with ID ${order.orderId} is currently: ${order.status}.`);
          failedAttempts = 0; // Reset on success
        } else {
          addMessage("Sorry, we couldn't find that Order ID. Please try again.");
          if (checkFailedAttempts()) return;
        }
      }, 1000);
      break;
    
    //For now it will return all orders connected to a phone no. but can be changed later to display certain time range
    case "check_phone":
      updateState("checking_phone");
      failedAttempts++;
      const phoneNumber = userInput.match(/\b\d{10}\b/)[0];
      addMessage("Thanks! Fetching your orders using the phone number...");
      setTimeout(() => {
        const orders = orderRecords.filter(o => o.phoneNumber === phoneNumber);
        if (orders.length > 0) {
          addMessage(`We found ${orders.length} order(s) linked to the phone number ${phoneNumber}:`);
          orders.forEach(order => {
            addMessage(`Order ID ${order.orderId}: Status - ${order.status}`);
          });
          failedAttempts = 0; // Reset on success
        } else {
          addMessage("Sorry, we couldn't find any orders using that phone number. Please try again.");
          if (checkFailedAttempts()) return;
        }
      }, 1000);
      break;
    
    //Don't transfer directly to agent if order can be tracked directly, so urge customer to input Order ID or phone no.
    case "talk_to_agent":
      updateState("transferring_to_agent");
      addMessage("Are you sure? I can help you if you provide an Order ID or phone number.");
      updateState("confirm_transfer");
      break;
    
    //User can't find order ID or remember their registered phone number
    case "don't_know":
      updateState("help_request");
      if (!hasOfferedHelp) {
        addMessage("No worries! I can also use your registered phone number to find the order status. Can you please provide that?");
        hasOfferedHelp = true; // Set flag to true after offering help
      } else {
        addMessage("It seems you don’t have your order ID or phone number. I can transfer you to an agent for further assistance. Would you like that?");
        updateState("confirm_transfer");
      }
      break;

    //User doesn't know what an order id is or where to find it
    case "confusion":
      updateState("help_request");
      addMessage("No problem! The Order ID is a unique number given to every order. You can find it in your order confirmation email or on our website in your order details.");
      break;
    
    //Generic prompt to ask for the Order ID/phone no.
    case "track_order":
      updateState("tracking_order");
      addMessage("Sure! Please provide your Order ID or phone number so I can check the status of your order.");
      break;
    
    case "end_chat":
      updateState("ending");
      addMessage("Goodbye! If you need help again, feel free to start over.");
      setTimeout(() => {
        resetChat();
      }, 1000);
      break;
    
    //Default will be that user inputted something invalid and has to try again
    default:
      updateState("invalid_input");
      addMessage("Sorry, I didn’t get that. Please enter a valid 6-digit Order ID or phone number.");
      break;
  }
}

// Handle confirmation of transfer to an agent
function handleConfirmation(input) {
  if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('sure')) {
    updateState("transferring_to_agent");
    addMessage("Sure! Transferring you to an agent now.");
    //we can add actual transfer or a connection here later
  } else {
    updateState("greet");
    addMessage("Okay, feel free to provide a valid Order ID or phone number when ready.");
    failedAttempts = 0;
    //User doesn't want to be transferred so we'll set failed attempts back to 0
  }
}