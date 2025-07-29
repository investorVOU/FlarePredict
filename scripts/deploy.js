
const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting multichain deployment...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Contract factory
  const PredictionMarket = await ethers.getContractFactory('PredictionMarket');

  // Chain configurations
  const chains = [
    {
      name: 'Flare',
      chainId: 14,
      usdtAddress: '0x...' // To be replaced with actual USDT address on Flare
    },
    {
      name: 'Ethereum',
      chainId: 1,
      usdtAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    },
    {
      name: 'Polygon',
      chainId: 137,
      usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    },
    {
      name: 'Arbitrum',
      chainId: 42161,
      usdtAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
    }
  ];

  const deployedContracts = {};

  for (const chain of chains) {
    console.log(`\n📡 Deploying to ${chain.name} (Chain ID: ${chain.chainId})`);
    
    try {
      // Deploy PredictionMarket contract
      const predictionMarket = await PredictionMarket.deploy(chain.usdtAddress);
      await predictionMarket.waitForDeployment();
      
      const address = await predictionMarket.getAddress();
      console.log(`✅ PredictionMarket deployed to: ${address}`);
      
      deployedContracts[chain.name.toLowerCase()] = {
        predictionMarket: address,
        usdtToken: chain.usdtAddress,
        chainId: chain.chainId
      };

      // Verify deployment
      const deployedContract = await ethers.getContractAt('PredictionMarket', address);
      const usdtToken = await deployedContract.usdtToken();
      console.log(`🔍 Verified USDT token address: ${usdtToken}`);
      
    } catch (error) {
      console.error(`❌ Failed to deploy to ${chain.name}:`, error.message);
    }
  }

  // Save deployment addresses
  const fs = require('fs');
  const deploymentData = {
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: deployedContracts
  };

  fs.writeFileSync(
    'deployments.json',
    JSON.stringify(deploymentData, null, 2)
  );

  console.log('\n📄 Deployment addresses saved to deployments.json');
  console.log('\n🎉 Multichain deployment completed!');
  
  // Print summary
  console.log('\n📋 Deployment Summary:');
  for (const [chain, contracts] of Object.entries(deployedContracts)) {
    console.log(`${chain.toUpperCase()}:`);
    console.log(`  PredictionMarket: ${contracts.predictionMarket}`);
    console.log(`  USDT Token: ${contracts.usdtToken}`);
    console.log(`  Chain ID: ${contracts.chainId}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
