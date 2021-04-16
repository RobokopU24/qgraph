import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';
import strings from '~/utils/strings';
import useDebounce from '~/stores/useDebounce';

import fetchCuries from '~/utils/fetchCuries';
import highlighter from '~/utils/d3/highlighter';

/**
 * Generic node selector component
 * @param {object} node node object from query graph
 * @param {string} nodeId node id
 * @param {boolean} original is node the original or a reference
 * @param {function} changeNode function to change node reference
 * @param {function} updateNode function to update node object
 * @param {object} nodeOptions node selector cannot create a brand new node
 * @param {boolean} nodeOptions.includeCuries node selector can include curies for a new node
 * @param {boolean} nodeOptions.includeExistingNodes node selector can include existing nodes
 * @param {boolean} nodeOptions.includeCategories node selector can include general categories
 */
export default function NodeSelector({
  id, properties, original,
  changeReference, update,
  options: nodeOptions = {},
}) {
  const {
    includeCuries = true, includeExistingNodes = true,
    existingNodes = [],
    includeCategories = true, clearable = true,
  } = nodeOptions;
  const [loading, toggleLoading] = useState(false);
  const [searchTerm, updateSearchTerm] = useState('');
  const [open, toggleOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const displayAlert = useContext(AlertContext);
  const { concepts } = useContext(BiolinkContext);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /**
   * Get dropdown options for node selector
   *
   * Uses options:
   * - includeExistingNodes
   * - includeCategories
   * - includeCuries
   *
   * Sets new dropdown options
   */
  async function getOptions() {
    toggleLoading(true);
    const newOptions = original ? [] : [{ name: 'Turn into new term', key: null }];
    // allow user to select an existing node
    if (includeExistingNodes) {
      newOptions.push(...existingNodes);
    }
    // add general concepts to options
    if (includeCategories) {
      const includedCategories = concepts.filter(
        (category) => category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ).flatMap((category) => (
        [
          {
            category: [category],
            name: strings.displayCategory(category),
          },
          {
            category: [category],
            name: strings.setify(category),
            is_set: true,
          },
        ]
      ));
      newOptions.push(...includedCategories);
    }
    // fetch matching curies from external services
    if (includeCuries && debouncedSearchTerm.length > 3) {
      if (debouncedSearchTerm.includes(':')) { // user is typing a specific curie
        newOptions.push({ name: debouncedSearchTerm, id: debouncedSearchTerm });
      } else {
        const fetchedCuries = await fetchCuries(debouncedSearchTerm, displayAlert);
        newOptions.push(...fetchedCuries);
      }
    }
    toggleLoading(false);
    setOptions(newOptions);
  }

  useEffect(() => {
    if (open) {
      getOptions();
    } else {
      setOptions([]);
    }
  }, [open, debouncedSearchTerm]);

  /**
   * Create a human-readable label for every option
   * @param {object} opt autocomplete option
   * @returns {string} Label to display
   */
  function getOptionLabel(opt) {
    let label = '';
    if (opt.key) {
      label += `${opt.key}: `;
    }
    if (opt.name) {
      return label + opt.name;
    }
    if (opt.id && Array.isArray(opt.id) && opt.id.length) {
      return label + opt.id.join(', ');
    }
    if (opt.category && Array.isArray(opt.category)) {
      if (opt.category.length) {
        return label + opt.category.join(', ');
      }
      return `${label} Any`;
    }
    return '';
  }

  /**
   * Update query graph based on option selected
   * @param {*} e click event
   * @param {object|null} v value of selected option
   */
  function handleUpdate(e, v) {
    // reset search term back when user selects something
    updateSearchTerm('');
    if (v && 'key' in v) {
      // key will only be in v when switching to existing node
      changeReference(v.key);
    } else {
      // updating a node value
      update(id, v);
    }
  }

  const nodeValue = useMemo(() => (
    (properties.category && properties.category.length && properties) ||
    (properties.id && properties.id.length && properties) ||
    null
  ), [properties]);

  return (
    <Autocomplete
      options={options}
      loading={loading}
      className={`textEditorSelector${original ? '' : ' referenceNode'} highlight-${id}`}
      getOptionLabel={getOptionLabel}
      autoComplete
      autoHighlight
      clearOnBlur
      blurOnSelect
      disableClearable={!clearable}
      inputValue={searchTerm}
      value={nodeValue}
      getOptionSelected={(option, value) => option.name === value.name}
      open={open}
      onChange={handleUpdate}
      onOpen={() => toggleOpen(true)}
      onClose={() => toggleOpen(false)}
      onInputChange={(e, v) => updateSearchTerm(v)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          className="nodeDropdown"
          label={id}
          margin="dense"
          onFocus={() => {
            highlighter.highlightGraphNode(id);
            highlighter.highlightTextEditorNode(id);
          }}
          onBlur={() => {
            highlighter.clearGraphNode(id);
            highlighter.clearTextEditorNode(id);
          }}
          InputProps={{
            ...params.InputProps,
            classes: {
              root: `nodeSelector nodeSelector-${id}`,
            },
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      size="medium"
    />
  );
}
