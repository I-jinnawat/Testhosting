const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const {Storage} = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const Service = process.env.Service;
// Initialize Secret Manager client
const client = new SecretManagerServiceClient();

async function getSecret() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/testfinale-423113/secrets/car-booking/versions/1',
  });

  const payload = version.payload.data.toString('utf8');
  console.log(`Retrieved secret: ${payload}`);
  return JSON.parse(payload);
}

// Initialize Google Cloud Storage after retrieving the key file from Secret Manager
async function initializeStorage() {
  try {
    const credentials = await getSecret();

    console.log(
      'Initializing Google Cloud Storage with credentials:',
      credentials
    );

    const storage = new Storage({
      projectId: 'testfinale-423113',
      credentials: credentials,
    });

    return storage.bucket('carbooking2');
  } catch (error) {
    console.error('Error initializing Google Cloud Storage:', error);
    throw error;
  }
}

const multerStorage = multer.memoryStorage(); // Use memory storage for multer

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'attachment' || file.fieldname === 'image') {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Unexpected field'), false); // Reject the file
    }
  },
});

// Export the upload middleware and the bucket
module.exports = {upload, initializeStorage};
