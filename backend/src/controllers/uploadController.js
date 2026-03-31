const multer = require('multer');
const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const ext = file.originalname.split('.').pop().toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

class UploadController {
  uploadImage(req, res) {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 10MB limit' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      try {
        const fileExt = req.file.originalname.split('.').pop().toLowerCase();
        const fileName = `${uuidv4()}.${fileExt}`;
        const bucketName = 'couple-diary';

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Upload to Supabase error:', error);
          return res.status(500).json({ error: error.message });
        }

        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        res.json({
          message: 'File uploaded successfully',
          image: {
            filename: fileName,
            url: urlData.publicUrl,
            originalName: req.file.originalname,
            size: req.file.size,
          },
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }

  async deleteImage(req, res) {
    try {
      const { filename } = req.params;
      const bucketName = 'couple-diary';

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filename]);

      if (error) {
        console.error('Delete from Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UploadController();
