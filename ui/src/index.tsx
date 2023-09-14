import * as React from 'react';
import {ApplicationsContainer} from './app/applications/components/applications-container';

const componentt = () => {
    return ApplicationsContainer;
};

((window) => {
  const component = () => {
    return React.createElement(
      "div",
      { style: { padding: "10px" } },
      "Hello World"
    );
  };
  window?.extensionsAPI?.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);

