import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { App } from 'components/App';
import { StaticRouter } from 'react-router-dom';

export async function serverRenderer(
  authToken = false,
  spotifyProfile = {},
  url = '/',
) {
  const initialData = {
    appName: 'PlayMix',
    spotAuthorized: authToken,
    spotifyProfile: spotifyProfile,
  };

  const pageData = {
    title: `${initialData.appName}`,
  };

  const context = {};

  return Promise.resolve({
    initialData,
    initialMarkup: ReactDOMServer.renderToString(
      <App initialData={initialData} />,
    ),
    pageData,
  });
}
