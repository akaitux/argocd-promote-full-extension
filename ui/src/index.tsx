import * as React from 'react';
import applications from './app/applications';

((window) => {
  const component = applications.component;
  window?.extensionsAPI?.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);
