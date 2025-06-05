const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: "Remote" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null }, // null means "Present"
  description: { type: String, default: "" },
  technologies: [{ type: String }],
  companyLogo: { type: String, default: "" },
  companyWebsite: { type: String, default: "" },
  achievements: [{ type: String }],
  employmentType: { type: String, default: "Full-time" },
  order: { type: Number, default: 0 } // For custom ordering
}, { timestamps: true });

// Virtual for formatted duration
experienceSchema.virtual('duration').get(function() {
  const startYear = this.startDate.getFullYear();
  const startMonth = this.startDate.toLocaleString('default', { month: 'short' });
  
  let endText;
  if (!this.endDate) {
    endText = "Present";
  } else {
    const endYear = this.endDate.getFullYear();
    const endMonth = this.endDate.toLocaleString('default', { month: 'short' });
    endText = `${endMonth} ${endYear}`;
  }
  
  return `${startMonth} ${startYear} - ${endText}`;
});

// Set toJSON option to include virtuals
experienceSchema.set('toJSON', { virtuals: true });
experienceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Experience", experienceSchema);