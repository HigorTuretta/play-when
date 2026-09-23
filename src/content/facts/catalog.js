// Every file in ./entries is one editorial fact page. Adding a file publishes a new page:
// it is prerendered, linked from its topics and added to the sitemap automatically.
// Entries are written by hand and must cite their sources; they never reference the
// game's internal event or round ids.
const modules = import.meta.glob('./entries/*.js', { eager: true, import: 'default' })

const byDate = (a, b) => a.date.iso.localeCompare(b.date.iso)

export const FACTS = Object.values(modules).sort(byDate)
