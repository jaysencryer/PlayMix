import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { App } from 'components/App';

export async function serverRenderer(authToken = false) {
  console.log(authToken);
  const initialData = {
    appName: 'PlayMix',
    spotAuthorized: authToken,
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
