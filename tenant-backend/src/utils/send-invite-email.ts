// import nodemailer from 'nodemailer';

// export async function sendInviteEmail(to: string, token: string, frontendUrl: string) {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',  // or any SMTP
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.SMTP_EMAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const inviteLink = `${frontendUrl}/invite?token=${token}`;

//   await transporter.sendMail({
//     from: `"Workspace App" <${process.env.SMTP_EMAIL}>`,
//     to,
//     subject: 'You are invited to join an organization',
//     html: `<p>Click here to join: <a href="${inviteLink}">${inviteLink}</a></p>`,
//   });
// }
