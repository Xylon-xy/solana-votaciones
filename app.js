let temaActual = "";
const inputPregunta = document.getElementById('input-pregunta');
const btnPublicar = document.getElementById('btn-publicar');

window.onload = () => { actualizarLista(); };

window.validar = () => {
    btnPublicar.disabled = inputPregunta.value.trim().length < 3;
    btnPublicar.className = btnPublicar.disabled ? "btn-p" : "btn-p activo";
};

btnPublicar.onclick = () => { seleccionarTema(inputPregunta.value.trim()); };

function seleccionarTema(titulo) {
    temaActual = titulo;
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('pregunta-box').style.display = 'block';
    document.getElementById('texto-pregunta').innerText = titulo;
    document.getElementById('voto-opciones').style.display = 'block';
    document.getElementById('btn-nueva').style.display = 'block';
    
    let historial = JSON.parse(localStorage.getItem('historial_v') || "[]");
    if (!historial.includes(titulo)) {
        historial.push(titulo);
        localStorage.setItem('historial_v', JSON.stringify(historial));
    }
    actualizarLista();
    cargarVotos(titulo);
}

function actualizarLista() {
    let historial = JSON.parse(localStorage.getItem('historial_v') || "[]");
    document.getElementById('lista-historial').innerHTML = historial.map(t => `
        <div class="historial-item" onclick="seleccionarTema('${t}')">
            <span style="flex-grow:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#999;">${t}</span>
            <button class="btn-borrar" onclick="eliminarPregunta(event, '${t}')">🗑️</button>
        </div>
    `).join('');
}

function eliminarPregunta(e, t) {
    e.stopPropagation();
    if(confirm(`¿Deseas eliminar "${t}"?`)) {
        let h = JSON.parse(localStorage.getItem('historial_v')).filter(i => i !== t);
        localStorage.setItem('historial_v', JSON.stringify(h));
        localStorage.removeItem(`v_${t}`);
        if(temaActual === t) resetearTodo();
        actualizarLista();
    }
}

document.getElementById('btn-conectar').onclick = async () => {
    if (window.solana) {
        try {
            await window.solana.connect();
            activarVotacion();
        } catch(err) { console.log("Rechazado"); }
    } else { alert("Instala Phantom o usa Invitado"); }
};

function activarVotacion() {
    document.getElementById('voto-opciones').style.display = 'none';
    document.getElementById('votos-cont').style.display = 'flex';
    document.getElementById('marcador').style.display = 'block';
    document.getElementById('duelo-cont').style.display = 'block';
}

function cargarVotos(titulo) {
    const d = JSON.parse(localStorage.getItem(`v_${titulo}`) || '{"si":0, "no":0}');
    document.getElementById('txt-si').innerText = d.si;
    document.getElementById('txt-no').innerText = d.no;
    
    const total = d.si + d.no;
    let pSi = 50, pNo = 50;

    if (total > 0) {
        pSi = (d.si / total) * 100;
        pNo = (d.no / total) * 100;
    }

    document.getElementById('barra-si').style.width = pSi + "%";
    document.getElementById('barra-no').style.width = pNo + "%";
}

function votar(tipo) {
    let d = JSON.parse(localStorage.getItem(`v_${temaActual}`) || '{"si":0, "no":0}');
    tipo === 'si' ? d.si++ : d.no++;
    localStorage.setItem(`v_${temaActual}`, JSON.stringify(d));
    cargarVotos(temaActual);
}

function resetearTodo() {
    temaActual = "";
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('pregunta-box').style.display = 'none';
    document.getElementById('voto-opciones').style.display = 'none';
    document.getElementById('votos-cont').style.display = 'none';
    document.getElementById('marcador').style.display = 'none';
    document.getElementById('duelo-cont').style.display = 'none';
    document.getElementById('btn-nueva').style.display = 'none';
    inputPregunta.value = "";
    validar();
}