export function useTaxTierUtils() {
  const fieldsLayout = [
    { minIncome: 'md', maxIncome: 'md' },
    { maxPayableAmount: 'md', rate: 'md' },
    { taxTableId: 'lg' },
  ];

  function recordValue(record) {
    return record.id;
  }

  function taxTableLabel(record) {
    return record.description;
  }

  function generateDataFields(taxTableId) {
    return [
      {
        key: 'id',
        type: 'text',
        label: 'ID',
        listable: true,
        viewable: false,
        creatable: false,
        updatable: false,
        sortable: true,
      },
      {
        key: 'minIncome',
        type: 'number',
        label: 'Minimum Income',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        sortable: true,
      },
      {
        key: 'maxIncome',
        type: 'number',
        label: 'Maximum Income',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'maxPayableAmount',
        type: 'number',
        label: 'Maximum Payable Amount',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'rate',
        type: 'number',
        label: 'Rate',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'taxTableId',
        type: 'singleSelect',
        label: 'Tax Table',
        reference: { label: taxTableLabel },
        defaultValue: () => { return taxTableId; },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: false,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tax_tables',
          value: recordValue,
          label: taxTableLabel,
        },
      },
    ];
  }

  return {
    fieldsLayout,
    recordValue,
    taxTableLabel,
    generateDataFields,
  };
}
