const axios = require('axios');
const settingsService = require('./settingsService');

const endPoint = 'https://api.mnotify.com/api/sms/quick';

/**
 * Get SMS settings from database
 */
const getSMSSettings = async () => {
  const smsSettings = await settingsService.getCategorySettings('sms');
  return {
    apiKey: smsSettings.api_key || '',
    senderName: smsSettings.sender_name || 'VisaLink',
    enabled: smsSettings.enabled === true || smsSettings.enabled === 'true' || smsSettings.enabled === '1'
  };
};

/**
 * Get SMS template from database
 * @param {string} templateKey - Template key (e.g., 'application_created_customer')
 * @param {string} fallbackTemplate - Fallback template if not found in database
 * @returns {Promise<string>} Template string
 */
const getSMSTemplate = async (templateKey, fallbackTemplate) => {
  try {
    const template = await settingsService.getSetting('sms_templates', templateKey);
    return template || fallbackTemplate;
  } catch (error) {
    console.error(`Error getting SMS template ${templateKey}:`, error);
    return fallbackTemplate;
  }
};

/**
 * Replace template variables with actual values
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} variables - Object with variable values
 * @returns {string} Resolved template string
 */
const replaceTemplateVariables = (template, variables) => {
  let resolved = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    resolved = resolved.replace(regex, value || '');
  }
  return resolved;
};

/**
 * Send SMS to single or multiple recipients
 * @param {string|string[]} recipients - Phone number(s) (e.g., '0241234567' or ['0241234567', '0201234567'])
 * @param {string} message - SMS message content
 * @param {boolean} isSchedule - Whether to schedule the SMS
 * @param {string} scheduleDate - Schedule date (ISO format) if isSchedule is true
 * @returns {Promise<Object>} Response from mNotify API
 */
