const MAX_IDEA = 500;

const $ = (sel) => document.querySelector(sel);
const formulario = $('#formulario');
const campoIdea = $('#idea');
const botonGenerar = $('#generar');
const contador = $('#contador');
const resultado = $('#resultado');

let actual = null;

// Crea nodos con textContent: lo que devuelve el modelo nunca se inserta como HTML.
function el(etiqueta, props = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [clave, valor] of Object.entries(props)) {
    if (valor == null || valor === false) continue;
    if (clave === 'class') nodo.className = valor;
    else if (clave === 'text') nodo.textContent = valor;
    else if (clave.startsWith('on')) nodo.addEventListener(clave.slice(2), valor);
    else nodo.setAttribute(clave, valor === true ? '' : valor);
  }
  for (const hijo of hijos.flat()) {
    if (hijo == null || hijo === false) continue;
    nodo.append(hijo);
  }
  return nodo;
}

const conMayuscula = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const quitarPunto = (s) => s.replace(/[.\s]+$/, '');
const codigo = (prefijo, i) => `${prefijo}-${String(i + 1).padStart(2, '0')}`;

function avisar(mensaje) {
  const aviso = $('#aviso');
  aviso.textContent = mensaje;
  aviso.classList.add('visible');
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => aviso.classList.remove('visible'), 2600);
}

function actualizarContador() {
  const n = campoIdea.value.length;
  contador.textContent = `${n} / ${MAX_IDEA}`;
  contador.classList.toggle('cerca', n > MAX_IDEA * 0.9);
}

function mostrarCarga() {
  resultado.replaceChildren(
    el('article', { class: 'spec cargando', 'aria-busy': 'true' },
      el('p', { class: 'estado', text: 'Redactando la especificación…' }),
      el('div', { class: 'linea-g titulo' }),
      el('div', { class: 'linea-g corta' }),
      el('div', { class: 'linea-g' }),
      el('div', { class: 'linea-g corta' }),
      el('div', { class: 'linea-g' })
    )
  );
}

function mostrarError(mensaje) {
  resultado.replaceChildren(
    el('div', { class: 'fallo', role: 'alert' },
      el('p', { text: mensaje }),
      el('button', { class: 'boton sec', type: 'button', text: 'Reintentar', onclick: generar })
    )
  );
}

function cabeceraBloque(numero, titulo, extra) {
  return el('div', { class: 'bloque-cab' },
    el('span', { class: 'num', text: numero }),
    el('h3', { text: titulo }),
    extra
  );
}

