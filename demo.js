let isMiniProgram = false;

// Show running environment
(function showEnv() {
    const envEl = document.getElementById("env");

    if (window.wx && wx.miniProgram && wx.miniProgram.getEnv) {

        wx.miniProgram.getEnv(function (res) {
            envEl.textContent = "wx.miniProgram.getEnv: " + JSON.stringify(res);
            isMiniProgram = true;
        });

        envEl.textContent = "wx.miniProgram not detected. Possibly not running inside mini program web-view environment.";
    } else {
        envEl.textContent = "wx.miniProgram not detected. Possibly not running inside mini program web-view environment.";
    }

    // Receive message from mini program
    function onEvent(e) {
        const message = e.message;
        const messageObj = JSON.parse(e.message);
        const {action} = messageObj;

        const linkEl = document.getElementById("a-transfer-detail");

        if (action === "transfer") {
            const {hash} = messageObj;
            linkEl.href = "https://scan.endless.link/txn/" + hash + "?network=mainnet";
            linkEl.style.display = "inline";
        } else {
            document.getElementById("miniMsg").textContent = e.message;
            linkEl.style.display = "none";
        }
    }

    // Register a listener
    wx.miniProgram.onWebviewEvent(onEvent);
    // Remove the listener
    // wx.miniProgram.offWebviewEvent(onEvent);
})();

function sendMessageToMiniProgram(message) {
    if (!isMiniProgram) {
        alert("Not in mini program web-view environment, or base library too low.");
        return;
    }

    wx.miniProgram.sendWebviewEvent({data: {message: message}});
}


// Send message to mini program
document.getElementById("btnSendToMini").addEventListener("click", function () {
    sendMessageToMiniProgram("Hello from H5!");
});

document.getElementById("btnTransfer").addEventListener("click", function () {
    const amount = document.getElementById("amount").value;
    const targetAddress = document.getElementById("targetAddress").value;

    if (!amount || !targetAddress) {
        alert("Please fill in both amount and target address.");
        return;
    }

    const transferData = {
        amount: amount,
        targetAddress: targetAddress,
        action: "transfer"
    };

    sendMessageToMiniProgram(JSON.stringify(transferData));
});

document.getElementById("btnDeposit").addEventListener("click", function () {
    const module = document.getElementById("depositPackageAddress").value;
    const moduleName = document.getElementById("depositModuleName").value;
    const functionName = document.getElementById("depositFunctionName").value;
    const roomId = document.getElementById("depositRoomId").value;
    const amount = document.getElementById("depositAmount").value;

    // todo: validate input

    const depositData = {
        action: "deposit",
        data: {
            module: module, // Contract address, default is EDS. For other tokens, specify in the contract
            moduleName: moduleName, // Module name
            functionName: functionName, // Function name
            data: JSON.stringify({
                // Parameters required by the contract. Each game may require different parameters, determined by the contract
                "1_u64_roomId": roomId, // 1 indicates the first parameter, u64 is the type, roomId is the parameter name
                "2_u128_amount": String(amount * 100000000),  // 2 indicates the second parameter, u128 is the type, amount is the parameter name
            }),
            argsData: []
        }
    };

    sendMessageToMiniProgram(JSON.stringify(depositData));
});
