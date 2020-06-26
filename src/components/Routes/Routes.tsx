import Home from 'pages/Home/Home';
import PageNotFound from 'pages/PageNotFound/PageNotFound';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

const Routes: React.FC = () => (
  <HashRouter>
    <Switch>
      <Route component={Home} exact path="/" />
      <Route component={PageNotFound} />
    </Switch>
  </HashRouter>
);

export default Routes;
