import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'docvision-super-secret-jwt-key-2026-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenExpiresDays: 7,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/docvision',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
  embeddingDimensions: 384,
  maxUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
};
