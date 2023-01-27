import { firstValueFrom } from 'rxjs';
import {
  Deadline,
  Account,
  TransactionService,
  RepositoryFactoryHttp,
  AddressAliasTransaction,
  NamespaceId,
  AliasAction,
  Address,
} from 'symbol-sdk';

const property = require('./Property.ts');
const accountPrivateKey = property.accountPrivateKey;
const targetAddress = 'TB5SUCCQIOISBCMTSYLYLGGAA3MIMYNC6KMRAHY';
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

  const namespaceId = new NamespaceId(property.namespaceName);
  const addressAliasTransaction = AddressAliasTransaction.create(
    Deadline.create(epochAdjustment),
    AliasAction.Link,
    namespaceId,
    Address.createFromRawAddress(targetAddress),
    networkType
  ).setMaxFee(100);

  const signedTransaction = account.sign(
    addressAliasTransaction,
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
