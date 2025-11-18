import { network } from "hardhat";

async function main() {
  // 连接到命令行指定的网络（如 --network localhost 会自动匹配）
  const { viem } = await network.connect();

  // 获取钱包客户端和公共客户端
  const [sender, receiver] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const tokenAddress = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 替换为实际合约地址

  // 直接获取合约实例，不指定 client（使用默认客户端）
  const token = await viem.getContractAt("FirstToken", tokenAddress);

  console.log("Sender:", sender.account.address);
  console.log("Receiver:", receiver.account.address);

  // 查询初始余额
  const beforeSender = await token.read.balanceOf([sender.account.address]);
  const beforeReceiver = await token.read.balanceOf([receiver.account.address]);

  console.log("Before — sender:", beforeSender.toString());
  console.log("Before — receiver:", beforeReceiver.toString());

  // 转账时显式指定发送账户（解决类型匹配问题）
  const amount = 1000n * 10n ** 18n;
  const txHash = await token.write.transfer([receiver.account.address, amount], {
    account: sender.account, // 这里明确指定发送账户
  });

  console.log("Transfer tx hash:", txHash);
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  // 验证余额变化
  const afterSender = await token.read.balanceOf([sender.account.address]);
  const afterReceiver = await token.read.balanceOf([receiver.account.address]);

  console.log("After — sender:", afterSender.toString());
  console.log("After — receiver:", afterReceiver.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});