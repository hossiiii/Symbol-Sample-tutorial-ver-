import { Account, NetworkType } from 'symbol-sdk';

const main = () => {
  const account = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(
    `1. 以下URLを別タブで開き、CLAIM!ボタンをクリック。アカウントに手数料分の通貨（XYM）を補充する
    `
  );
  console.log(
    `https://testnet.symbol.tools/?amount=100&recipient=${account.address.plain()}
    `
  );
  console.log(
    `2. CLAIM後、緑色のNotificationとして”View transaction in explorer.”
    とリンクが表示されるのでクリックし100XYM移動されていることを確認する
    `
  );
  console.log(
    `3. 以下のPrivate Keyを別ファイルの”Property.ts”に入力して保存する
    以上で準備は終了
    `
  );
  console.log(`Private Key: ${account.privateKey}`);
  console.log(`Public Key: ${account.publicKey}`);
  console.log(`Address: ${account.address.plain()}`);
};

main();
