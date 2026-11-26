--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: biomarcadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biomarcadores (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    unidad character varying(50),
    rango_min numeric,
    rango_max numeric
);


ALTER TABLE public.biomarcadores OWNER TO postgres;

--
-- Name: biomarcadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.biomarcadores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.biomarcadores_id_seq OWNER TO postgres;

--
-- Name: biomarcadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.biomarcadores_id_seq OWNED BY public.biomarcadores.id;


--
-- Name: citas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.citas (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    medico_id integer NOT NULL,
    fecha_hora timestamp without time zone NOT NULL,
    estado character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.citas OWNER TO postgres;

--
-- Name: citas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.citas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.citas_id_seq OWNER TO postgres;

--
-- Name: citas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.citas_id_seq OWNED BY public.citas.id;


--
-- Name: ejercicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ejercicios (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    nivel character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ejercicios OWNER TO postgres;

--
-- Name: ejercicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ejercicios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ejercicios_id_seq OWNER TO postgres;

--
-- Name: ejercicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ejercicios_id_seq OWNED BY public.ejercicios.id;


--
-- Name: expedientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expedientes (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    medico_responsable_id integer,
    fecha_apertura date,
    estado character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expedientes OWNER TO postgres;

--
-- Name: expedientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expedientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expedientes_id_seq OWNER TO postgres;

--
-- Name: expedientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expedientes_id_seq OWNED BY public.expedientes.id;


--
-- Name: medicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicos (
    id integer NOT NULL,
    usuario_id integer,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    numero_licencia character varying(50) NOT NULL,
    especialidad character varying(100),
    telefono character varying(20),
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    foto_url text
);


ALTER TABLE public.medicos OWNER TO postgres;

--
-- Name: medicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicos_id_seq OWNER TO postgres;

--
-- Name: medicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicos_id_seq OWNED BY public.medicos.id;


--
-- Name: notas_clinicas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notas_clinicas (
    id integer NOT NULL,
    expediente_id integer NOT NULL,
    medico_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    contenido text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notas_clinicas OWNER TO postgres;

--
-- Name: notas_clinicas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notas_clinicas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_clinicas_id_seq OWNER TO postgres;

--
-- Name: notas_clinicas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notas_clinicas_id_seq OWNED BY public.notas_clinicas.id;


--
-- Name: paciente_ejercicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paciente_ejercicio (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    medico_id integer NOT NULL,
    ejercicio_id integer NOT NULL,
    fecha_asignacion date,
    estado character varying(50)
);


ALTER TABLE public.paciente_ejercicio OWNER TO postgres;

--
-- Name: paciente_ejercicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paciente_ejercicio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paciente_ejercicio_id_seq OWNER TO postgres;

--
-- Name: paciente_ejercicio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paciente_ejercicio_id_seq OWNED BY public.paciente_ejercicio.id;


--
-- Name: pacientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pacientes (
    id integer NOT NULL,
    usuario_id integer,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    fecha_nacimiento date,
    sexo character varying(20),
    telefono character varying(20),
    email character varying(150),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    racha_dias integer DEFAULT 3,
    puntos_bienestar integer DEFAULT 210,
    alergias text DEFAULT ''::text,
    recetas text DEFAULT ''::text
);


ALTER TABLE public.pacientes OWNER TO postgres;

--
-- Name: pacientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pacientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pacientes_id_seq OWNER TO postgres;

--
-- Name: pacientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pacientes_id_seq OWNED BY public.pacientes.id;


--
-- Name: registros_biomarcador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registros_biomarcador (
    id integer NOT NULL,
    paciente_id integer NOT NULL,
    medico_id integer NOT NULL,
    biomarcador_id integer NOT NULL,
    valor numeric NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resultado_ia jsonb
);


ALTER TABLE public.registros_biomarcador OWNER TO postgres;

--
-- Name: registros_biomarcador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registros_biomarcador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registros_biomarcador_id_seq OWNER TO postgres;

--
-- Name: registros_biomarcador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registros_biomarcador_id_seq OWNED BY public.registros_biomarcador.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_rol (
    usuario_id integer NOT NULL,
    rol_id integer NOT NULL
);


ALTER TABLE public.usuario_rol OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    foto_url text,
    email_verificado boolean DEFAULT false,
    codigo_activacion character varying(10),
    codigo_expiracion timestamp without time zone,
    ultimo_login timestamp without time zone,
    primer_acceso boolean DEFAULT true
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: biomarcadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biomarcadores ALTER COLUMN id SET DEFAULT nextval('public.biomarcadores_id_seq'::regclass);


--
-- Name: citas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas ALTER COLUMN id SET DEFAULT nextval('public.citas_id_seq'::regclass);


--
-- Name: ejercicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id SET DEFAULT nextval('public.ejercicios_id_seq'::regclass);


--
-- Name: expedientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes ALTER COLUMN id SET DEFAULT nextval('public.expedientes_id_seq'::regclass);


--
-- Name: medicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicos ALTER COLUMN id SET DEFAULT nextval('public.medicos_id_seq'::regclass);


--
-- Name: notas_clinicas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_clinicas ALTER COLUMN id SET DEFAULT nextval('public.notas_clinicas_id_seq'::regclass);


--
-- Name: paciente_ejercicio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_ejercicio ALTER COLUMN id SET DEFAULT nextval('public.paciente_ejercicio_id_seq'::regclass);


--
-- Name: pacientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes ALTER COLUMN id SET DEFAULT nextval('public.pacientes_id_seq'::regclass);


--
-- Name: registros_biomarcador id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_biomarcador ALTER COLUMN id SET DEFAULT nextval('public.registros_biomarcador_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: biomarcadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.biomarcadores (id, nombre, unidad, rango_min, rango_max) VALUES ('1', 'Jitter', '%', '0.0', '1.5');
INSERT INTO public.biomarcadores (id, nombre, unidad, rango_min, rango_max) VALUES ('2', 'Shimmer', '%', '0.0', '5.0');
INSERT INTO public.biomarcadores (id, nombre, unidad, rango_min, rango_max) VALUES ('3', 'HNR', 'dB', '0.0', '50.0');


--
-- Data for Name: citas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.citas (id, paciente_id, medico_id, fecha_hora, estado, created_at, updated_at) VALUES ('1', '26', '4', '2026-05-26 11:00:00', 'PROGRAMADA', '2026-05-31 18:00:31.212574', '2026-05-31 18:00:31.212574');
INSERT INTO public.citas (id, paciente_id, medico_id, fecha_hora, estado, created_at, updated_at) VALUES ('2', '26', '2', '2026-05-31 15:30:00', 'PROGRAMADA', '2026-05-31 18:03:04.601465', '2026-05-31 18:03:04.601465');
INSERT INTO public.citas (id, paciente_id, medico_id, fecha_hora, estado, created_at, updated_at) VALUES ('3', '26', '4', '2026-06-01 09:00:00', 'PROGRAMADA', '2026-05-31 18:08:32.718706', '2026-05-31 18:08:32.718706');
INSERT INTO public.citas (id, paciente_id, medico_id, fecha_hora, estado, created_at, updated_at) VALUES ('4', '26', '4', '2026-06-04 09:00:00', 'PROGRAMADA', '2026-06-01 18:11:52.593242', '2026-06-01 18:11:52.593242');


--
-- Data for Name: ejercicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.ejercicios (id, nombre, descripcion, nivel, created_at, updated_at) VALUES ('1', 'Círculos suaves de cuello sentad@', '{"subtitle":"Movilidad cervical suave · Alivia rigidez en cuello","duration":"5 min","hint":"Movimiento lento, sin dolor","target":"Aflojar suavemente la musculatura del cuello y mejorar la movilidad cervical sin forzar.","steps":["Siéntate con la espalda apoyada firmemente y los pies planos en el suelo.","Lleva la barbilla hacia el pecho lentamente y respira profundo.","Despacio, dibuja un medio círculo llevando la cabeza hacia tu hombro izquierdo y luego de regreso hacia el derecho.","Mantén un ritmo pausado y respira tranquilo mientras te mueves.","Haz una pausa de 10 segundos al finalizar cada serie antes de continuar."],"precautions":"Si aparece dolor, mareo o visión borrosa, detén el ejercicio inmediatamente. No hagas giros de 360 grados ni tirones bruscos."}', 'Básico', '2026-06-10 10:25:51.753982', '2026-06-10 10:25:51.753982');
INSERT INTO public.ejercicios (id, nombre, descripcion, nivel, created_at, updated_at) VALUES ('2', 'Elevación y rotación suave de hombros', '{"subtitle":"Movilidad de hombros · Reduce rigidez superior","duration":"6 min","hint":"Hombros relajados, ritmo pausado","target":"Liberar tensión acumulada en la articulación del hombro y la parte superior de la espalda.","steps":["Colócate erguido en una silla cómoda con los brazos relajados a los lados.","Inhala aire y sube ambos hombros de forma controlada hacia tus orejas.","Exhala suavemente mientras llevas los hombros hacia atrás y abajo en un movimiento circular.","Mantén el cuello recto y evita tensar la mandíbula al subir.","Realiza de 5 a 8 giros suaves por cada serie."],"precautions":"Evita movimientos rápidos o forzar el rango de movimiento si sientes pinchazos o molestias agudas en el manguito rotador."}', 'Básico', '2026-06-10 10:25:51.753982', '2026-06-10 10:25:51.753982');
INSERT INTO public.ejercicios (id, nombre, descripcion, nivel, created_at, updated_at) VALUES ('3', 'Apertura y cierre de manos con toques de dedos', '{"subtitle":"Coordinación fina · Agilidad en dedos","duration":"4 min","hint":"Movimiento fluido y muy consciente","target":"Estimular la circulación, la motricidad fina y disminuir la rigidez en manos y dedos.","steps":["Extiende ambos brazos al frente a la altura de tu pecho con las palmas abiertas.","Separa los dedos lo más posible sintiendo un estiramiento agradable y sostén por 3 segundos.","Cierra los puños suavemente, abrazando el pulgar sin apretar con demasiada fuerza.","Abre las manos nuevamente y toca consecutivamente la yema de cada dedo con la yema del pulgar.","Alterna el orden de los toques para desafiar la coordinación cerebral."],"precautions":"Si sientes fatiga muscular en los antebrazos, haz pausas más prolongadas. No forces las articulaciones si hay dolor."}', 'Intermedio', '2026-06-10 10:25:51.753982', '2026-06-10 10:25:51.753982');


--
-- Data for Name: expedientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('2', '2', '1', '2026-03-22', 'ACTIVO', '2026-03-22 17:57:35.321938', '2026-03-22 17:57:35.321938');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('3', '3', '1', '2026-03-22', 'ACTIVO', '2026-03-22 18:23:06.032196', '2026-03-22 18:23:06.032196');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('4', '4', '2', '2026-03-22', 'ACTIVO', '2026-03-22 18:44:12.191176', '2026-03-22 18:44:12.191176');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('5', '5', '4', '2026-03-22', 'ACTIVO', '2026-03-22 20:43:06.914414', '2026-03-22 20:43:06.914414');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('6', '6', '4', '2026-03-22', 'ACTIVO', '2026-03-22 22:22:04.137334', '2026-03-22 22:22:04.137334');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('7', '7', '4', '2026-03-22', 'ACTIVO', '2026-03-22 23:06:15.534502', '2026-03-22 23:06:15.534502');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('8', '8', '5', '2026-03-22', 'ACTIVO', '2026-03-22 23:20:08.311893', '2026-03-22 23:20:08.311893');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('14', '14', '1', '2026-03-24', 'ACTIVO', '2026-03-24 10:44:13.391329', '2026-03-24 10:44:13.391329');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('15', '15', '7', '2026-03-24', 'ACTIVO', '2026-03-24 13:07:04.254474', '2026-03-24 13:07:04.254474');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('16', '16', '9', '2026-03-24', 'ACTIVO', '2026-03-24 13:10:27.849266', '2026-03-24 13:10:27.849266');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('17', '17', '9', '2026-03-24', 'ACTIVO', '2026-03-24 13:12:05.429429', '2026-03-24 13:12:05.429429');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('20', '20', '11', '2026-03-25', 'ACTIVO', '2026-03-25 10:05:29.197956', '2026-03-25 10:05:29.197956');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('21', '21', '7', '2026-03-25', 'ACTIVO', '2026-03-25 10:13:36.513523', '2026-03-25 10:13:36.513523');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('18', '18', '5', '2026-03-24', 'ACTIVO', '2026-03-24 14:01:47.568057', '2026-03-24 14:01:47.568057');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('23', '23', '7', '2026-05-31', 'ACTIVO', '2026-05-31 16:34:30.892697', '2026-05-31 16:34:30.892697');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('24', '24', '5', '2026-05-31', 'ACTIVO', '2026-05-31 16:41:13.030742', '2026-05-31 16:41:13.030742');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('25', '25', '14', '2026-05-31', 'ACTIVO', '2026-05-31 16:43:20.161085', '2026-05-31 16:43:20.161085');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('26', '26', '14', '2026-05-31', 'ACTIVO', '2026-05-31 16:47:17.256616', '2026-05-31 16:47:17.256616');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('27', '27', '2', '2026-05-31', 'ACTIVO', '2026-05-31 18:43:34.313763', '2026-05-31 18:43:34.313763');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('28', '28', '3', '2026-06-02', 'ACTIVO', '2026-06-02 12:16:17.884505', '2026-06-02 12:16:17.884505');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('29', '29', '2', '2026-06-03', 'ACTIVO', '2026-06-03 13:10:38.118498', '2026-06-03 13:10:38.118498');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('30', '30', '3', '2026-06-03', 'ACTIVO', '2026-06-03 13:26:01.193823', '2026-06-03 13:26:01.193823');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('31', '31', '14', '2026-06-03', 'ACTIVO', '2026-06-03 13:36:45.985685', '2026-06-03 13:36:45.985685');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('32', '32', '13', '2026-06-03', 'ACTIVO', '2026-06-03 13:41:18.618944', '2026-06-03 13:41:18.618944');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('33', '33', '14', '2026-06-05', 'ACTIVO', '2026-06-05 09:27:35.227424', '2026-06-05 09:27:35.227424');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('34', '34', '14', '2026-06-09', 'ACTIVO', '2026-06-09 11:01:21.534683', '2026-06-09 11:01:21.534683');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('35', '35', '9', '2026-06-10', 'ACTIVO', '2026-06-10 09:17:15.676559', '2026-06-10 09:17:15.676559');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('36', '36', '1', '2026-06-16', 'ACTIVO', '2026-06-16 11:50:55.560712', '2026-06-16 11:50:55.560712');
INSERT INTO public.expedientes (id, paciente_id, medico_responsable_id, fecha_apertura, estado, created_at, updated_at) VALUES ('37', '37', NULL, '2026-07-27', 'ACTIVO', '2026-07-27 15:59:25.973369', '2026-07-27 15:59:25.973369');


--
-- Data for Name: medicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('4', '12', 'roberto', 'martines martines', '1223233u3211', 'neurologo', '21376833', 't', '2026-03-22 20:10:13.528637', '2026-03-22 20:10:13.528637', '/uploads/avatars/avatar_12_1774243279458.png');
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('6', '23', 'roberto', 'gomes bolañio', '17627868', 'Neurología', '8117989907', 't', '2026-03-23 18:51:24.439035', '2026-03-23 18:51:24.439035', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('1', '2', 'Dr. Test', 'Swagger', '12345', 'Neurología', '8117989907', 't', '2026-03-22 17:17:47.787715', '2026-03-22 17:17:47.787715', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('7', '27', 'Obed', 'Capistrán Velázquez', 'bhjyti27897', 'Neurologia ', '+528117989907', 't', '2026-03-24 13:02:23.922784', '2026-03-24 13:02:23.922784', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('8', '28', 'Obed', 'Capistrán Velázquez', '1524253663', 'Neurología', '8117989907', 't', '2026-03-24 13:05:38.563367', '2026-03-24 13:05:38.563367', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('9', '30', 'paco', 'Capistrán Capistrán', '1234567', 'Medicina General', '8117989907', 't', '2026-03-24 13:09:07.925097', '2026-03-24 13:09:07.925097', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('11', '34', 'Daniel', 'González', '1542637tyw', 'Medicina General', '5555555555', 't', '2026-03-24 13:57:09.037209', '2026-03-24 13:57:09.037209', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('2', '3', 'obed', 'capistran velzaquez', '1223oeu3211', 'neurologo', '21376898', 't', '2026-03-22 17:23:19.498238', '2026-03-22 17:23:19.498238', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('5', '17', 'Obed', 'Capistrán Velázquez', '876t', 'Medicina General', '8117989907', 'f', '2026-03-22 23:08:42.293046', '2026-03-22 23:08:42.293046', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('13', '41', 'roberto', 'gomes galvan ', '984767389', 'Neurología', '2711256778', 't', '2026-03-25 10:14:34.929984', '2026-03-25 10:14:34.929984', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('14', '43', 'rodolfo ', 'cruz lopez ', '9878675678', 'Neurología', '2711278976', 't', '2026-03-25 10:17:41.530338', '2026-03-25 10:17:41.530338', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('3', '11', 'roberto', 'Capistrán Velázquez', '12345678', 'Neurología', NULL, 'f', '2026-03-22 20:08:30.64429', '2026-03-22 20:08:30.64429', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('12', '37', 'Eva', 'maria landa ', '1234567uyg', 'Neurología', NULL, 'f', '2026-03-24 14:06:52.248739', '2026-03-24 14:06:52.248739', NULL);
INSERT INTO public.medicos (id, usuario_id, nombre, apellido, numero_licencia, especialidad, telefono, activo, created_at, updated_at, foto_url) VALUES ('15', '50', 'Obed', 'Capistrán Velázquez', '1122222', 'Neurologo', '', 't', '2026-06-01 09:54:22.464442', '2026-06-01 09:54:22.464442', NULL);


--
-- Data for Name: notas_clinicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('7', '14', '1', 'INICIAL', 'un poco mal', '2026-03-24 10:44:13.391329');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('8', '15', '7', 'INICIAL', 'esta mas o menos', '2026-03-24 13:07:04.254474');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('9', '16', '9', 'INICIAL', 'le falta', '2026-03-24 13:10:27.849266');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('10', '17', '9', 'INICIAL', 'ok', '2026-03-24 13:12:05.429429');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('11', '18', '11', 'INICIAL', 'Sin diagnóstico', '2026-03-24 14:01:47.568057');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('14', '20', '7', 'INICIAL', 'estable', '2026-03-25 10:05:29.197956');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('15', '21', '7', 'INICIAL', 'estable', '2026-03-25 10:13:36.513523');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('17', '23', '7', 'INICIAL', 'estable', '2026-05-31 16:34:30.892697');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('18', '24', '5', 'INICIAL', 'estable', '2026-05-31 16:41:13.030742');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('19', '25', '14', 'INICIAL', 'estable', '2026-05-31 16:43:20.161085');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('20', '26', '14', 'INICIAL', 'establemente mal', '2026-05-31 16:47:17.256616');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('21', '27', '2', 'INICIAL', 'mal muy mal', '2026-05-31 18:43:34.313763');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('22', '28', '3', 'INICIAL', 'etsa grabe', '2026-06-02 12:16:17.884505');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('23', '29', '2', 'INICIAL', 'mal', '2026-06-03 13:10:38.118498');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('24', '30', '3', 'INICIAL', 'esta mak', '2026-06-03 13:26:01.193823');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('25', '31', '14', 'INICIAL', 'mal', '2026-06-03 13:36:45.985685');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('26', '32', '13', 'INICIAL', 'mal', '2026-06-03 13:41:18.618944');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('27', '33', '14', 'INICIAL', 'estable', '2026-06-05 09:27:35.227424');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('28', '34', '14', 'INICIAL', 'mal', '2026-06-09 11:01:21.534683');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('29', '35', '9', 'INICIAL', 'revisión', '2026-06-10 09:17:15.676559');
INSERT INTO public.notas_clinicas (id, expediente_id, medico_id, tipo, contenido, created_at) VALUES ('30', '36', '1', 'INICIAL', 'mal', '2026-06-16 11:50:55.560712');


--
-- Data for Name: paciente_ejercicio; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pacientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('2', '7', 'Paciente', 'Prueba', '1960-01-01', 'M', '1234567890', 'paciente.test@spark.com', '2026-03-22 17:57:35.321938', '2026-03-22 17:57:35.321938', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('3', '9', 'Paciente', 'Prueba', '1960-01-01', 'M', '1234567890', 'paciente.unique.999@spark.com', '2026-03-22 18:23:06.032196', '2026-03-22 18:23:06.032196', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('4', '10', 'Obed', 'Capistrán Velázquez', '2003-01-01', 'M', '8117989907', 'obedc@gmail.com', '2026-03-22 18:44:12.191176', '2026-03-22 18:44:12.191176', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('5', '13', 'Obed', 'Capistrán Velázquez', '2026-01-01', 'M', '8117989900', 'obec@gmail.com', '2026-03-22 20:43:06.914414', '2026-03-22 20:43:06.914414', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('6', '15', 'roberto', 'gomes bolañio', '2026-01-01', 'M', '8117989000', 'robert@gmail.com', '2026-03-22 22:22:04.137334', '2026-03-22 22:22:04.137334', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('7', '16', 'Obed', 'Capistrán Velázquez', '2026-01-01', 'M', '8117989907', 'ooe@uu.com', '2026-03-22 23:06:15.534502', '2026-03-22 23:06:15.534502', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('8', '18', 'Obed', 'Capistrán Velázquez', '1948-01-01', 'M', '8117989907', 'o0oiijjc@gmail.com', '2026-03-22 23:20:08.311893', '2026-03-22 23:20:08.311893', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('14', '26', 'Obed', 'Capistrán Velázquez', '2003-01-01', 'M', '8117989907', 'o0oiiwwwjjc@gmail.com', '2026-03-24 10:44:13.391329', '2026-03-24 10:44:13.391329', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('15', '29', 'paco ', 'gomes bolañio', '2003-01-01', 'M', '8117989907', 'paco@gmail.com', '2026-03-24 13:07:04.254474', '2026-03-24 13:07:04.254474', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('16', '31', 'Obed', 'Capistrán Velázquez', '1981-01-01', 'M', NULL, 'obeuyghiht@gmail.com', '2026-03-24 13:10:27.849266', '2026-03-24 13:10:27.849266', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('17', '32', 'Obed', 'Capistrán Velázquez', '1992-01-01', 'M', '8117989907', 'ob23c@gmail.com', '2026-03-24 13:12:05.429429', '2026-03-24 13:12:05.429429', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('20', '39', 'manolo', 'pérez pérez', '1981-01-01', 'M', '2711234567', 'manolo@gmail.com', '2026-03-25 10:05:29.197956', '2026-03-25 10:05:29.197956', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('21', '40', 'felix', 'García Perez ', '1958-01-01', 'M', '2711234567', 'garcia@gmail.com', '2026-03-25 10:13:36.513523', '2026-03-25 10:13:36.513523', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('18', '36', 'Eva', 'Landa', '2014-01-01', 'F', '2711234567', 'eva.landa2@utcv.edu.mx', '2026-03-24 14:01:47.568057', '2026-03-24 14:01:47.568057', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('23', '45', 'Obed', 'Capistrán Velázquez', '1992-01-01', 'M', '8117989907', 'otoec@gmail.com', '2026-05-31 16:34:30.892697', '2026-05-31 16:34:30.892697', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('24', '46', 'Obed', 'Capistrán Velázquez', '1970-01-01', 'M', '8117989907', 'pablito@gmail.com', '2026-05-31 16:41:13.030742', '2026-05-31 16:41:13.030742', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('25', '47', 'Obed', 'Capistrán Velázquez', '1981-01-01', 'M', '8117989907', 'mobed267@gmail.com', '2026-05-31 16:43:20.161085', '2026-05-31 16:43:20.161085', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('26', '48', 'roberto', 'gomes bolañio', '1970-01-01', 'M', '8117989907', 'robertinoo@gmail.com', '2026-05-31 16:47:17.256616', '2026-05-31 16:47:17.256616', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('27', '49', 'rodolfo ', 'lopez mateo ', '1970-01-01', 'M', NULL, 'rodolfito@gmail.com', '2026-05-31 18:43:34.313763', '2026-05-31 18:43:34.313763', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('28', '52', 'Obed', 'Capistrán Capistrán', '1937-01-01', 'M', '8117989907', 'morital@gmail.com', '2026-06-02 12:16:17.884505', '2026-06-02 12:16:17.884505', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('29', '54', 'Obed', 'Capistrán Velázquez', '1948-01-01', 'M', '8117989907', 'galvan@gmail.com', '2026-06-03 13:10:38.118498', '2026-06-03 13:10:38.118498', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('30', '55', 'Obed', 'Capistrán Velázquez', '1948-01-01', 'M', '8117989907', 'morak@gmail.com', '2026-06-03 13:26:01.193823', '2026-06-03 13:26:01.193823', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('31', '56', 'Obed', 'Capistrán Velázquez', '1939-01-01', 'M', '8117989907', 'mobed56778@gmail.com', '2026-06-03 13:36:45.985685', '2026-06-03 13:36:45.985685', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('32', '57', 'Obed', 'Capistrán Capistrán', '1937-01-01', 'M', '8117989907', 'moral09876@gmail.com', '2026-06-03 13:41:18.618944', '2026-06-03 13:41:18.618944', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('33', '58', 'roberto', 'gomes bolañio', '1970-01-01', 'M', NULL, 'robertina@gmail.com', '2026-06-05 09:27:35.227424', '2026-06-05 09:27:35.227424', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('34', '59', 'Obed', 'Capistrán Capistrán', '2026-01-01', 'M', NULL, '1234obed@gmail.com', '2026-06-09 11:01:21.534683', '2026-06-09 11:01:21.534683', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('35', '60', 'pedro ', 'rodrigues  garcia ', '1981-01-01', 'M', '8117989907', 'pedro@gmail.com', '2026-06-10 09:17:15.676559', '2026-06-10 09:17:15.676559', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('36', '61', 'Eva Maria ', 'Landa Huerta ', '1980-01-01', 'F', '2711234567', 'eva1234@gmail.com', '2026-06-16 11:50:55.560712', '2026-06-16 11:50:55.560712', '3', '210', '', '');
INSERT INTO public.pacientes (id, usuario_id, nombre, apellido, fecha_nacimiento, sexo, telefono, email, created_at, updated_at, racha_dias, puntos_bienestar, alergias, recetas) VALUES ('37', '62', 'Juan', 'Pérez', '1975-05-15', NULL, '5551234567', 'paciente@spark.com', '2026-07-27 15:59:25.965538', '2026-07-27 15:59:25.965538', '0', '0', '', '');


--
-- Data for Name: registros_biomarcador; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('4', '34', '14', '1', '0.443', '2026-06-10 08:57:26.784765', '{"riesgo": "MEDIO", "probabilidad": 82.65, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.6%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.79, "Random Forest": 77.24, "Gradient Boosting": 99.14}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('5', '34', '14', '2', '2.58', '2026-06-10 08:57:26.81479', '{"riesgo": "MEDIO", "probabilidad": 82.65, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.6%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.79, "Random Forest": 77.24, "Gradient Boosting": 99.14}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('6', '34', '14', '3', '25.95', '2026-06-10 08:57:26.817455', '{"riesgo": "MEDIO", "probabilidad": 82.65, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.6%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.79, "Random Forest": 77.24, "Gradient Boosting": 99.14}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('7', '35', '9', '1', '0.965', '2026-06-10 09:24:19.127651', '{"riesgo": "MEDIO", "probabilidad": 87.13, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 96, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('8', '35', '9', '2', '4.9', '2026-06-10 09:24:19.149359', '{"riesgo": "MEDIO", "probabilidad": 87.13, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 96, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('9', '35', '9', '3', '17.25', '2026-06-10 09:24:19.158324', '{"riesgo": "MEDIO", "probabilidad": 87.13, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 96, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('10', '35', '9', '1', '0.965', '2026-06-10 09:24:40.029258', '{"riesgo": "MEDIO", "probabilidad": 86.88, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 95, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('11', '35', '9', '2', '4.9', '2026-06-10 09:24:40.044195', '{"riesgo": "MEDIO", "probabilidad": 86.88, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 95, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('12', '35', '9', '3', '17.25', '2026-06-10 09:24:40.046455', '{"riesgo": "MEDIO", "probabilidad": 86.88, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.52, "Random Forest": 95, "Gradient Boosting": 99.57}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('13', '35', '9', '1', '0.641', '2026-06-10 10:04:22.607052', '{"riesgo": "MEDIO", "probabilidad": 84.21, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 84.2%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.83, "Random Forest": 84, "Gradient Boosting": 99.58}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('14', '35', '9', '2', '3.46', '2026-06-10 10:04:22.64112', '{"riesgo": "MEDIO", "probabilidad": 84.21, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 84.2%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.83, "Random Forest": 84, "Gradient Boosting": 99.58}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('15', '35', '9', '3', '22.65', '2026-06-10 10:04:22.64416', '{"riesgo": "MEDIO", "probabilidad": 84.21, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 84.2%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.83, "Random Forest": 84, "Gradient Boosting": 99.58}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('16', '35', '9', '1', '0.713', '2026-06-10 10:42:14.878545', '{"f0": 202.8, "riesgo": "MEDIO", "probabilidad": 85.45, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 85.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.29, "Random Forest": 90, "Gradient Boosting": 99.08}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('17', '35', '9', '2', '3.78', '2026-06-10 10:42:14.904698', '{"f0": 202.8, "riesgo": "MEDIO", "probabilidad": 85.45, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 85.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.29, "Random Forest": 90, "Gradient Boosting": 99.08}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('18', '35', '9', '3', '21.45', '2026-06-10 10:42:14.906071', '{"f0": 202.8, "riesgo": "MEDIO", "probabilidad": 85.45, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 85.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.29, "Random Forest": 90, "Gradient Boosting": 99.08}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('19', '35', '9', '1', '0.443', '2026-06-10 10:42:32.656087', '{"f0": 190.8, "riesgo": "MEDIO", "probabilidad": 82.38, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.72, "Random Forest": 76.24, "Gradient Boosting": 99.15}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('20', '35', '9', '2', '2.58', '2026-06-10 10:42:32.675958', '{"f0": 190.8, "riesgo": "MEDIO", "probabilidad": 82.38, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.72, "Random Forest": 76.24, "Gradient Boosting": 99.15}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('21', '35', '9', '3', '25.95', '2026-06-10 10:42:32.676861', '{"f0": 190.8, "riesgo": "MEDIO", "probabilidad": 82.38, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 82.4%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 99.72, "Random Forest": 76.24, "Gradient Boosting": 99.15}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('22', '35', '9', '1', '1.019', '2026-06-10 11:02:09.876201', '{"f0": 216.4, "riesgo": "MEDIO", "probabilidad": 86.87, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 95, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('23', '35', '9', '2', '5.14', '2026-06-10 11:02:09.901807', '{"f0": 216.4, "riesgo": "MEDIO", "probabilidad": 86.87, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 95, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('24', '35', '9', '3', '16.35', '2026-06-10 11:02:09.904409', '{"f0": 216.4, "riesgo": "MEDIO", "probabilidad": 86.87, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 86.9%). El nivel de severidad de los síntomas motores laringeos se estima como MEDIO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 95, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('25', '36', '1', '1', '1.001', '2026-06-16 12:32:38.381543', '{"f0": 215.6, "riesgo": "BAJO", "probabilidad": 87.12, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 96, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('26', '36', '1', '2', '5.06', '2026-06-16 12:32:38.408565', '{"f0": 215.6, "riesgo": "BAJO", "probabilidad": 87.12, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 96, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('27', '36', '1', '3', '16.65', '2026-06-16 12:32:38.410274', '{"f0": 215.6, "riesgo": "BAJO", "probabilidad": 87.12, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 87.1%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"SVM": 54.41, "XGBoost": 98.42, "Random Forest": 96, "Gradient Boosting": 99.65}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('28', '36', '1', '1', '0.839', '2026-06-16 20:21:35.197864', '{"f0": 208.4, "riesgo": "ALTO", "probabilidad": 93, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 93.0%). El nivel de severidad de los síntomas motores laringeos se estima como ALTO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 93}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('29', '36', '1', '2', '4.34', '2026-06-16 20:21:35.257627', '{"f0": 208.4, "riesgo": "ALTO", "probabilidad": 93, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 93.0%). El nivel de severidad de los síntomas motores laringeos se estima como ALTO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 93}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('30', '36', '1', '3', '19.35', '2026-06-16 20:21:35.261214', '{"f0": 208.4, "riesgo": "ALTO", "probabilidad": 93, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 93.0%). El nivel de severidad de los síntomas motores laringeos se estima como ALTO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 93}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('31', '36', '1', '1', '1.055', '2026-06-16 20:22:35.740238', '{"f0": 218, "riesgo": "BAJO", "probabilidad": 95, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 95.0%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 95}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('32', '36', '1', '2', '5.3', '2026-06-16 20:22:35.751108', '{"f0": 218, "riesgo": "BAJO", "probabilidad": 95, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 95.0%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 95}}');
INSERT INTO public.registros_biomarcador (id, paciente_id, medico_id, biomarcador_id, valor, fecha_registro, resultado_ia) VALUES ('33', '36', '1', '3', '15.75', '2026-06-16 20:22:35.753038', '{"f0": 218, "riesgo": "BAJO", "probabilidad": 95, "interpretacion": "ATENCION: Se identifican alteraciones acústicas significativas (shimmer y jitter elevados, HNR disminuido) altamente compatibles con disfonía parkinsoniana (probabilidad de presencia de la enfermedad del 95.0%). El nivel de severidad de los síntomas motores laringeos se estima como BAJO. Se recomienda priorización diagnóstica y consulta neurológica.", "comparacion_modelos": {"Random Forest": 95}}');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles (id, nombre) VALUES ('1', 'ADMIN');
INSERT INTO public.roles (id, nombre) VALUES ('2', 'MEDICO');
INSERT INTO public.roles (id, nombre) VALUES ('3', 'PACIENTE');


--
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('1', '1');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('2', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('3', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('7', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('9', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('10', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('11', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('12', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('13', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('14', '1');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('15', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('16', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('17', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('18', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('23', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('26', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('27', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('28', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('29', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('30', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('31', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('32', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('33', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('34', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('36', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('37', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('39', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('40', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('41', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('43', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('45', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('46', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('47', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('48', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('49', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('50', '2');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('51', '1');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('52', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('53', '1');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('54', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('55', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('56', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('57', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('58', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('59', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('60', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('61', '3');
INSERT INTO public.usuario_rol (usuario_id, rol_id) VALUES ('62', '3');


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('2', 'doctor.test2@spark.com', '$2a$10$K2MeA82gWptT8RIzDfz4KOGpGVVCf6q/ArYIPXyPLFEzxqkHGaySS', 't', '2026-03-22 17:17:47.77987', '2026-03-22 17:17:47.77987', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('3', 'mobed@gmail.com', '$2a$10$GQ.suZl9SVZxHOpEIrHJ4uYYy/s0zGxQgb0w79W7Dcrgp4U8ht9ku', 't', '2026-03-22 17:23:19.487019', '2026-03-22 17:23:19.487019', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('7', 'paciente.test@spark.com', '$2a$10$bYnBcU8qPD2LBh2mNOdHDupKDbHJw3xSLu.ByLKZP/VZk5NiwzHam', 't', '2026-03-22 17:57:35.321938', '2026-03-22 17:57:35.321938', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('9', 'paciente.unique.999@spark.com', '$2a$10$OMnbIk96moqoS1XlI4AWbe7VGWJci7thr9jOk52yZRUC8w6NdqDn.', 't', '2026-03-22 18:23:06.032196', '2026-03-22 18:23:06.032196', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('10', 'obedc@gmail.com', '$2a$10$cRkUGDuLKJOSB6QFoOS7nOUM1HaLbRacoDq9.27qhFy6/cN3MZLBq', 't', '2026-03-22 18:44:12.191176', '2026-03-22 18:44:12.191176', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('11', 'JohnDoe@uu.com', '$2a$10$gGr7Q1mmcbIaeAG/Z7IFQeMEJAdhDA0FRS2RrbVqYA7otxJjTIKWa', 't', '2026-03-22 20:08:30.63156', '2026-03-22 20:08:30.63156', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('12', 'capo@gmail.com', '$2a$10$bAjsh.dVknybXrRpZnCDZ.9X1o8Wx1ju.JdOhknrn7OX5L9Mpsik2', 't', '2026-03-22 20:10:13.515936', '2026-03-22 20:10:13.515936', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('13', 'obec@gmail.com', '$2a$10$cub2hZH4e2Jgh2to79RLQ.YUIdK0fw3aEfO2f5VCsUkt3DWFewBz6', 't', '2026-03-22 20:43:06.914414', '2026-03-22 20:43:06.914414', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('15', 'robert@gmail.com', '$2a$10$MrfoEDZljDvl.6zcfuAqYeohThu/1AfzBIWYgNtwF.gSE3bfNivzW', 't', '2026-03-22 22:22:04.137334', '2026-03-22 22:22:04.137334', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('14', 'ricardo.morales@spark.com', '$2a$10$krMjDsJQcYC/7mjHf5N9SOMkbzIYrVx2WVRZrNrRAFmzFVJfIB/Ki', 't', '2026-03-22 21:04:34.217061', '2026-03-22 21:04:34.217061', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('16', 'ooe@uu.com', '$2a$10$7wxXUUcN1w9yHQOtFqIjzeHwNVctwIfExFKqByLggWwy4POXBZyAm', 't', '2026-03-22 23:06:15.534502', '2026-03-22 23:06:15.534502', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('17', '009099nDoe@uu.com', '$2a$10$P2KhEGlFSEpOrfsl0U9/6uadyl54etBegiwRxrPwMUtB7qkbZCANC', 't', '2026-03-22 23:08:42.285315', '2026-03-22 23:08:42.285315', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('23', 'JouuDoe@uu.com', '$2a$10$VDLSalfVUzX8AsONrvmK5OzyufWsABZlCSJM7M8fmHyyzSLwu.5rO', 't', '2026-03-23 18:51:24.425571', '2026-03-23 18:51:24.425571', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('45', 'otoec@gmail.com', '$2a$10$6F1s32LRAEGxhXI5Xl6IgO8OBN.7N9MtggNm17ZjADHttH0KRSsGq', 't', '2026-05-31 16:34:30.892697', '2026-05-31 16:34:30.892697', NULL, 'f', '436387', '2026-05-31 16:49:31', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('46', 'pablito@gmail.com', '$2a$10$dE04g9egVqiJovuEXuCjQuS3lOW5Vb1y9J1zknpYxKI4Hy1zEGd62', 't', '2026-05-31 16:41:13.030742', '2026-05-31 16:41:13.030742', NULL, 'f', '616003', '2026-05-31 16:56:13.135', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('18', 'o0oiijjc@gmail.com', '$2a$10$bIBvMuHsAMKK5kFVgmOeM.3Vvw9oWpWwViNd8A43FT.l2Z5Lc3qDW', 't', '2026-03-22 23:20:08.311893', '2026-03-22 23:20:08.311893', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('26', 'o0oiiwwwjjc@gmail.com', '$2a$10$0cGYrzuRn2WETGwzuGmBWu/.oAi3CTQPl9uiS1nbZvu2BTfWmgJ7y', 't', '2026-03-24 10:44:13.391329', '2026-03-24 10:44:13.391329', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('27', 'Johjjhgjyujhe@uu.com', '$2a$10$zKV0ut2YSEuH5GeIi86u5.q8aPvKDttl7lTJFg0dfxqVY5RsqyMFW', 't', '2026-03-24 13:02:23.903194', '2026-03-24 13:02:23.903194', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('28', '0ijnihoe@uu.com', '$2a$10$GBQNdBiz7U3of8atL0m6Su5hR90c.TZfU0KBwDqQPJQa.V4rm7eo2', 't', '2026-03-24 13:05:38.552783', '2026-03-24 13:05:38.552783', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('29', 'paco@gmail.com', '$2a$10$C5lL.9wcKmHn8SYrpqIFY.vt.NmOrSqEAIfAZJ3j9OJCYV66sG0ii', 't', '2026-03-24 13:07:04.254474', '2026-03-24 13:07:04.254474', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('30', 'pacote@gmail.com', '$2a$10$ayKcNUQSGvVt192CNtf3x..HEjL424EhVyII80COk/UysR2QWE0se', 't', '2026-03-24 13:09:07.912522', '2026-03-24 13:09:07.912522', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('31', 'obeuyghiht@gmail.com', '$2a$10$7TzUn2SAJ0Hia7FgAoLyreJzKA6k3D.nTAMqCbEHcYm99AU8Mn.bq', 't', '2026-03-24 13:10:27.849266', '2026-03-24 13:10:27.849266', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('32', 'ob23c@gmail.com', '$2a$10$Z/WVDwVfOhoGpVoX2/681OdnutogzvZcuNU98H8F/JFYNMpUnlydy', 't', '2026-03-24 13:12:05.429429', '2026-03-24 13:12:05.429429', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('33', 'eva.landa@utcv.edu.mx', '$2a$10$lxXs4J3lka1DSbeSXFwpcOWXaEvrGcr8.54U1cnFlo2szj.6Te89K', 't', '2026-03-24 13:56:10.216088', '2026-03-24 13:56:10.216088', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('34', 'Evalanda@utcv.edu.mx', '$2a$10$B.lXoVbIfBic6pPumcHeJu7CeE9dAgY0/h98feKgHikYhxbc6NpxO', 't', '2026-03-24 13:57:09.026553', '2026-03-24 13:57:09.026553', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('37', 'evamaria@gmail.co', '$2a$10$o.9ydO.M4ZkFZ3Oa/RJWJug.YqpH0HQHRDskmMbu2EDBx5wAnWnXe', 't', '2026-03-24 14:06:52.23715', '2026-03-24 14:06:52.23715', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('39', 'manolo@gmail.com', '$2a$10$OytX/SjOJooonT6j5MdyQ.vxFutuXroJGOsve0qmxxuM3dE4AQSjS', 't', '2026-03-25 10:05:29.197956', '2026-03-25 10:05:29.197956', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('40', 'garcia@gmail.com', '$2a$10$raBePTHZqXQ6.JCsehsMX.d2biOrOalG2rfhyZFmIsXiectnIQkZa', 't', '2026-03-25 10:13:36.513523', '2026-03-25 10:13:36.513523', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('41', 'galvan@gmai.com', '$2a$10$i1ll0CWtLq/pszCqEz/hBOcL2vB5bXE7ZN2yTozQ2Wug/AWVj9H..', 't', '2026-03-25 10:14:34.921657', '2026-03-25 10:14:34.921657', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('36', 'eva.landa2@utcv.edu.mx', '$2a$10$e5Hfi6aIkEPTEkbff56hS.NZ7mUGh8fqXVdDNw/kVbmRBs.woI/gq', 't', '2026-03-24 14:01:47.568057', '2026-03-24 14:01:47.568057', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('43', 'rodolfo2@gmail.com', '$2a$10$g.auSZvKKMXNNfGBNV/VpOk6YCZ40nZKRdlSt27us5slRSOzw4AiC', 't', '2026-03-25 10:17:41.520872', '2026-03-25 10:17:41.520872', NULL, 'f', NULL, NULL, NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('47', 'mobed267@gmail.com', '$2a$10$vk4Mkuzdz2L8D2XfrA2nHu5JO.OzVRR1T10yAq.NXcKx09yP4AuC.', 't', '2026-05-31 16:43:20.161085', '2026-05-31 16:43:20.161085', NULL, 'f', '742293', '2026-05-31 16:58:20.253', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('52', 'morital@gmail.com', '$2a$10$oru1v0JM2SjyThgkXQe.1.SoYFrh3.D3iukQMJ7JhvolGzqDSi1uO', 't', '2026-06-02 12:16:17.884505', '2026-06-02 12:16:17.884505', NULL, 't', NULL, NULL, '2026-06-02 12:17:16.565154', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('57', 'moral09876@gmail.com', '$2a$10$GzVnPB.6rKt1ZKmMey9K5OZtGM5WkWuz.jHLr7IjZqnyKSzhp0s82', 't', '2026-06-03 13:41:18.618944', '2026-06-03 13:41:18.618944', NULL, 't', NULL, NULL, '2026-06-03 13:47:39.093851', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('49', 'rodolfito@gmail.com', '$2a$10$RYgGBoRd0ZPF2c9CDVtn0egroyZ7zasp/mNjH.31fcLQf2.7GT9pS', 't', '2026-05-31 18:43:34.313763', '2026-05-31 18:43:34.313763', NULL, 't', NULL, NULL, '2026-05-31 18:46:07.204154', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('53', 'admin.test@spark.com', '$2a$12$VTt.aC3Zul5Nsk.Fj99i4uSYUybuktCgWyK8dAPsKm5/RwccDgsra', 't', '2026-06-03 10:26:47.292359', '2026-06-03 10:26:47.292359', NULL, 't', NULL, NULL, '2026-06-05 09:27:10.874717', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('50', 'pepeo@gmail.com', '$2a$10$qGE1Iic8CCaw4NpvgB9/J.m2niMz.hZrRbb6tGIbNOsITLKm1r56W', 't', '2026-06-01 09:54:22.447982', '2026-06-01 09:54:22.447982', NULL, 'f', NULL, NULL, '2026-06-01 09:54:40.022867', 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('48', 'robertinoo@gmail.com', '$2a$10$1MnIGMuZi95bBTruLFjbHOQeDmD35gKuLOY9APyzyQCC67LBXgOiK', 't', '2026-05-31 16:47:17.256616', '2026-05-31 16:47:17.256616', NULL, 't', NULL, NULL, '2026-06-01 18:10:55.551616', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('54', 'galvan@gmail.com', '$2a$10$.BpBdJPNK5J8GT7UMb2n9Oc5BZVune3VtQeMu9KY0Rt34R5pAYeYa', 't', '2026-06-03 13:10:38.118498', '2026-06-03 13:10:38.118498', NULL, 'f', '391939', '2026-06-03 13:25:38.118498', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('55', 'morak@gmail.com', '$2a$10$uYdVXa1AE6wpB4XVpZA3iO3AmSS.S4uAdnXblG/jKf1stZAo2ciXS', 't', '2026-06-03 13:26:01.193823', '2026-06-03 13:26:01.193823', NULL, 'f', '138156', '2026-06-03 13:41:01.193823', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('56', 'mobed56778@gmail.com', '$2a$10$BiO5/wSTsi6vGQ1hXszx9Oefu19IFcrbRbhHpDl/o/5FdNDH/epzq', 't', '2026-06-03 13:36:45.985685', '2026-06-03 13:36:45.985685', NULL, 'f', '240387', '2026-06-03 13:51:45.985685', NULL, 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('58', 'robertina@gmail.com', '$2a$10$kfPTZBLdkXKbPww5flIopODOEYRra8XWEmfWnlkmReqo/PGSDzCo2', 't', '2026-06-05 09:27:35.227424', '2026-06-05 09:27:35.227424', NULL, 't', NULL, NULL, '2026-06-05 09:30:42.767013', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('51', 'admin2@spark.com', '$2a$10$K2DGDpPP9JAI3bH3iuAu1.r2I4.DjilPrDESmbr6z9R3B580ODf9.', 't', '2026-06-02 10:30:42.004667', '2026-06-02 10:30:42.004667', NULL, 'f', NULL, NULL, '2026-06-02 10:31:33.419721', 't');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('59', '1234obed@gmail.com', '$2a$10$DKrmAhzjoOKLrbyufN71a.nfIhupMGpG0IN3wcUKVIViaQpU3FHqK', 't', '2026-06-09 11:01:21.534683', '2026-06-09 11:01:21.534683', NULL, 't', NULL, NULL, '2026-06-09 11:09:07.561229', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('60', 'pedro@gmail.com', '$2a$10$LYgdhR5ZDG5Kxnd0Z9qqdOIfmt6f86bS8ETkkA68Fp0Qz7C5if2g6', 't', '2026-06-10 09:17:15.676559', '2026-06-10 09:17:15.676559', NULL, 't', NULL, NULL, '2026-06-10 09:19:51.608235', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('61', 'eva1234@gmail.com', '$2a$10$2EZaN/rRPqCy3pW6kf.dU.8.Zrtmz/.rQLHPDrBICxvM.rbnRS93.', 't', '2026-06-16 11:50:55.560712', '2026-06-16 11:50:55.560712', NULL, 't', NULL, NULL, '2026-06-16 11:52:54.708887', 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('62', 'paciente@spark.com', '$2a$10$hCX2oKperZW0zgoX0eLUGe5ARkCa7APp5anxP7PDW7XBVDZc7/s1G', 't', '2026-07-27 15:58:56.196285', '2026-07-27 15:58:56.196285', NULL, 't', NULL, NULL, NULL, 'f');
INSERT INTO public.usuarios (id, email, password_hash, activo, created_at, updated_at, foto_url, email_verificado, codigo_activacion, codigo_expiracion, ultimo_login, primer_acceso) VALUES ('1', 'admin@spark.com', '$2a$10$ru4KiMBX0TTbz0kmeZvzTu6yTFipDniGjOA/wj6.WMQiPy.VjdzI2', 't', '2026-03-22 17:04:22.050828', '2026-03-22 17:04:22.050828', NULL, 'f', NULL, NULL, '2026-07-27 16:00:55.814614', 't');


--
-- Name: biomarcadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biomarcadores_id_seq', 1, false);


--
-- Name: citas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.citas_id_seq', 4, true);


--
-- Name: ejercicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ejercicios_id_seq', 3, true);


--
-- Name: expedientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expedientes_id_seq', 37, true);


--
-- Name: medicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicos_id_seq', 15, true);


--
-- Name: notas_clinicas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notas_clinicas_id_seq', 30, true);


--
-- Name: paciente_ejercicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paciente_ejercicio_id_seq', 1, false);


--
-- Name: pacientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pacientes_id_seq', 37, true);


--
-- Name: registros_biomarcador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registros_biomarcador_id_seq', 33, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 62, true);


--
-- Name: biomarcadores biomarcadores_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biomarcadores
    ADD CONSTRAINT biomarcadores_nombre_key UNIQUE (nombre);


--
-- Name: biomarcadores biomarcadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biomarcadores
    ADD CONSTRAINT biomarcadores_pkey PRIMARY KEY (id);


--
-- Name: citas citas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_pkey PRIMARY KEY (id);


--
-- Name: ejercicios ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id);


--
-- Name: expedientes expedientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes
    ADD CONSTRAINT expedientes_pkey PRIMARY KEY (id);


--
-- Name: medicos medicos_numero_licencia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT medicos_numero_licencia_key UNIQUE (numero_licencia);


--
-- Name: medicos medicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT medicos_pkey PRIMARY KEY (id);


--
-- Name: medicos medicos_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT medicos_usuario_id_key UNIQUE (usuario_id);


--
-- Name: notas_clinicas notas_clinicas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_clinicas
    ADD CONSTRAINT notas_clinicas_pkey PRIMARY KEY (id);


--
-- Name: paciente_ejercicio paciente_ejercicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_ejercicio
    ADD CONSTRAINT paciente_ejercicio_pkey PRIMARY KEY (id);


--
-- Name: pacientes pacientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);


--
-- Name: pacientes pacientes_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_usuario_id_key UNIQUE (usuario_id);


--
-- Name: registros_biomarcador registros_biomarcador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_biomarcador
    ADD CONSTRAINT registros_biomarcador_pkey PRIMARY KEY (id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (usuario_id, rol_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: citas citas_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_medico_id_fkey FOREIGN KEY (medico_id) REFERENCES public.medicos(id);


--
-- Name: citas citas_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.citas
    ADD CONSTRAINT citas_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: expedientes expedientes_medico_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes
    ADD CONSTRAINT expedientes_medico_responsable_id_fkey FOREIGN KEY (medico_responsable_id) REFERENCES public.medicos(id);


--
-- Name: expedientes expedientes_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes
    ADD CONSTRAINT expedientes_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: medicos medicos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicos
    ADD CONSTRAINT medicos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: notas_clinicas notas_clinicas_expediente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_clinicas
    ADD CONSTRAINT notas_clinicas_expediente_id_fkey FOREIGN KEY (expediente_id) REFERENCES public.expedientes(id) ON DELETE CASCADE;


--
-- Name: notas_clinicas notas_clinicas_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notas_clinicas
    ADD CONSTRAINT notas_clinicas_medico_id_fkey FOREIGN KEY (medico_id) REFERENCES public.medicos(id);


--
-- Name: paciente_ejercicio paciente_ejercicio_ejercicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_ejercicio
    ADD CONSTRAINT paciente_ejercicio_ejercicio_id_fkey FOREIGN KEY (ejercicio_id) REFERENCES public.ejercicios(id);


--
-- Name: paciente_ejercicio paciente_ejercicio_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_ejercicio
    ADD CONSTRAINT paciente_ejercicio_medico_id_fkey FOREIGN KEY (medico_id) REFERENCES public.medicos(id);


--
-- Name: paciente_ejercicio paciente_ejercicio_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paciente_ejercicio
    ADD CONSTRAINT paciente_ejercicio_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: pacientes pacientes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pacientes
    ADD CONSTRAINT pacientes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: registros_biomarcador registros_biomarcador_biomarcador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_biomarcador
    ADD CONSTRAINT registros_biomarcador_biomarcador_id_fkey FOREIGN KEY (biomarcador_id) REFERENCES public.biomarcadores(id);


--
-- Name: registros_biomarcador registros_biomarcador_medico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_biomarcador
    ADD CONSTRAINT registros_biomarcador_medico_id_fkey FOREIGN KEY (medico_id) REFERENCES public.medicos(id);


--
-- Name: registros_biomarcador registros_biomarcador_paciente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registros_biomarcador
    ADD CONSTRAINT registros_biomarcador_paciente_id_fkey FOREIGN KEY (paciente_id) REFERENCES public.pacientes(id) ON DELETE CASCADE;


--
-- Name: usuario_rol usuario_rol_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: usuario_rol usuario_rol_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



SET search_path = public;