import * as React from "react";
import {useEffect, useState} from 'react';
import Moment from "react-moment";
import { ApplicationSet } from "./models/applicationset";
import { Application, Node, ResourceRef, ApplicationStatus} from "./models/models";
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
    console.log("YOYOY")
    console.log(applications)
    return applications
}

export const Extension = (props: { tree: Tree; resource: ApplicationSet }) => {
  console.log(props);

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

export const Child = (props: {tree: Tree, resource: ApplicationSet, applications: Application[]}) => {
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
          {console.log(props.applications)}
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

    </div>
  );
};

export const component = Extension;

