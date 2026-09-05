export default defineContentScript({
  main(_ctx) {
    console.log("penbo content script loaded");

    // TODO: Inject floating button UI
    // TODO: Handle image selection
    // TODO: Handle screenshot requests
  },
  matches: ["<all_urls>"],
  runAt: "document_idle",
});
