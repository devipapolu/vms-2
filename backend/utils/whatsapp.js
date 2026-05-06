/**
 * Mock WhatsApp Notification Utility
 * In a real production app, this would use Twilio, Meta Graph API, or a third-party WhatsApp API.
 */

exports.sendWhatsAppMessage = async (to, message) => {
  console.log('----------------------------------------------------');
  console.log(`📱 WHATSAPP MESSAGE SENT TO: ${to}`);
  console.log(`💬 MESSAGE: ${message}`);
  console.log('----------------------------------------------------');
  
  // Simulate API delay
  return new Promise((resolve) => setTimeout(resolve, 500));
};
