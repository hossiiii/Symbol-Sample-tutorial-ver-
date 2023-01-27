import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  NamespaceRegistrationTransaction,
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

  const namespaceName = property.namespaceName;
  const duration = UInt64.fromUint(2 * 60 * 24 * 30);

  const namespaceCreatetionTransaction =
    NamespaceRegistrationTransaction.createRootNamespace(
      Deadline.create(epochAdjustment),
      namespaceName,
      duration,
      networkType
    ).setMaxFee(100);

  const signedTransaction = account.sign(
    namespaceCreatetionTransaction,
    generationHash
  );

  listener.open().then(() => {
    transactionService.announce(signedTransaction, listener).subscribe({
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
