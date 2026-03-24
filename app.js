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

    function formatarMoeda(valor) {
  return "R$ " + Number(valor).toLocaleString("pt-BR");
}

function formatarPercentual(valor) {
  return (Number(valor) * 100).toFixed(2) + "%";
}

document.getElementById("meta").innerText =
  formatarMoeda(valores["meta_mes"]);

document.getElementById("faturamento").innerText =
  formatarMoeda(valores["faturamento_mes"]);

document.getElementById("percentual").innerText =
  formatarPercentual(valores["percentual_mes"].replace('"',''));

document.getElementById("backlog").innerText =
  formatarMoeda(valores["backlog"]);
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
     function limparNumero(valor) {
  if (!valor) return 0;
  return Number(valor.replace(/\./g, "").replace(",", "."));
}

meta.push(limparNumero(r[1]));
faturamento.push(limparNumero(r[3]));
    });

    new Chart(document.getElementById("grafico"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
  {
    label: "Meta",
    data: meta,
    backgroundColor: "#1E5BFF"
    borderRadius: 6
  },
  {
    label: "Faturamento",
    data: faturamento,
    backgroundColor: "#2ECC71"
  }
]
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
