import React, { useState, useEffect, useContext } from 'react';
import ReactTable from 'react-table-6';
import _ from 'lodash';

import BiolinkContext from '~/context/biolink';

import AnswersetGraph from '~/components/shared/graphs/AnswersetGraph';
import getNodeCategoryColorMap from '~/utils/colors';
import getColumnWidth from '~/utils/rtColumnWidth';

import useMessageStore from '~/stores/useMessageStore';

export default function NeightborhoodViewer(props) {
  const { sourceNode } = props;
  const messageStore = useMessageStore();
  const [answers, setAnswers] = useState([]);
  const [columns, setColumns] = useState([]);

  const { concepts } = useContext(BiolinkContext);

  // Filter method for table columns that is case-insensitive, and matches all rows that contain
  // provided sub-string
  function defaultFilterMethod(filter, row, column) { // eslint-disable-line no-unused-vars
    // console.log('filter, row, column', filter, row, column);
    let show = false;
    const key = filter.id;
    if (row[key].toLowerCase().includes(filter.value.toLowerCase())) {
      show = true;
    }
    return show;
  }

  function getReactTableColumnSpec(columnHeaders, data) {
    const bgColorMap = getNodeCategoryColorMap(concepts);
    // Take columnHeaders from store and update it as needed
    const colHeaders = columnHeaders.map((col) => {
      const colSpecObj = _.cloneDeep(col);
      const { id } = colSpecObj;
      colSpecObj.accessor = (d) => d.n01[0][id];
      colSpecObj.width = getColumnWidth(data, colSpecObj.accessor, colSpecObj.Header);
      return colSpecObj;
    });
    // Add Score column at the end
    colHeaders.push({
      Header: 'Rank',
      id: 'score',
      filterable: false,
      accessor: 'score',
      Cell: (d) => <span className="number">{parseFloat(Math.round(d.value * 1000) / 1000).toFixed(3)}</span>,
      className: 'center',
    });
    // Add Color column at the beginning
    colHeaders.unshift({
      Header: '',
      id: 'color',
      width: 10,
      filterable: false,
      accessor: (d) => d.n01[0].color,
      Cell: (d) => <div style={{ backgroundColor: bgColorMap(d.value), width: '100%', height: '100%' }} />,
      className: 'no-padding',
    });
    return colHeaders;
  }

  function initializeState(columnHeaders, newAnswers) {
    const newColumns = getReactTableColumnSpec(columnHeaders, newAnswers);
    setAnswers(newAnswers);
    setColumns(newColumns);
  }

  function openNewNodePage(id) {
    const a = document.createElement('a');
    a.href = `/neighborhood/${id}`;
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  useEffect(() => {
    messageStore.setMessage(props.data);
    const { columnHeaders, answers: newAnswers } = messageStore.getAlphaTable(concepts);
    initializeState(columnHeaders, newAnswers);
  }, []);

  const column = [{
    Header: `Neighbors of ${sourceNode}`,
    columns,
  }];
  return (
    <div style={{ marginBottom: '30px' }}>
      <AnswersetGraph
        messageStore={messageStore}
      />
      <ReactTable
        data={answers}
        columns={column}
        defaultPageSize={10}
        defaultFilterMethod={defaultFilterMethod}
        pageSizeOptions={[5, 10, 15, 20, 25, 30, 50]}
        minRows={10}
        filterable
        className="-highlight neighborhoodViewerReactTable"
        defaultSorted={[
          {
            id: 'score',
            desc: true,
          },
        ]}
        getTrProps={(state, rowInfo) => ({
          onClick: () => {
            openNewNodePage(rowInfo.row.id);
          },
        })}
      />
    </div>
  );
}
