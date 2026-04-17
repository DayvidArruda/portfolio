const $ = id => document.getElementById(id);
const fBRL = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const labelsGrafico = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const storage = localStorage;

let despesas = JSON.parse(storage.getItem('mycash_db')) || [];
let isDark = storage.getItem('mycash_dark') === 'true';
let meuGrafico;
let mesVisu = new Date().getUTCMonth();
let anoVisu = new Date().getUTCFullYear();

window.onload = () => {
  $('salarioInput').value = storage.getItem('mycash_renda') || 0;
  $('metaValor').value = storage.getItem('mycash_meta') || 0;
  if (isDark) document.body.classList.add('dark');
  atualizarTudo();
};

const filtroPeriodo = (mes = mesVisu, ano = anoVisu) => despesas.filter(d => {
  const dt = new Date(d.data);
  return dt.getUTCMonth() === mes && dt.getUTCFullYear() === ano;
});

const atualizarTudo = () => {
  storage.setItem('mycash_renda', $('salarioInput').value);
  storage.setItem('mycash_meta', $('metaValor').value);
  renderizarTabela();
  atualizarResumos();
  atualizarGrafico();
  atualizarMetas();
};

const toggleDarkMode = () => {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  storage.setItem('mycash_dark', isDark);
};

const toggleParcelas = () => $('campoParcelas').classList.toggle('hidden', $('tipoPagamento').value === 'avista');

const mudarMes = delta => {
  mesVisu += delta;
  if (mesVisu > 11) { mesVisu = 0; anoVisu++; }
  if (mesVisu < 0) { mesVisu = 11; anoVisu--; }
  atualizarTudo();
};

const adicionarGasto = () => {
  const desc = $('desc').value.trim();
  const valor = parseFloat($('valor').value);
  const data = $('data').value;
  const categoria = $('categoria').value;
  const tipo = $('tipoPagamento').value;
  const parcelas = tipo === 'parcelado' ? parseInt($('numParcelas').value, 10) : 1;

  if (!desc || !valor || !data) return alert('Preencha todos os campos!');

  const valorPorParcela = valor / parcelas;
  for (let i = 0; i < parcelas; i++) {
    const dt = new Date(data);
    dt.setUTCMonth(dt.getUTCMonth() + i);
    despesas.push({
      id: Date.now() + i,
      desc: parcelas > 1 ? `${desc} (${i + 1}/${parcelas})` : desc,
      valor: valorPorParcela,
      data: dt.toISOString().split('T')[0],
      categoria,
      quitada: false
    });
  }

  salvar();
  limparCampos();
};

const renderizarTabela = () => {
  const lista = $('listaVencimentos');
  $('mesAtualExtenso').innerText = `${nomesMeses[mesVisu]} ${anoVisu}`;

  const filtradas = filtroPeriodo().sort((a, b) => new Date(a.data) - new Date(b.data));
  lista.innerHTML = filtradas.map(item => {
    const status = getStatus(item.data, item.quitada);
    const dataFmt = new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    return `
      <tr class="hover:bg-slate-50/50 transition border-b border-slate-50">
        <td class="p-4 text-center"><span class="dot dot-${status}"></span></td>
        <td class="p-4 font-bold text-xs"><span class="text-slate-400">${item.categoria}</span><br>${item.desc}</td>
        <td class="p-4 text-[10px] font-bold text-slate-400">${dataFmt}</td>
        <td class="p-4 text-right font-black ${item.quitada ? 'text-green-500 opacity-40 line-through' : 'text-slate-700'}">R$ ${fBRL(item.valor)}</td>
        <td class="p-4 text-center space-x-2"><button onclick="marcarPaga(${item.id})" title="Quitar">✅</button><button onclick="remover(${item.id})" title="Remover">🗑️</button></td>
      </tr>
    `;
  }).join('');

  $('contadorVencimentos').innerText = `${filtradas.length} itens no mês`;
};

const getStatus = (data, quitada) => {
  if (quitada) return 'quitada';
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dt = new Date(data);
  const diff = (dt - hoje) / 86400000;
  if (diff < 0) return 'atrasada';
  if (diff <= 3) return 'proximo';
  return 'pendente';
};

const atualizarResumos = () => {
  const salario = parseFloat($('salarioInput').value) || 0;
  const freq = parseInt($('frequenciaInput').value, 10);
  const dMes = filtroPeriodo();
  const totalGastoMes = dMes.reduce((a, { valor }) => a + valor, 0);

  $('gastoMensalTxt').innerText = fBRL(totalGastoMes);
  $('totalMesTxt').innerText = `R$ ${fBRL(salario - totalGastoMes)}`;
  $('avisoCLT').innerText = freq === 1 ? 'Cobrir com salário' : `Provisionar R$ ${fBRL(totalGastoMes / freq)} p/ recebimento`;
};

const atualizarMetas = () => {
  const meta = parseFloat($('metaValor').value) || 0;
  const salario = parseFloat($('salarioInput').value) || 0;
  const totalMes = filtroPeriodo().reduce((a, { valor }) => a + valor, 0);
  const porc = meta > 0 ? Math.min(100, (Math.max(0, salario - totalMes) / meta) * 100) : 0;

  $('barraProgresso').style.width = `${porc}%`;
  $('metaStatus').innerText = `${porc.toFixed(1)}% alcançado este mês`;
};

const exportarDados = () => {
  const blob = new Blob([JSON.stringify(despesas, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mycash_backup_${Date.now()}.json`;
  a.click();
};

const marcarPaga = id => { despesas = despesas.map(d => d.id === id ? { ...d, quitada: !d.quitada } : d); salvar(); };
const remover = id => { despesas = despesas.filter(d => d.id !== id); salvar(); };
const salvar = () => { storage.setItem('mycash_db', JSON.stringify(despesas)); atualizarTudo(); };

const limparCampos = () => {
  $('desc').value = '';
  $('valor').value = '';
  $('data').value = '';
};

const atualizarGrafico = () => {
  const ctx = $('meuGrafico').getContext('2d');
  const valores = labelsGrafico.map((_, i) => filtroPeriodo(i, anoVisu).reduce((a, { valor }) => a + valor, 0));
  if (meuGrafico) meuGrafico.destroy();
  meuGrafico = new Chart(ctx, {
    type: 'line',
    data: { labels: labelsGrafico, datasets: [{ label: 'Gastos R$', data: valores, borderColor: '#6366f1', borderWidth: 3, tension: 0.4, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
};

async function gerarConselhoIA() {
  const btn = $('btnIA');
  const display = $('conselhoIA');
  const API_KEY = 'AIzaSyCcD9mckgOd-jfnNhMXvUDE3QzrwRLCifo';
  const dMes = filtroPeriodo();

  if (dMes.length === 0) {
    display.innerText = 'Adicione gastos para análise!';
    return;
  }

  const resumo = dMes.map(d => `${d.desc}: R$${d.valor.toFixed(2)}`).join(', ');
  const renda = $('salarioInput').value;
  btn.innerText = 'Analisando...';
  btn.disabled = true;

  const URL_FINAL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  try {
    const response = await fetch(URL_FINAL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Renda: R$${renda}. Gastos: ${resumo}. Dê 3 dicas curtas de economia.` }] }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    display.innerText = data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erro capturado:', error);
    display.innerText = 'Erro na IA. Veja o console (F12) para o detalhe.';
  } finally {
    btn.innerText = 'Pedir Conselho';
    btn.disabled = false;
  }
}
