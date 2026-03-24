// COLE OS LINKS DO GOOGLE SHEETS AQUI
const urlResumo = "COLE_LINK_RESUMO";
const urlBase = "COLE_LINK_BASE";

function parseCSV(text) {
  return text.split("\n").map(l => l.split(","));
}

// KPIs
fetch(urlResumo)
  .then(res => res.text())
  .then(data => {
    const rows = parseCSV(data);

    const valores = {};
    rows.slice(1).forEach(r => {
      valores[r[0]] = r[1];
    });

    document.getElementById("meta").innerText = valores["meta_mes"];
    document.getElementById("faturamento").innerText = valores["faturamento_mes"];
    document.getElementById("percentual").innerText = valores["percentual_mes"];
    document.getElementById("backlog").innerText = valores["backlog"];
  });

// GRÁFICO
fetch(urlBase)
  .then(res => res.text())
  .then(data => {
    const rows = parseCSV(data);

    const labels = [];
    const meta = [];
    const faturamento = [];

    rows.slice(1).forEach(r => {
      labels.push(r[0]);
      meta.push(parseFloat(r[1].replace(",", ".")));
      faturamento.push(parseFloat(r[3].replace(",", ".")) || 0);
    });

    new Chart(document.getElementById("grafico"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Meta",
            data: meta
          },
          {
            label: "Faturamento",
            data: faturamento
          }
        ]
      }
    });
  });
