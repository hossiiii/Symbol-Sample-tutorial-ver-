//accountからcosigner1へ20XYMを送金する

import { firstValueFrom } from 'rxjs';
import {
  TransferTransaction,
  Deadline,
  Address,
  EmptyMessage,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  NetworkCurrencies,
} from 'symbol-sdk';

const property = require('./Property.ts');
const accountPrivateKey = property.accountPrivateKey;
const targetAddress = property.cosigner1Address;
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

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(targetAddress),
    [NetworkCurrencies.PUBLIC.currency.createRelative(20)],
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
