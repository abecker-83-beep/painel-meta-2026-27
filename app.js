const urlResumo = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=997277030";
const urlBase = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=297052327";

function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(line => line.split(","));
}

function limparNumero(valor) {
  if (!valor) return 0;
  return Number(
    valor
      .toString()
      .replace(/"/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  ) || 0;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarPercentual(valor) {
  return `${(valor * 100).toFixed(2).replace(".", ",")}%`;
}

fetch(urlResumo)
  .then(res => res.text())
  .then(data => {
    const rows = parseCSV(data);
    const valores = {};

    rows.slice(1).forEach(r => {
      const chave = (r[0] || "").replace(/"/g, "").trim();
      const valor = (r[1] || "").replace(/"/g, "").trim();
      valores[chave] = valor;
    });

    document.getElementById("meta").innerText =
      formatarMoeda(limparNumero(valores["meta_mes"]));

    document.getElementById("faturamento").innerText =
      formatarMoeda(limparNumero(valores["faturamento_mes"]));

    document.getElementById("percentual").innerText =
      formatarPercentual(limparNumero(valores["percentual_mes"]));

    document.getElementById("backlog").innerText =
      formatarMoeda(limparNumero(valores["backlog"]));
  })
  .catch(error => {
    console.error("Erro ao carregar resumo:", error);
  });

fetch(urlBase)
  .then(res => res.text())
  .then(data => {
    const rows = parseCSV(data);

    const labels = [];
    const meta = [];
    const faturamento = [];

    rows.slice(1).forEach(r => {
      const mes = (r[0] || "").replace(/"/g, "").trim();
      if (!mes) return;

      labels.push(mes);
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
            backgroundColor: "#1E5BFF",
            borderRadius: 6
          },
          {
            label: "Faturamento",
            data: faturamento,
            backgroundColor: "#2ECC71",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("Erro ao carregar base:", error);
  });
