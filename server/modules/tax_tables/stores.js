const modelClass = 'tax_tables';

module.exports = ({ dataAccess, logger, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    return dataAccess.create(modelClass, params);
  }

  function update(id, params) {
    return dataAccess.update(modelClass, id, params);
  }

  function remove(id) {
    return dataAccess.remove(modelClass, id);
  }

  function estimateTax(id) {
    /** tax table **/
    const result = dataAccess.view(modelClass, id, {});

    if (!result.success) {
      return result;
    }

    const taxTable = result.record;
    const { effectiveStart, effectiveEnd } = taxTable;
    /** tax table **/

    /** transactions **/
    const transactionsFilters = {};

    if (taxTable.includeTags.length > 0) {
      transactionsFilters.tags = taxTable.includeTags;
    }

    transactionsFilters.transactionDate = {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    };

    const transactionsResult = dataAccess.list('transactions', { filters: transactionsFilters });

    if (transactionsResult.total === 0) {
      return {
        success: true,
        record: {
          incomeBracket: null,
          payable: 0,
          nettIncome: 0,
        },
      };
    }
    /** transactions **/

    /** calculate income **/
    const transactions = transactionsResult.data;
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const incomeReversalTransactions = transactions.filter(t => t.type === 'incomeReversal');

    const totalIncome = incomeTransactions.reduce((sum, txn) => {
      return sum + txn.homeCurrencyAmount;
    }, 0);

    const totalIncomeReversal = incomeReversalTransactions.reduce((sum, txn) => {
      return sum + txn.homeCurrencyAmount;
    }, 0);

    const nettIncome = totalIncome - totalIncomeReversal;

    if (nettIncome < 0) {
      return {
        success: true,
        record: {
          incomeBracket: null,
          payable: 0,
          nettIncome,
        },
      };
    }
    /** calculate income **/

    /** calculate tax **/
    const taxTiersResult = dataAccess.list(
      'tax_tiers',
      {
        filters: { taxTableId: taxTable.id },
        sort: { field: 'minIncome', order: 'asc' },
      }
    );

    if (taxTiersResult.total === 0) {
      return {
        success: true,
        record: {
          incomeBracket: null,
          payable: 0,
          nettIncome,
        },
      };
    }

    const taxTiers = taxTiersResult.data;

    const lastBracketIndex = taxTiers.findIndex(t => t.minIncome <= nettIncome && nettIncome <= t.maxIncome);

    if (lastBracketIndex < 0) {
      return {
        success: true,
        record: {
          incomeBracket: null,
          payable: 0,
          nettIncome,
        },
      };
    }

    const incomeBracket = taxTiers[lastBracketIndex];

    if (lastBracketIndex > 0) {
      const secondLastBracket = taxTiers[lastBracketIndex - 1];
      const secondLastBracketPayable = secondLastBracket.maxPayableAmount;
      const lastBracketTaxable = nettIncome - secondLastBracket.maxIncome;
      const payable = secondLastBracketPayable + (lastBracketTaxable * incomeBracket.rate);

      return {
        success: true,
        record: {
          incomeBracket,
          payable,
          nettIncome,
        },
      };
    } else {
      const payable = nettIncome * incomeBracket.rate;

      return {
        success: true,
        record: {
          incomeBracket,
          payable,
          nettIncome,
        },
      };
    }
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    estimateTax,
  };
};
