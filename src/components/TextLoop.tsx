import { animated, SpringConfig, useTransition } from '@react-spring/web';
import {
  forwardRef,
  ReactElement,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { useTimeout } from '../hooks/timeout';

type SpanProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

type LoopElement = ReactElement | string;

export type TextLoopProps = {
  elements: LoopElement[];
  interval: number;
  springConfig?: SpringConfig;
} & Omit<SpanProps, 'children'>;

type State = {
  elements: LoopElement[];
  current: LoopElement;
};

type Action = {
  type: 'next';
};

export const TextLoop = forwardRef<HTMLSpanElement, TextLoopProps>(
  function TextLoop(props, ref) {
    const {
      elements: [next, ...rest],
      interval,
      style: rootReceivedStyle,
      springConfig,
      ...rootProps
    } = props;

    const containerRef = useRef<HTMLSpanElement | null>(null);
    const textContainerRef = useRef<HTMLSpanElement | null>(null);

    const { requestTimeout, removeTimeout } = useTimeout();

    const [{ current }, dispatch] = useReducer<Reducer<State, Action>>(
      (prev, act) => {
        switch (act.type) {
          case 'next':
            const [next, ...rest] = prev.elements;
            return {
              elements: [...rest, next],
              current: next,
            };
        }
      },
      {
        elements: [...rest, next],
        current: next,
      }
    );

    const fixParentDimensions = useCallback(() => {
      if (containerRef.current && textContainerRef.current) {
        const { width } = textContainerRef.current.getBoundingClientRect();
        containerRef.current.style.width = `${width}px`;
      }
    }, []);

    const transitions = useTransition(current, {
      from: () => ({
        opacity: 0,
        translateY: '-50%',
      }),
      enter: () => ({
        opacity: 1,
        translateY: '0%',
      }),
      leave: () => ({
        opacity: 0,
        translateY: '50%',
      }),
      onStart: () => {
        fixParentDimensions();
      },
      config: springConfig,
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
