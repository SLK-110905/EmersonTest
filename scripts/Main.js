define("EmersonTest/scripts/Main", ["DS/WAFData/WAFData"], function (WAFData) {
  let myWidget = {
    onLoad: function () {
      const App = () => {
        return (
          <div>
            <h1>Hello, React from CDN!</h1>
            <p>This is a simple React app running through CDN.</p>
          </div>
        );
      };

      // Create a root and render the React component to the DOM
      const root = ReactDOM.createRoot(document.getElementById("root"));
      root.render(<App />);
    },
    updateWidget: function () {},
  };
  widget.myWidget = myWidget;
  return myWidget;
});
