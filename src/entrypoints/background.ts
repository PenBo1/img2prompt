export default defineBackground({
  main() {
    console.log("Hello background!", { id: browser.runtime.id });

    // Listen for keyboard shortcuts
    browser.commands.onCommand.addListener((command) => {
      if (command === "capture-image") {
        console.log("Capture image command received");
        // TODO: Handle image capture
      }
      if (command === "take-screenshot") {
        console.log("Take screenshot command received");
        // TODO: Handle screenshot
      }
    });
  },
});
