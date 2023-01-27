//cosigner2より連署を行い9_TransferTransationFromMultisigでロックしたトランザクションを実行する

import { firstValueFrom } from 'rxjs';
import {
  CosignatureTransaction,
  RepositoryFactoryHttp,
  TransactionGroup,
  Account,
  AggregateTransaction,
} from 'symbol-sdk';

const property = require('./Property.ts');
const cosignerKey = property.cosigner2Key;
const targetTxHash = property.targetTxHash;
const node = 'https://sym-test-04.opening-line.jp:3001';
const repoFactory = new RepositoryFactoryHttp(node);
const transactionHttp = repoFactory.createTransactionRepository();

const main = async () => {
  const networkType = await firstValueFrom(repoFactory.getNetworkType());
  const cosigner = Account.createFromPrivateKey(cosignerKey, networkType);

  const targetTransaction = (await firstValueFrom(
    transactionHttp.getTransaction(targetTxHash, TransactionGroup.Partial)
  )) as AggregateTransaction;
  const cosignatureTx = CosignatureTransaction.create(targetTransaction);
  const signedCosignatureTx =
    cosigner.signCosignatureTransaction(cosignatureTx);
  const result = await firstValueFrom(
    transactionHttp.announceAggregateBondedCosignature(signedCosignatureTx)
  );
  console.log(result);
};

main().then();
