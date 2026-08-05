document.addEventListener('DOMContentLoaded', () => {
    const cargandoEvento = document.getElementById('cargandoEvento');
    const sinEvento = document.getElementById('sinEvento');
    const detalleEvento = document.getElementById('detalleEvento');
    const form = document.getElementById('reactivaForm');
    const emailInput = document.getElementById('email');
    const confirmEmailInput = document.getElementById('confirmEmail');
    const suggestionEl = document.getElementById('suggestion-email');
    const cuposInfo = document.getElementById('cuposInfo');
    const formStatus = document.getElementById('formStatus');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnVerPrograma = document.getElementById('btnVerPrograma');
    const listaPrograma = document.getElementById('ev_programa');
    const loginPerfil = document.getElementById('loginPerfil');
    const formLogin = document.getElementById('formLogin');
    const loginEmail = document.getElementById('loginEmail');
    const resultadoLogin = document.getElementById('resultadoLogin');
    const perfilCargado = document.getElementById('perfilCargado');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const celularRegex = /^[0-9]{8}$/;

    let eventoActual = null;

    function escaparHTML(valor) {
        const div = document.createElement('div');
        div.textContent = valor === null || valor === undefined ? '' : String(valor);
        return div.innerHTML;
    }

    // ---------------------------------------------------------------
    // 0. Cargar el evento indicado en la URL (?evento=ID). Ya no hay
    //    selector: cada invitación trae su propio link específico.
    // ---------------------------------------------------------------
    function idEventoDesdeURL() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('evento');
        return id ? Number(id) : null;
    }

    // -----------------------------------------------------------------
    // VISTA PREVIA: en vez de pedirle el evento al servidor (que no
    // existe en esta versión), se usa un evento de ejemplo fijo. Cambia
    // estos datos aquí mismo para ver cómo se vería con otro evento.
    // -----------------------------------------------------------------
    const EVENTO_DE_EJEMPLO = {
        id: 1,
        nombre: 'Evento de ejemplo — Webinar ProEmpresas',
        tipo: 'Presencial',
        fecha: '15 de septiembre de 2026',
        hora: '09:30 hrs',
        lugar: 'Centro de Eventos Las Palmeras, Av. Providencia 1234',
        programa: [
            '09:30 - Acreditación y café de bienvenida',
            '10:00 - Palabras de apertura',
            '10:30 - Panel: Transformación digital para PYME',
            '12:00 - Networking y cierre'
        ],
        colorPrincipal: '#0284c7',
        logoUrl: '',
        pieLogosUrl: '',
        cupos: 100,
        inscritos: 42,
        disponibles: 58
    };

    function cargarEvento() {
        // Simula el mismo tiempo de carga que tendría una petición real,
        // para poder ver el estado de "Cargando información del evento…".
        return new Promise(resolve => {
            setTimeout(() => {
                eventoActual = EVENTO_DE_EJEMPLO;
                resolve(pintarEvento(EVENTO_DE_EJEMPLO));
            }, 400);
        });
    }

    function mostrarSinEvento(mensaje) {
        cargandoEvento.style.display = 'none';
        detalleEvento.style.display = 'none';
        form.style.display = 'none';
        loginPerfil.style.display = 'none';
        perfilCargado.style.display = 'none';
        sinEvento.textContent = mensaje;
        sinEvento.style.display = 'block';
    }

    // Aplica el color y el logo propios de este evento (si los definió el
    // organizador); si no, el formulario se queda con los colores por
    // defecto del sistema, sin ningún cambio visible.
    function aplicarMarcaEvento(evento) {
        if (evento.colorPrincipal) {
            document.documentElement.style.setProperty('--primary-color', evento.colorPrincipal);
            document.documentElement.style.setProperty('--primary-dark', oscurecerColor(evento.colorPrincipal, 20));
        }

        const logoEl = document.getElementById('logoEvento');
        if (evento.logoUrl) {
            logoEl.src = evento.logoUrl; // asignación por propiedad: segura, no interpreta HTML
            logoEl.style.display = 'block';
        } else {
            logoEl.style.display = 'none';
        }

        const pieLogosEl = document.getElementById('pieLogosEvento');
        if (evento.pieLogosUrl) {
            pieLogosEl.src = evento.pieLogosUrl;
            pieLogosEl.style.display = 'block';
        } else {
            pieLogosEl.style.display = 'none';
        }
    }

    // Oscurece un color hexadecimal (#RRGGBB) un cierto porcentaje, para
    // tener una variante "oscura" del color principal sin pedirle al
    // organizador que elija dos colores.
    function oscurecerColor(hex, porcentaje) {
        const limpio = hex.replace('#', '');
        if (limpio.length !== 6) return hex;
        const num = parseInt(limpio, 16);
        const factor = 1 - porcentaje / 100;
        const r = Math.max(0, Math.floor(((num >> 16) & 0xFF) * factor));
        const g = Math.max(0, Math.floor(((num >> 8) & 0xFF) * factor));
        const b = Math.max(0, Math.floor((num & 0xFF) * factor));
        return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
    }

    function pintarEvento(evento) {
        cargandoEvento.style.display = 'none';
        detalleEvento.style.display = 'block';

        aplicarMarcaEvento(evento);

        document.getElementById('ev_nombre').textContent = evento.nombre;
        document.getElementById('ev_meta').textContent = `${evento.fecha} · ${evento.hora} · ${evento.tipo}`;

        const lugarLinkEl = document.getElementById('ev_lugarLink');
        lugarLinkEl.textContent = evento.tipo === 'Presencial'
            ? `Lugar: ${evento.lugar}`
            : 'Esta actividad es online. El enlace de conexión se envía por correo al confirmar tu inscripción.';

        if (evento.programa && evento.programa.length > 0) {
            listaPrograma.innerHTML = evento.programa.map(item => `<li>${escaparHTML(item)}</li>`).join('');
        } else {
            btnVerPrograma.style.display = 'none';
        }

        pintarCupos(evento);

        if (evento.disponibles > 0) {
            form.style.display = 'block';
            return true;
        } else {
            mostrarSinEvento('Lo sentimos, los cupos para este evento ya están agotados.');
            return false;
        }
    }

    btnVerPrograma.addEventListener('click', () => {
        const visible = listaPrograma.style.display !== 'none';
        listaPrograma.style.display = visible ? 'none' : 'block';
        btnVerPrograma.textContent = visible ? 'Ver programa ▾' : 'Ocultar programa ▴';
    });

    function pintarCupos(evento) {
        cuposInfo.innerHTML = `
            <span class="cupo-badge ${evento.disponibles <= 0 ? 'agotado' : ''}">
                ${evento.disponibles > 0 ? evento.disponibles + ' cupos disponibles' : 'Cupos agotados'}
            </span>`;
    }

    // El login solo tiene sentido si el evento cargó bien: se encadena
    // después de cargarEvento() en vez de correr en paralelo, para evitar
    // que ambos mensajes ("sin evento" y "datos autocompletados") se
    // muestren a la vez por una condición de carrera.
    cargarEvento().then(eventoValido => {
        if (eventoValido) intentarAutocompletar();
    });

    // ---------------------------------------------------------------
    // 0.1 Login por magic link: si la URL trae ?loginToken=..., se
    //     verifica y se autocompleta el formulario con el perfil guardado.
    //     Si no, se ofrece el formulario para solicitar el enlace.
    // ---------------------------------------------------------------
    function idLoginTokenDesdeURL() {
        return new URLSearchParams(window.location.search).get('loginToken');
    }

    // -----------------------------------------------------------------
    // VISTA PREVIA: no hay servidor real detrás, así que no se puede
    // verificar ningún magic link ni reconocer dispositivos de verdad.
    // Se muestra directamente el cuadro para pedir el enlace, tal como
    // se vería para alguien que nunca se ha inscrito antes.
    // -----------------------------------------------------------------
    function intentarAutocompletar() {
        loginPerfil.style.display = 'block';
    }

    function mostrarPerfilAutocompletado(perfil) {
        autocompletarFormulario(perfil);
        perfilCargado.style.display = 'block';
        loginPerfil.style.display = 'none';
    }

    function autocompletarFormulario(perfil) {
        document.getElementById('nombre').value = perfil.nombre || '';
        document.getElementById('apellido').value = perfil.apellido || '';
        document.getElementById('nombreEmpresa').value = perfil.nombreEmpresa || '';
        document.getElementById('rutPersona').value = perfil.rutPersona || '';
        document.getElementById('rutEmpresa').value = perfil.rutEmpresa || '';
        emailInput.value = perfil.email || '';
        confirmEmailInput.value = perfil.email || '';
        document.getElementById('rubro').value = perfil.rubro || '';
        document.getElementById('facturacion').value = perfil.facturacion || '';
        document.getElementById('trabajadores').value = perfil.trabajadores || '';
        if (perfil.celular) celularInput.value = perfil.celular.replace('+56 9', '');
        if (perfil.genero) {
            const radioGenero = document.querySelector(`input[name="genero"][value="${perfil.genero}"]`);
            if (radioGenero) radioGenero.checked = true;
        }
        if (perfil.newsletter) {
            const radioNews = document.querySelector(`input[name="newsletter"][value="${perfil.newsletter}"]`);
            if (radioNews) radioNews.checked = true;
        }
    }

    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        resultadoLogin.textContent = 'Enviando...';
        resultadoLogin.className = 'resultado-checkin';

        // VISTA PREVIA: no hay servidor real ni correo real — se simula
        // la respuesta después de un momento, solo para ver cómo se ve.
        setTimeout(() => {
            resultadoLogin.textContent = 'Te enviamos un enlace de acceso a tu correo. Válido por 15 minutos.';
            resultadoLogin.className = 'resultado-checkin exito';
        }, 600);
    });

    // ---------------------------------------------------------------
    // 1. Corrector de dominios de correo
    // ---------------------------------------------------------------
    const dominiosValidos = [
        'gmail.com', 'hotmail.com', 'outlook.com', 'outlook.es', 'hotmail.es',
        'yahoo.com', 'yahoo.es', 'live.com', 'icloud.com', 'me.com', 'msn.com', 'uc.cl', 'gmail.cl'
    ];
    let emailSugerido = null;

    function distanciaLevenshtein(a, b) {
        const matriz = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) matriz[i][0] = i;
        for (let j = 0; j <= b.length; j++) matriz[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const costo = a[i - 1] === b[j - 1] ? 0 : 1;
                matriz[i][j] = Math.min(matriz[i - 1][j] + 1, matriz[i][j - 1] + 1, matriz[i - 1][j - 1] + costo);
            }
        }
        return matriz[a.length][b.length];
    }

    function sugerirDominio(correo) {
        const partes = correo.split('@');
        if (partes.length !== 2) return null;
        const usuario = partes[0];
        const dominio = partes[1].toLowerCase().trim();
        if (!dominio || dominiosValidos.includes(dominio)) return null;

        let mejor = null, mejorDistancia = Infinity;
        dominiosValidos.forEach(valido => {
            const d = distanciaLevenshtein(dominio, valido);
            if (d < mejorDistancia) { mejorDistancia = d; mejor = valido; }
        });
        if (mejor && mejorDistancia > 0 && mejorDistancia <= 2) return `${usuario}@${mejor}`;
        return null;
    }

    emailInput.addEventListener('input', () => {
        emailSugerido = null;
        suggestionEl.style.display = 'none';
        suggestionEl.innerHTML = '';
        const valor = emailInput.value.trim();
        if (valor === '' || !valor.includes('@')) return;

        const sugerencia = sugerirDominio(valor);
        if (sugerencia && sugerencia.toLowerCase() !== valor.toLowerCase()) {
            emailSugerido = sugerencia;
            suggestionEl.style.display = 'block';
            suggestionEl.innerHTML = `¿Quisiste decir <button type="button" id="btnAceptarSugerencia">${sugerencia}</button>?`;
            document.getElementById('btnAceptarSugerencia').addEventListener('click', () => {
                emailInput.value = sugerencia;
                emailSugerido = null;
                suggestionEl.style.display = 'none';
                suggestionEl.innerHTML = '';
            });
        }
    });

    // ---------------------------------------------------------------
    // 2. Formateo de RUT en vivo
    // ---------------------------------------------------------------
    function formatearRut(valor) {
        let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
        if (limpio.length === 0) return '';
        let dv = limpio.slice(-1);
        let cuerpo = limpio.slice(0, -1);
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return cuerpo ? `${cuerpo}-${dv}` : dv;
    }
    ['rutPersona', 'rutEmpresa'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', (e) => {
            const cursorAlFinal = e.target.selectionEnd === e.target.value.length;
            const nuevoValor = formatearRut(e.target.value);
            e.target.value = nuevoValor;
            if (cursorAlFinal) e.target.setSelectionRange(nuevoValor.length, nuevoValor.length);
        });
    });

    // ---------------------------------------------------------------
    // 3. Celular
    // ---------------------------------------------------------------
    const celularInput = document.getElementById('celular');
    celularInput.addEventListener('input', () => {
        celularInput.value = celularInput.value.replace(/\D/g, '').slice(0, 8);
    });

    // ---------------------------------------------------------------
    // 4. Envío del formulario
    // ---------------------------------------------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        if (!eventoActual) return;
        let isFormValid = true;

        const camposTexto = ['nombre', 'apellido', 'nombreEmpresa'];
        camposTexto.forEach(id => {
            const el = document.getElementById(id);
            if (el.value.trim() === '') { markInvalid(el, true); isFormValid = false; } else markInvalid(el, false);
        });

        ['genero', 'newsletter'].forEach(name => {
            const group = document.getElementsByName(name);
            const parent = group[0].closest('.form-group');
            let checked = false;
            group.forEach(radio => { if (radio.checked) checked = true; });
            if (!checked) { parent.classList.add('invalid'); isFormValid = false; } else parent.classList.remove('invalid');
        });

        ['rutPersona', 'rutEmpresa'].forEach(id => {
            const el = document.getElementById(id);
            if (!validarRutChileno(el.value)) { markInvalid(el, true); isFormValid = false; } else markInvalid(el, false);
        });

        if (!emailRegex.test(emailInput.value.trim())) { markInvalid(emailInput, true); isFormValid = false; } else markInvalid(emailInput, false);

        if (confirmEmailInput.value.trim() === '' || emailInput.value.trim().toLowerCase() !== confirmEmailInput.value.trim().toLowerCase()) {
            markInvalid(confirmEmailInput, true); isFormValid = false;
        } else markInvalid(confirmEmailInput, false);

        if (isFormValid && emailSugerido) {
            const continuar = window.confirm(`Escribiste "${emailInput.value.trim()}". ¿Confirmas que este correo es correcto tal cual lo escribiste?`);
            if (!continuar) { emailInput.focus(); return; }
        }

        ['rubro', 'facturacion'].forEach(id => {
            const el = document.getElementById(id);
            if (el.value === '') { markInvalid(el, true); isFormValid = false; } else markInvalid(el, false);
        });

        const trabajadores = document.getElementById('trabajadores');
        if (trabajadores.value === '' || parseInt(trabajadores.value) < 1) { markInvalid(trabajadores, true); isFormValid = false; } else markInvalid(trabajadores, false);

        if (!celularRegex.test(celularInput.value.trim()) || celularInput.value.trim().startsWith('0')) {
            markInvalid(celularInput, true); isFormValid = false;
        } else markInvalid(celularInput, false);

        const privacidad = document.getElementById('privacidad');
        const privacidadParent = privacidad.closest('.form-group');
        if (!privacidad.checked) { privacidadParent.classList.add('invalid'); isFormValid = false; } else privacidadParent.classList.remove('invalid');

        if (!isFormValid) return;

        const payload = {
            eventoId: eventoActual.id,
            nombre: document.getElementById('nombre').value.trim(),
            apellido: document.getElementById('apellido').value.trim(),
            genero: document.querySelector('input[name="genero"]:checked').value,
            nombreEmpresa: document.getElementById('nombreEmpresa').value.trim(),
            rutPersona: document.getElementById('rutPersona').value.trim(),
            rutEmpresa: document.getElementById('rutEmpresa').value.trim(),
            email: emailInput.value.trim().toLowerCase(),
            rubro: document.getElementById('rubro').value,
            facturacion: document.getElementById('facturacion').value,
            trabajadores: parseInt(trabajadores.value),
            celular: '+56 9' + celularInput.value.trim(),
            newsletter: document.querySelector('input[name="newsletter"]:checked').value,
            aceptaPoliticaPrivacidad: true
        };

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Enviando...';

        // VISTA PREVIA: no hay servidor real — se simula una respuesta
        // exitosa después de un momento, para ver la pantalla final.
        // Aquí, en el archivo real, va la llamada fetch('/api/inscripcion').
        setTimeout(() => {
            formStatus.textContent = 'Inscripción registrada con éxito. Revisa tu correo para la confirmación.';
            formStatus.className = 'form-status success';
            form.reset();
            suggestionEl.style.display = 'none';
            form.style.display = 'none';
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Enviar Inscripción';
        }, 700);
    });

    function markInvalid(element, isInvalid) {
        if (isInvalid) element.classList.add('invalid'); else element.classList.remove('invalid');
    }

    function validarRutChileno(rut) {
        if (!rut) return false;
        let valor = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
        if (valor.length < 8) return false;
        let cuerpo = valor.slice(0, -1);
        let dv = valor.slice(-1);
        let suma = 0, multiplo = 2;
        for (let i = 1; i <= cuerpo.length; i++) {
            let index = multiplo * valor.charAt(cuerpo.length - i);
            suma += index;
            multiplo = multiplo < 7 ? multiplo + 1 : 2;
        }
        let dvEsperado = 11 - (suma % 11);
        let dvEsperadoStr = dvEsperado == 11 ? '0' : dvEsperado == 10 ? 'K' : String(dvEsperado);
        return dvEsperadoStr === dv;
    }
});
