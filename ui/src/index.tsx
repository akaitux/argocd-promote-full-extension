import * as React from 'react';
//import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';

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
