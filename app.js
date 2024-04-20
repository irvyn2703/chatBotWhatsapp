const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const url = 'http://172.28.158.13:3000/';
const imagen = 'https://unsplash.com/es/fotos/perro-sentado-en-el-suelo-de-parquet-d-vxciNS6ck';

const saludos = ['Hola', 'ola', 'holi', 'hola'];
const verTareas = ['1.-', '1.', '1', 'ver tareas', 'tareas']
const AgregarTareas = ['2.-', '2.', '2', 'agregar', 'Agregar', 'tarea']
const Informacion = ['3.-', '3.', '3', 'informacion', 'Inforacion']
const Info = ['4.-', '4.', '4', 'saber', 'Saber', 'mas']

const verTareasListas = ['1.-', '1.', '1', 'listas']
const verTareasEnCurso = ['2.-', '2.', '2', 'curso']
const verTareasSiEmpezar = ['3.-', '3.', '3', 'empezar']
const verTareasTodas = ['4.-', '4.', '4', 'todas']

let data
let evento

const getDataTareas = async (tipo) => {
    const peticion = url + `tareas?tipo=${tipo}`;
    try {
        const response = await fetch(peticion);
        if (!response.ok) {
            throw new Error('No se pudo obtener los datos');    
        }
      
        const data = await response.json();
        // Agregar encabezado dependiendo del tipo
        let encabezado;
        if (tipo === "listo") {
            encabezado = "👍 Tareas completadas:\n";
        } else if (tipo === "sin_empezar") {
            encabezado = "🚫 Tareas sin empezar:\n";
        } else if (tipo === "en_curso") {
            encabezado = "⏳ Tareas en curso:\n";
        } else if (tipo === "todas") {
            encabezado = "📋 Todas las tareas:\n";
        } else {
            encabezado = "📃 Tareas:\n";
        }
        
        // Convertir el objeto JSON en una cadena y agregar el encabezado antes de cada objeto
        const dataString = data.map(obj => `${JSON.stringify(obj)}`).join('\n\n');

        final = encabezado + dataString
        return final; // Devolver la cadena resultante
    } catch (error) {
        console.log(error);
        throw new Error('Hubo un error al obtener las tareas');
    }
}


const getAgregarTareas = async (nombre, des) => {
    const peticion = url + `agregar?nombre=${nombre}&descripcion=${des}`;
    console.log(peticion)
    try {
        const response = await fetch(peticion);
        
        if (!response.ok) {
            throw new Error('No se pudo obtener los datos');
        }

        // Si la petición es exitosa, no necesitas hacer nada más
    } catch (error) {
        console.log(error);
        throw new Error('Hubo un error al obtener las tareas');
    }
}



const flowTareaListas = addKeyword(verTareasListas).addAction(async(_, { flowDynamic }) => {
    data = await getDataTareas("listo");
    console.log(data);
    return await flowDynamic(data);
});

const flowTareasinEmpezar = addKeyword(verTareasSiEmpezar).addAction(async(_, { flowDynamic }) => {
    data = await getDataTareas("sin_empezar");
    console.log(data);
    return await flowDynamic(data);
});

const flowTareaEncurso = addKeyword(verTareasEnCurso).addAction(async(_, { flowDynamic }) => {
    data = await getDataTareas("en_curso");
    console.log(data);
    return await flowDynamic(data);
});

const flowTareaTodas = addKeyword(verTareasTodas).addAction(async(_, { flowDynamic }) => {
    data = await getDataTareas("todas");
    console.log(data);
    return await flowDynamic(data);
});


const flowAgregar = addKeyword(AgregarTareas)
  .addAnswer(
    ['Hola!', 'Para enviar el formulario necesito unos datos...', 'Escriba el nombre del evento*'],
    { capture: true},
    async (ctx, { flowDynamic }) => {
      nombre = ctx.body;
      return await flowDynamic(`...`);
    }
  )
  .addAnswer(
    ['También necesito una descripción del evento'],
    { capture: true},
    async (ctx, { flowDynamic}) => {
      
      desc = ctx.body;
      data = await getAgregarTareas(nombre, desc)
      return await flowDynamic(data);
      // quiero hacer una peticion con getAgregarTareas(nombre, des)
    }
  );




const flowInformacion = addKeyword(Informacion).addAnswer('Hola y Bienvenido! como puedo ayudarte')

const flowInfo = addKeyword(Info).addAnswer(
    'Gracias por interesarte en mi 😚. \n \n mas informacion sobre mi en https://www.notion.so/Imagina-un-mundo-donde-organizar-tus-ideas-y-proyectos-sea-tan-f-cil-bc80179c702e43abba8375d450216d8e?pvs=4',
)

// Primero declaramos flowTarea
const flowTarea = addKeyword(verTareas).addAnswer(
    [
        '¿Qué quieres hacer? 🧐',
        '➡ 1.-Ver eventos completados',
        '➡ 2.-Ver eventos en curso',
        '➡ 3.-Ver eventos sin empezar',
        '➡ 4.-Ver todos los eventos',
    ], null, null, [flowTareaListas, flowTareaEncurso, flowTareasinEmpezar, flowTareaTodas]
);

const flowPrincipal = addKeyword(saludos).addAnswer('🙌 Hola bienvenido soy RECO').addAnswer(
    [
        'Te comparto lo que podemos hacer hoy 😏: ',
        '➡ 1.-Ver eventos',
        '➡ 2.-Agregar evento',
        '➡ 3.-Información de mis eventos',
        '➡ 4.-¿Quieres iniciar tus primeros pasos conmigo? 👉👈',
    ], null, null, [flowTarea, flowAgregar, flowInformacion, flowInfo]
);


const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
;

    QRPortalWeb()
}

main()
