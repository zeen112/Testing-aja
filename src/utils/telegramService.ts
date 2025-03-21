
/**
 * Telegram service for sending messages to a Telegram bot
 */

// Bot token supplied by the user
const BOT_TOKEN = "6780732383:AAE0m3mudcTobTuuZHULqHLsu58oFMdM39c";

// Updated chat ID provided by the user
const CHAT_ID = "828200865"; // User's actual chat ID

/**
 * Sends a message to a Telegram bot
 * @param message The message to send
 * @returns Promise<boolean> whether the message was sent successfully
 */
export const sendToTelegram = async (message: string): Promise<boolean> => {
  try {
    console.log("Sending message to Telegram...");
    
    // Construct the Telegram API URL
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    // Prepare the request payload
    const payload = {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown", // Use Markdown formatting
    };
    
    console.log("Sending to Telegram with payload:", {
      chat_id: CHAT_ID,
      text: message.substring(0, 50) + "...", // Log truncated message for privacy
      parse_mode: "Markdown",
    });
    
    // Send the HTTP request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    // Get the response data for better error handling
    const responseData = await response.json();
    
    // Check if the request was successful
    if (response.ok) {
      console.log("Message sent to Telegram successfully:", responseData);
      return true;
    } else {
      console.error("Failed to send message to Telegram:", responseData);
      return false;
    }
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    return false;
  }
};
