const { v4: uuidv4 } = require('uuid');

class ImageService {
  generateFileName(originalName) {
    const ext = originalName.split('.').pop().toLowerCase();
    return `${uuidv4()}.${ext}`;
  }

  getFileUrl(filename) {
    const baseUrl = process.env.CDN_BASE_URL || 'http://localhost:3000/uploads';
    return `${baseUrl}/${filename}`;
  }
}

module.exports = new ImageService();
