import * as React from 'react';
import { StaticRouter, Switch, Route } from 'react-router-dom';

import Header from './Header';
import ConnectSpotify from './ConnectSpotify';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized } = initialData;
  return (
    <StaticRouter>
      <div>
        <h1>PlayMix</h1>
        {spotAuthorized || (
          <>
            <p>To use this app you must connect to spotify</p>
            <ConnectSpotify />
          </>
        )}
        {spotAuthorized && (
          <>
            <Header />
            <Switch>
              <Route exact path="/">
                <p>Yay! Spotify connected. Welcome to PlayMix</p>
              </Route>
            </Switch>
          </>
        )}
      </div>
    </StaticRouter>
  );
}
