// Quick script to test MongoDB URI format and URL encoding
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env');
  process.exit(1);
}

console.log('📋 Current MongoDB URI (password hidden):');
const uriPreview = MONGO_URI.replace(/:([^:@]+)@/, ':***@');
console.log(uriPreview);

// Extract password from URI
const match = MONGO_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
if (match) {
  const username = match[1];
  const password = match[2];
  
  console.log(`\n👤 Username: ${username}`);
  console.log(`🔑 Password (length): ${password.length} characters`);
  
  // Check if password needs URL encoding
  const needsEncoding = /[@:#\/?\[\]%&=+]/.test(password);
  if (needsEncoding) {
    console.log('⚠️  Password contains special characters that may need URL encoding');
    console.log('   Special chars found: @ : # / ? [ ] % & = +');
    
    // Encode the password
    const encodedPassword = encodeURIComponent(password);
    const encodedURI = MONGO_URI.replace(`:${password}@`, `:${encodedPassword}@`);
    console.log('\n💡 Try using URL-encoded password:');
    console.log(encodedURI.replace(/:([^:@]+)@/, ':***@'));
  } else {
    console.log('✅ Password looks fine (no special characters detected)');
    console.log('\n💡 If authentication still fails:');
    console.log('   1. Verify username and password in MongoDB Atlas Dashboard');
    console.log('   2. Reset the password in MongoDB Atlas if needed');
    console.log('   3. Check database user permissions');
  }
}



