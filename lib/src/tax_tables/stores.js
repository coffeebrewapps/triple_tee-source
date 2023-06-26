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

    const taxTiersResult = dataAccess.list(
      'tax_tiers',
      {
        filters: { taxTableId: taxTable.id },
        sort: { field: 'minIncome', order: 'asc' },
      }
    );

    if (taxTiersResult.total === 0) {
      return {
        success: false,
        errors: {
          payableTier: ['notFound'],
        },
      };
    }

    /** incomeTransactions **/
    const transactionsFilters = {};

    if (taxTable.includeTags.length > 0) {
      transactionsFilters.tags = taxTable.includeTags;
    }

    transactionsFilters.transactionDate = {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    };

    transactionsFilters.type = ['income', 'incomeReversal'];

    const transactionsResult = dataAccess.list('transactions', { filters: transactionsFilters });

    if (transactionsResult.total === 0) {
      return {
        success: true,
        record: {
          incomeBracket: null,
          payable: 0,
          nettIncome: 0,
          totalDeductible: 0,
        },
      };
    }

    const transactions = transactionsResult.data;
    /** incomeTransactions **/

    /** calculate income **/
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const incomeReversalTransactions = transactions.filter(t => t.type === 'incomeReversal');

    const totalIncome = incomeTransactions.reduce((sum, txn) => {
      return sum + txn.homeCurrencyAmount;
    }, 0);

    const totalIncomeReversal = incomeReversalTransactions.reduce((sum, txn) => {
      return sum + txn.homeCurrencyAmount;
    }, 0);
    /** calculate income **/

    /** calculate deductions **/
    const deductiblesResult = dataAccess.list('tax_deductibles', { filters: { taxTableId: id } });
    const deductibles = deductiblesResult.data;
    const totalDeductible = parseFloat(deductibles.reduce((deductibleAmount, deductible) => {
      function calculateDeductible(deductible, amount) {
        if (deductible.type === 'fixed') {
          return deductible.rate;
        } else {
          const calculated = deductible.rate * amount;
          if (utils.notEmpty(deductible.maxDeductibleAmount)) {
            return calculated > deductible.maxDeductibleAmount ? deductible.maxDeductibleAmount : calculated;
          } else {
            return calculated;
          }
        }
      }

      const deductiblesTags = deductible.includeTags;
      const deductiblesTypes = deductible.transactionTypes;

      const deductibleTransactionsFilters = {};
      if (deductiblesTags.length > 0) {
        deductibleTransactionsFilters.tags = deductiblesTags;
      }

      if (deductiblesTypes.length > 0) {
        deductibleTransactionsFilters.type = deductiblesTypes;
      }

      deductibleTransactionsFilters.transactionDate = {
        startDate: effectiveStart,
        endDate: effectiveEnd,
      };

      const deductibleTransactionsResult = dataAccess.list('transactions', { filters: deductibleTransactionsFilters });
      const deductibleTransactions = deductibleTransactionsResult.data;

      const transactionsAmount = deductibleTransactions.reduce((sum, transaction) => {
        if (
          (deductiblesTags.length === 0 || transaction.tags.some(t => deductiblesTags.includes(t))) &&
            (deductiblesTypes.length === 0 || deductiblesTypes.includes(transaction.type))
        ) {
          const multiplier = transaction.type === 'income' || transaction.type === 'expense' ? 1 : -1;
          return sum + transaction.homeCurrencyAmount * multiplier;
        } else {
          return sum;
        }
      }, 0);

      const currentDeductible = calculateDeductible(deductible, transactionsAmount)
      deductibleAmount = deductibleAmount + calculateDeductible(deductible, transactionsAmount);

      return deductibleAmount;
    }, 0).toFixed(2));
    /** calculate deductions **/

    const nettIncome = parseFloat((totalIncome - totalIncomeReversal - totalDeductible).toFixed(2));

    /** calculate tax **/
    const taxTiers = taxTiersResult.data;

    if (nettIncome < 0) {
      return {
        success: false,
        errors: {
          nettIncome: ['negative'],
        }
      };
    }

    const lastBracketIndex = taxTiers.findIndex(t => t.minIncome <= nettIncome && nettIncome <= t.maxIncome);

    if (lastBracketIndex < 0) {
      return {
        success: false,
        errors: {
          payableTier: ['notFound'],
        },
      };
    }

    const incomeBracket = taxTiers[lastBracketIndex];

    if (lastBracketIndex > 0) {
      const secondLastBracket = taxTiers[lastBracketIndex - 1];
      const secondLastBracketPayable = secondLastBracket.maxPayableAmount;
      const lastBracketTaxable = nettIncome - secondLastBracket.maxIncome;
      const payable = parseFloat((secondLastBracketPayable + (lastBracketTaxable * incomeBracket.rate)).toFixed(2));

      return {
        success: true,
        record: {
          incomeBracket,
          payable,
          nettIncome,
          totalDeductible,
        },
      };
    } else {
      const payable = parseFloat((nettIncome * incomeBracket.rate).toFixed(2));

      return {
        success: true,
        record: {
          incomeBracket,
          payable,
          nettIncome,
          totalDeductible,
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
