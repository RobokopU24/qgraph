/* eslint-disable no-restricted-syntax */
import React, { useContext } from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import QueryBuilderContext from '~/context/queryBuilder';

const flattenTree = (root, includeMixins) => {
  const items = [root];
  if (root.children) {
    for (const child of root.children) {
      items.push(...flattenTree(child, includeMixins));
    }
  }
  if (root.mixinChildren && includeMixins === true) {
    for (const mixinChild of root.mixinChildren) {
      items.push(...flattenTree(mixinChild, includeMixins));
    }
  }
  return items;
};

const getQualifierOptions = ({ range, subpropertyOf }) => {
  const options = [];

  if (range) {
    if (range.permissible_values) {
      options.push(...Object.keys(range.permissible_values));
    } else {
      options.push(...flattenTree(range).map(({ name }) => name));
    }
  }

  if (subpropertyOf) {
    options.push(...flattenTree(subpropertyOf).map(({ name }) => name));
  }

  return options;
};

// const getBestAssociationOption = (associationOptions) => {
//   let best = null;
//   for (const opt of associationOptions) {
//     if (opt.qualifiers.length > (best.length || 0)) best = opt;
//   }
//   return best;
// };

export default function QualifiersSelector({ id, associations }) {
  const queryBuilder = useContext(QueryBuilderContext);

  const associationOptions = associations
    .filter((a) => a.qualifiers.length > 0)
    .map(({ association, qualifiers }) => ({
      name: association.name,
      uuid: association.uuid,
      qualifiers: qualifiers.map((q) => ({
        name: q.qualifier.name,
        options: getQualifierOptions(q),
      })),
    }));

  const [value, setValue] = React.useState(associationOptions[0] || null);
  const [qualifiers, setQualifiers] = React.useState({});
  React.useEffect(() => {
    queryBuilder.dispatch({ type: 'editQualifiers', payload: { id, qualifiers } });
  }, [qualifiers]);

  if (associationOptions.length === 0) return null;
  if (associationOptions.length === 1 && associationOptions[0].name === 'association') return null;

  return (
    <details>
      <summary>Qualifiers</summary>
      <div className="qualifiers-dropdown">
        <Autocomplete
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
          }}
          disableClearable
          size="small"
          options={associationOptions}
          getOptionLabel={(option) => option.name}
          getOptionSelected={(opt, val) => opt.uuid === val.uuid}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Association" variant="outlined" />}
        />

        <hr />

        {
          value.qualifiers.map(({ name, options }) => (
            <Autocomplete
              key={name}
              value={qualifiers[name] || null}
              onChange={(_, newValue) => {
                if (newValue === null) {
                  setQualifiers((prev) => {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                  });
                } else { setQualifiers((prev) => ({ ...prev, [name]: newValue || null })); }
              }}
              options={options}
              style={{ width: 300 }}
              renderInput={(params) => <TextField {...params} label={name} variant="outlined" />}
              size="small"
            />
          ))
        }
      </div>

    </details>
  );
}
