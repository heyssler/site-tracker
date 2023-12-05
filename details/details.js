document.addEventListener('DOMContentLoaded', async function() {
    console.log("Opened up details.js!");
    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']; // Example labels for months

    const data = {
      labels: labels,
      datasets: [{
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
    
    const config = {
      type: 'line',
      data: data,
    };
    
    // Assuming you have a canvas element with id "myChart" in your HTML
    const ctx = document.getElementById('exampleChart').getContext('2d');
    const myChart = new Chart(ctx, config);
});