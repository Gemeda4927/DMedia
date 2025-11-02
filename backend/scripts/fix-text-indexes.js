/**
 * Script to fix MongoDB text index language issue
 * 
 * This script drops and recreates text indexes with the correct language ('none')
 * Run this once if you encounter "language override unsupported: om" error
 * 
 * Usage: node scripts/fix-text-indexes.js
 */

import mongoose from 'mongoose';
import News from '../models/News.js';
import Content from '../models/Content.js';
import dotenv from 'dotenv';

dotenv.config();

// Use the same connection logic as app.js
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dhugaa-media';

async function fixTextIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    console.log(`Using database: ${MONGO_URI.split('/').pop() || 'default'}`);
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections and find text indexes
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections`);
    
    // Fix News collection text indexes
    const newsCollection = db.collection('news');
    try {
      console.log('\n📋 Checking News collection indexes...');
      const newsIndexes = await newsCollection.indexes();
      
      // Find all text indexes
      const textIndexes = newsIndexes.filter(idx => 
        idx.key && Object.values(idx.key).includes('text')
      );
      
      if (textIndexes.length > 0) {
        console.log(`Found ${textIndexes.length} text index(es) in News collection`);
        for (const idx of textIndexes) {
          try {
            const indexName = idx.name;
            console.log(`  Dropping index: ${indexName}`);
            await newsCollection.dropIndex(indexName);
            console.log(`  ✓ Dropped ${indexName}`);
          } catch (error) {
            console.log(`  Note: Could not drop index ${idx.name}:`, error.message);
          }
        }
      } else {
        console.log('  No text indexes found in News collection');
      }
    } catch (error) {
      console.log('  Note: News collection might not exist yet:', error.message);
    }
    
    // Fix Content collection text indexes
    const contentCollection = db.collection('contents');
    try {
      console.log('\n📋 Checking Content collection indexes...');
      const contentIndexes = await contentCollection.indexes();
      
      // Find all text indexes
      const textIndexes = contentIndexes.filter(idx => 
        idx.key && Object.values(idx.key).includes('text')
      );
      
      if (textIndexes.length > 0) {
        console.log(`Found ${textIndexes.length} text index(es) in Content collection`);
        for (const idx of textIndexes) {
          try {
            const indexName = idx.name;
            console.log(`  Dropping index: ${indexName}`);
            await contentCollection.dropIndex(indexName);
            console.log(`  ✓ Dropped ${indexName}`);
          } catch (error) {
            console.log(`  Note: Could not drop index ${idx.name}:`, error.message);
          }
        }
      } else {
        console.log('  No text indexes found in Content collection');
      }
    } catch (error) {
      console.log('  Note: Content collection might not exist yet:', error.message);
    }
    
    // Recreate indexes using Mongoose models (they will use the fixed schema)
    console.log('\n🔄 Recreating text indexes with correct language...');
    
    // Force Mongoose to recreate the indexes
    try {
      await News.createIndexes();
      console.log('  ✓ News text indexes recreated');
    } catch (error) {
      console.log('  ⚠ News indexes creation error:', error.message);
    }
    
    try {
      await Content.createIndexes();
      console.log('  ✓ Content text indexes recreated');
    } catch (error) {
      console.log('  ⚠ Content indexes creation error:', error.message);
    }
    
    console.log('\n✅ All text indexes have been fixed!');
    console.log('You can now create news articles without language override errors.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing text indexes:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixTextIndexes();

