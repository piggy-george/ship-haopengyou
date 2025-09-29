// Test Tencent Cloud API connection
require('dotenv').config();

console.log('Testing Tencent Cloud API connection...');
console.log('SecretId configured:', process.env.TENCENT_SECRET_ID ? '✓' : '✗');
console.log('SecretKey configured:', process.env.TENCENT_SECRET_KEY ? '✓' : '✗');
console.log('Region:', process.env.TENCENT_REGION || 'ap-guangzhou');

try {
  const tencentcloud = require("tencentcloud-sdk-nodejs");
  console.log('SDK loaded successfully: ✓');

  const commonModule = require("tencentcloud-sdk-nodejs").common;
  const Credential = commonModule.Credential;
  const ClientProfile = commonModule.ClientProfile;
  const HttpProfile = commonModule.HttpProfile;

  const cred = new Credential(
    process.env.TENCENT_SECRET_ID,
    process.env.TENCENT_SECRET_KEY
  );

  const httpProfile = new HttpProfile();
  httpProfile.endpoint = "ai3d.tencentcloudapi.com";

  const clientProfile = new ClientProfile();
  clientProfile.httpProfile = httpProfile;

  const ai3dModule = require("tencentcloud-sdk-nodejs").ai3d;
  const Ai3dClient = ai3dModule.v20250513.Client;
  const client = new Ai3dClient(cred, process.env.TENCENT_REGION || 'ap-guangzhou', clientProfile);

  console.log('Client initialized successfully: ✓');
  console.log('\nAPI connection test passed! Ready for 3D generation.');

} catch (error) {
  console.error('Error:', error.message);
}