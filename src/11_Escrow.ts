//cosigner1が起案者となりcosigner1=>cosigner2へ5XYMを、cosigner2=>cosigner1へ1xymを送る取引を行う
//この時点ではcosigner1のみの署名のためトランザクションはロックされている状態

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
  PublicAccount,
  AggregateTransaction,
  HashLockTransaction,
  UInt64,
} from 'symbol-sdk';

const property = require('./Property.ts');
const initiatorKey = property.cosigner1Key;

const node = 'https://sym-test-04.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();
const receiptHttp = repoFactory.createReceiptRepository();
const accountHttp = repoFactory.createAccountRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);
const listener = repoFactory.createListener();

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repoFactory.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repoFactory.getGenerationHash());

  const initiatorAccount = Account.createFromPrivateKey(
    initiatorKey,
    networkType
  );

  const accountInfo = await accountHttp
    .getAccountInfo(Address.createFromRawAddress(property.cosigner2Address))
    .toPromise();

  console.log(accountInfo!.publicKey)
  
  const cosignerPublicAccount = PublicAccount.createFromPublicKey(
    accountInfo!.publicKey,
    networkType
  );

  const transferTransaction1 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(cosignerPublicAccount.address.plain()),
    [NetworkCurrencies.PUBLIC.currency.createRelative(5)],
    EmptyMessage,
    networkType
  );

  const transferTransaction2 = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(initiatorAccount.address.plain()),
    [NetworkCurrencies.PUBLIC.currency.createRelative(1)],
    EmptyMessage,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [
      transferTransaction1.toAggregate(initiatorAccount.publicAccount),
      transferTransaction2.toAggregate(cosignerPublicAccount),
    ],
    networkType
  ).setMaxFeeForAggregate(100, 2);

  const signedTransaction = initiatorAccount.sign(
    aggregateTransaction,
    generationHash
  );

  const duration = UInt64.fromUint(2 * 60 * 24 * 2);

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    NetworkCurrencies.PUBLIC.currency.createRelative(10),
    duration,
    signedTransaction,
    networkType
  ).setMaxFee(100);

  const signedHashlockTransaction = initiatorAccount.sign(
    hashLockTransaction,
    generationHash
  );

  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        signedHashlockTransaction,
        signedTransaction,
        listener
      )
      .subscribe({
        next: (x) => {
          console.log(x);
        },
        error: (err) => {
          console.error(err);
        },
        complete: () => {
          listener.close();
        },
      });
  });
};

main().then();
