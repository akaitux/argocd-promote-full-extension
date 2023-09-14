import * as React from 'react';
import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';

export const Extension = (props: { tree: any; resource: any}) => {
    <div>Hello YOYO {props.resource.metadata.name}!</div>
};

export const component = Extension;

// Register the component extension in ArgoCD
((window: any) => {
  window?.extensionsAPI?.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);
