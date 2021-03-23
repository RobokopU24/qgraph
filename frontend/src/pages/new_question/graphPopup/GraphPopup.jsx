import React from 'react';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';

export default function GraphPopup({ popup, close }) {
  const { x = 0, y = 0 } = popup.pos || {};
  return (
    <>
      <div id="graphPopupLoc" style={{ position: 'absolute', top: y - 50, left: x - 30 }} />
      <Popper
        open={Boolean(popup.msg)}
        anchorEl={document.getElementById('graphPopupLoc')}
        placement="top-start"
      >
        <ClickAwayListener onClickAway={close}>
          <Paper>
            {popup.msg}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
