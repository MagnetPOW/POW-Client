const ethers = require('ethers');
const keccak256 = require('keccak256');
const readlineSync = require('readline-sync');
const readline = require('readline');
const chalk = require('chalk');

// RPC 节点选项
const rpcOptions = [
    'https://node1.magnetchain.xyz',
    'https://node2.magnetchain.xyz',
    'https://node3.magnetchain.xyz',
    'https://node4.magnetchain.xyz'
];

// 合约地址
const CONTRACT_ADDRESS = '0x506ceef559085fe783935962c69519a36f002579';

// 合约 ABI
const CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "enum MiningContract.WhitelistLevel", "name": "level", "type": "uint8"}
        ],
        "name": "addToWhitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"}
        ],
        "name": "MiningReward",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "difficulty", "type": "uint256"}
        ],
        "name": "NewMiningTask",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "removeFromWhitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "requestMiningTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "solution", "type": "uint256"}],
        "name": "submitMiningResult",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "enum MiningContract.WhitelistLevel", "name": "level", "type": "uint8"}
        ],
        "name": "WhitelistUpdated",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "withdrawEther",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {"stateMutability": "payable", "type": "receive"},
    {
        "inputs": [],
        "name": "FREE_REWARD",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyTask",
        "outputs": [
            {"internalType": "uint256", "name": "nonce", "type": "uint256"},
            {"internalType": "uint256", "name": "difficulty", "type": "uint256"},
            {"internalType": "bool", "name": "active", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getWhitelistLevel",
        "outputs": [{"internalType": "enum MiningContract.WhitelistLevel", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "LEVEL1000_REWARD",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "LEVEL200_REWARD",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "LEVEL30_REWARD",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "whitelist1000",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "whitelist200",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "whitelist30",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
];

async function main() {
    console.log(chalk.bold.bgCyan.black(' 你好，欢迎使用 Magnet POW 区块链挖矿客户端！ '));
    console.log(chalk.bold.bgCyan.black(' Hello, welcome to Magnet POW Blockchain Mining Client! '));

    // 选择 RPC 节点
    console.log(chalk.bold('\n选择 RPC 节点 / Select RPC Node:'));
    rpcOptions.forEach((rpc, index) => {
        console.log(chalk.cyan(`${index + 1}. ${rpc}`));
    });
    let rpcIndex = readlineSync.questionInt(chalk.yellow('输入节点编号 / Enter node number: '), { min: 1, max: 4 }) - 1;
    let RPC_URL = rpcOptions[rpcIndex];
    console.log(chalk.green(`已选择 RPC / Selected RPC: ${RPC_URL}`));

    // 初始化 ethers.js 和账户
    let provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    let wallet;

    // 输入私钥
    let privateKey;
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
        privateKey = readlineSync.question(chalk.yellow('\n请输入私钥（以 0x 开头） / Enter private key (starts with 0x): ')).trim();
        if (privateKey.startsWith('0x') && privateKey.length === 66 && /^[0-9a-fA-F]{64}$/.test(privateKey.slice(2))) {
            break;
        }
        attempts++;
        console.log(chalk.red(`私钥格式错误：需以 0x 开头，后面跟 64 位十六进制字符。还剩 ${maxAttempts - attempts} 次尝试。`));
        console.log(chalk.red(`Invalid private key: Must start with 0x followed by 64 hexadecimal characters. ${maxAttempts - attempts} attempts left.`));
        if (attempts === maxAttempts) {
            console.log(chalk.red('达到最大尝试次数，程序退出。 / Max attempts reached, exiting.'));
            process.exit(1);
        }
    }

    wallet = new ethers.Wallet(privateKey, provider);
    console.log(chalk.green(`钱包地址 / Wallet address: ${wallet.address}`));

    // 检查余额
    let balance;
    try {
        balance = await provider.getBalance(wallet.address);
        console.log(chalk.green(`当前余额 / Current balance: ${ethers.utils.formatEther(balance)} MAG`));
    } catch (balanceError) {
        console.error(chalk.red('获取钱包余额失败 / Failed to get wallet balance:'), balanceError.message);
        process.exit(1);
    }
    const minBalance = ethers.utils.parseEther('0.1');
    if (balance.lt(minBalance)) {
        console.log(chalk.red(`钱包余额不足 / Insufficient balance: ${ethers.utils.formatEther(balance)} MAG (需要至少 0.1 MAG / Requires at least 0.1 MAG)`));
        console.log(chalk.red('请通过 Telegram 群领取免费 MAG 或充值 / Please claim free MAG via Telegram or fund the wallet.'));
        process.exit(1);
    }

    // 初始化合约
    let contract;
    try {
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    } catch (contractError) {
        console.error(chalk.red('初始化合约失败 / Failed to initialize contract:'), contractError.message);
        process.exit(1);
    }

    // 检查合约余额
    let contractBalance;
    try {
        contractBalance = await contract.getContractBalance();
        console.log(chalk.green(`合约余额 / Contract balance: ${ethers.utils.formatEther(contractBalance)} MAG`));
    } catch (balanceError) {
        console.error(chalk.red('获取合约余额失败 / Failed to get contract balance:'), balanceError.message);
        process.exit(1);
    }
    const minContractBalance = ethers.utils.parseEther('1000'); // LEVEL1000_REWARD
    if (contractBalance.lt(minContractBalance)) {
        console.log(chalk.red(`合约余额不足 / Insufficient contract balance: ${ethers.utils.formatEther(contractBalance)} MAG (需要至少 1000 MAG / Requires at least 1000 MAG)`));
        console.log(chalk.red('请联系 Magnet 链管理员充值合约 / Please contact Magnet chain admin to fund the contract.'));
        process.exit(1);
    }

    // 选择挖矿模式
    console.log(chalk.bold('\n选择挖矿模式 / Select Mining Mode:'));
    console.log(chalk.cyan('1. 免费挖矿 (0.3 MAG 每次哈希) / Free Mining (0.3 MAG per hash)'));
    console.log(chalk.cyan('2. 付费 30 USDT (7 MAG 每次哈希) / Pay 30 USDT (7 MAG per hash)'));
    console.log(chalk.cyan('3. 付费 200 USDT (120 MAG 每次哈希) / Pay 200 USDT (120 MAG per hash)'));
    console.log(chalk.cyan('4. 付费 1000 USDT (1000 MAG 每次哈希) / Pay 1000 USDT (1000 MAG per hash)'));
    const modeChoice = readlineSync.questionInt(chalk.yellow('输入 1-4 / Enter 1-4: '), { min: 1, max: 4 });

    // 检查白名单
    let level;
    try {
        level = await contract.getWhitelistLevel(wallet.address);
        const levelNames = ['None', 'Level30', 'Level200', 'Level1000'];
        console.log(chalk.green(`您的白名单级别 / Your whitelist level: ${levelNames[level]}`));
    } catch (whitelistError) {
        console.error(chalk.red('获取白名单级别失败 / Failed to get whitelist level:'), whitelistError.message);
        process.exit(1);
    }

    // 验证付费挖矿资格
    if (modeChoice > 1) {
        const requiredLevel = modeChoice - 1;
        if (level < requiredLevel) {
            console.log(chalk.red('您没有资格进行此级别的付费挖矿。请联系管理员加入白名单。'));
            console.log(chalk.red('You are not eligible for this level of paid mining. Contact admin to join whitelist.'));
            process.exit(1);
        }
    }

    // 开始挖矿
    console.log(chalk.bold.green('\n开始挖矿 / Starting mining...'));
    let retryCount = 0;
    const maxRetries = 5;
    while (true) {
        try {
            // 请求新任务
            console.log(chalk.cyan('请求新挖矿任务 / Requesting new mining task...'));
            let tx;
            try {
                const gasPrice = await provider.getGasPrice();
                const gasLimit = await contract.estimateGas.requestMiningTask();
                tx = await contract.requestMiningTask({ gasLimit: gasLimit.mul(110).div(100), gasPrice });
            } catch (gasError) {
                throw new Error(`Gas estimation failed: ${gasError.message}`);
            }
            const receipt = await tx.wait();
            console.log(chalk.green(`任务请求成功 / Task requested successfully, 交易哈希 / Transaction hash: ${receipt.transactionHash}`));

            // 获取任务
            let task;
            try {
                task = await contract.getMyTask();
            } catch (taskError) {
                throw new Error(`Failed to get task: ${taskError.message}`);
            }
            const nonce = task.nonce.toString();
            const difficulty = task.difficulty.toString();
            const active = task.active;
            if (!active) {
                console.log(chalk.yellow('没有活跃的挖矿任务 / No active mining task'));
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            console.log(chalk.cyan(`任务 / Task: nonce=${nonce}, difficulty=${difficulty}`));

            // 计算解决方案（设置10分钟超时）
            let solution = null;
            console.log(chalk.cyan('正在计算解决方案 / Calculating solution...'));
            try {
                solution = await Promise.race([
                    mineSolution(nonce, wallet.address, difficulty),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Mining timeout')), 10 * 60 * 1000))
                ]);
            } catch (timeoutError) {
                console.error(chalk.red('挖矿超时 / Mining timeout:'), timeoutError.message);
                continue;
            }
            if (solution === null) {
                console.log(chalk.yellow('未找到解决方案，重新请求任务 / No solution found, requesting new task...'));
                continue;
            }
            console.log(chalk.green(`找到解决方案 / Solution found: ${solution}`));

            // 验证任务是否仍然有效
            let currentTask;
            try {
                currentTask = await contract.getMyTask();
            } catch (taskError) {
                console.error(chalk.red('验证任务失败 / Failed to verify task:'), taskError.message);
                continue;
            }
            if (!currentTask.active || currentTask.nonce.toString() !== nonce) {
                console.log(chalk.yellow('任务已失效，重新请求 / Task expired, requesting new task...'));
                continue;
            }

            // 检查合约余额
            let currentContractBalance;
            try {
                currentContractBalance = await contract.getContractBalance();
            } catch (balanceError) {
                console.error(chalk.red('获取合约余额失败 / Failed to get contract balance:'), balanceError.message);
                continue;
            }
            if (currentContractBalance.lt(minContractBalance)) {
                console.log(chalk.red('合约余额不足，无法提交 / Insufficient contract balance, cannot submit.'));
                continue;
            }

            // 提交解决方案
            console.log(chalk.cyan('提交解决方案 / Submitting solution...'));
            try {
                const gasPrice = await provider.getGasPrice();
                const gasLimit = await contract.estimateGas.submitMiningResult(solution);
                const submitTx = await contract.submitMiningResult(solution, { gasLimit: gasLimit.mul(110).div(100), gasPrice });
                const submitReceipt = await submitTx.wait();
                console.log(chalk.green(`提交成功 / Submission successful, 交易哈希 / Transaction hash: ${submitReceipt.transactionHash}`));
            } catch (submitError) {
                console.error(chalk.red('提交失败 / Submission failed:'), submitError.message);
                if (submitError.reason) {
                    console.error(chalk.red('失败原因 / Reason:'), submitError.reason);
                }
                console.log(chalk.yellow('5秒后重试当前任务 / Retrying current task in 5 seconds...'));
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }

            // 显示余额变化
            let newBalance;
            try {
                newBalance = await provider.getBalance(wallet.address);
                console.log(chalk.green(`当前余额 / Current balance: ${ethers.utils.formatEther(newBalance)} MAG`));
            } catch (balanceError) {
                console.error(chalk.red('获取新余额失败 / Failed to get new balance:'), balanceError.message);
            }
            retryCount = 0; // 重置重试计数
        } catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                console.error(chalk.red('挖矿失败 / Mining failed: 交易被合约拒绝 / Transaction reverted by contract'));
                console.error(chalk.red(`交易哈希 / Transaction hash: ${error.transactionHash || '未知 / Unknown'}`));
                console.error(chalk.red('可能原因 / Possible reasons: 钱包未在白名单、余额不足或合约逻辑错误 / Wallet not whitelisted, insufficient balance, or contract logic error'));
                if (error.reason) {
                    console.error(chalk.red('失败原因 / Reason:'), error.reason);
                }
            } else if (error.code === 'NETWORK_ERROR') {
                console.error(chalk.red('网络错误 / Network error:'), error.message);
                console.log(chalk.yellow('尝试切换 RPC 节点 / Trying another RPC node...'));
                rpcIndex = (rpcIndex + 1) % rpcOptions.length;
                RPC_URL = rpcOptions[rpcIndex];
                console.log(chalk.green(`切换到 RPC / Switched to RPC: ${RPC_URL}`));
                provider = new ethers.providers.JsonRpcProvider(RPC_URL);
                wallet = wallet.connect(provider);
                contract = contract.connect(wallet);
            } else if (error.code === 'NUMERIC_FAULT') {
                console.error(chalk.red('挖矿失败 / Mining failed: 数值溢出 / Numeric overflow'));
                console.error(chalk.red('请检查任务数据 / Please check task data'));
            } else {
                console.error(chalk.red('挖矿失败 / Mining failed:'), error.message);
            }
            retryCount++;
            if (retryCount >= maxRetries) {
                console.error(chalk.red('达到最大重试次数，程序退出 / Max retries reached, exiting.'));
                process.exit(1);
            }
            console.log(chalk.yellow(`5秒后重试（第 ${retryCount}/${maxRetries} 次） / Retrying in 5 seconds (Attempt ${retryCount}/${maxRetries})...`));
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// 单线程挖矿函数
async function mineSolution(nonce, address, difficulty) {
    let solution = 0;
    let currentAttempts = 0;
    let lastHash = '';
    let hashCount = 0;
    const startTime = Date.now();

    // 动态更新控制台
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // 每秒更新进度
    const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const hashRate = elapsed > 0 ? (hashCount / elapsed).toFixed(2) : 0;
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        process.stdout.write(chalk.gray(`尝试次数 / Attempts: ${currentAttempts}, 哈希速度 / Hash rate: ${hashRate} H/s, 当前哈希 / Current hash: ${lastHash.substring(0, 16)}...`));
    }, 1000);

    // 预计算编码前缀
    const prefix = ethers.utils.solidityPack(['uint256', 'address'], [nonce, address]);
    const threshold = BigInt('2') ** BigInt(256) / BigInt(difficulty);

    try {
        while (true) {
            // 检查超时（10分钟）
            if (Date.now() - startTime > 10 * 60 * 1000) {
                throw new Error('Mining timeout');
            }

            const encoded = ethers.utils.solidityPack(['bytes', 'uint256'], [prefix, solution]);
            const hash = '0x' + keccak256(encoded).toString('hex');
            const hashValue = BigInt(hash);
            currentAttempts++;
            hashCount++;

            if (hashValue <= threshold) {
                clearInterval(progressInterval);
                rl.close();
                console.log(chalk.green(`\n找到有效哈希 / Valid hash found: ${hash}, solution: ${solution}`));
                return solution;
            }

            lastHash = hash;
            solution++;

            // 每 10 万次检查一次，避免过度阻塞
            if (currentAttempts % 100000 === 0) {
                // 同步检查，无需异步暂停
            }
        }
    } catch (error) {
        clearInterval(progressInterval);
        rl.close();
        console.error(chalk.red('挖矿计算错误 / Mining calculation error:'), error.message);
        return null; // 返回 null 表示未找到解决方案
    }
}

// 运行主函数
main().catch(error => {
    console.error(chalk.red('程序错误 / Program error:'), error.message);
    console.error(chalk.red('错误详情 / Error details:'), error);
    process.exit(1);
});