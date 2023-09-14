import applications from './app/applications';

((window) => {
  const component = () => {
    return applications.component;
  };
  window?.extensionsAPI?.registerSystemLevelExtension(
    component,
    "Test Ext",
    "/hello",
    "fa-flask"
  );
})(window);
