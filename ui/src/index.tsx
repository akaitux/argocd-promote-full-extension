import * as React from 'react';
import applications from './app/applications';

((window) => {
  const componentt = () => {
    return applications.component;
  };
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
