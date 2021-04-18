import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import PlayLists from 'components/PlayLists';

export async function testRenderer() {
  const initialData = {};

  const pageData = {
    title: `Test`,
  };

  return Promise.resolve({
    initialData,
    initialMarkup: ReactDOMServer.renderToString(<PlayLists />),
    pageData,
  });
}
