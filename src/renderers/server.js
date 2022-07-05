import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { App } from 'components/App/App';

export async function serverRenderer(sessionData = {}) {
  const initialData = {
    appName: 'PlayMix',
    sessionData,
  };

  const pageData = {
    title: `${initialData.appName}`,
  };

  return Promise.resolve({
    initialData,
    initialMarkup: ReactDOMServer.renderToString(
      <App initialData={initialData} />,
    ),

    pageData,
  });
}
