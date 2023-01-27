//accountで発行したモザイクにサブネームスペース（.coin）を割り当てる

import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  AddressAliasTransaction,
  NamespaceId,
  AliasAction,
  MosaicAliasTransaction,
  MosaicId,
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

  const namespaceId = new NamespaceId(`${property.namespaceName}.coin`);
  const mosaicId = new MosaicId(`${property.mosaicId}`);

  const mosaicAliasTransaction = MosaicAliasTransaction.create(
    Deadline.create(epochAdjustment),
    AliasAction.Link,
    namespaceId,
    mosaicId,
    networkType
  ).setMaxFee(100);

  const signedTransaction = account.sign(
    mosaicAliasTransaction,
    generationHash
  );

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
