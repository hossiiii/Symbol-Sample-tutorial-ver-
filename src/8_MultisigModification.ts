import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  MultisigAccountModificationTransaction,
  AggregateTransaction,
  NetworkType,
} from 'symbol-sdk';

const node = 'https://sym-test-04.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();
const receiptHttp = repoFactory.createReceiptRepository();
const transactionService = new TransactionService(transactionHttp, receiptHttp);
const listener = repoFactory.createListener();

const property = require('./Property.ts');
const multisigAccountKey = property.accountPrivateKey;

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const epochAdjustment = await firstValueFrom(
    repoFactory.getEpochAdjustment()
  );
  const generationHash = await firstValueFrom(repoFactory.getGenerationHash());

  const multisigAccount = Account.createFromPrivateKey(
    multisigAccountKey,
    networkType
  );
  const cosigner1 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner2 = Account.generateNewAccount(NetworkType.TEST_NET);
  const cosigner3 = Account.generateNewAccount(NetworkType.TEST_NET);

  const multisigModificationTransaction =
    MultisigAccountModificationTransaction.create(
      Deadline.create(epochAdjustment),
      2,
      2,
      [cosigner1.address, cosigner2.address, cosigner3.address],
      [],
      networkType
    );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      multisigModificationTransaction.toAggregate(
        multisigAccount.publicAccount
      ),
    ],
    networkType,
    []
  ).setMaxFeeForAggregate(100, 4);

  const signedTransaction = multisigAccount.signTransactionWithCosignatories(
    aggregateTransaction,
    [cosigner1, cosigner2, cosigner3],
    generationHash
  );

  console.log(signedTransaction);

  listener.open().then(() => {
    transactionService.announce(signedTransaction, listener).subscribe({
      next: (x) => {
        console.log(x);

        //display cosigner privateKey
        console.log(
          `以下のprivateKeyを別ファイルの”Property.ts”に入力して保存する
        `
        );
        console.log(`cosigner1Key: ${cosigner1.privateKey}`);
        console.log(`cosigner2Key: ${cosigner2.privateKey}`);
        console.log(`cosigner3Key: ${cosigner3.privateKey}`);
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
