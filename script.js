console.log("Script cargado correctamente");

$(document).ready(function () {
});

  const urlCSV = "https://raw.githubusercontent.com/rudyluis/DashboardJS/main/global_cancer.csv";

  $(document).ready(function () {
    // Cargar los datos desde el CSV
    $.ajax({
      url: urlCSV,
      dataType: "text",
      success: function (data) {
        const jsonData = csvToJSON(data);
        cargarTabla(jsonData);
        graficar(jsonData);
      },
      error: function (xhr, status, error) {
        console.error("Error al cargar el archivo:", error);
        $('#cancerTable tbody').html('<tr><td colspan="7" class="text-center error">Error al cargar los datos. Por favor intente más tarde.</td></tr>');
      }
    });

    function csvToJSON(csv) {
      const lines = csv.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      return lines.slice(1).map(line => {
        const data = line.split(",");
        const obj = {};
        headers.forEach((h, i) => {
          const value = data[i] ? data[i].trim() : "";
          obj[h] = isNaN(value) || h === 'country' || h === 'cancer' || h === 'sex' || h === 'region' ? value : parseFloat(value);
        });
        return obj;
      });
    }

    function cargarTabla(data) {
      data.forEach(row => {
        $('#cancerTable tbody').append(`
          <tr>
            <td>${row.country}</td>
            <td>${row.cancer}</td>
            <td>${row.sex}</td>
            <td>${row.year}</td>
            <td>${row.cases.toLocaleString()}</td>
            <td>${row.deaths.toLocaleString()}</td>
            <td>${row.region}</td>
          </tr>
        `);
      });

      $('#cancerTable').DataTable({
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        },
        responsive: true
      });
    }

    function graficar(data) {
      // Preparar datos para los gráficos
      const paises = [...new Set(data.map(item => item.country))];
      const tiposCancer = [...new Set(data.map(item => item.cancer))];
      const regiones = [...new Set(data.map(item => item.region))];
      const años = [...new Set(data.map(item => item.year))];
      
      // Función para sumar valores por propiedad
      const sumBy = (arr, prop, filter) => {
        return arr.reduce((sum, item) => {
          if (!filter || filter(item)) {
            return sum + (item[prop] || 0);
          }
          return sum;
        }, 0);
      };
      
      // Gráfico 1: Casos de Cáncer por País
      const ctx1 = document.getElementById('chart1').getContext('2d');
      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: paises.slice(0, 15),
          datasets: [{
            label: 'Casos',
            data: paises.slice(0, 15).map(pais => sumBy(data, 'cases', item => item.country === pais)),
            backgroundColor: 'rgba(156, 39, 176, 0.7)',
            borderColor: 'rgba(156, 39, 176, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      
      // Gráfico 2: Distribución por Tipo de Cáncer
      const ctx2 = document.getElementById('chart2').getContext('2d');
      new Chart(ctx2, {
        type: 'pie',
        data: {
          labels: tiposCancer,
          datasets: [{
            label: 'Casos',
            data: tiposCancer.map(tipo => sumBy(data, 'cases', item => item.cancer === tipo)),
            backgroundColor: [
              'rgba(156, 39, 176, 0.7)',
              'rgba(33, 150, 243, 0.7)',
              'rgba(76, 175, 80, 0.7)',
              'rgba(255, 152, 0, 0.7)',
              'rgba(244, 67, 54, 0.7)',
              'rgba(63, 81, 181, 0.7)',
              'rgba(0, 150, 136, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
      
      // Gráfico 3: Muertes por Región
      const ctx3 = document.getElementById('chart3').getContext('2d');
      new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: regiones,
          datasets: [{
            label: 'Muertes',
            data: regiones.map(region => sumBy(data, 'deaths', item => item.region === region)),
            backgroundColor: 'rgba(244, 67, 54, 0.7)',
            borderColor: 'rgba(244, 67, 54, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      
      // Gráfico 4: Proporción por Género
      const ctx4 = document.getElementById('chart4').getContext('2d');
      new Chart(ctx4, {
        type: 'doughnut',
        data: {
          labels: ['Masculino', 'Femenino'],
          datasets: [{
            label: 'Casos',
            data: [
              sumBy(data, 'cases', item => item.sex === 'Male'),
              sumBy(data, 'cases', item => item.sex === 'Female')
            ],
            backgroundColor: [
              'rgba(33, 150, 243, 0.7)',
              'rgba(244, 67, 54, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
      
      // Gráfico 5: Tendencias Anuales
      const ctx5 = document.getElementById('chart5').getContext('2d');
      new Chart(ctx5, {
        type: 'line',
        data: {
          labels: años,
          datasets: [{
            label: 'Casos',
            data: años.map(year => sumBy(data, 'cases', item => item.year == year)),
            borderColor: 'rgba(156, 39, 176, 1)',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            borderWidth: 2,
            fill: true
          },
          {
            label: 'Muertes',
            data: años.map(year => sumBy(data, 'deaths', item => item.year == year)),
            borderColor: 'rgba(244, 67, 54, 1)',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderWidth: 2,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: false }
          }
        }
      });
      
      // Gráfico 6: Top 10 Países con Más Casos
      const paisesConCasos = paises.map(pais => ({
        pais,
        casos: sumBy(data, 'cases', item => item.country === pais)
      })).sort((a, b) => b.casos - a.casos).slice(0, 10);
      
      const ctx6 = document.getElementById('chart6').getContext('2d');
      new Chart(ctx6, {
        type: 'bar',
        data: {
          labels: paisesConCasos.map(item => item.pais),
          datasets: [{
            label: 'Casos',
            data: paisesConCasos.map(item => item.casos),
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      
      // Gráfico 7: Relación Casos vs Muertes
      const ctx7 = document.getElementById('chart7').getContext('2d');
      new Chart(ctx7, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Países',
            data: paises.map(pais => ({
              x: sumBy(data, 'cases', item => item.country === pais),
              y: sumBy(data, 'deaths', item => item.country === pais),
              r: 10
            })),
            backgroundColor: 'rgba(255, 152, 0, 0.7)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              title: { display: true, text: 'Casos' },
              beginAtZero: true
            },
            y: {
              title: { display: true, text: 'Muertes' },
              beginAtZero: true
            }
          }
        }
      });
      
      // Gráfico 8: Distribución por Región
      const ctx8 = document.getElementById('chart8').getContext('2d');
      new Chart(ctx8, {
        type: 'polarArea',
        data: {
          labels: regiones,
          datasets: [{
            label: 'Casos',
            data: regiones.map(region => sumBy(data, 'cases', item => item.region === region)),
            backgroundColor: [
              'rgba(156, 39, 176, 0.7)',
              'rgba(33, 150, 243, 0.7)',
              'rgba(76, 175, 80, 0.7)',
              'rgba(255, 152, 0, 0.7)',
              'rgba(244, 67, 54, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' }
          }
        }
      });
      
      // Gráfico 9: Tipos de Cáncer por género
      const ctx9 = document.getElementById('chart9').getContext('2d');
      new Chart(ctx9, {
        type: 'radar',
        data: {
          labels: tiposCancer,
          datasets: [
            {
              label: 'Masculino',
              data: tiposCancer.map(tipo => sumBy(data, 'cases', item => item.cancer === tipo && item.sex === 'Male')),
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              borderColor: 'rgba(33, 150, 243, 1)',
              borderWidth: 2
            },
            {
              label: 'Femenino',
              data: tiposCancer.map(tipo => sumBy(data, 'cases', item => item.cancer === tipo && item.sex === 'Female')),
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              borderColor: 'rgba(244, 67, 54, 1)',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            r: { beginAtZero: true }
          }
        }
      });
      
      // Gráfico 10: Mortalidad por tipo de cáncer
      const ctx10 = document.getElementById('chart10').getContext('2d');
      new Chart(ctx10, {
        type: 'bar',
        data: {
          labels: tiposCancer,
          datasets: [{
            label: 'Tasa de mortalidad (%)',
            data: tiposCancer.map(tipo => {
              const casos = sumBy(data, 'cases', item => item.cancer === tipo);
              const muertes = sumBy(data, 'deaths', item => item.cancer === tipo);
              return casos > 0 ? (muertes / casos * 100).toFixed(1) : 0;
            }),
            backgroundColor: 'rgba(63, 81, 181, 0.7)',
            borderColor: 'rgba(63, 81, 181, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Tasa de mortalidad (%)' }
            }
          }
        }
      });
    }
  });
</script>
</body>
</html>