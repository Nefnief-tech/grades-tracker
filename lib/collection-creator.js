const sdk = require("node-appwrite");
require('dotenv').config();

// Initialize Appwrite client
const client = new sdk.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.nief.tech/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '67d6ea990025fa097964')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '67d6b079002144822b5e';
const twoFactorCodesCollection = process.env.NEXT_PUBLIC_APPWRITE_2FA_CODES_COLLECTION_ID || 'two_factor_codes';
const userPrefsCollection = process.env.NEXT_PUBLIC_APPWRITE_USER_PREFS_COLLECTION_ID || 'user_preferences';

/**
 * Create the two_factor_codes collection
 */
async function createTwoFactorCodesCollection() {
  try {
    console.log(`Creating ${twoFactorCodesCollection} collection...`);
    
    // Create collection
    await databases.createCollection(
      databaseId,
      twoFactorCodesCollection,
      '2FA Verification Codes'
    );
    
    // Create userId attribute (required, indexed)
    await databases.createStringAttribute(
      databaseId,
      twoFactorCodesCollection,
      'userId',
      255,
      true,
      null,
      false,
      null,
      true
    );
    
    // Create code attribute (required)
    await databases.createStringAttribute(
      databaseId,
      twoFactorCodesCollection,
      'code',
      32,
      true,
      null,
      false
    );
    
    // Create expiresAt attribute (required, indexed)
    await databases.createDatetimeAttribute(
      databaseId,
      twoFactorCodesCollection,
      'expiresAt',
      true,
      null,
      true
    );
    
    // Create used attribute (required, default: false)
    await databases.createBooleanAttribute(
      databaseId,
      twoFactorCodesCollection,
      'used',
      true,
      false
    );
    
    // Set permissions for the collection
    await databases.updateCollection(
      databaseId,
      twoFactorCodesCollection,
      '2FA Verification Codes', // name
      null, // read permissions
      ['role:all'] // write permissions - allow all for now, can be restricted later
    );
    
    console.log(`✅ Created ${twoFactorCodesCollection} collection successfully`);
  } catch (error) {
    console.error(`❌ Error creating ${twoFactorCodesCollection} collection:`, error);
  }
}

/**
 * Create the user_preferences collection
 */
async function createUserPreferencesCollection() {
  try {
    console.log(`Creating ${userPrefsCollection} collection...`);
    
    // Create collection
    await databases.createCollection(
      databaseId,
      userPrefsCollection,
      'User Preferences'
    );
    
    // Create userId attribute (required, indexed)
    await databases.createStringAttribute(
      databaseId,
      userPrefsCollection,
      'userId',
      255,
      true,
      null,
      false,
      null,
      true
    );
    
    // Create twoFactorEnabled attribute (required, default: false)
    await databases.createBooleanAttribute(
      databaseId,
      userPrefsCollection,
      'twoFactorEnabled',
      true,
      false
    );
    
    // Set permissions for the collection
    await databases.updateCollection(
      databaseId,
      userPrefsCollection,
      'User Preferences', // name
      ['role:all'], // read permissions - all can read
      ['role:all'] // write permissions - all can write for now
    );
    
    console.log(`✅ Created ${userPrefsCollection} collection successfully`);
  } catch (error) {
    console.error(`❌ Error creating ${userPrefsCollection} collection:`, error);
  }
}

/**
 * Main function to create all collections
 */
async function createCollections() {
  try {
    await createTwoFactorCodesCollection();
    await createUserPreferencesCollection();
    console.log('✅ All collections created successfully');
  } catch (error) {
    console.error('❌ Error creating collections:', error);
  }
}

// Run the script
createCollections();