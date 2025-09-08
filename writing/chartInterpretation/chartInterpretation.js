// Function to load the selected chart
function loadChart(type) {
  const chartContainer = document.getElementById('chart-container');
  chartContainer.innerHTML = content[type].chart;

  // Execute the script for the chart if it exists
  if (content[type].script) {
    eval(content[type].script);
  }

  // Hide all interpretations initially
  const interpretations = document.querySelectorAll('.interpretation');
  interpretations.forEach(interpretation => {
    interpretation.style.display = 'none';
  });
}

// Function to toggle the interpretation visibility
function toggleInterpretation(type) {
  const interpretation = document.getElementById(`${type}-interpretation`);
  if (interpretation.style.display === 'none' || !interpretation.style.display) {
    interpretation.style.display = 'block';
  } else {
    interpretation.style.display = 'none';
  }
}

// Chart data and content
const content = {
  "bar-chart": {
    chart: `
      <div class="chart" id="pieDiv">
        <canvas id="museumChart"></canvas>
      </div>
      <button onclick="toggleInterpretation('bar-chart')">Show Interpretation</button>
      <div class="interpretation" id="bar-chart-interpretation">
        <h3>Interpreting a Bar Chart</h3>
        <ul>
          <li><strong>Introduction:</strong> Mention what the bar chart represents and the time period covered.</li>
          <li><strong>Body:</strong> Describe the highest and lowest values, trends, and comparisons among categories.</li>
          <li><strong>Conclusion:</strong> Summarize key findings in a few sentences.</li>
        </ul>
        <h3>Sample Interpretation:</h3>
        <p>The given bar graph displays the number of adult and child visitors to a museum over four months: January, February, March, and April. The horizontal axis shows the months while the vertical axis indicates the number of visitors. </p>

        <p>The data shows varying trends for both categories. In January, children had a slightly higher turnout (600) than adults (500). February saw an increase in adult visitors to 650, while child attendance dropped to 500. This shift suggests a seasonal or promotional factor affecting adult attendance positively. March recorded the highest number of child visitors (750), while adult attendance dropped significantly to 300. This contrast could indicate a school event or vacation period encouraging more children to visit. In April, adult visitors rebounded to 550, whereas children's numbers declined sharply to 300, the lowest recorded for them. This reversal might suggest a change in school schedules or the end of a seasonal attraction. </p>

        <p>Overall, children's attendance fluctuates more than adults', with March being their peak month and April their lowest. Adults, on the other hand, show a relatively stable trend, with the highest attendance in February and the lowest in March. The data indicates that external factors, such as school schedules or museum events, likely influence these trends. </p>
      </div>

    `,
    script: `
      var ctx = document.getElementById('museumChart').getContext('2d');
      var museumChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['January', 'February', 'March', 'April'],
          datasets: [
            {
              label: 'Adults',
              data: [500, 650, 300, 550],
              backgroundColor: 'orange'
            },
            {
              label: 'Children',
              data: [600, 500, 750, 300],
              backgroundColor: 'purple'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 800
            }
          }
        }
      });
    `
  },
  "pie-chart": {
    chart: `
      <div class="chart">
      <h2 id="pieTitle"> Book Publishing Expences</h2>
        <canvas id="costPieChart"></canvas>
      </div>
      <button onclick="toggleInterpretation('pie-chart')">Show Interpretation</button>
      <div class="interpretation" id="pie-chart-interpretation">
        <h3>Interpreting a Pie Chart</h3>
        <ul>
          <li><strong>Introduction:</strong> State what the pie chart represents and its data source.</li>
          <li><strong>Body:</strong> Discuss the largest and smallest segments, significant differences, and notable proportions.</li>
          <li><strong>Conclusion:</strong> Summarize the overall distribution.</li>
        </ul>
        <h3>Sample Interpretation:</h3>
         <p>The pie chart represents the cost distribution for book publishing, categorizing expenses into six key areas: Promotion, Transportation, Pinning, Royalty, Binding, and Paper Cost. The legend at the bottom indicates these categories and their cost in percentage. </p>

        <p>The largest portion of the budget is allocated to Paper Cost (25%), indicating its significant role in the overall expenses. Binding and Pinning Costs each take up 20%, making them the second-largest contributors. These three elements together account for 65% of the total cost, emphasizing the high expenditure on materials and assembly.</p>

        <p>Royalty expenses, which make up 15%, reflect the payments made to authors or contributors. This allocation ensures that writers receive fair compensation for their work. Promotion and Transportation Costs are the lowest, each at 10%. This suggests that marketing efforts and logistical expenses are relatively controlled compared to material and production costs.</p> 

        <p>Overall, the chart highlights that the majority of book publishing expenses are associated with materials and production processes. Paper and binding alone account for nearly half of the total cost, demonstrating their importance in book manufacturing.</p> 
      </div>
    `,
    script: `
      const data = {
        labels: ["Promotion Cost 10%", "Transportation Cost 10%", "Pinning Cost 20%", "Royalty 15%", "Binding 20%", "Paper Cost 25%"],
        datasets: [{
          data: [10, 10, 20, 15, 20, 25],
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
          ],
          borderWidth: 0,
        }]
      };

      const config = {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              color: '#fff',
              font: {
                weight: 'bold',
                size: 14,
              },
              formatter: (value) => {
                return value + '%';
              },
              anchor: 'center',
              align: 'center',
              offset: 0,
              display: 'auto',
            },
            legend: {
              position: 'bottom',
              labels: {
                font: {
                  size: 14,
                },
              },
            },
          },
        },
      };

      const ctx = document.getElementById('costPieChart').getContext('2d');
      new Chart(ctx, config);
    `
  },
  "line-graph": {
    chart: `
      <div class="chart">
        <canvas id="temperatureChart"></canvas>
      </div>
      <button onclick="toggleInterpretation('line-graph')">Show Interpretation</button>
      <div class="interpretation" id="line-graph-interpretation">
        <h3>Interpreting a Line Graph</h3>
        <ul>
          <li><strong>Introduction:</strong> Identify the subject and time span of the graph.</li>
          <li><strong>Body:</strong> Describe major trends, peaks, declines, and any fluctuations.</li>
          <li><strong>Conclusion:</strong> Summarize the overall trend.</li>
        </ul>
        <h3>Sample Interpretation:</h3>
        <p>The line graph illustrates temperature changes throughout the day, beginning at 5:00 A.M. and ending at 7:00 P.M. The X axis shows the time of the day and the Y axis indicates temperature in degree celsius. </p>

        <p>The trend shows a gradual increase in temperature from the early morning, starting at 12°C at 5:00 A.M. and rising steadily to 18°C by 7:00 A.M. The temperature continues to climb, reaching 24°C at 9:00 A.M. and peaking at 30°C around 1:00 P.M. This steady rise suggests the warming effect of the sun as the day progresses. </p>

      <p>After reaching its highest point at 1:00 P.M., the temperature begins to decline, dropping to 27°C by 3:00 P.M. and further decreasing to 24°C at 5:00 P.M. The cooling trend becomes more pronounced in the evening, with a sharp drop to 15°C by 7:00 P.M. This pattern indicates a typical daily temperature cycle, where the heat builds up during the daytime and gradually dissipates after the sun begins to set.</p>

      <p>Overall, the graph highlights a predictable temperature pattern, with the lowest temperatures occurring in the early morning and late evening, and the highest temperatures recorded in the early afternoon. </p>
      </div>
    `,
    script: `
      const data = {
        labels: ["5:00 A.M.", "7:00 A.M.", "9:00 A.M.", "11:00 A.M.", "1:00 P.M.", "3:00 P.M.", "5:00 P.M.",  "7:00 P.M."],
        datasets: [{
          label: "Temperature (°C)",
          data: [12.0, 18.0, 24.0, 27.0, 30.0, 27.0, 24.0, 15.0],
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#007bff",
          fill: false,
        }]
      };

      const config = {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time of the Day',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Temperature (°C)',
              },
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
            },
          },
        },
      };

      const ctx = document.getElementById('temperatureChart').getContext('2d');
      new Chart(ctx, config);
    `
  },
  "table": {
    chart: `
      <div class="chart">
  <div class="table-container">
    <table>
      <caption>Mobile Phone Sales by Showroom (in units)</caption>
      <thead>
        <tr>
          <th>Years / Showroom</th>
          <th>A</th>
          <th>B</th>
          <th>C</th>
          <th>D</th>
          <th>E</th>
          <th>F</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2016</td>
          <td>183</td>
          <td>123</td>
          <td>277</td>
          <td>167</td>
          <td>178</td>
          <td>237</td>
        </tr>
        <tr>
          <td>2017</td>
          <td>178</td>
          <td>272</td>
          <td>269</td>
          <td>95</td>
          <td>379</td>
          <td>198</td>
        </tr>
        <tr>
          <td>2018</td>
          <td>133</td>
          <td>161</td>
          <td>226</td>
          <td>176</td>
          <td>239</td>
          <td>277</td>
        </tr>
        <tr>
          <td>2019</td>
          <td>264</td>
          <td>107</td>
          <td>237</td>
          <td>225</td>
          <td>282</td>
          <td>237</td>
        </tr>
        <tr>
          <td>2020</td>
          <td>278</td>
          <td>272</td>
          <td>213</td>
          <td>284</td>
          <td>293</td>
          <td>196</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
      <button onclick="toggleInterpretation('table')">Show Interpretation</button>
      <div class="interpretation" id="table-interpretation">
        <h3>Interpreting a Table</h3>
        <ul>
          <li><strong>Introduction:</strong> State the data presented in the table.</li>
          <li><strong>Body:</strong> Highlight key figures, compare values, and identify trends.</li>
          <li><strong>Conclusion:</strong> Provide a summary of the most significant insights.</li>
        </ul>
        <h3>Sample Interpretation:</h3>
        <p>The table presents mobile phone sales data from six different showrooms (A to F) over five years (2016-2020). It contains six rows and seven columns displaying the year wise units of sales of the different showrooms.</p>

        <p>Showroom C had the highest sales in 2016 (277 units), while Showroom B had the lowest (123 units). In 2017, Showroom E saw a dramatic increase to 379 units, making it the highest-selling showroom that year, whereas Showroom D had the lowest sales at just 95 units. In 2018, sales were more balanced, with no extreme highs or lows. In 2019, Showroom A experienced a significant increase to 264 units, while Showroom B dropped to its lowest at 107 units. Showroom E led again with 282 units, showing consistent performance. By 2020, sales peaked for most showrooms, with Showroom D reaching the highest sales figure of 284 units. Showroom E remained strong at 293 units, while Showroom C saw a decline to 213 units. Showroom F also dropped to its lowest at 196 units.</p> 

       <p>Overall, Showroom E demonstrated the most consistent high performance, while other showrooms saw fluctuating trends. This data suggests that some showrooms had better long-term strategies or customer bases, while others struggled with inconsistency.</p>
      </div>
    `,
    script: ''
  },
  "picture": {
    chart: `
      <div class="chart" align="center">
        <img src="beachImage.jpg" alt="Beach Scene" style="width:100%; max-width:600px; height:80vh; border-radius:10px; align=center">
      </div>
      <button onclick="toggleInterpretation('picture')">Show Interpretation</button>
      <div class="interpretation" id="picture-interpretation">
        <h3>Interpreting a Picture</h3>
        <ul>
          <li><strong>Introduction:</strong> Look at the picture carefully and write what you see in the foreground (people, animals, plants, things).</li>
          <li><strong>Body:</strong> Observe the actions (running, playing, etc.) and describe them. Write about what you see in the background.</li>
          <li><strong>Conclusion:</strong> Write about the overall impression.</li>
        </ul>
        <h3>Sample Interpretation:</h3>
        <p>This illustration depicts a serene beach scene with a family enjoying a sunny day by the sea. A young boy and girl are at the center, building an intricate sandcastle with towers and flags, their expressions showing focus and joy. Nearby, their mother relaxes on a lounge chair, engrossed in a book.</p>

        <p>The background features calm blue waters, a sailboat drifting in the distance, and lush green mountains rising against a bright sky with fluffy clouds. The setting conveys a tranquil and idyllic atmosphere, where nature and leisure blend harmoniously. The scene is lively, with other beachgoers splashing in the waves. Various beach essentials, such as towels, sandals, a picnic basket, and toys, add to the realism of the scene.</p>

        <p>The art style is vibrant and warm, with smooth lines and soft shading that evoke a nostalgic, storybook-like quality. The composition balances relaxation and playfulness, capturing the essence of a perfect family outing. Overall, the image looks both visually appealing and emotionally resonant.</p>
      </div>
    `,
    script: ''
  }

};

