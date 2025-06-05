const Content = require('../models/Content');

const getContent = async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) content = await Content.create({ content: 'Welcome to my portfolio!' });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get content' });
  }
};

const updateContent = async (req, res) => {
  try {
    const { content } = req.body;
    let page = await Content.findOne();
    if (!page) {
      page = await Content.create({ content });
    } else {
      page.content = content;
      await page.save();
    }
    res.json({ message: 'Content updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update content' });
  }
};

module.exports = { getContent, updateContent };
