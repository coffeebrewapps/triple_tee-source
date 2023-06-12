import { useValidations } from '@/utils/validations';
const {
  greaterThanOrEqual,
} = useValidations();

export function useTaxDeductibleUtils() {
  const fieldsLayout = [
    { category: 'md', description: 'md' },
    { type: 'md', rate: 'md', maxDeductibleAmount: 'md' },
    { includeTags: 'md' },
    { taxTableId: 'lg' },
  ];

  function recordValue(record) {
    return record.id;
  }

  function taxTableLabel(record) {
    return record.description;
  }

  function tagLabel(record) {
    return `${record.category}:${record.name}`;
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
        key: 'category',
        type: 'text',
        label: 'Category',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'description',
        type: 'text',
        label: 'Description',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'type',
        type: 'enum',
        label: 'Rate Type',
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
        key: 'maxDeductibleAmount',
        type: 'number',
        label: 'Maximum Deductible Amount',
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
      },
      {
        key: 'includeTags',
        type: 'multiSelect',
        label: 'Include Tags',
        isTags: true,
        reference: { label: tagLabel },
        listable: true,
        viewable: true,
        creatable: true,
        updatable: true,
        filterable: true,
        options: {
          server: true,
          pagination: true,
          modelClass: 'tags',
          value: recordValue,
          label: tagLabel,
        },
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

  const validations = {
    create: {
      maxPayableAmount: [
        (record) => { return greaterThanOrEqual(record, 'maxPayableAmount', 0); },
      ],
      rate: [
        (record) => { return greaterThanOrEqual(record, 'rate', 0); },
      ],
    },
    update: {
      maxPayableAmount: [
        (record) => { return greaterThanOrEqual(record, 'maxPayableAmount', 0); },
      ],
      rate: [
        (record) => { return greaterThanOrEqual(record, 'rate', 0); },
      ],
    },
  };

  return {
    fieldsLayout,
    recordValue,
    tagLabel,
    taxTableLabel,
    generateDataFields,
    validations,
  };
}
