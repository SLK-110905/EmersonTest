require.config({
    paths: {
        // Define the path for Tabulator (already included in HTML via CDN)
        tabulator: 'https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min',
        tabulatorCss: 'https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min' // Path for Tabulator CSS
    },
    shim: {
        // Make Tabulator available globally to RequireJS
        tabulator: {
            exports: 'Tabulator'
        }
    }
});

define("EmersonTest/components/notification", ["DS/DataDragAndDrop/DataDragAndDrop", "DS/WAFData/WAFData","tabulator","EmersonTest/components/tableToolbar","css!EmersonTest/styles/revstyles.css","css!tabulatorCss"], function (DataDragAndDrop, WAFData,Tabulator,tableToolbar) {

    var notification = {
        showNotification: function (data) {

            // Create a container for the notifications if it doesn't exist
            if (!document.getElementById('notification-container')) {
                var container = document.createElement('div');
                container.id = 'notification-container';
                container.style.position = 'fixed';
                container.style.top = '20px';
                container.style.right = '20px';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
            } else {
                var container = document.getElementById('notification-container');
            }

            // Function to create a single notification
            function createNotification(message, messageType) {
                var toast = document.createElement('div');
                toast.className = `toast align-items-center text-bg-${messageType} border-0`;
                toast.role = 'alert';
                toast.ariaLive = 'assertive';
                toast.ariaAtomic = 'true';
                toast.style.marginBottom = '10px';

                var toastBody = document.createElement('div');
                toastBody.className = 'd-flex';
                toastBody.innerHTML = `
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                `;

                toast.appendChild(toastBody);
                container.appendChild(toast);

                var bsToast = new bootstrap.Toast(toast, { delay: 3000 });
                bsToast.show();

                toast.addEventListener('hidden.bs.toast', function () {
                    toast.remove();
                });
            }

            // Show notifications
            if (Array.isArray(data)) {
                data.forEach(function (item) {
                    createNotification(item.message, item.messageType);
                });
            } else {
                createNotification(data.message, data.messageType);
            }


        }
    };
    widget.showNotification = showNotification;
    return showNotification;

});