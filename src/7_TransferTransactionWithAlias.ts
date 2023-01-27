//accountからネームスペースで宛先（daoka）とモザイク（.coin）を指定して送信する

import { firstValueFrom } from 'rxjs';
import {
  TransferTransaction,
  Deadline,
  EmptyMessage,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  NamespaceId,
  Mosaic,
  UInt64,
} from 'symbol-sdk';

const property = require('./Property.ts');
const accountPrivateKey = property.accountPrivateKey;
const node = 'https://sym-test-04.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();
const receiptHttp = repoFactory.createReceiptRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);
const listener = repoFactory.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repoFactory.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repoFactory.getGenerationHash());

  const account = Account.createFromPrivateKey(accountPrivateKey, networkType);

  const mosaic = new Mosaic(
    new NamespaceId(`${property.namespaceName}.coin`),
    UInt64.fromUint(10)
  );

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    new NamespaceId('daoka'),
    [mosaic],
    EmptyMessage,
    networkType
  ).setMaxFee(100);

  const signedTransaction = account.sign(transferTransaction, generationHash);

  listener.open().then(() => {
    transactionService.announce(signedTransaction, listener).subscribe({
      next: (x) => {
        console.log(x);
      },
      error: (err) => {
        console.error(err);
        listener.close();
      },
      complete: () => {
        listener.close();
      },
    });
  });
};

main().then();
