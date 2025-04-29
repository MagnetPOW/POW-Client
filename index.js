const ethers = require('ethers');
const readlineSync = require('readline-sync');
const readline = require('readline');
const chalk = require('chalk');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

// RPC 节点选项
const rpcOptions = [
    'https://node1.magnetchain.xyz',
    'https://node2.magnetchain.xyz',
    'https://node3.magnetchain.xyz',
    'https://node4.magnetchain.xyz'
];

// 合约地址（请替换为新部署的合约地址）
const CONTRACT_ADDRESS = '0xeb9a64d18d6d5248f3505cbea4739da38e9f84b2'; // 确认是否正确

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

// 主线程逻辑
if (isMainThread) {
    async function main() {
        // 显示欢迎消息
        console.log(chalk.bold.bgCyan.black(' 你好，欢迎使用 Magnet POW 区块链挖矿客户端！ '));
        console.log(chalk.bold.bgCyan.black(' Hello, welcome to Magnet POW Blockchain Mining Client! '));

        // 选择 RPC 节点
        console.log(chalk.bold('\n选择 RPC 节点 / Select RPC Node:'));
        rpcOptions.forEach((rpc, index) => {
            console.log(chalk.cyan(`${index + 1}. ${rpc}`));
        });
        const rpcIndex = readlineSync.questionInt(chalk.yellow('输入节点编号 / Enter node number: '), { min: 1, max: 4 }) - 1;
        const RPC_URL = rpcOptions[rpcIndex];
        console.log(chalk.green(`已选择 RPC / Selected RPC: ${RPC_URL}`));

        // 提示用户准备 0.1 MAG
        console.log(chalk.bold('\n注意 / Note:'));
        console.log(chalk.gray('钱包需至少 0.1 MAG 余额以启动挖矿，加入 Telegram 群可免费领取。'));
        console.log(chalk.gray('Wallet needs at least 0.1 MAG to start mining; join Telegram for free airdrop.'));

        // 输入私钥（显示输入）
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

        // 初始化 ethers.js 和账户
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        console.log(chalk.green(`钱包地址 / Wallet address: ${wallet.address}`));

        // 检查余额
        const balance = await provider.getBalance(wallet.address);
        const minBalance = ethers.utils.parseEther('0.1');
        if (balance.lt(minBalance)) {
            console.log(chalk.red(`钱包余额不足 / Insufficient balance: ${ethers.utils.formatEther(balance)} MAG (需要至少 0.1 MAG / Requires at least 0.1 MAG)`));
            console.log(chalk.red('请通过 Telegram 群领取免费 MAG 或充值 / Please claim free MAG via Telegram or fund the wallet.'));
            process.exit(1);
        }
        console.log(chalk.green(`当前余额 / Current balance: ${ethers.utils.formatEther(balance)} MAG`));

        // 初始化合约
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // 选择挖矿模式
        console.log(chalk.bold('\n选择挖矿模式 / Select Mining Mode:'));
        console.log(chalk.cyan('1. 免费挖矿 (0.3 MAG 每次哈希) / Free Mining (0.3 MAG per hash)'));
        console.log(chalk.cyan('2. 付费 30 USDT (7 MAG 每次哈希) / Pay 30 USDT (7 MAG per hash)'));
        console.log(chalk.cyan('3. 付费 200 USDT (120 MAG 每次哈希) / Pay 200 USDT (120 MAG per hash)'));
        console.log(chalk.cyan('4. 付费 1000 USDT (1000 MAG 每次哈希) / Pay 1000 USDT (1000 MAG per hash)'));
        const modeChoice = readlineSync.questionInt(chalk.yellow('输入 1-4 / Enter 1-4: '), { min: 1, max: 4 });

        // 检查白名单
        const level = await contract.getWhitelistLevel(wallet.address);
        const levelNames = ['None', 'Level30', 'Level200', 'Level1000'];
        console.log(chalk.green(`您的白名单级别 / Your whitelist level: ${levelNames[level]}`));

        // 验证付费挖矿资格
        if (modeChoice > 1) {
            const requiredLevel = modeChoice - 1; // 2->1, 3->2, 4->3
            if (level < requiredLevel) {
                console.log(chalk.red('您没有资格进行此级别的付费挖矿。请联系管理员加入白名单。'));
                console.log(chalk.red('You are not eligible for this level of paid mining. Contact admin to join whitelist.'));
                process.exit(1);
            }
        }

        // 开始挖矿
        console.log(chalk.bold.green('\n开始挖矿 / Starting mining...'));
        while (true) {
            try {
                // 请求新任务
                console.log(chalk.cyan('请求新挖矿任务 / Requesting new mining task...'));
                let tx;
                try {
                    const gasLimit = await contract.estimateGas.requestMiningTask();
                    tx = await contract.requestMiningTask({ gasLimit: gasLimit.mul(120).div(100) });
                } catch (gasError) {
                    throw new Error(`Gas estimation failed: ${gasError.message}`);
                }
                const receipt = await tx.wait();
                console.log(chalk.green(`任务请求成功 / Task requested successfully, 交易哈希 / Transaction hash: ${receipt.transactionHash}`));

                // 获取任务
                const task = await contract.getMyTask();
                const nonce = task.nonce.toString();
                const difficulty = task.difficulty.toString();
                const active = task.active;
                if (!active) {
                    console.log(chalk.yellow('没有活跃的挖矿任务 / No active mining task'));
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
                console.log(chalk.cyan(`任务 / Task: nonce=${nonce}, difficulty=${difficulty}`));

                // 计算解决方案（多线程）
                console.log(chalk.cyan('正在计算解决方案 / Calculating solution...'));
                const solution = await mineSolution(nonce, wallet.address, difficulty);
                if (solution === null) {
                    console.log(chalk.yellow('未找到解决方案 / No solution found'));
                    continue;
                }
                console.log(chalk.green(`找到解决方案 / Solution found: ${solution}`));

                // 提交解决方案
                console.log(chalk.cyan('提交解决方案 / Submitting solution...'));
                let submitTx;
                try {
                    const gasLimit = await contract.estimateGas.submitMiningResult(solution);
                    submitTx = await contract.submitMiningResult(solution, { gasLimit: gasLimit.mul(120).div(100) });
                } catch (gasError) {
                    throw new Error(`Gas estimation failed for submit: ${gasError.message}`);
                }
                const submitReceipt = await submitTx.wait();
                console.log(chalk.green(`提交成功 / Submission successful, 交易哈希 / Transaction hash: ${submitReceipt.transactionHash}`));

                // 显示余额变化
                const newBalance = await provider.getBalance(wallet.address);
                console.log(chalk.green(`当前余额 / Current balance: ${ethers.utils.formatEther(newBalance)} MAG`));
            } catch (error) {
                if (error.code === 'CALL_EXCEPTION') {
                    console.error(chalk.red('挖矿失败 / Mining failed: 交易被合约拒绝 / Transaction reverted by contract'));
                    console.error(chalk.red(`交易哈希 / Transaction hash: ${error.transactionHash || '未知 / Unknown'}`));
                    console.error(chalk.red('可能原因 / Possible reasons: 钱包未在白名单、余额不足或合约逻辑错误 / Wallet not whitelisted, insufficient balance, or contract logic error'));
                } else if (error.code === 'NUMERIC_FAULT') {
                    console.error(chalk.red('挖矿失败 / Mining failed: 数值溢出 / Numeric overflow'));
                    console.error(chalk.red('请检查任务数据 / Please check task data'));
                } else {
                    console.error(chalk.red('挖矿失败 / Mining failed:'), error.message);
                }
                console.log(chalk.yellow('5秒后重试 / Retrying in 5 seconds...'));
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    // 多线程挖矿函数
    async function mineSolution(nonce, address, difficulty) {
        return new Promise((resolve) => {
            const maxAttempts = 60000000; // 6000万次，确保1分钟内90%概率
            const timeoutMs = 60000; // 60秒超时
            const numWorkers = os.cpus().length; // 使用所有 CPU 核心
            const chunkSize = Math.ceil(maxAttempts / numWorkers);
            let workersCompleted = 0;
            let solutionFound = null;

            // 动态更新控制台
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            let currentAttempts = 0;
            let lastHash = '';

            function updateProgress() {
                readline.cursorTo(process.stdout, 0);
                readline.clearLine(process.stdout, 0);
                process.stdout.write(chalk.gray(`尝试次数 / Attempts: ${currentAttempts}, 当前哈希 / Current hash: ${lastHash.substring(0, 16)}...`));
            }

            // 设置超时
            const timeout = setTimeout(() => {
                workersCompleted = numWorkers; // 强制终止所有工作线程
                resolve(null); // 返回 null，触发新任务请求
            }, timeoutMs);

            // 创建工作线程
            for (let i = 0; i < numWorkers; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, maxAttempts);
                const worker = new Worker(__filename, {
                    workerData: { nonce, address, difficulty, start, end }
                });

                worker.on('message', (msg) => {
                    if (msg.type === 'solution') {
                        if (msg.solution !== null) {
                            solutionFound = msg.solution;
                            workersCompleted = numWorkers; // 找到解决方案，终止所有线程
                            clearTimeout(timeout); // 清除超时
                        }
                    } else if (msg.type === 'progress') {
                        currentAttempts = Math.max(currentAttempts, msg.attempts);
                        lastHash = msg.hash || lastHash;
                        updateProgress();
                    }
                });

                worker.on('error', (err) => {
                    console.error(chalk.red('工作线程错误 / Worker error:'), err.message);
                    workersCompleted++;
                    if (workersCompleted === numWorkers) {
                        clearTimeout(timeout);
                        rl.close();
                        resolve(solutionFound);
                    }
                });

                worker.on('exit', () => {
                    workersCompleted++;
                    if (workersCompleted === numWorkers) {
                        clearTimeout(timeout);
                        rl.close();
                        resolve(solutionFound);
                    }
                });
            }
        });
    }

    // 运行主函数
    main().catch(error => {
        console.error(chalk.red('程序错误 / Program error:'), error.message);
        process.exit(1);
    });
} else {
    // 工作线程逻辑
    const { nonce, address, difficulty, start, end } = workerData;

    for (let solution = start; solution < end; solution++) {
        const encoded = ethers.utils.solidityPack(['uint256', 'address', 'uint256'], [nonce, address, solution]);
        const hash = ethers.utils.keccak256(encoded);
        const hashValue = BigInt(hash);
        const threshold = BigInt('2') ** BigInt(256) / BigInt(difficulty);

        if (hashValue <= threshold) {
            parentPort.postMessage({ type: 'solution', solution });
            process.exit(0);
        }

        if (solution % 100000 === 0) { // 每10万次更新一次进度
            parentPort.postMessage({ type: 'progress', attempts: solution, hash });
        }
    }

    parentPort.postMessage({ type: 'solution', solution: null });
}