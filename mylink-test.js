// 导入 Env 模块
const $ = new Env('Mylink');

// 获取环境变量 Mylink 或者从本地存储中获取
const Mylink = ($.isNode() ? process.env.Mylink : $.getjson("Mylink")) || [];

// 主入口函数，判断是获取 Cookie 还是执行主逻辑
(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {
    $.log(e);
}).finally(() => {
    $.done({});
});

// 主逻辑函数
async function main() {
    console.log('作者：@Shy0o\n');
    for (const account of Mylink) {
        const headers = generateHeaders(account);
        console.log(`用户：${account.userId}开始任务`);
        
        // 签到
        console.log("开始签到");
        let sign = await commonGet("/sign_in", headers);
        console.log(sign);
        console.log("————————————");

        // 查询积分
        let info = await commonGet("/member", headers);
        console.log(`拥有积分: ${info.data.usableScore}`);
        $.msg($.name, `用户：${account.userId}`, `拥有积分: ${info.data.usableScore}`);
    }
}

// 生成请求头部的辅助函数
function generateHeaders(account) {
    return {
        'Authorization': account.authorization,
        'CMHS-User-Agent': 'hshhk/ios/10.4.0',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://mylink.komect.com/activity/myCity/',
        'HTTP-HSH-DeviceID': account.deviceID,
        'Sec-Fetch-Mode': 'cors',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'hshhk/ios/10.4.0',
        'Sec-Fetch-Site': 'same-origin',
        'Content-Type': 'application/json',
        'Cookie': account.cookie,
        'Accept-Language': 'zh-TW',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Host': 'mylink.komect.com',
    };
}

// 获取 Cookie 的辅助函数
async function getCookie() {
    const authorization = $request.headers["authorization"];
    const cookie = $request.headers["Cookie"];
    const deviceID = $request.headers["HTTP-HSH-DeviceID"];

    if (!authorization || !cookie || !deviceID) {
        return;
    }

    const body = JSON.parse($response.body);
    const phone = body.body.phone;

    const newData = {
        "userId": phone,
        "authorization": authorization,
        "cookie": cookie,
        "deviceID": deviceID
    };

    const index = Mylink.findIndex(e => e.userId == newData.userId);
    if (index !== -1) {
        if (Mylink[index].authorization == newData.authorization &&
            Mylink[index].cookie == newData.cookie &&
            Mylink[index].deviceID == newData.deviceID) {
            return;
        } else {
            Mylink[index] = newData;
            console.log(newData.authorization);
            $.msg($.name, `🎉用户${newData.userId}更新token成功!`, ``);
        }
    } else {
        Mylink.push(newData);
        console.log(newData.authorization);
        $.msg($.name, `🎉新增用户${newData.userId}成功!`, ``);
    }
    $.setjson(Mylink, "Mylink");
}

// 通用 GET 请求的辅助函数
async function commonGet(url, headers) {
    return new Promise(resolve => {
        const options = {
            url: `https://mylink.komect.com/v1/api/eas/sign${url}`,
            headers: headers,
        };
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`);
                    console.log(`${$.name} API请求失败，请检查网路重试`);
                } else {
                    await $.wait(5000); // 等待 5 秒
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        });
    });
}
