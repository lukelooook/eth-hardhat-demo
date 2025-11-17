import { viem } from "hardhat";

async function main() {
  // 部署时生成的一样的本地账户
  const [sender, receiver] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const tokenAddress = "0x你的合约地址"; // TODO: 替换为真正的 MyToken 地址

  // 关联已部署的 MyToken 合约
  const token = await viem.getContractAt("FirstToken", tokenAddress, {
    walletClient: sender,
  });

  console.log("Sender:", sender.account.address);
  console.log("Receiver:", receiver.account.address);

  // 查询初始余额
  const beforeSender = await token.read.balanceOf([sender.account.address]);
  const beforeReceiver = await token.read.balanceOf([receiver.account.address]);

  console.log("Before — sender:", beforeSender.toString());
  console.log("Before — receiver:", beforeReceiver.toString());

  // 从 sender 向 receiver 转 1000 单位
  const amount = 1000n * 10n ** 18n; // 假设 decimals=18
  const txHash = await token.write.transfer([
    receiver.account.address,
    amount,
  ]);

  console.log("Transfer tx hash:", txHash);

  // 等待交易确认
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  // 再查一次余额
  const afterSender = await token.read.balanceOf([sender.account.address]);
  const afterReceiver = await token.read.balanceOf([receiver.account.address]);

  console.log("After — sender:", afterSender.toString());
  console.log("After — receiver:", afterReceiver.toString());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});