const sendSMS = async (recipients, message, isSchedule = false, scheduleDate = '') => {
  // Get SMS settings from database
  const smsSettings = await getSMSSettings();
  
  // Check if SMS is enabled
  if (!smsSettings.enabled) {
    console.log('SMS notifications are disabled. Skipping SMS send.');
    return { success: false, message: 'SMS notifications are disabled' };
  }

  // Check if API key is configured
  if (!smsSettings.apiKey) {
    console.error('SMS API key is not configured. Cannot send SMS.');
    return { success: false, message: 'SMS API key not configured' };
  }

  // Normalize recipients to array
  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  
  // Filter out empty/invalid phone numbers
  const validRecipients = recipientArray.filter(phone => phone && phone.trim() !== '');
  
  if (validRecipients.length === 0) {
    console.error('No valid phone numbers provided for SMS');
    return { success: false, message: 'No valid phone numbers provided' };
  }

  // Format phone numbers (remove spaces, ensure proper format)
  const formattedRecipients = validRecipients.map(phone => {
    // Remove spaces and special characters, keep only digits
    let formatted = phone.replace(/\D/g, '');
    // Ensure it starts with country code (Ghana: 233)
    if (formatted.startsWith('0')) {
      formatted = '233' + formatted.substring(1);
    } else if (!formatted.startsWith('233')) {
      formatted = '233' + formatted;
    }
    return formatted;
  });

  const url = endPoint + '?key=' + smsSettings.apiKey;
  
  const data = {
    recipient: formattedRecipients,
    sender: smsSettings.senderName,
    message: message,
    is_schedule: isSchedule,
    schedule_date: scheduleDate
  };

  try {
    const response = await axios.post(url, data, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('SMS sent successfully:', response.data);
    return {
      success: true,
      data: response.data,
      summary: response.data.summary || {}
    };
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Send SMS notification when application is created
 * @param {string} customerPhone - Customer's phone number
 * @param {string} customerName - Customer's name
 * @param {number} applicationId - Application ID
 * @param {string} serviceName - Service name
 * @param {string} [agentPhone] - Optional agent's phone number (if application was created by agent)
 * @param {string} [agentName] - Optional agent's name (if application was created by agent)
 */
const notifyApplicationCreated = async (customerPhone, customerName, applicationId, serviceName, agentPhone = null, agentName = null) => {
  const recipients = [];
  const messages = [];
  const smsSettings = await getSMSSettings();

  // Always send SMS to customer
  if (customerPhone) {
    const fallbackTemplate = `Dear {{customer_name}}, your application #{{application_id}} for {{service_name}} has been received and is being processed. We will keep you updated. Thank you! - {{sender_name}}`;
    const template = await getSMSTemplate('application_created_customer', fallbackTemplate);
    const customerMessage = replaceTemplateVariables(template, {
      customer_name: customerName,
      application_id: applicationId,
      service_name: serviceName,
      sender_name: smsSettings.senderName
    });
    recipients.push(customerPhone);
    messages.push({ phone: customerPhone, message: customerMessage });
  }

  // If agent created the application, also send SMS to agent
  if (agentPhone && agentName) {
    const fallbackTemplate = `Dear {{agent_name}}, you have successfully created application #{{application_id}} for {{customer_name}} ({{service_name}}). The application is now being processed. - {{sender_name}}`;
    const template = await getSMSTemplate('application_created_agent', fallbackTemplate);
    const agentMessage = replaceTemplateVariables(template, {
      agent_name: agentName,
      application_id: applicationId,
      customer_name: customerName,
      service_name: serviceName,
      sender_name: smsSettings.senderName
    });
    recipients.push(agentPhone);
    messages.push({ phone: agentPhone, message: agentMessage });
  }

  if (recipients.length === 0) {
    console.log('No phone numbers provided for application created notification');
    return { success: false, message: 'No phone numbers provided' };
  }

  // Send SMS to all recipients
  // If we have multiple recipients with different messages, send separately
  // Otherwise, if same message, send as batch
  if (messages.length === 1) {
    return await sendSMS(messages[0].phone, messages[0].message);
  } else {
    // Send multiple SMS with different messages
    const results = await Promise.allSettled(
      messages.map(msg => sendSMS(msg.phone, msg.message))
    );
    
    // Return summary
    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length;
    
    return {
      success: successful > 0,
      summary: {
        total: messages.length,
        successful,
        failed
      }
    };
  }
};

/**
 * Send SMS notification when application status changes
 * @param {string} customerPhone - Customer's phone number
 * @param {string} customerName - Customer's name
 * @param {number} applicationId - Application ID
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} serviceName - Service name
 * @param {string} [agentPhone] - Optional agent's phone number (if application was created by agent)
 * @param {string} [agentName] - Optional agent's name (if application was created by agent)
 */
const notifyApplicationStatusChange = async (customerPhone, customerName, applicationId, oldStatus, newStatus, serviceName, agentPhone = null, agentName = null) => {
  const messages = [];
  const smsSettings = await getSMSSettings();

  // Build status message
  let statusMessage = '';
  switch (newStatus.toLowerCase()) {
    case 'submitted':
      statusMessage = 'has been submitted for review';
      break;
    case 'under_review':
      statusMessage = 'is now under review';
      break;
    case 'approved':
      statusMessage = 'has been APPROVED! Congratulations!';
      break;
    case 'rejected':
      statusMessage = 'has been rejected. Please contact us for more information.';
      break;
    case 'pending':
      statusMessage = 'is pending further action';
      break;
    default:
      statusMessage = `status has been updated to ${newStatus}`;
  }

  // Always send SMS to customer
  if (customerPhone) {
    const fallbackTemplate = `Dear {{customer_name}}, your application #{{application_id}} for {{service_name}} {{status_message}}. We will contact you if any additional information is needed. - {{sender_name}}`;
    const template = await getSMSTemplate('application_status_change_customer', fallbackTemplate);
    const customerMessage = replaceTemplateVariables(template, {
      customer_name: customerName,
      application_id: applicationId,
      service_name: serviceName,
      status_message: statusMessage,
      sender_name: smsSettings.senderName
    });
    messages.push({ phone: customerPhone, message: customerMessage });
  }

  // If agent created the application, also send SMS to agent
  if (agentPhone && agentName) {
    const fallbackTemplate = `Dear {{agent_name}}, the status of application #{{application_id}} for {{customer_name}} ({{service_name}}) {{status_message}}. - {{sender_name}}`;
    const template = await getSMSTemplate('application_status_change_agent', fallbackTemplate);
    const agentMessage = replaceTemplateVariables(template, {
      agent_name: agentName,
      application_id: applicationId,
      customer_name: customerName,
      service_name: serviceName,
      status_message: statusMessage,
      sender_name: smsSettings.senderName
    });
    messages.push({ phone: agentPhone, message: agentMessage });
  }

  if (messages.length === 0) {
    console.log('No phone numbers provided for application status change notification');
    return { success: false, message: 'No phone numbers provided' };
  }

  // Send SMS to all recipients
  if (messages.length === 1) {
    return await sendSMS(messages[0].phone, messages[0].message);
  } else {
    // Send multiple SMS with different messages
    const results = await Promise.allSettled(
      messages.map(msg => sendSMS(msg.phone, msg.message))
    );
    
    // Return summary
    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)).length;
    
    return {
      success: successful > 0,
      summary: {
        total: messages.length,
        successful,
        failed
      }
    };
  }
};

/**
 * Send SMS notification when appointment is created
 */
const notifyAppointmentCreated = async (customerPhone, customerName, appointmentDate, appointmentTime, service, location) => {
  if (!customerPhone) {
    console.log('No phone number provided for appointment created notification');
    return;
  }

  const smsSettings = await getSMSSettings();
  const date = new Date(appointmentDate).toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const locationText = location ? ` at ${location}` : '';
  const fallbackTemplate = `Dear {{customer_name}}, your appointment for {{service}} has been scheduled for {{appointment_date}} at {{appointment_time}}{{location_text}}. We look forward to seeing you! - {{sender_name}}`;
  const template = await getSMSTemplate('appointment_created', fallbackTemplate);
  const message = replaceTemplateVariables(template, {
    customer_name: customerName,
    service: service,
    appointment_date: date,
    appointment_time: appointmentTime,
    location_text: locationText,
    sender_name: smsSettings.senderName
  });
  
  return await sendSMS(customerPhone, message);
};

/**
 * Send SMS reminder for upcoming appointment
 */
const notifyAppointmentReminder = async (customerPhone, customerName, appointmentDate, appointmentTime, service) => {
  if (!customerPhone) {
    console.log('No phone number provided for appointment reminder');
    return;
  }

  const smsSettings = await getSMSSettings();
  const date = new Date(appointmentDate).toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const fallbackTemplate = `Reminder: Dear {{customer_name}}, you have an appointment for {{service}} tomorrow ({{appointment_date}}) at {{appointment_time}}. Please arrive on time. - {{sender_name}}`;
  const template = await getSMSTemplate('appointment_reminder', fallbackTemplate);
  const message = replaceTemplateVariables(template, {
    customer_name: customerName,
    service: service,
    appointment_date: date,
    appointment_time: appointmentTime,
    sender_name: smsSettings.senderName
  });
  
  return await sendSMS(customerPhone, message);
};

/**
 * Send SMS notification when customer is created (optional welcome message)
 */
const notifyCustomerCreated = async (customerPhone, customerName) => {
  if (!customerPhone) {
    console.log('No phone number provided for customer created notification');
    return;
  }

  const smsSettings = await getSMSSettings();
  const fallbackTemplate = `Welcome {{customer_name}}! Thank you for registering with {{sender_name}}. We're here to help you with all your visa and travel needs. - {{sender_name}}`;
  const template = await getSMSTemplate('customer_welcome', fallbackTemplate);
  const message = replaceTemplateVariables(template, {
    customer_name: customerName,
    sender_name: smsSettings.senderName
  });
  
  return await sendSMS(customerPhone, message);
};

/**
 * Send custom SMS message
 */
const sendCustomSMS = async (recipients, message, isSchedule = false, scheduleDate = '') => {
  return await sendSMS(recipients, message, isSchedule, scheduleDate);
};

module.exports = {
  sendSMS,
  notifyApplicationCreated,
  notifyApplicationStatusChange,
  notifyAppointmentCreated,
  notifyAppointmentReminder,
  notifyCustomerCreated,
  sendCustomSMS
};

