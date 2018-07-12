function formatTime(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

function formatYMD(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return [year, month, day].map(formatNumber).join('-');
}

function formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
}

// 默认固定两位小数
function formatFixed(val, fixed=2){
    return parseFloat(val).toFixed(fixed)
}

// 返回一个二维数组
function getTwoArr (arr) {
    var allData = []; //用来装处理完的数组
    var currData = []; //子数组用来存分割完的数据
    for (var i = 0; i < arr.length; i++) {
        currData.push(arr[i]);
        if ((i != 0 && (i + 1) % 2 == 0) || i == arr.length - 1) {
            allData.push(currData);
            currData = [];
        }
    };
    return allData;
}

module.exports = {
    formatTime: formatTime,
    formatYMD: formatYMD,
    formatFixed: formatFixed,
    getTwoArr: getTwoArr,
};
