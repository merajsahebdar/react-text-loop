import createMockRaf, { MockRaf } from '@react-spring/mock-raf';
import { raf, __raf } from '@react-spring/rafz';
import { Globals } from '@react-spring/web';
import { render, screen } from '@testing-library/react';
import { TextLoop } from '../TextLoop';

let mockRaf: MockRaf;

beforeEach(() => {
  mockRaf = createMockRaf();

  Globals.assign({
    now: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    skipAnimation: true,
  });

  raf.use(mockRaf.raf);
  __raf.clear();
});

describe('text-loop', () => {
  it('render', async () => {
    const advanceStep = () => {
      mockRaf.step({
        time: 1000,
        count: 1,
      });
    };

    render(
      <TextLoop
        elements={[
          'Tomato Soup',
          <span style={{ color: 'brown' }}>Coffee</span>,
          'Chicken Salad',
          'French Onion Soup',
        ]}
        interval={1000}
      />
    );

    const firstElement = screen.getByText(/tomato soup/i);
    expect(firstElement).toBeInTheDocument();

    advanceStep();

    const secondElement = await screen.findByText(/coffee/i);
    expect(firstElement).not.toBeInTheDocument();
    expect(secondElement).toBeInTheDocument();
    expect(secondElement).toHaveStyle('color: brown;');

    advanceStep();

    const thirdElement = await screen.findByText(/chicken salad/i);
    expect(secondElement).not.toBeInTheDocument();
    expect(thirdElement).toBeInTheDocument();

    advanceStep();

    const fourthElement = await screen.findByText(/french onion soup/i);
    expect(thirdElement).not.toBeInTheDocument();
    expect(fourthElement).toBeInTheDocument();

    advanceStep();

    const secondLoopFirstElement = await screen.findByText(/tomato soup/i);
    expect(fourthElement).not.toBeInTheDocument();
    expect(secondLoopFirstElement).toBeInTheDocument();
  });
});
