const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

// Deploys GlassBox and writes its address + ABI to deployments/<network>.json.
// This file is what lets a stranger verify commits independently -- it must
// reflect a real onchain deployment, never a placeholder.
async function main() {
  const GlassBox = await hre.ethers.getContractFactory("GlassBox");
  const glassBox = await GlassBox.deploy();
  await glassBox.waitForDeployment();

  const address = await glassBox.getAddress();
  const artifact = await hre.artifacts.readArtifact("GlassBox");

  const network = hre.network.name;
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${network}.json`);
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        network,
        address,
        deployedAt: new Date().toISOString(),
        abi: artifact.abi,
      },
      null,
      2
    )
  );

  console.log(`GlassBox deployed to ${address} on ${network}`);
  console.log(`Wrote deployment info to ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
