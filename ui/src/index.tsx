import {ErrorNotification, NotificationType, SlidingPanel} from 'argo-ui';
import * as React from 'react';
import {Form, FormApi} from 'react-form';
import {ProgressPopup} from '../../../shared/components';
import {Consumer} from '../../../shared/context';
import * as models from '../../../shared/models';
import {services} from '../../../shared/services';
import {ApplicationSelector} from '../../../shared/components';
import {ResourceNode} from '../../../shared/models';


// https://argocd-prod.zxz.su/api/v1/applications/premier-frontend-v3-dl-preprod/resource/actions?appNamespace=argocd-prod&namespace=prem-preprod&resourceName=premier-web-frontend-v3&version=v1alpha1&kind=Rollout&group=argoproj.io

interface Progress {
    percentage: number;
    title: string;
}

export const ApplicationsPromoteFullPanel = ({show, apps, hide}: {show: boolean; apps: models.Application[]; hide: () => void}) => {
    const [form, setForm] = React.useState<FormApi>(null);
    const [progress, setProgress] = React.useState<Progress>(null);
    const getSelectedApps = (params: any) => apps.filter((_, i) => params['app/' + i]);

    return (
        <Consumer>
            {ctx => (
                <SlidingPanel
                    isMiddle={true}
                    isShown={show}
                    onClose={() => hide()}
                    header={
                        <div>
                            <button className='argo-button argo-button--base' onClick={() => form.submitForm(null)}>
                                Promote-Full
                            </button>{' '}
                            // <button onClick={() => hide()} className='argo-button argo-button--base-o'>
                            //     Cancel
                            // </button>
                        </div>
                    }>
                    <Form
                        onSubmit={async (params: any) => {
                            const selectedApps = getSelectedApps(params);
                            if (selectedApps.length === 0) {
                                ctx.notifications.show({content: `No apps selected`, type: NotificationType.Error});
                                return;
                            }


                            setProgress({percentage: 0, title: 'Promote-Full applications'});
                            let i = 0;
                            const promoteActions = [];
                            for (const app of selectedApps) {
                                const resourcesTree = await services.applications.resourceTree(app.metadata.name, app.metadata.namespace).catch(e => {
                                    ctx.notifications.show({
                                        content: <ErrorNotification title={`Error while fetch resource tree ${app.metadata.name}`} e={e} />,
                                        type: NotificationType.Error
                                    });
                                });

                                for (const resource of resourcesTree) {
                                    for (const node of resource.nodes ) {
                                        if (node.kind === "Rollout") {
                                            const promoteAction = async () => {
                                                await services.applications.runResourceAction(app.metadata.name, app.metadata.namespace, node, "promote-full").catch(e => {
                                                    ctx.notifications.show({
                                                        content: <ErrorNotification title={`Unable to promote ${app.metadata.name}`} e={e} />,
                                                        type: NotificationType.Error
                                                    });
                                                });
                                                i++;
                                                setProgress({
                                                    percentage: i / selectedApps.length,
                                                    title: `Promoted ${i} of ${selectedApps.length} applications`
                                                });
                                            };
                                            promoteActions.push(promoteAction());

                                        }
                                    }

                                }

                                if (promoteActions.length >= 20) {
                                    await Promise.all(promoteActions);
                                    promoteActions.length = 0;
                                }
                            }
                            await Promise.all(promoteActions);
                            setProgress({percentage: 100, title: 'Complete'});
                        }}
                        getApi={setForm}>
                        {formApi => (
                            <React.Fragment>
                                <div className='argo-form-row' style={{marginTop: 0}}>
                                    <h4>Promote app(s)</h4>
                                    {progress !== null && <ProgressPopup onClose={() => setProgress(null)} percentage={progress.percentage} title={progress.title} />}
                                    <ApplicationSelector apps={apps} formApi={formApi} />
                                </div>
                            </React.Fragment>
                        )}
                    </Form>
                </SlidingPanel>
            )}
        </Consumer>
    );
};

export const component = ApplicationsPromoteFullPanel;
