const modelClass = 'transactions';

module.exports = ({ dataAccess, utils, logger }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    if (utils.isEmpty(params.homeCurrencyAmount)) {
      params.homeCurrencyAmount = convertToHomeCurrencyAmount(params.currencyId, params.amount);
    }
    return dataAccess.create(modelClass, params);
  }

  function update(id, params) {
    return dataAccess.update(modelClass, id, params);
  }

  function remove(id) {
    return dataAccess.remove(modelClass, id);
  }

  function convertToHomeCurrencyAmount(sourceCurrencyId, sourceAmount) {
    const latestSystemConfigs = dataAccess.list(
      'system_configs',
      {
        sort: { field: 'effectiveStart', order: 'desc' },
        include: ['baseCurrencyId'],
        offset: 0,
        limit: 1,
      }
    ).data[0];

    const homeCurrency = latestSystemConfigs.includes.baseCurrencyId[latestSystemConfigs.baseCurrencyId];

    const sourceCurrency = dataAccess.view('currencies', sourceCurrencyId, {}).record;

    if (sourceCurrency.code === homeCurrency.code) {
      return sourceAmount;
    } else {
      return (sourceAmount / sourceCurrency.exchangeRate).toFixed(2);
    }
  }

  function reverseTransaction(id) {
    const result = dataAccess.view('transactions', id, {});

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

    const { success, results } = dataAccess.atomic(
      [
        {
          id: 'createReversalTransaction',
          params: reversalParams,
          invoke: (reversalParams) => {
            return dataAccess.create('transactions', reversalParams);
          },
          rollback: (result) => {
            dataAccess.remove('transactions', result.record.id);
          },
        },
        {
          id: 'updateOriginalTransactionAssociation',
          params: {
            originalId: record.id,
          },
          invoke: ({ originalId }, pastResults) => {
            const reversalTransactionId = pastResults[0].result.record.id;
            return dataAccess.update('transactions', originalId, { associatedTransactionId: reversalTransactionId });
          },
          rollback: (result) => {
            dataAccess.update('transactions', result.record.id, { associatedTransactionId: null });
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
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    reverseTransaction,
  };
};
