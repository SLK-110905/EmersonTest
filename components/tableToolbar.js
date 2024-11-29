require.config({
    paths: {
        bootstrapCss: 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min', // Path for Tabulator CSS
        
    }
});

define("EmersonTest/components/tableToolbar", ["DS/DataDragAndDrop/DataDragAndDrop", "DS/WAFData/WAFData","EmersonTest/components/table","css!EmersonTest/styles/revstyles.css","css!bootstrapCss"], function (DataDragAndDrop, WAFData, customTable) {

    var tableToolbar = {
        showToolbar: function (tableData) {
            
            data = [
                { buttonLabel: "Select all", onClick: tableToolbar.selectAll },
                { buttonLabel: "De-Select all", onClick: tableToolbar.deselectAll },
                { buttonLabel: "Select items in my Collaborative Space", onClick: tableToolbar.selectMyCollbSpaceObjs },
                { buttonLabel: "Replace", onClick: tableToolbar.replaceObjects, style:"margin-left: auto; margin-right:5px" },
            ];




            var toobarHTML = '';
            data.forEach(button => {
                toobarHTML += `<button class="btn btn-primary" ${button.style ? `style="${button.style}"` : ''}>${button.buttonLabel}</button>`;
            });

            var tableToobarDiv = document.createElement('div');
            tableToobarDiv.id = "tableToobarDiv";
            tableToobarDiv.className = "tableToobarDiv";
            tableToobarDiv.innerHTML = toobarHTML;
            
            var tableElement = document.getElementById("example-table");
            var parentElement = tableElement.parentNode;

            // Insert the new element before the reference element
            parentElement.insertBefore(tableToobarDiv, tableElement);

            // Add onclick event listeners to the buttons
            var buttons = tableToobarDiv.getElementsByTagName('button');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].onclick = data[i].onClick;
            }
            
        },selectAll: function () {
            widget.whereUsedTable.tableData.selectRow();
        },deselectAll: function (tableData) {
            widget.whereUsedTable.tableData.deselectRow();
        },selectMyCollbSpaceObjs: function (tableData) {
            
        }, replaceObjects: function () {
            widget.whereUsedTable.updateAllRevision();
        }
    }
    widget.tableToolbar = tableToolbar;
    return tableToolbar;



});
