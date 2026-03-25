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

  if (texto.includes("%")) {
    texto = texto.replace("%", "");
  }

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

function corPorPercentual(valor) {
  if (valor >= 100) return "#21bf73";
  if (valor >= 80) return "#f1c40f";
  return "#e74c3c";
}

function aplicarGauge(id, valor) {
  const percentualVisual = Math.min(valor, 100);
  const graus = (percentualVisual / 100) * 180;
  const cor = corPorPercentual(valor);

  document.getElementById(id).style.background =
    `conic-gradient(${cor} 0deg, ${cor} ${graus}deg, #e6e6e6 ${graus}deg, #e6e6e6 180deg, transparent 180deg)`;
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

    const metaMes = limparNumero(valores["meta_mes"]);
    const faturamentoMes = limparNumero(valores["faturamento_mes"]);
    const percentualMes = limparNumero(valores["percentual_mes"]);
    const percentualAcumulado = limparNumero(valores["percentual_acumulado"]);
    const backlog = limparNumero(valores["backlog"]);

    document.getElementById("meta").innerText = formatarMoeda(metaMes);
    document.getElementById("faturamento").innerText = formatarMoeda(faturamentoMes);
    document.getElementById("percentual").innerText = formatarPercentual(percentualMes);
    document.getElementById("backlog").innerText = formatarMoeda(backlog);

    aplicarGauge("gaugeMes", percentualMes);
aplicarGauge("gaugeTemporada", percentualAcumulado);

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
    const tbody = document.querySelector("#tabelaMetas tbody");

    rows.slice(1).forEach(r => {
      const mes = (r[0] || "").replace(/"/g, "").trim();
      if (!mes) return;

      const metaValor = limparNumero(r[1]);
      const entradaPedidos = limparNumero(r[2]);
      const faturamentoValor = limparNumero(r[3]);
      const realizado = limparNumero(r[4]);
      const acumulado = limparNumero(r[5]);
      const projetado = limparNumero(r[6]);

      labels.push(mes);
      meta.push(metaValor);
      faturamento.push(faturamentoValor);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${mes}</td>
        <td>${formatarMoeda(metaValor)}</td>
        <td>${formatarMoeda(entradaPedidos)}</td>
        <td>${formatarMoeda(faturamentoValor)}</td>
        <td>${formatarPercentual(realizado)}</td>
        <td>${formatarPercentual(acumulado)}</td>
        <td>${formatarPercentual(projetado)}</td>
      `;
      tbody.appendChild(tr);
    });

    new Chart(document.getElementById("grafico"), {
      data: {
        labels: labels,
        datasets: [
          {
            type: "bar",
            label: "Meta",
            data: meta,
            backgroundColor: "#1E5BFF",
            borderRadius: 8,
            maxBarThickness: 36
          },
          {
            type: "line",
            label: "Faturamento",
            data: faturamento,
            borderColor: "#21bf73",
            backgroundColor: "#21bf73",
            tension: 0.35,
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
