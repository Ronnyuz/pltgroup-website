// Source files for the build (texts, drafts) are not served to visitors.
export const onRequest = () => new Response('Not found', { status: 404 });
