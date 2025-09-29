// Test Tencent Cloud SDK with proper imports
require('dotenv').config();

try {
  // Import the SDK
  const tencentcloud = require("tencentcloud-sdk-nodejs");

  // Get the ai3d module and client
  const ai3d = tencentcloud.ai3d;
  const Ai3dClient = ai3d.v20250513.Client;

  // Create the client config
  const clientConfig = {
    credential: {
      secretId: process.env.TENCENT_SECRET_ID,
      secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: process.env.TENCENT_REGION || 'ap-guangzhou',
    profile: {
      httpProfile: {
        endpoint: "ai3d.tencentcloudapi.com",
      },
    },
  };

  // Create the client
  const client = new Ai3dClient(clientConfig);

  console.log('✅ SDK loaded successfully');
  console.log('✅ Client initialized successfully');
  console.log('\n🎉 Tencent Cloud AI3D API connection test passed!');
  console.log('Ready for 3D generation testing.');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}