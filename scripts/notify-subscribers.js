/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

async function main() {
  const { SMTP_USER, SMTP_PASS, FROM_NAME, REPO_URL, CHANGED_FILES } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP credentials');
    process.exit(1);
  }

  const subscribersPath = path.join(__dirname, '..', 'data', 'subscribers.json');
  const subs = JSON.parse(fs.readFileSync(subscribersPath, 'utf8'));
  if (!Array.isArray(subs) || subs.length === 0) {
    console.log('No subscribers to notify');
    return;
  }

  const changed = (CHANGED_FILES || '')
    .split('\n')
    .filter(Boolean)
    .filter(f => /data\/(blogs|backend-engineering|ai|startup-world|tech-innovations)\/.*\.json$/.test(f));

  if (changed.length === 0) {
    console.log('No blog changes detected');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const subject = `Satyverse: ${changed.length} new/updated article(s)`;
  const links = changed.map(f => {
    const slug = path.basename(f, '.json');
    return `- ${slug}: ${REPO_URL}/blob/main/${f}`;
  }).join('\n');

  const text = `Hello,\n\nWe have ${changed.length} new/updated article(s):\n\n${links}\n\nRead them on our site: https://satyamparmar-dev.github.io/satyamparmar\n\n— Satyverse`;

  for (const to of subs) {
    try {
      await transporter.sendMail({
        from: `${FROM_NAME || 'Satyverse'} <${SMTP_USER}>`,
        to,
        subject,
        text,
      });
      console.log('Sent to', to);
    } catch (e) {
      console.error('Failed to send to', to, e.message);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
