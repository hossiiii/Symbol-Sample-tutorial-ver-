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
    `
  );
  console.log(`accountPrivateKey: ${account.privateKey}`);
  console.log(`accountPublicKey: ${account.publicKey}`);
  console.log(
    `4. 以下のPrivate Keyを別ファイルの”Property.ts”に入力して保存する
    `
  );
  const cosigner1 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner2 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner3 = Account.generateNewAccount(NetworkType.TEST_NET);
  console.log(`cosigner1Key: ${cosigner1.privateKey}`);
  console.log(`cosigner2Key: ${cosigner2.privateKey}`);
  console.log(`cosigner3Key: ${cosigner3.privateKey}`);
};

main();
