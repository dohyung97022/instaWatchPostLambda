const Faker = require('faker');
const ADB = require('./adbf');
const Tools = require('./tools');
const Mysql = require('./mysql');
const MysqlQuery = require('./mysqlQuery');
const { time } = require('faker');

async function createGoogleAccount(adb, device) {
    try {
        await device.setup(adb);

        await Tools.waitMilli(5000);
        await adb.tapUntilImgFound(device.googleImages.login);
        await Tools.waitMilli(2600);
        await adb.tapUntilImgFound(device.googleImages.createAccount);
        await Tools.waitSec(1);
        // 가끔씩 안나올 때도 있다?
        await adb.tapUntilImgFound(device.googleImages.myAccount);
        await Tools.waitMilli(1231);
        // Faker.setLocale('ko');
        // Setlocale을 하여도 regex가 설정되지 않았다면 불가능하다.
        const firstName = Faker.name.firstName().replace(/[^a-z0-9A-Z]/g, "");
        const lastName = Faker.name.lastName().replace(/[^a-z0-9A-Z]/g, "");
        const email = (Tools.getRandomFromArray([firstName, lastName]).toLowerCase() + Tools.getRandomLettersOfLenFromPool(6, '1234567890')).replace(/[^a-z0-9]/g, "");
        const password = Tools.getRandomLettersOfLenFromPool(8, '1234567890') + Tools.getRandomLettersOfLenFromPool(4, 'abcdefghijklmnopqrstuvwxyz');

        await adb.tapUntilImgFound(device.googleImages.firstName);
        await adb.type(firstName, device.typeMinInterval, device.typeMaxInterval, true);
        await adb.tapUntilImgFound(device.googleImages.lastName);
        await adb.type(lastName, device.typeMinInterval, device.typeMaxInterval, true);
        await Tools.waitMilli(4000);

        let idIsEmpty = await adb.findImage(device.googleImages.userName);
        if (!idIsEmpty) idIsEmpty = await adb.findImage(device.googleImages.userName2);
        if (!idIsEmpty) {
            await Tools.waitMilli(600);
            await adb.tapImage(device.googleImages.eraseName);
            await Tools.waitMilli(600);
            for (let i = 0; i < 25; i++) {
                await adb.delete();
            }
        }
        else {
            await adb.tapUntilImgFound([device.googleImages.userName, device.googleImages.userName2]);
        }
        await adb.type(email, device.typeMinInterval, device.typeMaxInterval, true);

        await adb.tapUntilImgFound(device.googleImages.password);
        await adb.type(password, device.typeMinInterval, device.typeMaxInterval, true);
        await device.randomScrollDown(adb);
        await adb.tapUntilImgFound(device.googleImages.confirmPassword);
        await adb.type(password, device.typeMinInterval, device.typeMaxInterval, true);
        await Tools.waitMilli(1200);
        await adb.tapUntilImgFound(device.googleImages.next);
        await Tools.waitMilli(4000)

        // 이름 재입력
        const phoneChoice = await adb.findImage(device.googleImages.phoneChoice);
        if (!phoneChoice) {
            console.log('this browser is temporary blocked');
            const clearApp = await adb.getCurrentApp();
            await adb.clearAppData(clearApp);
            return;
        }

        await adb.tapUntilImgFound(device.googleImages.year);
        await adb.typeBasic(Math.floor(Tools.getRandomNumberInRange(1970, 2001)), 110, 600, false);
        await adb.tapUntilImgFound(device.googleImages.date);
        await adb.typeBasic(Math.floor(Tools.getRandomNumberInRange(1, 30)), 110, 600, false);

        await device.dropdown(adb);

        await Tools.waitMilli(1241);
        await adb.tapImage(device.googleImages.next);

        for (let i = 0; i < 10; i++)
            await device.randomScrollDown(adb);

        await adb.tapUntilImgFound(device.googleImages.agreeServices);
        await adb.tapUntilImgFound(device.googleImages.agreeInformation);
        await adb.tapUntilImgFound(device.googleImages.createAccount2);
        await Tools.waitSec(5);

        // 구글 메인화면으로 왔다면 생성 완료
        // 나중에도 포함시키기
        // let retry = 50;
        // var isDone = false;
        // for (let i = 0; i < retry; i++) {
        //     if (!isDone)
        //         isDone = await adb.findImage('../img/google/logo.png');
        //     else break;
        // }
        const mysql = await Mysql.new();
        // if (isDone)
        await mysql.exec(MysqlQuery.getInsertGoogleId(email, password, firstName, lastName, device.name, Tools.getCurrentDateTime()));
        const currentApp = await adb.getCurrentApp();
        await adb.clearAppData(currentApp);
        return;
    }
    catch (e) {
        await adb.captureImage();
        console.log('error device = ' + device.name);
        console.log(e);
        return;
    }
}

