require.config({
    paths: {
        'react': 'https://unpkg.com/react/umd/react.development',
        'react-dom': 'https://unpkg.com/react-dom/umd/react-dom.development',
        'babel':'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js'
    }
});
define("EmersonTest/scripts/Main", ["DS/WAFData/WAFData",'babel',"react-dom","react"], function (WAFData,ReactDOM,React) {
let myWidget = {
    onLoad: function () {
    alert("debug 2");
      // Create a root and render the React component to the DOM
      ReactDOM.render(React.createElement("<h1>Hello from react</h1>"), document.getElementById('root'));
    },
    updateWidget: function () {},
};
widget.myWidget = myWidget;
return myWidget;
});
