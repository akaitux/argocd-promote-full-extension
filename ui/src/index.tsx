import * as React from 'react';
import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';

export const Extension = (props: { tree: any; resource: any}) => {
    <div>Hello YOYO {props.resource.metadata.name}!</div>
    console.log("YOOOOOOOO")
};

export const component = Extension;
