import * as React from "react";
import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';
import {useEffect, useState} from 'react';
import {Form, FormApi} from 'react-form';
import {ProgressPopup} from './lib/components/progress/progress-popup'
import Moment from "react-moment";
import { ApplicationSet } from "./models/applicationset";
import { Application, ApplicationTree, ResourceRef, ApplicationStatus} from "./models/models";
import { HealthStatus, Tree } from "./models/tree";
import {combineLatest, from, merge, Observable} from 'rxjs';
import {services} from "./lib/applications-service"

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
  Unknown: {
    name: "fa-question-circle",
    spin: false,
    color: "rgb(204, 214, 221)",
  },
};


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

export const Extension = (props: { tree: Tree; resource: ApplicationSet }) => {

  const [apps, setApps] = useState<Application[]>([]);
  useEffect(() => {
    var items = props.tree.nodes.filter((item) =>
      // filter the one owned by the ApplicationSet
      item.parentRefs?.find(
        (parentRef) => parentRef.uid === props.resource.metadata.uid
      )
    );
    const fetchData = async () => {
      await getApplications(items).then(res => {
         setApps(res);
       });
    };
    fetchData();
  }, []);

  if (apps) {
    return <Child tree={props.tree} resource={props.resource} applications={apps}/>
  }
}

interface Progress {
    percentage: number;
    title: string;
}


export const Child = (props: {tree: Tree, resource: ApplicationSet, applications: Application[]}) => {

    const [form, setForm] = React.useState<FormApi>(null);
    const [progress, setProgress] = React.useState<Progress>(null);
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

    <button className='argo-button argo-button--base' onClick={() => form.submitForm(null)}>
        Promote-Full
    </button>{' '}

    // <Form
    //     onSubmit={async (params: any) => {
    //         const selectedApps = props.applications;
    //         if (selectedApps.length === 0) {
    //             //ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
    //             console.log("No apps selected")
    //             return;
    //     }
    //
    //     setProgress({percentage: 0, title: 'Promote-Full applications'});
    //     let i = 0;
    //     const promoteActions = [];
    //     for (const app of selectedApps) {
    //         console.log("Selected app", app);
    //         const resourcesTree = await services.applications.resourceTree(app.metadata.name, app.metadata.namespace).catch(e => {
    //             // ctx.notifications.show({
    //             //     content: <ErrorNotification title={`Error while fetch resource tree ${app.metadata.name}`} e={e} />,
    //             //     type: NotificationType.Error
    //             // });
    //               console.log("Error while fetch resource tree", e)
    //         });
    //
    //         // for (const resource of resourcesTree) {
    //         //     for (const node of resource.nodes ) {
    //         //         if (node.kind === "Rollout") {
    //         //             const promoteAction = async () => {
    //         //                 await services.applications.runResourceAction(app.metadata.name, app.metadata.namespace, node, "promote-full").catch(e => {
    //         //                     // ctx.notifications.show({
    //         //                     //     content: <ErrorNotification title={`Unable to promote ${app.metadata.name}`} e={e} />,
    //         //                     //     type: NotificationType.Error
    //         //                     // });
    //         //                   console.log("Unable to promote", e)
    //         //                 });
    //         //                 i++;
    //         //                 setProgress({
    //         //                     percentage: i / selectedApps.length,
    //         //                     title: `Promoted ${i} of ${selectedApps.length} applications`
    //         //                 });
    //         //             };
    //         //             promoteActions.push(promoteAction());
    //         //
    //         //         }
    //         //     }
    //         //
    //         // }
    //
    //         // if (promoteActions.length >= 20) {
    //         //     await Promise.all(promoteActions);
    //         //     promoteActions.length = 0;
    //         // }
    //     }
    //     // await Promise.all(promoteActions);
    //     // setProgress({percentage: 100, title: 'Complete'});
    // }}
    // getApi={setForm}>
    // {() => (
    //     <React.Fragment>
    //         <div className='argo-form-row' style={{marginTop: 0}}>
    //             <h4>Promote app(s)</h4>
    //             {progress !== null && <ProgressPopup onClose={() => setProgress(null)} percentage={progress.percentage} title={progress.title} />}
    //         </div>
    //     </React.Fragment>
    // )}
    // </Form>



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
                <div style={{ fontSize: ".8em" }}>
                  <i
                    qe-id="utils-health-status-title"
                    title={item.status.health.status}
                    className={`fa ${MAP_STATUS[item.status.health.status].name}${
                      MAP_STATUS[item.status.health.status].spin ? " fa-spin" : ""
                    }`}
                    style={{ color: MAP_STATUS[item.status.health.status].color, marginRight: "0.3rem" }}
                  ></i>
                  <a href={`/applications/${item.metadata.name}`} title="Open application">
                    <i className="fa fa-external-link-alt"></i>
                  </a>
                </div>
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

