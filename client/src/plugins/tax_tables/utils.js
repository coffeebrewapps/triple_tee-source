export function useTaxTableUtils() {
  const fieldsLayout = [
    { description: 'lg' },
    { effectiveStart: 'md', effectiveEnd: 'md' },
    { includeTags: 'lg' },
    { excludeTags: 'lg' },
  ];

  function recordValue(record) {
    return record.id;
  }

  function tagLabel(record) {
    return `${record.category}:${record.name}`;
  }

  const dataFields = [
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
      key: 'description',
      type: 'text',
      label: 'Description',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
    },
    {
      key: 'effectiveStart',
      type: 'date',
      label: 'Effective Start',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: 'effectiveEnd',
      type: 'date',
      label: 'Effective End',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      sortable: true,
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
      key: 'excludeTags',
      type: 'multiSelect',
      label: 'Exclude Tags',
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
  ];

  return {
    fieldsLayout,
    dataFields,
    recordValue,
    tagLabel,
  };
}
