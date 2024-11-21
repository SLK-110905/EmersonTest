require.config({
    paths: {
        reactproduction: "https://unpkg.com/react@18/umd/react.production.min.js",
        reactdomproduction:"https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
        reactbabel:"https://unpkg.com/babel-standalone@6/babel.min.js"
    }
});
define("EmersonTest/scripts/Main", [
    "DS/WAFData/WAFData",
],
    function (WAFData) {
        let myWidget = {
            onLoad: function () {
                alert("widget has been Loaded");
                const App = () => {
                    return (
                        <div>
                            <h1>Hello, React from CDN!</h1>
                            <p>This is a simple React app running through CDN.</p>
                        </div>
                    );
                };
            
                // Render the React component to the DOM
                ReactDOM.render(<App />, document.getElementById('root'));
                
            },
            updateWidget: function () {

            },
           
        }
        widget.myWidget = myWidget;
        return myWidget;
    });
