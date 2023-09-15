import * as React from 'react';
import {ApplicationsContainer} from './applications/components/applications-container';

((window) => {
  const component = ApplicationsContainer;
  window?.extensionsAPI?.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);
