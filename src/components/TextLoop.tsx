import {
  forwardRef,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { animated, config, useTransition } from 'react-spring';
import { useTimeout } from '../hooks/timeout';

type SpanProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

export type TextLoopProps = {
  texts: string[];
  interval: number;
} & Omit<SpanProps, 'children'>;

type State = {
  texts: string[];
  current: string;
};

type Action = {
  type: 'next';
};

export const TextLoop = forwardRef<HTMLSpanElement, TextLoopProps>(
  function TextLoop(props, ref) {
    const {
      texts: [next, ...rest],
      interval,
      style: rootReceivedStyle,
      ...rootProps
    } = props;

    const containerRef = useRef<HTMLSpanElement | null>(null);
    const textContainerRef = useRef<HTMLSpanElement | null>(null);

    const { requestTimeout, removeTimeout } = useTimeout();

    const [{ current }, dispatch] = useReducer<Reducer<State, Action>>(
      (prev, act) => {
        if (act.type === 'next') {
          const [next, ...rest] = prev.texts;
          return {
            texts: [...rest, next],
            current: next,
          };
        }

        return prev;
      },
      {
        texts: [...rest, next],
        current: next,
      }
    );

    const getTextBounding = useCallback(
      () =>
        textContainerRef.current
          ? textContainerRef.current.getBoundingClientRect()
          : { width: 0, height: 0 },
      []
    );

    const fixParentDimensions = useCallback(() => {
      const { width } = getTextBounding();
      if (containerRef.current) {
        containerRef.current.style.width = `${width}px`;
      }
    }, [getTextBounding]);

    const transitions = useTransition(current, {
      from: () => ({
        opacity: 0,
        translateY: '-100%',
      }),
      enter: () => ({
        opacity: 1,
        translateY: '0%',
      }),
      leave: () => ({
        opacity: 0,
        translateY: '100%',
      }),
      onStart: () => {
        fixParentDimensions();
      },
      config: config.wobbly,
    });

    const tick = useCallback(() => {
      dispatch({ type: 'next' });
      requestTimeout(tick, interval);
    }, [requestTimeout, interval]);

    useEffect(() => {
      requestTimeout(tick, interval);

      return () => {
        removeTimeout();
      };
    }, [requestTimeout, removeTimeout, tick, interval]);

    return (
      <span
        ref={ref}
        style={{
          ...rootReceivedStyle,
          display: 'inline-block',
          position: 'relative',
          verticalAlign: 'top',
        }}
        {...rootProps}
      >
        <span
          ref={containerRef}
          style={{
            display: 'inline-block',
            transition: `width 0.1s linear`,
          }}
        >
          {transitions(({ opacity, translateY }, item) => {
            return (
              <animated.span
                ref={textContainerRef}
                style={{
                  left: 0,
                  top: 0,
                  whiteSpace: 'nowrap',
                  position: 'absolute',
                  opacity,
                  translateY,
                }}
              >
                {item}
              </animated.span>
            );
          })}
        </span>
      </span>
    );
  }
);
