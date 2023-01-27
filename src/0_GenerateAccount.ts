//ハンズオンに必要なアカウントの作成と入金などの準備

import { Account, NetworkType } from 'symbol-sdk';

const main = () => {
  const account = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(
    `1. 以下URLを別タブで開き、CLAIM!ボタンをクリック。アカウントに手数料分の通貨（XYM）を補充し
    緑色のNotificationとして”View transaction in explorer.”と表示されたらタブを閉じる
    `
  );
  console.log(
    `https://testnet.symbol.tools/?amount=200&recipient=${account.address.plain()}
    `
  );
  console.log(
    `2. 以下リンクを別タブで開き200XYMが入金されていることを確認する(このページは開いたままにしておく)`
  );
  console.log('');
  console.log(
    `https://testnet.symbol.fyi/accounts/${account.address.plain()}
    `
  );
  console.log(
    `3. 以下のPrivate Keyを別ファイルの”Property.ts”に入力して保存する
    `
  );
  console.log(`accountPrivateKey: ${account.privateKey}`);
  console.log(`accountPublicKey: ${account.publicKey}`);
  console.log(`accountAddress: ${account.address.plain()}
  `);
  const cosigner1 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner2 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner3 = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(`cosigner1Key: ${cosigner1.privateKey}`);
  console.log(`cosigner2Key: ${cosigner2.privateKey}`);
  console.log(`cosigner3Key: ${cosigner3.privateKey}
  `);
  console.log(`cosigner1Address: ${cosigner1.address.plain()}`);
  console.log(`cosigner2Address: ${cosigner2.address.plain()}`);
  console.log(`cosigner3Address: ${cosigner3.address.plain()}`);
};

main();
