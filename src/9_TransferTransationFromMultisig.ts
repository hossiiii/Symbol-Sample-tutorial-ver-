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
const multisigAccountPublicKey = property.accountPublicKey;
const cosignerPrivateKey = property.cosigner1Key;

const targetAddress = property.cosigner2Address;
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
  const cosignerAccount = Account.createFromPrivateKey(
    cosignerPrivateKey,
    networkType
  );

  const multisigPublicAccount = PublicAccount.createFromPublicKey(
    multisigAccountPublicKey,
    networkType
  );

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    Address.createFromRawAddress(targetAddress),
    [NetworkCurrencies.PUBLIC.currency.createRelative(10)],
    EmptyMessage,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [transferTransaction.toAggregate(multisigPublicAccount)],
    networkType
  ).setMaxFeeForAggregate(100, 0);

  const signedTransaction = cosignerAccount.sign(
    aggregateTransaction,
    generationHash
  );

  // const aggregateTransaction = AggregateTransaction.createBonded(
  //   Deadline.create(epochAdjustment),
  //   [transferTransaction.toAggregate(multisigPublicAccount)],
  //   networkType
  // ).setMaxFeeForAggregate(100, 2);

  // const signedTransaction = cosignerAccount.sign(
  //   aggregateTransaction,
  //   generationHash
  // );

  const duration = UInt64.fromUint(2 * 60 * 24 * 2);

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    NetworkCurrencies.PUBLIC.currency.createRelative(10),
    duration,
    signedTransaction,
    networkType
  ).setMaxFee(100);

  const signedHashlockTransaction = cosignerAccount.sign(
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
