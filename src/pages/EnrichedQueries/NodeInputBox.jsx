import { RichTextarea } from 'rich-textarea';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  size,
  useDismiss,
  useId,
  useInteractions,
  useListNavigation,
  useRole,
  flip, useFloating,
} from '@floating-ui/react';

import { useQuery } from '../../hooks/use-query';
import nameLookup from './name-resolver';

export default function NodeInputBox({ onCurieListChange, inputNodeTaxa, inputNodeType }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [validNames, setValidNames] = useState(new Map());

  useEffect(() => {
    const curies = value
      .split('\n')
      .map((line) => validNames.get(line))
      .filter((line) => line !== undefined);
    onCurieListChange(curies);
  }, [value, validNames, onCurieListChange]);

  const [selection, setSelection] = useState({
    top: 0, left: 0, selectionStart: 0, selectionEnd: 0,
  });

  const listRef = useRef([]);

  const { refs, floatingStyles, context } = useFloating({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [
      flip(),
      size({
        padding: 16,
        apply({ availableHeight, availableWidth, elements }) {
          elements.floating.style.maxHeight = `${availableHeight}px`;
          elements.floating.style.maxWidth = `${availableWidth}px`;
        },
      }),
    ],
  });

  const role = useRole(context, { role: 'listbox' });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    openOnArrowKeyDown: false,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav],
  );

  const getCurrentLineIndex = useCallback(
    () => value.slice(0, selection.selectionStart).split('\n').length - 1,
    [value, selection],
  );

  useEffect(() => {
    refs.setPositionReference({
      getBoundingClientRect: () => ({
        x: 0,
        y: 0,
        top: selection.top,
        left: selection.left,
        bottom: selection.top + 20,
        right: selection.left,
        width: 0,
        height: 20,
      }),
    });
  }, [selection, refs]);

  const currentLineText = useMemo(() => {
    const currentLineIndex = getCurrentLineIndex();
    return value.split('\n')[currentLineIndex];
  }, [getCurrentLineIndex, value]);

  const {
    data: options,
    isLoading,
  } = useQuery({
    queryFn: async (signal) => {
      if (currentLineText.length === 0) return [];
      return nameLookup({
        signal,
        name: currentLineText,
        taxaFilter: inputNodeTaxa.trim().split(',').map(((t) => t.trim())),
        biolinkTypeFilter: inputNodeType,
      });
    },
    debounceMs: 250,
    queryKey: `${currentLineText}-${inputNodeTaxa}-${inputNodeType}`,
    keepStaleData: true,
  });

  function handleSelectItem() {
    setActiveIndex(null);
    setOpen(false);

    if (!options || options.length === 0 || activeIndex === null) return;

    const selectedOption = options[activeIndex];

    setValidNames((prev) => {
      const nextMap = new Map(prev);
      nextMap.set(selectedOption.label, selectedOption.curie);
      return nextMap;
    });

    setValue((prev) => {
      const lines = prev.split('\n');
      const currentLineIndex = getCurrentLineIndex();
      lines[currentLineIndex] = selectedOption.label;
      return lines.join('\n');
    });
  }

  return (
    <div>
      {/* REFERENCE */}
      <span
        style={{
          fontSize: '14px',
          color: '#626262',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          paddingLeft: '8px',
        }}
      >
        Input nodes
      </span>
      <RichTextarea
        style={{
          padding: '8px',
          border: '1px solid #9F9F9F',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '100%',
          fontSize: '16px',
        }}
        rows={10}
        autoHeight
        onSelectionChange={setSelection}
        {...getReferenceProps({
          value,
          onChange: (e) => {
            setValue(e.target.value);
          },
          'aria-autocomplete': 'list',
          onKeyDown: (e) => {
            if (open) {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSelectItem();
              }
            }

            const noModifiers = !e.ctrlKey && !e.altKey && !e.metaKey;

            if (
              (e.ctrlKey && e.code === 'Space') ||
              (noModifiers && e.key.length === 1 && e.key.match(/\S| /))
            ) {
              setOpen(true);
            }
          },
        })}
      >
        {(content) => content.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            <span
              style={
                validNames.has(line)
                  ? { backgroundColor: '#95FA7F' }
                  : { backgroundColor: '#F09C97' }
              }
            >
              {`${line}\n`}
            </span>
          </React.Fragment>
        ))}
      </RichTextarea>

      {/* FLOATING */}
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  border: '1px solid #9F9F9F',
                  borderRadius: '4px',
                  overflow: 'auto',
                  boxShadow:
                    '0px 2px 2px rgba(0 0 0 / 0.25), 0px 4px 4px rgba(0 0 0 / 0.25)',
                  ...floatingStyles,
                },
              })}
            >
              {isLoading && (
                <div style={{ padding: '2px 8px', fontStyle: 'italic' }}>
                  Loading&hellip;
                </div>
              )}
              {options === null || (options.length === 0 && !isLoading) ? (
                <div style={{ padding: '2px 8px' }}>
                  No matching results, please try a different query
                </div>
              ) : (
                <>
                  {Boolean(options) && options.map((option, i) => (
                    <Item
                      {...getItemProps({
                        ref(node) {
                          listRef.current[i] = node;
                        },
                        onClick() {
                          handleSelectItem();
                        },
                      })}
                      key={option.curie}
                      active={activeIndex === i}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '16px',
                        }}
                      >
                        <span>{option.label}</span>
                        <span style={{ fontFamily: 'monospace' }}>
                          {option.curie}
                        </span>
                      </div>
                    </Item>
                  ))}
                </>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}

const Item = React.memo(
  forwardRef(
    ({ children, active, ...rest }, ref) => {
      const id = useId();
      return (
        <div
          ref={ref}
          role="option"
          id={id}
          aria-selected={active}
          {...rest}
          style={{
            background: active ? '#D9D9D9' : 'none',
            padding: '2px 8px',
            cursor: 'pointer',
            ...rest.style,
          }}
        >
          {children}
        </div>
      );
    },
  ),
);