function mostrarSpec(spec, idea) {
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const revisados = el('span', { class: 'extra' });
  const contarRevisados = () => {
    const marcados = spec.criterios.filter((c) => c.hecho).length;
    revisados.textContent = `${marcados} de ${spec.criterios.length} revisados`;
    revisados.classList.toggle('completo', marcados === spec.criterios.length);
  };

  const historias = spec.historias.map((h, i) =>
    el('li', {},
      el('span', { class: 'id', text: codigo('HU', i) }),
      el('p', {}, 'Como ', el('b', { text: h.rol }), ', quiero ', el('b', { text: quitarPunto(h.accion) }),
        ' para ', el('b', { text: quitarPunto(h.beneficio) }), '.')
    )
  );

  const criterios = spec.criterios.map((c, i) =>
    el('li', {},
      el('label', {},
        el('input', {
          type: 'checkbox',
          onchange: (e) => { c.hecho = e.target.checked; contarRevisados(); },
        }),
        el('span', { class: 'id', text: codigo('CA', i) }),
        el('span', { class: 'txt', text: c.texto })
      )
    )
  );

  const fases = spec.roadmap.map((f, i) =>
    el('li', {},
      el('span', { class: 'etiqueta', text: `Fase ${i + 1}` }),
      el('strong', { text: f.fase }),
      el('p', { text: f.detalle })
    )
  );

  const titulo = el('h2', { tabindex: '-1', text: spec.titulo });

  resultado.replaceChildren(
    el('article', { class: 'spec' },
      el('header', { class: 'spec-cab' },
        el('p', { class: 'sello', text: `Especificación · ${fecha}` }),
        titulo,
        el('blockquote', { text: idea }),
        el('div', { class: 'acciones' },
          el('button', { class: 'boton', type: 'button', text: 'Copiar en Markdown', onclick: copiar }),
          el('button', { class: 'boton sec', type: 'button', text: 'Descargar .md', onclick: descargar }),
          el('button', { class: 'boton sec', type: 'button', text: 'Nueva idea', onclick: empezarDeNuevo })
        )
      ),
      el('section', { class: 'bloque' }, cabeceraBloque('01', 'Historias de usuario'), el('ol', { class: 'historias' }, historias)),
      el('section', { class: 'bloque' }, cabeceraBloque('02', 'Criterios de aceptación', revisados), el('ul', { class: 'criterios' }, criterios)),
      el('section', { class: 'bloque' }, cabeceraBloque('03', 'Plan en tres fases'), el('ol', { class: 'fases' }, fases))
    )
  );

  contarRevisados();
  titulo.focus({ preventScroll: true });
  resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function aMarkdown({ spec, idea }) {
  const lineas = [
    `# ${spec.titulo}`,
    '',
    `> ${idea}`,
    '',
    '## Historias de usuario',
    '',
    ...spec.historias.map((h, i) =>
      `- **${codigo('HU', i)}** Como ${h.rol}, quiero ${quitarPunto(h.accion)} para ${quitarPunto(h.beneficio)}.`),
    '',
    '## Criterios de aceptación',
    '',
    ...spec.criterios.map((c, i) => `- [${c.hecho ? 'x' : ' '}] **${codigo('CA', i)}** ${c.texto}`),
    '',
    '## Plan',
    '',
    ...spec.roadmap.map((f, i) => `${i + 1}. **${f.fase}**: ${f.detalle}`),
    '',
  ];
  return lineas.join('\n');
}

async function copiar() {
  try {
    await navigator.clipboard.writeText(aMarkdown(actual));
    avisar('Copiado. Pégalo en Jira, Notion o donde trabajes.');
  } catch {
    avisar('No se pudo copiar. Prueba con «Descargar .md».');
  }
}

function descargar() {
  const nombre = actual.spec.titulo
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'especificacion';
  const archivo = new Blob([aMarkdown(actual)], { type: 'text/markdown;charset=utf-8' });
  const enlace = el('a', { href: URL.createObjectURL(archivo), download: `${nombre}.md` });
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

function empezarDeNuevo() {
  actual = null;
  resultado.replaceChildren();
  campoIdea.value = '';
  actualizarContador();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  campoIdea.focus({ preventScroll: true });
}

async function generar() {
  const idea = campoIdea.value.trim();
  if (!idea) {
    campoIdea.focus();
    avisar('Escribe primero tu idea.');
    return;
  }

  botonGenerar.disabled = true;
  botonGenerar.textContent = 'Generando…';
  mostrarCarga();

  try {
    const respuesta = await fetch('/api/generar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(datos.error || 'Algo ha fallado. Inténtalo de nuevo.');

    const spec = { ...datos, criterios: datos.criterios.map((texto) => ({ texto, hecho: false })) };
    actual = { spec, idea };
    mostrarSpec(spec, idea);
  } catch (error) {
    mostrarError(error.message || 'No hay conexión. Revisa tu red e inténtalo de nuevo.');
  } finally {
    botonGenerar.disabled = false;
    botonGenerar.textContent = 'Generar especificación';
  }
}

formulario.addEventListener('submit', (e) => {
  e.preventDefault();
  generar();
});

campoIdea.addEventListener('input', actualizarContador);
campoIdea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    generar();
  }
});

document.querySelectorAll('[data-idea]').forEach((boton) => {
  boton.addEventListener('click', () => {
    campoIdea.value = boton.dataset.idea;
    actualizarContador();
    campoIdea.focus();
  });
});

actualizarContador();
