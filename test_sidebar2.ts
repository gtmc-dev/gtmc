import { getSidebarTree } from './t_sidebar'; async function run() { const t = await getSidebarTree(); console.log(JSON.stringify(t.find(n => n.title==='加载票'), null, 2)); } run();
