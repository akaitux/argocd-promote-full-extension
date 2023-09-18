import * as React from "react";
import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';
import {useEffect, useState} from 'react';
import {Form, FormApi} from 'react-form';
import Moment from "react-moment";
import { ApplicationSet } from "./models/applicationset";
import { Application, ResourceAction, ResourceRef, ApplicationStatus} from "./models/models";
import { HealthStatus, Tree } from "./models/tree";
import {combineLatest, from, merge, Observable} from 'rxjs';
import {services} from "./lib/applications-service"
import {getAppDefaultSource} from "./lib/utils"
import {ApplicationManualSyncFlags, ApplicationSyncOptions, FORCE_WARNING, SyncFlags} from './lib/application-sync-options';

const MAP_STATUS = {
  Healthy: { name: "fa-heart", spin: false, color: "rgb(24, 190, 148)" },
  Progressing: {
    name: "fa-circle-notch",
    spin: true,
    color: "rgb(13, 173, 234)",
  },
  Degraded: {
    name: "fa-heart-broken",
    spin: false,
    color: "rgb(233, 109, 118)",
  },
  Suspended: {
    name: "fa-pause-circle",
    spin: false,
    color: "rgb(118, 111, 148)",
  },
  Missing: { name: "fa-ghost", spin: false, color: "rgb(244, 192, 48)" },
  OutOfSync: { name: "fa-arrow-alt-circle-up", spin: false, color: "rgb(244, 192, 48)" },
  Unknown: {
    name: "fa-question-circle",
    spin: false,
    color: "rgb(204, 214, 221)",
  },
};


enum AppAction {PROMOTE, SYNC, REFRESH}


function renderAppStatus(app: Application) {
    var state: any
    if (app.status.sync.status === "OutOfSync")  {
        state = MAP_STATUS['OutOfSync']
    } else {
        state = MAP_STATUS[app.status.health.status]
    }
    return (
        <div style={{ fontSize: ".8em" }}>
          <i
            qe-id="utils-health-status-title"
            title={app.status.health.status}
            className={`fa ${state.name}`}
            style={{ color: state.color, marginRight: "0.3rem" }}
          ></i>
          <a href={`/applications/${app.metadata.name}`} title="Open application">
            <i className="fa fa-external-link-alt"></i>
          </a>
        </div>
    )

}

async function getApplications(nodes: ResourceRef[]) {
  var applications = new Array<Application>();
  for (const node of nodes) {
        let application = await services.applications.get(node.name, node.namespace).catch(e => {
            console.log(e);

        });
        if (application) {
            applications.push(application);
        }
    }
    return applications
}


async function refreshAll(apps: Application[]) {
    if (apps.length === 0) {
        //ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
        console.log("No apps selected")
        return;
    }
    await doAppsAction(apps, AppAction.REFRESH)
}




async function promoteAll(apps: Application[]) {
    if (apps.length === 0) {
        //ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
        console.log("No apps selected")
        return;
    }
    await doAppsAction(apps, AppAction.PROMOTE)
}


async function doAppsAction(apps: Application[], action: AppAction) {
    if (apps.length === 0) {
        //ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
        console.log("No apps selected")
        return;
    }
    console.log("Apps for promote:")
    console.log(apps)
    const actions = [];
    for (const app of apps) {
        const resourcesTree = await services.applications.resourceTree(app.metadata.name, app.metadata.namespace).catch(e => {
            // ctx.notifications.show({
            //     content: <ErrorNotification title={`Error while fetch resource tree ${app.metadata.name}`} e={e} />,
            //     type: NotificationType.Error
            // });
            console.log('Error while fetch resource tree', e)
        });
        if (! resourcesTree) {
            console.log("Empty node tree for app", app.metadata.name)
            continue
        }
        if (! resourcesTree.nodes) {
            console.log("No nodes in app", app.metadata.name)
            continue
        }
        for (const node of resourcesTree.nodes ) {
            if (node.kind === "Rollout") {
                var fn: Promise<any>;
                const promise = async () => {
                    switch (action) {
                        case AppAction.PROMOTE:
                            fn = services.applications.runResourceAction(
                            app.metadata.name,
                            app.metadata.namespace,
                            node,
                            "promote-full");
                            break;
                        case AppAction.REFRESH:
                            fn = services.applications.get(
                                app.metadata.name,
                                app.metadata.namespace,
                                'hard' );
                            break;
                        case AppAction.SYNC:
                            console.log("SYNC NOT REALIZED");
                            break;
                    }
                    console.log(fn);
                    await fn.catch(e => {
                        // ctx.notifications.show({
                        //     content: <ErrorNotification title={`Unable to promote ${app.metadata.name}`} e={e} />,
                        //     type: NotificationType.Error
                        // });
                        console.log("Error in action, ", app.metadata.name, e)
                    })
                }
                actions.push(promise());
            }
        }
        await Promise.all(actions);
    }
}


