
'use server';

import type { Order, CartItem } from '@/lib/types';

// Helper function to escape HTML special characters for Telegram
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/**
 * Sends a message to a specified Telegram chat using the Telegram Bot API.
 * @param text The message text. Supports HTML formatting.
 * @returns A promise that resolves to true if the message was sent successfully, false otherwise.
 */
async function sendTelegramMessage(text: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || botToken === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.error('Telegram Bot Token not configured. Skipping notification.');
    return false;
  }
  if (!chatId || chatId === 'YOUR_TELEGRAM_CHAT_ID_HERE') {
    console.error('Telegram Chat ID not configured. Skipping notification.');
    return false;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload = new URLSearchParams({
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('Telegram notification sent successfully.');
      return true;
    } else {
      console.error('Failed to send Telegram notification:', result.description);
      console.error('Failed message content:', text); // Log the message that failed
      return false;
    }
  } catch (error) {
    console.error('Error sending Telegram request:', error);
    return false;
  }
}

/**
 * Formats and sends a notification for a new order.
 * @param order The newly created order object.
 */
export async function sendNewOrderNotification(order: Order): Promise<void> {
  const customerName = escapeHtml(order.customerName);
  const total = order.totalPrice.toFixed(2);
  const itemsSummary = order.items
    .map(item => `  - ${escapeHtml(item.name)} (x${item.quantity})`)
    .join('\n');

  const message = `
<b>🎉 New Order Received!</b>

<b>Order ID:</b> <code>${escapeHtml(order.id)}</code>
<b>Customer:</b> ${customerName}
<b>Total:</b> $${total}
<b>Payment Method:</b> ${escapeHtml(order.paymentMethod)}

<b>Items:</b>
<pre>${itemsSummary}</pre>

<b>Shipping Address:</b>
<pre>
${escapeHtml(order.shippingAddress.fullName)}
${escapeHtml(order.shippingAddress.streetAddress)}
${escapeHtml(order.shippingAddress.district)}, ${escapeHtml(order.shippingAddress.state)}
Phone: ${escapeHtml(order.shippingAddress.phone)}
</pre>
  `;

  await sendTelegramMessage(message.trim());
}

/**
 * Formats and sends a notification for a new contact message.
 */
export async function sendContactMessageNotification(formData: {
  name: string;
  email: string;
  message: string;
  instagram?: string;
  whatsapp?: string;
  otherContact?: string;
}): Promise<void> {
  let otherDetails = '';
  if (formData.instagram) {
    otherDetails += `<b>Instagram:</b> ${escapeHtml(formData.instagram)}\n`;
  }
  if (formData.whatsapp) {
    otherDetails += `<b>WhatsApp:</b> ${escapeHtml(formData.whatsapp)}\n`;
  }
  if (formData.otherContact) {
    otherDetails += `<b>Other:</b> ${escapeHtml(formData.otherContact)}\n`;
  }

  const message = `
📬 <b>New Contact Message!</b>

<b>From:</b> ${escapeHtml(formData.name)}
<b>Email:</b> <code>${escapeHtml(formData.email)}</code>

<b>Message:</b>
<pre>${escapeHtml(formData.message)}</pre>

${otherDetails ? '<b>Other Contact Info:</b>\n' + otherDetails : ''}
  `;

  await sendTelegramMessage(message.trim());
}
