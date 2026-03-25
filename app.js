const urlResumo = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=997277030";
const urlBase = "https://docs.google.com/spreadsheets/d/1WlA0FCviEshPMnehQZFJKTy2MywYJQml2vymgtOGC1I/export?format=csv&gid=297052327";

function parseCSV(text) {
  return text
    .trim()
    .split(/\r?\n/)
    .map(linha => linha.split(/,|;/));
}

function limparNumero(valor) {
  if (!valor) return 0;

  let texto = valor.toString()
    .replace(/"/g, "")
    .replace("R$", "")
    .replace(/\s/g, "")
    .trim();

  // trata percentual
  if (texto.includes("%")) {
    texto = texto.replace("%", "");
  }

  // remove milhar e ajusta decimal
  texto = texto.replace(/\./g, "").replace(",", ".");

  return Number(texto) || 0;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarPercentual(valor) {
  return `${Number(valor).toFixed(2).replace(".", ",")}%`;
}

fetch(urlResumo)
  .then(res => {
    if (!res.ok) throw new Error("Falha ao carregar resumo");
    return res.text();
  })
  .then(data => {
    const rows = parseCSV(data);
    const valores = {};

    rows.slice(1).forEach(r => {
      const chave = (r[0] || "").replace(/"/g, "").trim();
      const valor = (r[1] || "").replace(/"/g, "").trim();
      if (chave) valores[chave] = valor;
    });

    console.log("Resumo lido:", valores);

    const metaMes = limparNumero(valores["meta_mes"]);
    const faturamentoMes = limparNumero(valores["faturamento_mes"]);
    const percentualMes = limparNumero(valores["percentual_mes"]);
    const percentualAcumulado = limparNumero(valores["percentual_acumulado"]);
    const backlog = limparNumero(valores["backlog"]);

    document.getElementById("meta").innerText = formatarMoeda(metaMes);
    document.getElementById("faturamento").innerText = formatarMoeda(faturamentoMes);
    document.getElementById("percentual").innerText = formatarPercentual(percentualMes);
    document.getElementById("backlog").innerText = formatarMoeda(backlog);

    const mesAltura = Math.min(percentualMes > 1 ? percentualMes : percentualMes * 100, 100);
    const temporadaAltura = Math.min(percentualAcumulado > 1 ? percentualAcumulado : percentualAcumulado * 100, 100);

    document.getElementById("termometroMes").style.height = `${mesAltura}%`;
    document.getElementById("termometroTemporada").style.height = `${temporadaAltura}%`;

    document.getElementById("termometroMesTexto").innerText = formatarPercentual(percentualMes);
    document.getElementById("termometroTemporadaTexto").innerText = formatarPercentual(percentualAcumulado);
  })
  .catch(error => {
    console.error("Erro ao carregar resumo:", error);
  });

fetch(urlBase)
  .then(res => {
    if (!res.ok) throw new Error("Falha ao carregar base");
    return res.text();
  })
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

    console.log("Base lida:", { labels, meta, faturamento });

    const canvas = document.getElementById("grafico");
    if (!canvas) {
      console.error("Canvas do gráfico não encontrado");
      return;
    }

    new Chart(canvas, {
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: "Meta",
            data: meta,
            backgroundColor: "#1E5BFF",
            borderRadius: 6,
            maxBarThickness: 40
          },
          {
            type: "line",
            label: "Faturamento",
            data: faturamento,
            borderColor: "#2ECC71",
            backgroundColor: "#2ECC71",
            tension: 0.3,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString("pt-BR");
              }
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("Erro ao carregar base:", error);
  });
