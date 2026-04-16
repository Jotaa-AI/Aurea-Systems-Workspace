-- ============================================================
-- NOTION DATA SEED
-- Migrates all content from Notion "Aurea Systems" workspace
-- Run this AFTER all migrations (001-007) have been applied
-- ============================================================

-- Get the workspace ID (assumes workspace already exists)
DO $$
DECLARE
  ws_id UUID;
  -- Page IDs
  root_id UUID;
  procesos_id UUID;
  credenciales_id UUID;
  closing_id UUID;
  clientes_id UUID;
  coco_id UUID;
  estrategia_id UUID;
  -- Task board
  board_id UUID;
  -- Client
  client_id UUID;
BEGIN

-- Get workspace
SELECT id INTO ws_id FROM workspaces LIMIT 1;
IF ws_id IS NULL THEN
  RAISE EXCEPTION 'No workspace found. Create one first.';
END IF;

-- ============================================================
-- 1. PAGES - Recreate Notion page hierarchy
-- ============================================================

-- Root: Aurea Systems (top-level page)
root_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (root_id, ws_id, NULL, 'Aurea Systems', '🏢', '[
  {"id":"b1","type":"paragraph","content":[{"type":"text","text":"Workspace principal de Aurea Systems. Aqui se centraliza toda la informacion de la agencia.","styles":{}}],"props":{},"children":[]}
]'::jsonb, true);

-- PROCESOS INTERNOS
procesos_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (procesos_id, ws_id, root_id, 'PROCESOS INTERNOS', '🔒', '[
  {"id":"p1","type":"paragraph","content":[{"type":"text","text":"Procesos internos de la agencia: tareas, credenciales y scripts de venta.","styles":{}}],"props":{},"children":[]}
]'::jsonb, true);

-- Credenciales (child of PROCESOS INTERNOS)
credenciales_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (credenciales_id, ws_id, procesos_id, 'Credenciales', '🔐', '[
  {"id":"c1","type":"table","content":{"type":"tableContent","rows":[
    {"cells":[
      [{"type":"text","text":"Servicio","styles":{"bold":true}}],
      [{"type":"text","text":"URL","styles":{"bold":true}}],
      [{"type":"text","text":"Usuario","styles":{"bold":true}}],
      [{"type":"text","text":"Password","styles":{"bold":true}}]
    ]},
    {"cells":[
      [{"type":"text","text":"Dominio Hostinger","styles":{}}],
      [{"type":"text","text":"https://hpanel.hostinger.com/domains","styles":{}}],
      [{"type":"text","text":"","styles":{}}],
      [{"type":"text","text":"****","styles":{}}]
    ]},
    {"cells":[
      [{"type":"text","text":"Email Hostinger","styles":{}}],
      [{"type":"text","text":"hpanel.hostinger.com/email/aureasystems.es","styles":{}}],
      [{"type":"text","text":"hola@aureasystems.es","styles":{}}],
      [{"type":"text","text":"****","styles":{}}]
    ]}
  ]},"props":{},"children":[]}
]'::jsonb, false);

-- CLOSING (child of PROCESOS INTERNOS)
closing_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (closing_id, ws_id, procesos_id, 'CLOSING', '💰', '[
  {"id":"cl1","type":"paragraph","content":[{"type":"text","text":"La inversion es de 1000€ al mes + anuncios. Esto incluye todo el sistema de captacion, produccion de contenido, conversion, CRM. Tardamos menos de 10 dias en implementar. Normalmente las nuevas citas agendadas llegan a partir del dia 3 de lanzamiento.","styles":{}}],"props":{},"children":[]}
]'::jsonb, false);

-- CLIENTES
clientes_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (clientes_id, ws_id, root_id, 'CLIENTES', '🤝🏼', '[
  {"id":"cli1","type":"paragraph","content":[{"type":"text","text":"Portfolio de clientes activos de Aurea Systems.","styles":{}}],"props":{},"children":[]}
]'::jsonb, true);

