import React, {
  useState, useEffect, useContext,
} from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';
import strings from '~/utils/stringUtils';
import useDebounce from '~/utils/useDebounce';

import fetchCuries from '~/utils/fetchCuries';

import './nodeSelector.css';

/**
 * Generic node selector component
 * @param {object} queryBuilder query builder custom hook
 * @param {string} edgeId edge id that we'll use to look up a specific node in the query graph
 * @param {string} type either subject or object to specify which id to look at on the edge
 * @param {object} nodeOptions node selector cannot create a brand new node
 * @param {boolean} nodeOptions.includeCuries node selector can include curies for a new node
 * @param {boolean} nodeOptions.includeExistingNodes node selector can include existing nodes
 * @param {boolean} nodeOptions.includeCategories node selector can include general categories
 */
export default function NodeSelector({
  nodeOptions = {}, node, nodeId,
  updateEdge, updateNode,
}) {
  const {
    includeCuries = true, includeExistingNodes = true,
    existingNodes,
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
   */
  async function getOptions() {
    toggleLoading(true);
    const newOptions = [];
    // allow user to select an existing node
    if (includeExistingNodes) {
      newOptions.push(...existingNodes);
    }
    // add general concepts to options
    if (includeCategories) {
      const includedCategories = concepts.filter(
        (category) => category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      ).map((category) => (
        {
          category: [category],
          name: strings.displayCategory(category),
        }
      ));
      newOptions.push(...includedCategories);
    }
    // fetch matching curies from external services
    if (includeCuries && searchTerm.length > 3) {
      const fetchedCuries = await fetchCuries(debouncedSearchTerm, displayAlert);
      newOptions.push(...fetchedCuries);
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
    if (v && 'key' in v) {
      // key will only be in v when switching to existing node
      updateEdge(v.key);
    } else {
      // updating a node value
      updateNode(nodeId, v);
    }
  }

  return (
    <Autocomplete
      options={options}
      loading={loading}
      className="nodeSelector"
      getOptionLabel={getOptionLabel}
      clearOnBlur={false}
      blurOnSelect
      disableClearable={!clearable}
      value={node.category.length ? node : null}
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
          // variant={includeExistingNodes ? 'filled' : 'outlined'}
          label={nodeId}
          margin="dense"
          InputProps={{
            ...params.InputProps,
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
