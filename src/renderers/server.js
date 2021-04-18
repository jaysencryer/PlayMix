import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { App } from 'components/App';

export async function serverRenderer(authToken = false, spotifyProfile = {}) {
  const initialData = {
    appName: 'PlayMix',
    spotAuthorized: authToken,
    spotifyProfile: spotifyProfile,
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
