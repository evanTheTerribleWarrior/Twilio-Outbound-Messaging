# Remove any existing frontend build  and serverless deployed assets (if any)
rm -r ./frontend/build && find "./serverless/assets" -mindepth 1 -delete

# Create the new build
npm run --prefix frontend build

# Copy new build to serverless assets
cp -a ./frontend/build/. ./serverless/assets/

# Deploy app and functions
cd serverless && twilio serverless:start --port=3002