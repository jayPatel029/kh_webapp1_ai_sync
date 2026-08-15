import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoCollapseTextarea from '../components/AutoCollapseTextarea';

describe('AutoCollapseTextarea', () => {
  it('expands while focused and collapses after blur', () => {
    const { getByRole } = render(
      <AutoCollapseTextarea aria-label="Notes" value="Draft note" onChange={() => {}} />
    );
    const textarea = getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveStyle({ height: '36px' });

    fireEvent.focus(textarea);
    expect(textarea).toHaveStyle({ height: '78px' });

    fireEvent.blur(textarea);
    expect(textarea).toHaveStyle({ height: '36px' });
  });
});
