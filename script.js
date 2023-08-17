document.addEventListener("DOMContentLoaded", function() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const messageContainer = document.createElement("div");
    document.body.appendChild(messageContainer);

    function displayMessage(message, isError = false) {
        console.log(message);
        const messageElement = document.createElement("p");
        messageElement.textContent = message;
        if (isError) {
            messageElement.style.color = "red";
        }
        messageContainer.appendChild(messageElement);
    }

    uploadButton.addEventListener("click", function() {
        const file = fileInput.files[0];
        if (!file) {
            displayMessage("Error: Please select a file first.", true);
            return;
        }

        Papa.parse(file, {
            complete: function(results) {
                if (results.errors.length > 0) {
                    displayMessage(`Error parsing CSV: ${results.errors[0].message}`, true);
                    return;
                }

                const data = results.data;
                const processedData = processDataWithTensorFlow(data);

                // Further visualizations and processing here...

            },
            header: true,
            skipEmptyLines: true
        });
    });

    function processDataWithTensorFlow(data) {
        displayMessage("Processing data with TensorFlow.js...");

        // Assuming data has columns 'value1', 'value2'
        const values1 = data.map(row => parseFloat(row.value1));
        const values2 = data.map(row => parseFloat(row.value2));

        const tensor1 = tf.tensor(values1);
        const tensor2 = tf.tensor(values2);

        // Example: Normalize tensors
        const normalizedTensor1 = tensor1.sub(tensor1.min()).div(tensor1.max().sub(tensor1.min()));
        const normalizedTensor2 = tensor2.sub(tensor2.min()).div(tensor2.max().sub(tensor2.min()));

        // Convert tensors back to arrays
        const normalizedValues1 = normalizedTensor1.arraySync();
        const normalizedValues2 = normalizedTensor2.arraySync();

        // Return processed data
        return data.map((row, index) => ({
            ...row,
            normalizedValue1: normalizedValues1[index],
            normalizedValue2: normalizedValues2[index]
        }));
    }
