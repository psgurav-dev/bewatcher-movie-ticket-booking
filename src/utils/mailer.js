'use strict';
const nodemailer = require('nodemailer');

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'dev.psgurav@gmail.com',
        pass: process.env.GMAIL_PASS,
    },
});
