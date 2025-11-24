# 项目运行与排查上下文（最新）

## 关键环境
- Node.js: v22.21.0（容器内）
- TypeScript: ~5.8.3（`devDependencies`）
- Hardhat: ^3.0.15，启用 `@nomicfoundation/hardhat-toolbox-viem` 和 `@nomicfoundation/hardhat-viem` 插件
- 合约依赖：OpenZeppelin Contracts ^5.4.0
- 运行时模型：ESM（`package.json` 声明 `"type": "module"`，`tsconfig.json` 使用 `module: "node16"` 与 `moduleResolution: "node16"`）

## ESM / 顶层 await 注意点
- 脚本使用 ESM 与顶层 `await`（如 `scripts/send-op-tx.ts` 直接在模块顶层调用 Hardhat 网络）。
- 必须用 Hardhat 提供的执行入口，例如：
  - `npx hardhat run scripts/transfer.ts --network localhost`
  - `npx hardhat run scripts/send-op-tx.ts`
- 避免直接 `node` 或 `ts-node` 运行，否则会出现导入错误或顶层 `await` 不被处理的情况。

## 网络与编译配置
- Solidity 版本：默认与生产 profile 均为 0.8.28（`hardhat.config.ts`）。
- 优化：生产 profile 开启优化，`runs: 200`。
- 预设网络：
  - `localhost`：HTTP 节点，`http://127.0.0.1:8545`。
  - `hardhatMainnet`、`hardhatOp`：`edr-simulated`，其中 `hardhatOp` 的 `chainType` 为 `op`。
  - `sepolia`：从环境变量 `SEPOLIA_RPC_URL`、`SEPOLIA_PRIVATE_KEY` 读取。

## Viem 使用习惯
- `network.connect()` 返回的 `viem` 客户端用于获取钱包与公共客户端，例如 `viem.getWalletClients()`、`viem.getPublicClient()`。
- 获取合约实例时可直接 `viem.getContractAt("FirstToken", tokenAddress)`，如需发送交易记得在 `write` 调用里显式指定 `account`（`scripts/transfer.ts`）。

## 典型运行命令
- 本地链转账脚本：`npx hardhat run scripts/transfer.ts --network localhost`
- OP 模拟链测试：`npx hardhat run scripts/send-op-tx.ts`

将上述信息作为排查基线，先确认运行方式符合 ESM/Hardhat 要求，再检查网络与环境变量，可避免再次遇到导入类错误无法定位的问题。
