# PackageBot
Chat Bot to help track lost package

# Order Tracking Chatbot

A simple chatbot to help customers track their orders, built with HTML, CSS, and JavaScript.

## Setup/Installation Instructions
To run the chatbot:
1. **Clone or Download**: 
   - Clone this repository using `git clone https://github.com/K-Shirule/PackageBot.git` or download the ZIP file from GitHub.
   - Once downloaded you can open the chatbot.html file to see the bot in action.
3. **Interact**:
   - Type an order ID (e.g., "123456") or phone number (e.g., "9876543210") and click "Send" to test.
   - There is a simple text input and text output, you can type whatever you like.

## Brief Explanation of Approach
This chatbot helps customers track lost packages with a smooth, logical flow:
- **Scenario**: Assists users in checking order status using a 6-digit order ID or 10-digit phone number.
- **Design Choices**: 
  - Starts with a greeting, accepts flexible input (e.g., "Its 123456"), and offers help if stuck.
  - Uses condition-driven logic to guide the conversation (e.g., greet → input → result).
- **Implementation**: 
  - `currentState` tracks the conversation stage (e.g., `"greet"`, `"checking_order_id"`).
  - Regex patterns (e.g., `/^.*\b\d{6}\b.*$/`) parse inputs from text and match with common hard-coded phrases.
  - DOM updates via `addMessage()` display responses in the chatbox.
- **Error Handling**: 
  - Invalid inputs (e.g., "blah") trigger error/invalid message.
  - After certain number of settable failed attempts, suggests an agent.

The goal was simplicity and usability, avoiding complex features per the project guidelines.

## Screenshots/Examples of the Chatbot in Action
Below are examples of how the chatbot responds:

### 1. Order Lookup
![Order Lookup](screenshots/valid-order-search.png)  
**Input**: "It's 123456"  
**Output**: "Thanks! Checking your order status..." → "Your order with ID 123456 is currently: Shipped."

### 2. Phone Number Check
![Phone Check](screenshots/valid-phone-search.png)  
**Input**: "My phone is 9123456789"  
**Output**: "Thanks! Fetching your orders using the phone number...
We found 2 order(s) linked to the phone number 9123456789:
Order ID 654321: Status - In Transit
Order ID 789012: Status - Delivered"

### 4. Escalate to Agent
![Agent Testing](screenshots/agent-testing.png)  

### 3. Error Handling
![Error Handling1](screenshots/error1.png)  
**Input**: "blah"  
**Output**: "Sorry, I didn’t get that. Please enter a valid 6-digit Order ID or phone number."

![Error Handling2](screenshots/error2.png) 
**Input**: "999999"  
**Output**: "Thanks! Checking your order status...
Sorry, we couldn't find that Order ID. Please try again."

![Error Handling3](screenshots/error3.png) 
**Input**: "1234567890"  
**Output**: "Thanks! Fetching your orders using the phone number...
Sorry, we couldn't find any orders using that phone number. Please try again."

## Notes
- Uses dummy data in `orderRecords` for demo purposes.
