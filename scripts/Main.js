require.config({
    paths: {
        'react': 'https://unpkg.com/react/umd/react.development',
        'react-dom': 'https://unpkg.com/react-dom/umd/react-dom.development'
    }
});
define("EmersonTest/scripts/Main", ["DS/WAFData/WAFData","react-dom","react"], function (WAFData) {
let myWidget = {
    onLoad: function () {
    alert("debug 2");
    const App = () => {
        return (
        <div>
            <h1>Hello, React from CDN!</h1>
            <p>This is a simple React app running through CDN.</p>
        </div>
        );
    };

      // Create a root and render the React component to the DOM
      ReactDOM.render(React.createElement(App), document.getElementById('root'));
    },
    updateWidget: function () {},
};
widget.myWidget = myWidget;
return myWidget;
});
