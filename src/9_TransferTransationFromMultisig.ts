//cosigner1を起案者としてマルチシグアカウント化したaccountからcosigner3に対して20XYMを送信する
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
const multisigAccountPublicKey = property.accountPublicKey;
const cosignerPrivateKey = property.cosigner1Key;

const targetAddress = property.cosigner3Address;
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
    [NetworkCurrencies.PUBLIC.currency.createRelative(20)],
    EmptyMessage,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [transferTransaction.toAggregate(multisigPublicAccount)],
    networkType
  ).setMaxFeeForAggregate(100, 2);

  const signedTransaction = cosignerAccount.sign(
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

          //display targetTxHash
          console.log(
            `以下のtargetTxHashを別ファイルの”Property.ts”に入力して保存する
          `
          );
          console.log(x.transactionInfo!.hash);
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
