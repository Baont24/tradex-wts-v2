import { IEquityCashAdvancedAmountResponse } from 'interfaces/api';

export const calculateAdvanceFee = (
  advanceAmount: number,
  cashAdvancedAmount: IEquityCashAdvancedAmountResponse
) => {
  const {
    t2AdvAvailable,
    t1AdvAvailable,
    t0AdvAvailable,
    t2Days,
    t1Days,
    t0Days,
    interestRate,
  } = cashAdvancedAmount;
  let advAmt = advanceAmount;
  let fee = 0;
  let isContinue = true;

  if (t2AdvAvailable > 0) {
    [fee, isContinue, advAmt] = calculateAdvanceFeeBasedOnPaymentDate(
      fee,
      isContinue,
      advAmt,
      t2AdvAvailable,
      t2Days,
      interestRate
    );
  }

  if (isContinue && t1AdvAvailable > 0) {
    [fee, isContinue, advAmt] = calculateAdvanceFeeBasedOnPaymentDate(
      fee,
      isContinue,
      advAmt,
      t1AdvAvailable,
      t1Days,
      interestRate
    );
  }

  if (isContinue && t0AdvAvailable > 0) {
    [fee, isContinue, advAmt] = calculateAdvanceFeeBasedOnPaymentDate(
      fee,
      isContinue,
      advAmt,
      t0AdvAvailable,
      t0Days,
      interestRate
    );
  }
  return fee;
};

const calculateAdvanceFeeBasedOnPaymentDate = (
  fee: number,
  cont: boolean,
  advAmt: number,
  tNAdvAvailable: number,
  tNDays: number,
  interestRate: number
): [number, boolean, number] => {
  let tempFee = fee;
  let tempAdvAmt = advAmt;
  let tempCont = cont;
  if (advAmt > tNAdvAvailable) {
    tempFee += (tNAdvAvailable * tNDays * interestRate) / 360 / 100;
    tempAdvAmt -= tNAdvAvailable;
  } else {
    tempFee += (advAmt * tNDays * interestRate) / 360 / 100;
    tempCont = false;
  }
  return [tempFee, tempCont, tempAdvAmt];
};