async function syncAll(apps: Application[]) {
    if (apps.length === 0) {
        //ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
        console.log("No apps selected")
        return;
    }
    await doAppsAction(apps, AppAction.SYNC)
}


export const Extension = (props: { tree: Tree; resource: ApplicationSet }) => {

  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => {
    const intervalId = setInterval(() => {
        var appset_apps = props.tree.nodes.filter((item) =>
          // filter the one owned by the ApplicationSet
          item.parentRefs?.find(
            (parentRef) => parentRef.uid === props.resource.metadata.uid
          )
        );
        const fetchData = async () => {
          await getApplications(appset_apps).then(res => {
             setApps(res);
           });
        };
        fetchData();
    }, 1000)
    return () => clearInterval(intervalId);
  }, []);

  if (apps) {
    return <Child tree={props.tree} resource={props.resource} applications={apps}/>
  }
}


export const Child = (props: {tree: Tree, resource: ApplicationSet, applications: Application[]}) => {

    const [refreshForm, refreshSetForm] = React.useState<FormApi>(null);
    const [syncForm, syncSetForm] = React.useState<FormApi>(null);
    const [promoteForm, promoteSetForm] = React.useState<FormApi>(null);
    return (
      <div>
        <div
          style={{
            background: "#fff",
            width: "100%",
            boxShadow: "1px 1px 1px #ccd6dd",
            borderRadius: "4px",
            border: "1px solid transparent",
          }}
        >
          {
          }
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            {Object.keys(MAP_STATUS).map((key: HealthStatus) => (
                  <div
                    style={{
                      margin: "1rem",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <i
                      qe-id="utils-health-status-title"
                      title={key}
                      className={`fa ${MAP_STATUS[key].name}`}
                      style={{
                        color: MAP_STATUS[key].color,
                        marginBottom: "0.50rem",
                      }}
                    ></i>
                    {key}: {
                       props.applications.filter((item) => item.status.health.status == key).length
                   }
                  </div>
            ))}
          </div>
        </div>

    <br/>
    <button
        className='argo-button argo-button--base'
        onClick={() => refreshAll(props.applications)}
    >
        Refresh All
    </button>{' '}
    <button
        className='argo-button argo-button--base'
        onClick={() => promoteAll(props.applications)}
    >
        Promote All
    </button>{' '}
    <button
        className='argo-button argo-button--base'
        onClick={() => syncAll(props.applications)}
    >
        Promote All
    </button>{' '}
    <Form
        onSubmit={async (params: any) => { refreshAll(props.applications) }}
        getApi={refreshSetForm}>
        {formApi => (
            <React.Fragment>
            </React.Fragment>
        )}
    </Form>



    <div style={{ display: "flex", flexDirection: "column", width: "40%" }}>
    {props.applications.map((item) => (
          <div
            title={`Kind: Application Namespace: ${item.metadata.namespace} Name: ${item.metadata.name}`}
            style={{
              marginTop: "2rem",
              padding: "0.2rem",
              boxShadow: "1px 1px 1px #ccd6dd",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: "#fff",
              color: "#363c4a",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "60px",
                flexGrow: "1",
                color: "#495763",
                textAlign: "center",
              }}
            >
              <i title="Application" className="icon argo-icon-application"></i>
              <br />
              <div style={{ fontSize: ".7em", color: "#6d7f8b" }}>
                application
              </div>
            </div>
            <div
              style={{
                flexGrow: "100",
                padding: "10px 20px 10px 10px",
                lineHeight: ".95",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: ".8em",
                  paddingBottom: "5px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "left",
                }}
              >
                {item.metadata.name}
              </div>
                {renderAppStatus(item)}
            </div>
            <div style={{ flexGrow: "1", alignSelf: "flex-end" }}>
              {  item.metadata.creationTimestamp ? (
                <Moment
                  style={{
                    backgroundColor: "#ccd6dd",
                    color: "#495763",
                    border: "1px solid #8fa4b1",
                    borderRadius: "5px",
                    padding: "0 5px",
                    fontSize: ".6em",
                    textTransform: "lowercase",
                    marginRight: "1px",
                  }}
                  fromNow={true}
                  ago={true}
                >
                  {item.metadata.creationTimestamp}
                </Moment>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
    );
};

export const component = Extension;

