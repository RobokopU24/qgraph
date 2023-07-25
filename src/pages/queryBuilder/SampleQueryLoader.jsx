import React, { useContext } from 'react';
import {
  Button, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper,
} from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import samples from '../../sample-queries.json';

import QueryBuilderContext from '~/context/queryBuilder';

export default function SampleQueryLoader() {
  const queryBuilder = useContext(QueryBuilderContext);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleMenuItemClick = (_, index) => {
    queryBuilder.dispatch({ type: 'saveGraph', payload: samples[index].query });
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        endIcon={<ArrowDropDown />}
        onClick={handleToggle}
        variant="outlined"
        aria-controls={open ? 'sample-query-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="menu"
      >
        Load Sample Query
      </Button>
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'right bottom',
            }}
          >
            <Paper elevation={4}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="sample-query-menu" autoFocusItem>
                  {samples.map((sample, index) => (
                    <MenuItem
                      key={sample.name}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {sample.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
