export function useStore({ dataStore }) {
  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null);
  }

  function create(modelClass, params) {
    if (isEmpty(params.homeCurrencyAmount)) {
      params.homeCurrencyAmount = convertToHomeCurrencyAmount(params.currencyId, params.amount);
    }
    return dataStore.create(modelClass, params);
  }

  function convertToHomeCurrencyAmount(sourceCurrencyId, sourceAmount) {
    const latestSystemConfigs = dataStore.list(
      'system_configs',
      {
        sort: { field: 'effectiveStart', order: 'desc' },
        include: ['baseCurrencyId'],
        offset: 0,
        limit: 1,
      }
    ).data[0];

    const homeCurrency = latestSystemConfigs.includes.baseCurrencyId[latestSystemConfigs.baseCurrencyId];

    const sourceCurrency = dataStore.view('currencies', sourceCurrencyId, {}).record;

    if (sourceCurrency.code === homeCurrency.code) {
      return sourceAmount;
    } else {
      return (sourceAmount / sourceCurrency.exchangeRate).toFixed(2);
    }
  }

  function reverseTransaction(modelClass, id, params) {
    const result = dataStore.view('transactions', id, {});

    if (!result.success) { return result; }

    const record = result.record;

    if (record.type !== 'income' && record.type !== 'expense') {
      return {
        success: false,
        errors: {
          type: ['notReversible'],
        },
      };
    }

    const reversalType = record.type === 'income' ? 'incomeReversal' : 'expenseReversal';
    const reversalParams = {
      type: reversalType,
      transactionDate: new Date(),
      description: `Reverse ${record.description}`,
      amount: record.amount,
      homeCurrencyAmount: record.homeCurrencyAmount,
      currencyId: record.currencyId,
    };

    const { success, results } = dataStore.atomic(
      [
        {
          id: 'createReversalTransaction',
          params: reversalParams,
          invoke: (reversalParams) => {
            return dataStore.create('transactions', reversalParams);
          },
          rollback: (result) => {
            dataStore.remove('transactions', result.record.id);
          },
        },
        {
          id: 'updateOriginalTransactionAssociation',
          params: {
            originalId: record.id,
          },
          invoke: ({ originalId }, pastResults) => {
            const reversalTransactionId = pastResults[0].result.record.id;
            return dataStore.update('transactions', originalId, { associatedTransactionId: reversalTransactionId });
          },
          rollback: (result) => {
            dataStore.update('transactions', result.record.id, { associatedTransactionId: null });
          },
        },
      ]
    );

    if (success) {
      const originalTransaction = results[1].result.record;
      const reversalTransaction = results[0].result.record;
      const includes = {
        associatedTransactionId: {
          [reversalTransaction.id]: reversalTransaction,
        },
      };

      return {
        success: true,
        record: Object.assign(
          {},
          originalTransaction,
          { includes }
        ),
      };
    } else {
      return results[0].result;
    }
  }

  return {
    create,
    reverseTransaction,
  };
}