const s10 = {
    name: 's10',
    typeMinInterval: 110,
    typeMaxInterval: 600,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');

        await adb.tapUntilImgFound('../img/samsung/agree.png');
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/later.png');
        await adb.tapUntilImgFound('../img/samsung/settings.png');
        await adb.tapUntilImgFound('../img/samsung/lightMode.png');
        await adb.tapUntilImgFound('../img/samsung/settings.png');
        await adb.tapUntilImgFound('../img/samsung/options.png');
        await adb.swipe(550, 2000, 550, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/personalInfo.png');
        await adb.tapUntilImgFound('../img/samsung/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/back.png');
        await adb.tapUntilImgFound('../img/samsung/back.png');
        await adb.tapUntilImgFound('../img/samsung/back.png');
        await adb.tapUntilImgFound('../img/samsung/betweenUrl.png');
        await adb.typeBasic('www.google.com');
        await adb.enter();
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/s10/month.png');
        await waitRandom();
        await adb.swipe(550, 2100, 550, Tools.getRandomNumberInRange(1630, 2100), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1650, 2080));
        await adb.tapImage('../img/samsung/dropdownComplete.png');

        await adb.tapUntilImgFound('../img/google/s10/sex.png');
        await adb.tapImage('../img/samsung/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1700),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1000, 680), 500);
    },
    googleImages: {
        login: '../img/google/s10/login.png',
        createAccount: '../img/google/s10/createAccount.png',
        myAccount: '../img/google/s10/myAccount.png',
        firstName: '../img/google/s10/firstName.png',
        lastName: '../img/google/s10/lastName.png',
        userName: '../img/google/s10/userName.png',
        userName2: '../img/google/s10/userName2.png',
        eraseName: '../img/google/s10/eraseName.png',
        password: '../img/google/s10/password.png',
        confirmPassword: '../img/google/s10/confirmPassword.png',
        next: '../img/google/s10/next.png',
        phoneChoice: '../img/google/s10/phoneChoice.png',
        year: '../img/google/s10/year.png',
        date: '../img/google/s10/date.png',
        agreeServices: '../img/google/s10/agreeServices.png',
        agreeInformation: '../img/google/s10/agreeInformation.png',
        createAccount2: '../img/google/s10/createAccount2.png',
        logo: '../img/google/s10/logo.png'
    }
}
const note5 = {
    name: 'note5',
    typeMinInterval: 50,
    typeMaxInterval: 300,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');

        await adb.tapUntilImgFound('../img/samsung/note5/agree.png');
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/note5/later.png');
        await adb.tapUntilImgFound('../img/samsung/note5/settings.png');
        await adb.tapUntilImgFound('../img/samsung/note5/options.png');
        await adb.swipe(550, 1800, 550, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/note5/personalInfo.png');
        await adb.tapUntilImgFound('../img/samsung/note5/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/note5/month.png');
        await waitRandom();
        await adb.swipe(550, 1800, 550, Tools.getRandomNumberInRange(1400, 1800), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1400, 1800));
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
        await adb.tapUntilImgFound('../img/google/note5/sex.png');
        await adb.tapImage('../img/samsung/note5/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1700),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(900, 680), 500);
    },
    googleImages: {
        login: '../img/google/note5/login.png',
        createAccount: '../img/google/note5/createAccount.png',
        myAccount: '../img/google/note5/myAccount.png',
        firstName: '../img/google/note5/firstName.png',
        lastName: '../img/google/note5/lastName.png',
        userName: '../img/google/note5/userName.png',
        userName2: '../img/google/note5/userName2.png',
        eraseName: '../img/google/note5/eraseName.png',
        password: '../img/google/note5/password.png',
        confirmPassword: '../img/google/note5/confirmPassword.png',
        next: '../img/google/note5/next.png',
        phoneChoice: '../img/google/note5/phoneChoice.png',
        year: '../img/google/note5/year.png',
        date: '../img/google/note5/date.png',
        agreeServices: '../img/google/note5/agreeServices.png',
        agreeInformation: '../img/google/note5/agreeInformation.png',
        createAccount2: '../img/google/note5/createAccount2.png',
        logo: '../img/google/note5/logo.png'
    }
}
const a5 = {
    name: 'a5',
    typeMinInterval: 0,
    typeMaxInterval: 100,
    setup: async function (adb) {
        await adb.clearAppData('com.android.chrome');
        await Tools.waitSec(5);
        await adb.openApp('com.android.chrome');
        await adb.type('');

        await adb.tapUntilImgFound('../img/chrome/a5/check.png');
        await adb.tapUntilImgFound('../img/chrome/a5/agreeAndContinue.png');
        await adb.tapUntilImgFound('../img/chrome/a5/skip.png');
        await adb.tapUntilImgFound('../img/chrome/a5/options.png');
        await adb.tapUntilImgFound('../img/chrome/a5/settings.png');
        await adb.tapUntilImgFound('../img/chrome/a5/savePassword.png');
        await adb.tapUntilImgFound('../img/chrome/a5/toggle.png');
        await adb.tapUntilImgFound('../img/chrome/a5/check.png');
        await adb.tapUntilImgFound('../img/chrome/a5/back.png');
        await adb.tapUntilImgFound('../img/chrome/a5/back.png');
        await adb.tapUntilImgFound('../img/chrome/a5/urlTab.png');
        await adb.typeBasic('www.google.co.kr');
        await adb.enter();
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/a5/month.png');
        await waitRandom();
        await adb.swipe(550, 1200, 550, Tools.getRandomNumberInRange(500, 1200), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1200, 100));
        await adb.swipe(
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(1100, 1250),
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(150, 250), 500);
        await adb.tapUntilImgFound('../img/google/a5/sex.png');
        await adb.tapImage('../img/samsung/a5/dropdownDoNotShow.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(1100, 1250),
            Tools.getRandomNumberInRange(100, 650),
            Tools.getRandomNumberInRange(150, 250), 500);
    },
    googleImages: {
        login: '../img/google/a5/login.png',
        createAccount: '../img/google/a5/createAccount.png',
        myAccount: '../img/google/a5/myAccount.png',
        firstName: '../img/google/a5/firstName.png',
        lastName: '../img/google/a5/lastName.png',
        userName: '../img/google/a5/userName.png',
        userName2: '../img/google/a5/userName2.png',
        eraseName: '../img/google/a5/eraseName.png',
        password: '../img/google/a5/password.png',
        confirmPassword: '../img/google/a5/confirmPassword.png',
        next: '../img/google/a5/next.png',
        phoneChoice: '../img/google/a5/phoneChoice.png',
        year: '../img/google/a5/year.png',
        date: '../img/google/a5/date.png',
        agreeServices: '../img/google/a5/agreeServices.png',
        agreeInformation: '../img/google/a5/agreeInformation.png',
        createAccount2: '../img/google/a5/createAccount2.png',
        logo: '../img/google/a5/logo.png'
    }
}
const s6 = {
    name: 's6',
    typeMinInterval: 50,
    typeMaxInterval: 300,
    setup: async function (adb) {
        await adb.clearAppData('com.sec.android.app.sbrowser');
        await Tools.waitSec(5);
        await adb.openApp('com.sec.android.app.sbrowser');
        await adb.type('');

        await adb.tapUntilImgFound('../img/samsung/note5/agree.png');
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/note5/later.png');
        await adb.tapUntilImgFound('../img/samsung/note5/settings.png');
        await adb.tapUntilImgFound('../img/samsung/note5/options.png');
        await adb.swipe(550, 1800, 550, 0, 1000);
        await Tools.waitMilli(500);
        await adb.tapUntilImgFound('../img/samsung/note5/personalInfo.png');
        await adb.tapUntilImgFound('../img/samsung/note5/userNameAndPassword.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/toggle.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
        await adb.tapUntilImgFound('../img/samsung/note5/back.png');
    },
    dropdown: async function (adb) {
        await adb.tapUntilImgFound('../img/google/note5/month.png');
        await waitRandom();
        await adb.swipe(550, 1800, 550, Tools.getRandomNumberInRange(1400, 1800), 200);
        await Tools.waitSec(3);
        await adb.tapLocation(550, Tools.getRandomNumberInRange(1400, 1800));
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
        await adb.tapUntilImgFound('../img/google/note5/sex.png');
        await adb.tapImage('../img/samsung/note5/dropdownDoNotShow.png');
        await adb.tapImage('../img/samsung/note5/dropdownComplete.png');
    },
    randomScrollDown: async function (adb) {
        await adb.swipe(
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(1502, 1700),
            Tools.getRandomNumberInRange(250, 800),
            Tools.getRandomNumberInRange(900, 680), 500);
    },
    googleImages: {
        login: '../img/google/note5/login.png',
        createAccount: '../img/google/note5/createAccount.png',
        myAccount: '../img/google/note5/myAccount.png',
        firstName: '../img/google/note5/firstName.png',
        lastName: '../img/google/note5/lastName.png',
        userName: '../img/google/note5/userName.png',
        userName2: '../img/google/note5/userName2.png',
        eraseName: '../img/google/note5/eraseName.png',
        password: '../img/google/note5/password.png',
        confirmPassword: '../img/google/note5/confirmPassword.png',
        next: '../img/google/note5/next.png',
        phoneChoice: '../img/google/note5/phoneChoice.png',
        year: '../img/google/note5/year.png',
        date: '../img/google/note5/date.png',
        agreeServices: '../img/google/note5/agreeServices.png',
        agreeInformation: '../img/google/note5/agreeInformation.png',
        createAccount2: '../img/google/note5/createAccount2.png',
        logo: '../img/google/note5/logo.png'
    }
}


async function main() {
    const newDeviceIpId = '192.168.43.1:5555'
    const newDeviceId = 'R39M60041TD'
    const oldDeviceId = '0915f948d3db1c05'
    const newAdb = ADB.new(newDeviceId);
    const oldAdb = ADB.new(oldDeviceId);

    await newAdb.setBrightness(106);
    // await oldAdb.setBrightness(106);

    // // // 특정 device에 너무 많은 트래픽이 빨리 모이면 block당한다.
    // // // 한시간에 5개를 나눠서 traffic을 줘보도록 하자.
    // // // 브라우저에서 device 정보를 다 얻을 수 있음으로 device를 돌려가면서 얻는 것이 좋은 방법일 수도 있다.
    // // // 두번째 device를 lte에 연결하고 두번째 device를 사용하도록 하자.

    for (let i = 0; i < 200; i++) {
        await newAdb.lteOff();
        await newAdb.lteOn();
        // await newAdb.lock();

        await oldAdb.lock();
        await createGoogleAccount(oldAdb, note5);
        await oldAdb.setBasicKeyboard('com.sec.android.inputmethod/.SamsungKeypad');
        await oldAdb.lock();

        // await newAdb.unlock('9347314da');
        // await newAdb.lteOff();
        // await newAdb.lteOn();
        // await createGoogleAccount(newAdb, s10);
        // await newAdb.setBasicKeyboard('com.samsung.android.honeyboard/.service.HoneyBoardService');
        // await newAdb.lock();
        await Tools.waitSec(Tools.getRandomNumberInRange(3600, 4600));
    }

    // const note5 = '0915f948d3db1c05'
    // const note5Adb = ADB.new(note5);

    // const s10 = 'R39M60041TD'
    // const s10Adb = ADB.new(s10);

    // await s10Adb.lteOff();
    // await s10Adb.lteOn();


    // const a5Code = '4e05ca11'
    // const a5Adb = ADB.new(a5Code);
    // await createGoogleAccount(a5Adb, a5);
}

async function test() {
    const note5 = '0915f948d3db1c05'
    const note5Adb = ADB.new(note5);

    const s10 = 'R39M60041TD'
    const s10Adb = ADB.new(s10);

    await s10Adb.lteOff();
    await s10Adb.lteOn();


    const a5Code = '4e05ca11'
    const a5Adb = ADB.new(a5Code);
    await createGoogleAccount(a5Adb, a5);
}



async function waitRandom() {
    await Tools.waitMilli(Tools.getRandomNumberInRange(400, 1500));
}


test();