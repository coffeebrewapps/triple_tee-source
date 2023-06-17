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
    const deductiblesTags = deductibles.map(d => d.includeTags).flat();

    const expensesFilters = {};
    if (deductiblesTags.length > 0) {
      expensesFilters.tags = deductiblesTags;
    }

    expensesFilters.transactionDate = {
      startDate: effectiveStart,
      endDate: effectiveEnd,
    }

    expensesFilters.type = ['expense', 'expenseReversal'];

    const expensesResult = dataAccess.list('transactions', { filters: expensesFilters });
    const expenses = expensesResult.data;

    const expenseTransactions = expenses.filter(t => t.type === 'expense');
    const expenseReversalTransactions = expenses.filter(t => t.type === 'expenseReversal');

    const totalDeductible = deductibles.reduce((deductibleAmount, deductible) => {
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

      deductibleAmount = deductibleAmount + expenseTransactions.reduce((sum, expense) => {
        if (expense.tags.some(t => deductible.includeTags.includes(t))) {
          sum = sum + calculateDeductible(deductible, expense.amount);
        };
        return sum;
      }, 0);

      deductibleAmount = deductibleAmount - expenseReversalTransactions.reduce((sum, reversal) => {
        if (reversal.tags.some(t => deductible.includeTags.includes(t))) {
          sum = sum + calculateDeductible(deductible, reversal.amount);
        };
        return sum;
      }, 0);

      return deductibleAmount;
    }, 0);
    /** calculate deductions **/

    const nettIncome = totalIncome - totalIncomeReversal - totalDeductible;

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
          totalDeductible,
        },
      };
    }

    const taxTiers = taxTiersResult.data;

    if (nettIncome < 0) {
      return {
        success: true,
        record: {
          incomeBracket: taxTiers[0],
          payable: 0,
          nettIncome,
          totalDeductible,
        },
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
      const payable = secondLastBracketPayable + (lastBracketTaxable * incomeBracket.rate);

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
      const payable = nettIncome * incomeBracket.rate;

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
