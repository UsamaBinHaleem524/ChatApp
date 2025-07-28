const cloudinary = require("../config/cloudinary"); // adjust path as needed
const { v4: uuidv4 } = require("uuid");

const uploadFromBuffer = (fileBuffer, folder = 'uploads', prefix = 'file') => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${prefix}_${uuidv4()}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (result) resolve(result.secure_url);
          else reject(error);
        }
      );
      stream.end(fileBuffer);
    });
  };

module.exports = uploadFromBuffer;
