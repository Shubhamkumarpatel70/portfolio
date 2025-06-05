const mongoose = require("mongoose");

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  name: { 
    type: String, 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  unsubscribeToken: { 
    type: String, 
    required: true 
  },
  lastEmailSent: { 
    type: Date 
  }
}, { timestamps: true });

// Create index for faster lookups
newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ isActive: 1 });

module.exports = mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);