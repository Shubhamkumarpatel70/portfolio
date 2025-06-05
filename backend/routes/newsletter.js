const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Configure email transporter
let transporter;
try {
  // Try to set up the transporter with environment variables
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  console.log('Email transporter configured successfully');
} catch (error) {
  console.error('Failed to configure email transporter:', error);
}

// Get all subscribers (admin only)
router.get('/subscribers', protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    console.error('Error fetching subscribers:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get subscriber count (admin only)
router.get('/count', protect, adminOnly, async (req, res) => {
  try {
    const count = await Newsletter.countDocuments({ isActive: true });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Subscribe to newsletter (public)
router.post('/subscribe', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      // If already subscribed but inactive, reactivate
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = Date.now();
        if (name) existingSubscriber.name = name;
        
        await existingSubscriber.save();
        return res.status(200).json({ message: 'Subscription reactivated successfully' });
      }
      
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    
    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      name: name || '',
      isActive: true,
      unsubscribeToken
    });
    
    await newSubscriber.save();
    
    // Send welcome email if transporter is configured
    if (transporter && process.env.EMAIL_FROM) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Welcome to our Newsletter!',
          html: `
            <h2>Thank you for subscribing!</h2>
            <p>You've been added to our newsletter list and will receive updates about our latest content.</p>
            <p>If you wish to unsubscribe, <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}">click here</a>.</p>
          `
        });
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Continue even if email fails
      }
    }
    
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error subscribing:', err);
    res.status(400).json({ message: err.message });
  }
});

// Unsubscribe from newsletter using token (public)
router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    return res.status(400).json({ message: 'Unsubscribe token is required' });
  }
  
  try {
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Invalid unsubscribe token' });
    }
    
    subscriber.isActive = false;
    await subscriber.save();
    
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('Error unsubscribing:', err);
    res.status(400).json({ message: err.message });
  }
});

// Unsubscribe from newsletter using email (public)
router.post('/unsubscribe', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in subscribers list' });
    }
    
    subscriber.isActive = false;
    await subscriber.save();
    
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('Error unsubscribing:', err);
    res.status(400).json({ message: err.message });
  }
});

// Send newsletter to subscribers (admin only)
router.post('/send', protect, adminOnly, async (req, res) => {
  const { subject, body, recipients } = req.body;
  
  if (!subject || !body) {
    return res.status(400).json({ message: 'Subject and body are required' });
  }
  
  if (!transporter || !process.env.EMAIL_FROM) {
    return res.status(500).json({ message: 'Email service not configured' });
  }
  
  try {
    let subscribersToEmail = [];
    
    if (recipients && Array.isArray(recipients) && recipients.length > 0) {
      // Send to specific recipients
      subscribersToEmail = await Newsletter.find({
        _id: { $in: recipients },
        isActive: true
      });
    } else {
      // Send to all active subscribers
      subscribersToEmail = await Newsletter.find({ isActive: true });
    }
    
    if (subscribersToEmail.length === 0) {
      return res.status(400).json({ message: 'No active subscribers found' });
    }
    
    // Send emails in batches to avoid overloading the server
    const batchSize = 50;
    const totalBatches = Math.ceil(subscribersToEmail.length / batchSize);
    
    for (let i = 0; i < totalBatches; i++) {
      const batch = subscribersToEmail.slice(i * batchSize, (i + 1) * batchSize);
      
      const emailPromises = batch.map(subscriber => {
        const personalizedBody = body.replace('{name}', subscriber.name || 'Subscriber');
        
        return transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: subscriber.email,
          subject: subject,
          html: `
            ${personalizedBody}
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If you wish to unsubscribe, <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${subscriber.unsubscribeToken}">click here</a>.
            </p>
          `
        }).then(() => {
          // Update last email sent date
          return Newsletter.findByIdAndUpdate(subscriber._id, {
            lastEmailSent: new Date()
          });
        });
      });
      
      await Promise.all(emailPromises);
      
      // Small delay between batches to prevent rate limiting
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.json({ 
      message: 'Newsletter sent successfully', 
      count: subscribersToEmail.length 
    });
  } catch (err) {
    console.error('Error sending newsletter:', err);
    res.status(500).json({ message: 'Failed to send newsletter: ' + err.message });
  }
});

// Delete a subscriber (admin only)
router.delete('/subscribers/:id', protect, adminOnly, async (req, res) => {
  try {
    const deletedSubscriber = await Newsletter.findByIdAndDelete(req.params.id);
    
    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (err) {
    console.error('Error deleting subscriber:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;