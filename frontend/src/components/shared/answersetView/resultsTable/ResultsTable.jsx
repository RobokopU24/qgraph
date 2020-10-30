import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import IconButton from '@material-ui/core/IconButton';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import _ from 'lodash';

import AlertContext from '@/context/alert';

import entityNameDisplay from '@/utils/entityNameDisplay';
import getNodeTypeColorMap from '@/utils/colorUtils';
import Table from './Table';

import './resultsTable.css';

export default function AnswerTable(props) {
  const { messageStore, concepts } = props;
  const [columns, setColumns] = useState([]);

  const displayAlert = useContext(AlertContext);

  const onExpand = useCallback((row) => {
    row.toggleRowExpanded(!row.isExpanded);
  }, []);

  function getReactTableColumnSpec(columnHeaders) {
    const bgColorMap = getNodeTypeColorMap(concepts);
    // Take columnHeaders from store and update it as needed
    const colHeaders = columnHeaders.map((col) => {
      const colSpecObj = _.cloneDeep(col);
      const nodeId = colSpecObj.id;
      if (colSpecObj.isSet) {
        colSpecObj.accessor = (d) => (d[nodeId][0].name ? d[nodeId][0].name : d[nodeId][0].id);
        colSpecObj.style = { cursor: 'pointer', userSelect: 'none' };
        const cellTextFn = (setNodes) => {
          if (!setNodes) {
            return [];
          }
          if (setNodes.length === 1) {
            return setNodes[0].name ? [setNodes[0].name] : [setNodes[0].id];
          }
          return [entityNameDisplay(colSpecObj.type), `[${setNodes.length}]`];
        };
        colSpecObj.Cell = (row) => {
          const setNodes = messageStore.getSetNodes(row.row.index, row.column.id);
          const cellText = cellTextFn(setNodes);
          return (
            <span>
              <span style={{ textAlign: 'center' }}>
                {`${cellText[0]} `}
                {(cellText.length > 1) && (
                  <span style={{ fontWeight: 'bold' }}>{cellText[1]}</span>
                )}
              </span>
              <span className="pull-right">&#x2295;</span>
            </span>
          );
        };
      } else {
        colSpecObj.accessor = (d) => (d[nodeId][0].name ? d[nodeId][0].name : d[nodeId][0].id);
      }
      // this initializes the filter object for all nodes
      colSpecObj.filterable = true;
      colSpecObj.qnodeId = nodeId;
      messageStore.initializeFilter();

      const backgroundColor = bgColorMap(colSpecObj.type);
      const columnHeader = colSpecObj.Header;
      colSpecObj.Header = () => (
        <div style={{ backgroundColor, padding: 2 }}>{columnHeader}</div>
      );
      return colSpecObj;
    });
    colHeaders.unshift({
      // Make an expander cell
      Header: () => null, // No header
      id: 'expander', // It needs an ID
      Cell: ({ row }) => (
        <IconButton onClick={() => onExpand(row)}>
          {row.isExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
        </IconButton>
      ),
      minWidth: 50,
      width: 75,
      maxWidth: 100,
      // filterable: false,
      disableFilters: true,
    });
    // Add Score column at the end
    colHeaders.push({
      Header: 'Rank',
      id: 'score',
      minWidth: 50,
      width: 100,
      maxWidth: 100,
      // filterable: false,
      disableFilters: true,
      accessor: 'score',
      sortType: 'basic',
      Cell: (d) => {
        if (!d.value) {
          return <div className="center">N/A</div>;
        }
        return <div className="center">{parseFloat(Math.round(d.value * 1000) / 1000).toFixed(3)}</div>;
      },
      className: 'center',
    });
    return colHeaders;
  }

  function initializeState(columnHeaders) {
    const columnSpec = getReactTableColumnSpec(columnHeaders);
    setColumns(columnSpec);
  }

  useEffect(() => {
    const { columnHeaders, unknownNodes } = messageStore.answerSetTableData();
    if (unknownNodes) {
      displayAlert('warning', 'There was an error retrieving some of the nodes in this answer. If you would like a complete answer, please try asking this question again.');
    }
    initializeState(columnHeaders);
  }, [messageStore.message]);

  return (
    <>
      {columns.length ? (
        <div id="answerTableContainer">
          <Table
            columns={columns}
            data={messageStore.filteredAnswers}
            messageStore={messageStore}
          />
        </div>
      ) : (
        <div>
          There do not appear to be any answers for this question.
        </div>
      )}
    </>
  );
}