-- Cocó Clinics (child of CLIENTES)
coco_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (coco_id, ws_id, clientes_id, 'Coco Clinics', '💯', '[
  {"id":"cc1","type":"heading","content":[{"type":"text","text":"Objetivos","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"cc2","type":"numberedListItem","content":[{"type":"text","text":"Conseguir volumen de leads. Llevarlos a la clinica.","styles":{}}],"props":{},"children":[]},
  {"id":"cc3","type":"numberedListItem","content":[{"type":"text","text":"Llenar agenda para subir precios.","styles":{}}],"props":{},"children":[]},
  {"id":"cc4","type":"heading","content":[{"type":"text","text":"Lanzamiento","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"cc5","type":"paragraph","content":[{"type":"text","text":"A nivel externo semana 23 de febrero","styles":{}}],"props":{},"children":[]},
  {"id":"cc6","type":"paragraph","content":[{"type":"text","text":"A nivel interno reto dia 12 de febrero.","styles":{}}],"props":{},"children":[]}
]'::jsonb, false);

-- ESTRATEGIA DE CONTENIDOS
estrategia_id := gen_random_uuid();
INSERT INTO pages (id, workspace_id, parent_id, title, icon, content, is_favorite)
VALUES (estrategia_id, ws_id, root_id, 'ESTRATEGIA DE CONTENIDOS', '📈', '[
  {"id":"e1","type":"heading","content":[{"type":"text","text":"FUNCION DE CADA FORMATO","styles":{}}],"props":{"level":2},"children":[]},
  {"id":"e2","type":"bulletListItem","content":[{"type":"text","text":"🎥 Reels / Shorts → alcance (te descubren)","styles":{}}],"props":{},"children":[]},
  {"id":"e3","type":"bulletListItem","content":[{"type":"text","text":"📊 Carruseles → valor (te guardan)","styles":{}}],"props":{},"children":[]},
  {"id":"e4","type":"bulletListItem","content":[{"type":"text","text":"🎬 YouTube largo → autoridad (te confian)","styles":{}}],"props":{},"children":[]},
  {"id":"e5","type":"bulletListItem","content":[{"type":"text","text":"💬 Stories / POV → conexion (te humanizan) + VENTA","styles":{}}],"props":{},"children":[]},

  {"id":"e6","type":"heading","content":[{"type":"text","text":"PILARES","styles":{}}],"props":{"level":1},"children":[]},

  {"id":"e7","type":"heading","content":[{"type":"text","text":"🔥 PILAR 1: LEADS / CONVERSION (CORE)","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e8","type":"bulletListItem","content":[{"type":"text","text":"Te escriben pero no compran","styles":{}}],"props":{},"children":[]},
  {"id":"e9","type":"bulletListItem","content":[{"type":"text","text":"Te dejan en visto","styles":{}}],"props":{},"children":[]},
  {"id":"e10","type":"bulletListItem","content":[{"type":"text","text":"No-show","styles":{}}],"props":{},"children":[]},
  {"id":"e11","type":"bulletListItem","content":[{"type":"text","text":"No convierten en consulta","styles":{}}],"props":{},"children":[]},

  {"id":"e12","type":"heading","content":[{"type":"text","text":"💰 PILAR 2: VENTAS / CLOSING","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e13","type":"bulletListItem","content":[{"type":"text","text":"Como vender sin parecer pesado","styles":{}}],"props":{},"children":[]},
  {"id":"e14","type":"bulletListItem","content":[{"type":"text","text":"Como hacer diagnostico","styles":{}}],"props":{},"children":[]},
  {"id":"e15","type":"bulletListItem","content":[{"type":"text","text":"Como guiar conversacion","styles":{}}],"props":{},"children":[]},
  {"id":"e16","type":"bulletListItem","content":[{"type":"text","text":"Objeciones","styles":{}}],"props":{},"children":[]},

  {"id":"e17","type":"heading","content":[{"type":"text","text":"🎯 PILAR 3: META ADS / CRECIMIENTO","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e18","type":"bulletListItem","content":[{"type":"text","text":"Errores ads","styles":{}}],"props":{},"children":[]},
  {"id":"e19","type":"bulletListItem","content":[{"type":"text","text":"Creativos","styles":{}}],"props":{},"children":[]},
  {"id":"e20","type":"bulletListItem","content":[{"type":"text","text":"Segmentacion","styles":{}}],"props":{},"children":[]},
  {"id":"e21","type":"bulletListItem","content":[{"type":"text","text":"Como atraer mejor cliente","styles":{}}],"props":{},"children":[]},

  {"id":"e22","type":"heading","content":[{"type":"text","text":"🧠 PILAR 4: SISTEMA (TU DIFERENCIAL)","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e23","type":"bulletListItem","content":[{"type":"text","text":"Como funciona todo el proceso","styles":{}}],"props":{},"children":[]},
  {"id":"e24","type":"bulletListItem","content":[{"type":"text","text":"Como se conecta todo","styles":{}}],"props":{},"children":[]},
  {"id":"e25","type":"bulletListItem","content":[{"type":"text","text":"Casos reales","styles":{}}],"props":{},"children":[]},

  {"id":"e26","type":"heading","content":[{"type":"text","text":"🚀 PILAR 5: EMPRENDIMIENTO / MENTALIDAD","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e27","type":"bulletListItem","content":[{"type":"text","text":"Errores de agencia","styles":{}}],"props":{},"children":[]},
  {"id":"e28","type":"bulletListItem","content":[{"type":"text","text":"Lo que nadie te cuenta","styles":{}}],"props":{},"children":[]},
  {"id":"e29","type":"bulletListItem","content":[{"type":"text","text":"Experiencias","styles":{}}],"props":{},"children":[]},

  {"id":"e30","type":"heading","content":[{"type":"text","text":"ANGULOS","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e31","type":"heading","content":[{"type":"text","text":"PROBLEMAS","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e32","type":"paragraph","content":[{"type":"text","text":"Ej: Te dejan en visto.","styles":{}}],"props":{},"children":[]},
  {"id":"e33","type":"heading","content":[{"type":"text","text":"SOLUCIONES","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e34","type":"paragraph","content":[{"type":"text","text":"3 mensajes que convierten","styles":{}}],"props":{},"children":[]},
  {"id":"e35","type":"heading","content":[{"type":"text","text":"AUTORIDAD","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e36","type":"paragraph","content":[{"type":"text","text":"Resultados, analisis, esto es lo que hacemos etc.","styles":{}}],"props":{},"children":[]},
  {"id":"e37","type":"heading","content":[{"type":"text","text":"PRUEBA SOCIAL","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e38","type":"paragraph","content":[{"type":"text","text":"Chats, antes vs despues, caso, testimonio etc.","styles":{}}],"props":{},"children":[]},
  {"id":"e39","type":"heading","content":[{"type":"text","text":"CREENCIA","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e40","type":"paragraph","content":[{"type":"text","text":"No hace falta publicar posts cada semana, no es el lead, deja de hacer descuentos, etc.","styles":{}}],"props":{},"children":[]},
  {"id":"e41","type":"heading","content":[{"type":"text","text":"STORYTELLING / PERSONAL","styles":{}}],"props":{"level":3},"children":[]},
  {"id":"e42","type":"paragraph","content":[{"type":"text","text":"Errores, aprendizajes, experiencias...","styles":{}}],"props":{},"children":[]},

  {"id":"e43","type":"heading","content":[{"type":"text","text":"FORMATOS","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e44","type":"bulletListItem","content":[{"type":"text","text":"Hook directo","styles":{}}],"props":{},"children":[]},
  {"id":"e45","type":"bulletListItem","content":[{"type":"text","text":"Listas","styles":{}}],"props":{},"children":[]},
  {"id":"e46","type":"bulletListItem","content":[{"type":"text","text":"POV","styles":{}}],"props":{},"children":[]},
  {"id":"e47","type":"bulletListItem","content":[{"type":"text","text":"Breakdown (bien vs mal)","styles":{}}],"props":{},"children":[]},
  {"id":"e48","type":"bulletListItem","content":[{"type":"text","text":"Historia","styles":{}}],"props":{},"children":[]},
  {"id":"e49","type":"bulletListItem","content":[{"type":"text","text":"Antes vs despues","styles":{}}],"props":{},"children":[]},
  {"id":"e50","type":"bulletListItem","content":[{"type":"text","text":"Tutorial expres","styles":{}}],"props":{},"children":[]},
  {"id":"e51","type":"bulletListItem","content":[{"type":"text","text":"Recortes videocall (auditorias y mentorias)","styles":{}}],"props":{},"children":[]},
  {"id":"e52","type":"bulletListItem","content":[{"type":"text","text":"Recortes de youtube","styles":{}}],"props":{},"children":[]},
  {"id":"e53","type":"bulletListItem","content":[{"type":"text","text":"Podcast (profundo, conexion)","styles":{}}],"props":{},"children":[]},
  {"id":"e54","type":"bulletListItem","content":[{"type":"text","text":"Demostracion","styles":{}}],"props":{},"children":[]},
  {"id":"e55","type":"bulletListItem","content":[{"type":"text","text":"Polemico","styles":{}}],"props":{},"children":[]},
  {"id":"e56","type":"bulletListItem","content":[{"type":"text","text":"Bandas negras con texto simple","styles":{}}],"props":{},"children":[]},

  {"id":"e57","type":"heading","content":[{"type":"text","text":"🔥 A) CONTENIDO DE ALCANCE (VIRAL)","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e58","type":"paragraph","content":[{"type":"text","text":"👉 objetivo: atraer","styles":{"bold":true}}],"props":{},"children":[]},
  {"id":"e59","type":"paragraph","content":[{"type":"text","text":"Formatos: POV, hooks agresivos, errores, frases tipo verdad incomoda","styles":{}}],"props":{},"children":[]},
  {"id":"e60","type":"paragraph","content":[{"type":"text","text":"Ejemplos: \"No es el lead, eres tu\" / \"Asi pierdes pacientes sin darte cuenta\" / POV: eres una clinica respondiendo mal","styles":{}}],"props":{},"children":[]},

  {"id":"e61","type":"heading","content":[{"type":"text","text":"🔥 B) CONTENIDO DE VALOR (GUARDABLE)","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e62","type":"paragraph","content":[{"type":"text","text":"👉 objetivo: autoridad","styles":{"bold":true}}],"props":{},"children":[]},
  {"id":"e63","type":"paragraph","content":[{"type":"text","text":"Formatos: listas, tutorial, carrusel, metodo","styles":{}}],"props":{},"children":[]},
  {"id":"e64","type":"paragraph","content":[{"type":"text","text":"Ejemplos: \"5 errores que te hacen perder pacientes\" / \"guion de WhatsApp\" / \"como filtrar clientes\"","styles":{}}],"props":{},"children":[]},

  {"id":"e65","type":"heading","content":[{"type":"text","text":"🔥 C) CONTENIDO DE CONEXION (HUMANO)","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e66","type":"paragraph","content":[{"type":"text","text":"👉 objetivo: confianza","styles":{"bold":true}}],"props":{},"children":[]},
  {"id":"e67","type":"paragraph","content":[{"type":"text","text":"Formatos: storytelling, experiencia, opinion","styles":{}}],"props":{},"children":[]},
  {"id":"e68","type":"paragraph","content":[{"type":"text","text":"Ejemplos: \"un cliente me dijo esto...\" / \"lo que aprendi trabajando con clinicas\" / \"esto pensaba antes\"","styles":{}}],"props":{},"children":[]},

  {"id":"e69","type":"heading","content":[{"type":"text","text":"🔥 D) CONTENIDO DE AUTORIDAD","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e70","type":"paragraph","content":[{"type":"text","text":"👉 objetivo: posicionarte","styles":{"bold":true}}],"props":{},"children":[]},
  {"id":"e71","type":"paragraph","content":[{"type":"text","text":"Formatos: explicacion profunda, breakdown, analisis","styles":{}}],"props":{},"children":[]},
  {"id":"e72","type":"paragraph","content":[{"type":"text","text":"Ejemplos: \"por que tu sistema no funciona\" / \"esto es lo que nadie entiende del marketing\"","styles":{}}],"props":{},"children":[]},

  {"id":"e73","type":"heading","content":[{"type":"text","text":"🔥 E) CONTENIDO DE CONVERSION","styles":{}}],"props":{"level":1},"children":[]},
  {"id":"e74","type":"paragraph","content":[{"type":"text","text":"👉 objetivo: vender","styles":{"bold":true}}],"props":{},"children":[]},
  {"id":"e75","type":"paragraph","content":[{"type":"text","text":"Formatos: CTA directo, prueba social, casos","styles":{}}],"props":{},"children":[]},
  {"id":"e76","type":"paragraph","content":[{"type":"text","text":"Ejemplos: \"como una clinica paso de X a X\" / \"lo que hicimos aqui\"","styles":{}}],"props":{},"children":[]}
]'::jsonb, true);

-- ============================================================
-- 2. CLIENT - Cocó Clinics
-- ============================================================

client_id := gen_random_uuid();
INSERT INTO clients (id, workspace_id, name, status, mrr, notes, health_score)
VALUES (client_id, ws_id, 'Cocó Clinics', 'active', 1000,
  'Objetivo: Conseguir volumen de leads y llevarlos a la clinica. Llenar agenda para subir precios. Lanzamiento externo semana 23 febrero, interno dia 12 febrero.',
  80);

-- ============================================================
-- 3. TASK BOARD + TASKS (from Tasks Tracker + Onboarding)
-- ============================================================

board_id := gen_random_uuid();
INSERT INTO task_boards (id, workspace_id, name, columns)
VALUES (board_id, ws_id, 'Tasks Tracker', '[
  {"id":"col-not-started","title":"Not started"},
  {"id":"col-in-progress","title":"In progress"},
  {"id":"col-done","title":"Done"}
]'::jsonb);

-- Tasks from Notion Tasks Tracker
INSERT INTO tasks (workspace_id, board_id, title, description, status, priority, order_index) VALUES
(ws_id, board_id, 'Definir oferta de forma clara', NULL, 'col-not-started', 'high', 0),
(ws_id, board_id, 'Definir Sistema Inicial, desde donde empieza y hasta donde llega', NULL, 'col-not-started', 'high', 1),
(ws_id, board_id, 'Diseñar y crear landing de recursos', NULL, 'col-not-started', 'medium', 2),
(ws_id, board_id, 'Web (landing soft)', NULL, 'col-not-started', 'medium', 3),
(ws_id, board_id, 'Landing ventas (hard)', NULL, 'col-not-started', 'medium', 4),
(ws_id, board_id, 'Presentación ventas', NULL, 'col-not-started', 'high', 5),
(ws_id, board_id, 'Guión de ventas', NULL, 'col-not-started', 'high', 6),
(ws_id, board_id, 'Crear y edificar YouTube', NULL, 'col-not-started', 'medium', 7),
(ws_id, board_id, 'Crear y edificar Instagram', NULL, 'col-not-started', 'medium', 8),
(ws_id, board_id, 'Hacer brandbook', NULL, 'col-not-started', 'medium', 9),
(ws_id, board_id, 'Modificar form onboarding', NULL, 'col-not-started', 'low', 10),
(ws_id, board_id, 'SOP Onboarding cliente', NULL, 'col-not-started', 'medium', 11),
(ws_id, board_id, 'Correo cierre cliente', NULL, 'col-not-started', 'low', 12),
(ws_id, board_id, 'Correo nuevo cliente confirmado', NULL, 'col-not-started', 'low', 13),
(ws_id, board_id, 'Informes automaticos o semi automaticos', NULL, 'col-not-started', 'medium', 14),
(ws_id, board_id, 'Movil agencia + SIM', NULL, 'col-not-started', 'low', 15),
(ws_id, board_id, 'Crear tarjetas creativas para entregar en fisico', NULL, 'col-not-started', 'low', 16),
(ws_id, board_id, 'Diseño contenidos proximo mes para YouTube e Instagram', NULL, 'col-not-started', 'high', 17);

-- ============================================================
-- 4. CONTENT ITEMS (from CONTENT AGENCIA database)
-- ============================================================

INSERT INTO content_items (workspace_id, platform, format, hook, caption, hashtags, status, scheduled_for, tags, notes) VALUES
-- Otra vez que me plantan
(ws_id, 'instagram', 'reel',
 'Otra vez que me plantan',
 'Que… Otra vez esperando a que venga tu paciente y no aparece… no?

Entiendo que te joda, pero eso es porque no has hecho bien tu trabajo.

Haz estas 3 cosas y veras como reduces brutalmente estos plantones.

1. Filtra antes de agendar. Tienes que ver si su compromiso es real.
2. Humaniza y genera confianza. Puedes enviar audios, videos y contenidos para lograrlo.
3. Refleja el valor. Haz que vean que no pueden fallar, curratelo con una propuesta diferente.
4. Haz recordatorios multicanal repartidos en varios avisos.

Comenta PLANTON y te envio una guia completa.',
 ARRAY['#clinicaestetica', '#leads', '#noshow', '#agendallena'],
 'draft', '2026-04-24T10:00:00Z',
 ARRAY['setting', 'valor-educar'],
 'Plataformas: Reels Instagram, Short Youtube. Problema: LEADS QUE AGENDAN PERO NO VIENEN'),

-- La verdad incomoda
(ws_id, 'instagram', 'reel',
 'La verdad incomoda: no necesitas mas seguidores, necesitas un sistema',
 'Hook: A ver, esto te va a doler pero te voy a decir una verdad incomoda. Tu clinica no necesita mas seguidores, necesita un sistema.

Desarrollo 1: Puedes tener una cuenta bonita, buenos videos y aun asi no llenar agenda.
Desarrollo 2: Una clinica no crece solo por hacer contenido. Crece cuando tiene una buena oferta, capta atencion, atiende bien al lead y convierte ese interes en citas y ventas.
Desarrollo 3: Si una de esas piezas falla, el crecimiento se frena aunque sigas publicando.

CTA ManyChat: comenta CITAS y te envio las instrucciones para llevar mas pacientes a tu clinica.',
 ARRAY['#sistema', '#clinica', '#captacion', '#marketingclinicas'],
 'ready', '2026-04-13T10:00:00Z',
 ARRAY['patient-flow', 'mentalidad', 'alcance', 'autoridad'],
 'Formatos: Polemica, Hook directo. Plataformas: Reels Instagram, Short Youtube. Incluye Lead Magnet.'),

-- Errores que estan matando tu clinica (parte 1)
(ws_id, 'instagram', 'reel',
 'Errores que estan matando tu clinica (parte 1)',
 '',
 ARRAY['#errores', '#clinicaestetica', '#marketing'],
 'draft', NULL,
 ARRAY['patient-flow'],
 'Serie de 2 partes'),

-- Errores que estan matando tu clinica (parte 2)
(ws_id, 'instagram', 'reel',
 'Errores que estan matando tu clinica (parte 2)',
 '',
 ARRAY['#errores', '#clinicaestetica', '#marketing'],
 'draft', NULL,
 ARRAY['patient-flow'],
 'Serie de 2 partes - continuacion'),

-- 5 minutos para contactar
(ws_id, 'instagram', 'reel',
 '5 minutos para contactar',
 '',
 ARRAY['#leads', '#contacto', '#rapidez', '#clinica'],
 'draft', NULL,
 ARRAY['leads-conversion'],
 NULL),

-- Si tu clinica tiene leads pero no citas
(ws_id, 'instagram', 'reel',
 'Si tu clinica tiene leads pero no citas, el problema casi nunca es Meta Ads',
 '',
 ARRAY['#metaads', '#leads', '#clinica', '#citas'],
 'draft', NULL,
 ARRAY['meta-ads', 'leads-conversion'],
 NULL),

-- Como convertir Instagram en una maquina de confianza
(ws_id, 'instagram', 'carousel',
 'Como convertir Instagram en una maquina de confianza para tu clinica estetica',
 '',
 ARRAY['#instagram', '#confianza', '#clinicaestetica', '#contenido'],
 'draft', NULL,
 ARRAY['setting', 'autoridad'],
 NULL),

-- Que publicar en Instagram si tu clinica quiere vender sin parecer agresiva
(ws_id, 'instagram', 'carousel',
 'Que publicar en Instagram si tu clinica quiere vender sin parecer agresiva',
 '',
 ARRAY['#instagram', '#vender', '#contenido', '#clinica'],
 'draft', NULL,
 ARRAY['ventas', 'contenido'],
 NULL),

-- Por que tus anuncios te llenan WhatsApp de gente que pregunta precio y desaparece
(ws_id, 'instagram', 'reel',
 'Por que tus anuncios te llenan WhatsApp de gente que pregunta precio y desaparece',
 '',
 ARRAY['#metaads', '#whatsapp', '#leads', '#clinica'],
 'draft', NULL,
 ARRAY['meta-ads', 'leads-conversion'],
 'PROBLEMA QUE RESUELVE: LEADS BASURA'),

-- tecnica 2x2
(ws_id, 'instagram', 'reel',
 'Tecnica 2x2',
 '',
 ARRAY['#tecnica', '#ventas', '#clinica'],
 'draft', NULL,
 ARRAY['ventas'],
 NULL),

-- POV: una clinica responde tarde
(ws_id, 'instagram', 'reel',
 'POV: una clinica responde tarde y luego dice que los leads no sirven',
 '',
 ARRAY['#pov', '#leads', '#clinica', '#respuesta'],
 'draft', NULL,
 ARRAY['leads-conversion'],
 NULL),

-- 5 errores que hacen que una clinica pierda pacientes
(ws_id, 'instagram', 'reel',
 '5 errores que hacen que una clinica pierda pacientes antes de sentarlos en cabina',
 '',
 ARRAY['#errores', '#pacientes', '#clinicaestetica'],
 'draft', NULL,
 ARRAY['patient-flow'],
 NULL),

-- Caso real: como una clinica deja de depender del boca a boca
(ws_id, 'instagram', 'reel',
 'Caso real: como una clinica deja de depender del boca a boca para llenar agenda',
 '',
 ARRAY['#casoreal', '#clinica', '#agenda', '#captacion'],
 'draft', NULL,
 ARRAY['autoridad', 'prueba-social'],
 NULL),

-- El error de WhatsApp que hace que una clinica pierda pacientes calientes
(ws_id, 'instagram', 'reel',
 'El error de WhatsApp que hace que una clinica pierda pacientes calientes',
 '',
 ARRAY['#whatsapp', '#error', '#pacientes', '#clinica'],
 'draft', NULL,
 ARRAY['leads-conversion'],
 NULL),

-- Por que muchas clinicas atraen gente que pregunta pero no compra
(ws_id, 'instagram', 'reel',
 'Por que muchas clinicas atraen gente que pregunta, pero no compra',
 '',
 ARRAY['#clinica', '#leads', '#conversion', '#ventas'],
 'draft', NULL,
 ARRAY['leads-conversion', 'ventas'],
 NULL),

-- 3 cosas que una clinica estetica debe hacer antes de invertir 1 euro en anuncios
(ws_id, 'instagram', 'reel',
 '3 cosas que una clinica estetica debe hacer antes de invertir 1 euro en anuncios',
 '',
 ARRAY['#clinicaestetica', '#anuncios', '#metaads', '#preparacion'],
 'draft', NULL,
 ARRAY['meta-ads'],
 NULL),

-- TOP 10 contenidos para hacer crecer tu clinica en redes
(ws_id, 'instagram', 'carousel',
 'TOP 10 contenidos para hacer crecer tu clinica en redes',
 '',
 ARRAY['#top10', '#contenido', '#redes', '#clinica'],
 'draft', NULL,
 ARRAY['contenido', 'valor-educar'],
 NULL),

-- Quieres saber si tu tratamiento tiene el precio correcto
(ws_id, 'instagram', 'reel',
 'Quieres saber si tu tratamiento tiene el precio correcto? Haz esto',
 '',
 ARRAY['#precio', '#tratamiento', '#clinicaestetica'],
 'draft', NULL,
 ARRAY['ventas'],
 NULL),

-- Lead Magnet - Checklist pre-ads
(ws_id, 'instagram', 'carousel',
 'Lead Magnet - Checklist pre-ads para clinicas esteticas',
 '',
 ARRAY['#leadmagnet', '#checklist', '#ads', '#clinica'],
 'draft', NULL,
 ARRAY['meta-ads', 'lead-magnet'],
 'ESTE LEAD MAGNET SERIA TOP EN FORMULARIO PARA PODER VER QUE PONEN'),

-- Lead Magnet - Auditoria rapida de conversion lead a cita
(ws_id, 'instagram', 'carousel',
 'Lead Magnet - Auditoria rapida de conversion lead a cita',
 '',
 ARRAY['#leadmagnet', '#auditoria', '#conversion', '#clinica'],
 'draft', NULL,
 ARRAY['leads-conversion', 'lead-magnet'],
 NULL),

-- Lead Magnet - Framework visual del sistema de captacion
(ws_id, 'instagram', 'carousel',
 'Lead Magnet - Framework visual del sistema de captacion para clinicas esteticas',
 '',
 ARRAY['#leadmagnet', '#framework', '#captacion', '#sistema'],
 'draft', NULL,
 ARRAY['patient-flow', 'lead-magnet'],
 NULL);

RAISE NOTICE 'Seed completed: % pages, 1 client, 1 board, 18 tasks, 21 content items', 7;

END $$;
