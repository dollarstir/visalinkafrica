const pool = require('../config/database');

async function addSMSTemplates() {
  try {
    console.log('Adding SMS templates...');

    // Default templates for each action
    const templates = [
      {
        key: 'application_created_customer',
        name: 'Application Created - Customer',
        description: 'SMS sent to customer when application is created',
        defaultTemplate: 'Dear {{customer_name}}, your application #{{application_id}} for {{service_name}} has been received and is being processed. We will keep you updated. Thank you! - {{sender_name}}',
        variables: ['customer_name', 'application_id', 'service_name', 'sender_name']
      },
      {
        key: 'application_created_agent',
        name: 'Application Created - Agent',
        description: 'SMS sent to agent when they create an application',
        defaultTemplate: 'Dear {{agent_name}}, you have successfully created application #{{application_id}} for {{customer_name}} ({{service_name}}). The application is now being processed. - {{sender_name}}',
        variables: ['agent_name', 'application_id', 'customer_name', 'service_name', 'sender_name']
      },
      {
        key: 'application_status_change_customer',
        name: 'Application Status Change - Customer',
        description: 'SMS sent to customer when application status changes',
        defaultTemplate: 'Dear {{customer_name}}, your application #{{application_id}} for {{service_name}} {{status_message}}. We will contact you if any additional information is needed. - {{sender_name}}',
        variables: ['customer_name', 'application_id', 'service_name', 'status_message', 'sender_name']
      },
      {
        key: 'application_status_change_agent',
        name: 'Application Status Change - Agent',
        description: 'SMS sent to agent when application status changes',
        defaultTemplate: 'Dear {{agent_name}}, the status of application #{{application_id}} for {{customer_name}} ({{service_name}}) {{status_message}}. - {{sender_name}}',
        variables: ['agent_name', 'application_id', 'customer_name', 'service_name', 'status_message', 'sender_name']
      },
      {
        key: 'appointment_created',
        name: 'Appointment Created',
        description: 'SMS sent to customer when appointment is created',
        defaultTemplate: 'Dear {{customer_name}}, your appointment for {{service}} has been scheduled for {{appointment_date}} at {{appointment_time}}{{location_text}}. We look forward to seeing you! - {{sender_name}}',
        variables: ['customer_name', 'service', 'appointment_date', 'appointment_time', 'location_text', 'sender_name']
      },
      {
        key: 'appointment_reminder',
        name: 'Appointment Reminder',
        description: 'SMS reminder sent to customer before appointment',
        defaultTemplate: 'Reminder: Dear {{customer_name}}, you have an appointment for {{service}} tomorrow ({{appointment_date}}) at {{appointment_time}}. Please arrive on time. - {{sender_name}}',
        variables: ['customer_name', 'service', 'appointment_date', 'appointment_time', 'sender_name']
      },
      {
        key: 'customer_welcome',
        name: 'Customer Welcome',
        description: 'Welcome SMS sent to customer when they are created',
        defaultTemplate: 'Welcome {{customer_name}}! Thank you for registering with {{sender_name}}. We\'re here to help you with all your visa and travel needs. - {{sender_name}}',
        variables: ['customer_name', 'sender_name']
      }
    ];

    for (const template of templates) {
      // Check if template already exists
      const check = await pool.query(
        "SELECT id FROM settings WHERE category = 'sms_templates' AND key = $1",
        [template.key]
      );

      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO settings (category, key, value, type, description)
          VALUES ('sms_templates', $1, $2, 'string', $3)
        `, [template.key, template.defaultTemplate, template.description]);
        console.log(`Added template: ${template.name}`);
      } else {
        console.log(`Template already exists: ${template.name}`);
      }
    }

    console.log('SMS templates setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding SMS templates:', error);
    process.exit(1);
  }
}

addSMSTemplates();

