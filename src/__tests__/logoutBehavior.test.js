/** @jest-environment node */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AppLogout from '../components/logout/Logout';

describe('AppLogout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children without enforcing an idle logout', () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    const markup = renderToStaticMarkup(
      <AppLogout>
        <div>Protected content</div>
      </AppLogout>
    );

    expect(markup).toContain('Protected content');
    expect(debugSpy).toHaveBeenCalledWith(
      '[auth] AppLogout wrapper mounted; inactivity logout is disabled.'
    );
  });
});