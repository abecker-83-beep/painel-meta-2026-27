const urlResumo = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=997277030";
const urlBase = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=297052327";

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
