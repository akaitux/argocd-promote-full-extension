import * as React from 'react';
import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';

export const Extension = (props: { tree: any; resource: any}) => {
    <div>Hello YOYO {props.resource.metadata.name}!</div>
    console.log("YOOOOOOOO")
};

export const component = Extension;

// Register the component extension in ArgoCD
((window: any) => {
  window?.extensionsAPI?.registerResourceExtension(
    component,
    "*",
    "Rollout",
    "Metrics",
    { icon: "fa fa-chart-area" }
  );
  window?.extensionsAPI?.registerResourceExtension(component, '', 'Pod', 'Metrics', { icon: "fa fa-chart-area" });
  window?.extensionsAPI?.registerResourceExtension(component, '*', 'Deployment', 'Metrics', { icon: "fa fa-chart-area" });
})(window);
