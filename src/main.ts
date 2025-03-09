import * as path from "path";
import * as express from "express";
import * as morgan from "morgan";
import * as config from "config";

// Define TestData interface
interface TestData {
  totalTestCases: number;
  automatedTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  tool_language: string;
  testType: string;
  lastexecutionDate: string;
  environment: string;
}

// Define ProjectRoute interface for config
interface ProjectRoute {
  name: string;
  testData: TestData;
}

let app: express.Application;

async function bootstrap() {
  app = express();
  app.use(morgan("dev"));

  // Serve static files
  app.use(express.static(path.join(__dirname, "..", "uploads")));
  app.use(express.static(path.join(__dirname, "..", "vendor")));

  // Main route with chart and test data per project
  app.get("/", (req, res) => {
    const links = config
      .get<ProjectRoute[]>("routes")
      .map((route, index) => {
        const { name, testData } = route;
        const passPercentage = Math.round((testData.passedTestCases / testData.totalTestCases) * 100); // No decimals
        const chartId = `testChart-${index}`; // Unique chart ID

        // Determine Pass Percentage badge class based on value
        let passBadgeClass = "bg-danger"; // Red if ≤ 50%
        if (passPercentage >= 80) {
          passBadgeClass = "bg-success"; // Green if ≥ 80%
        } else if (passPercentage > 50 && passPercentage < 80) {
          passBadgeClass = "bg-warning text-dark"; // Amber if > 50% and < 80%
        }

        return `
          <div class="col-sm-6 col-md-4 col-sm-12 col-xs-12">
            <div class="card mb-4 shadow-sm">
              <div class="card-header text-center">
                <h5 class="card-title mb-0">${name}</h5>
              </div>
              <div class="card-body">
                <!-- Test Execution Summary -->
                <div class="test-info">
                  <h6 class="text-muted mb-2">Test Execution Summary</h6>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Total Test Cases
                      <span class="badge bg-secondary rounded-pill">${testData.totalTestCases}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Automated Test Cases
                      <span class="badge bg-info rounded-pill">${testData.automatedTestCases}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Passed Test Cases
                      <span class="badge bg-success rounded-pill">${testData.passedTestCases}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Failed Test Cases
                      <span class="badge bg-danger rounded-pill">${testData.failedTestCases}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Pass Percentage
                      <span class="badge ${passBadgeClass} rounded-pill">${passPercentage}%</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Tool & Language
                      <span class="badge bg-primary rounded-pill">${testData.tool_language}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Test Type
                      <span class="badge bg-warning text-dark rounded-pill">${testData.testType}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Last Execution Date
                      <span class="badge bg-secondary rounded-pill">${testData.lastexecutionDate}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      Environment
                      <span class="badge bg-info rounded-pill">${testData.environment}</span>
                    </li>
                  </ul>
                </div>

                <!-- Chart Section -->
                <div class="chart-container">
                  <canvas id="${chartId}"></canvas>
                </div>
              </div>
              <div class="card-footer text-center">
                <a href="${name}" class="btn btn-primary btn-sm">Open</a>
              </div>

              <!-- Chart.js Script for ${name} -->
              <script>
                document.addEventListener('DOMContentLoaded', function() {
                  Chart.register(ChartDataLabels);
                  const ctx${index} = document.getElementById('${chartId}').getContext('2d');
                  new Chart(ctx${index}, {
                    type: 'pie',
                    data: {
                      labels: ['Passed', 'Failed'],
                      datasets: [{
                        data: [${testData.passedTestCases}, ${testData.failedTestCases}],
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderColor: ['#fff', '#fff'],
                        borderWidth: 1
                      }]
                    },
                    options: {
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: '${name} Pass vs Fail %' },
                        datalabels: {
                          color: '#fff',
                          formatter: (value) => value, // Show raw numbers
                          font: { weight: 'bold', size: 14 }
                        }
                      }
                    }
                  });
                });
              </script>
            </div>
          </div>`;
      })
      .join("");

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base href="/">
          <link rel="stylesheet" href="bootstrap.min.css">
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
          <style>
            .chart-container { width: 40%; margin: 15px auto; } /* Reduced from 80% to 40% */
            .test-info { margin: 10px; }
            .test-info .list-group-item { padding: 0.5rem 1rem; font-size: 0.9em; }
            .test-info .badge { font-size: 0.9em; padding: 0.4em 0.8em; }
            .card { border-radius: 8px; }
            .card-header { background-color: #f8f9fa; }
            .text-muted { font-size: 0.8em; }
          </style>
        </head>
        <body>
          <div class="row">
            <div class="col-xs-12 mx-auto text-center">
              <h1>${config.get("title")}</h1>
            </div>
          </div>

          <!-- Routes Section with Embedded Charts and Summaries -->
          <div class="row col-xs-12 mx-auto">
            ${links}
          </div>
        </body>
      </html>
    `);
  });

  // Set dynamic routes
  await config.get<ProjectRoute[]>("routes").forEach((project) => {
    console.log(`project: ${project.name} loaded`);
    app.use(`/${project.name}`, (req, res) => {
      res.sendFile(
        path.resolve(path.join(__dirname, "../uploads", `${project.name}/index.html`))
      );
    });
  });

  await app.listen(config.get<number>("port"));
  console.log(`Server running on port ${config.get("port")}`);
}

bootstrap().catch((err) => console.error("Bootstrap error:", err));