import jwt from 'jsonwebtoken';

// Export JWT_SECRET so it can be used consistently across the app
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d';

// Log the secret on module load to verify it's set correctly
console.log('🔵 [JWT] JWT_SECRET initialized:', {
  secretLength: JWT_SECRET.length,
  secretPreview: JWT_SECRET.substring(0, 10) + '...',
  hasEnvVar: !!process.env.JWT_SECRET
});

export const generateToken = (userId) => {
  console.log('🟡 [JWT] Generating token:', {
    userId: userId?.toString(),
    expiresIn: JWT_EXPIRES_IN,
    secretLength: JWT_SECRET.length,
    secretPreview: JWT_SECRET.substring(0, 10) + '...'
  });
  
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  // Verify the token was generated correctly (decode without verification)
  try {
    const decoded = jwt.decode(token);
    console.log('✅ [JWT] Token generated successfully:', {
      tokenLength: token.length,
      tokenPreview: `${token.substring(0, 20)}...${token.substring(token.length - 10)}`,
      decoded: decoded
    });
  } catch (e) {
    console.error('🔴 [JWT] Error decoding generated token:', e);
  }
  
  return token;
};

export const verifyToken = (token) => {
  try {
    console.log('🟡 [JWT] Verifying token:', {
      tokenLength: token?.length,
      tokenPreview: token && token.length > 30 
        ? `${token.substring(0, 20)}...${token.substring(token.length - 10)}`
        : token
    });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ [JWT] Token verified:', {
      userId: decoded.userId,
      iat: decoded.iat,
      exp: decoded.exp
    });
    return decoded;
  } catch (error) {
    console.error('🔴 [JWT] Token verification failed:', {
      name: error.name,
      message: error.message,
      tokenLength: token?.length
    });
    return null;
  }
};

