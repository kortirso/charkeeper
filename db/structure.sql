SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: dnd5_character_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dnd5_character_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    character_id uuid NOT NULL,
    item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ready_to_use boolean DEFAULT false NOT NULL
);


--
-- Name: dnd5_character_spells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dnd5_character_spells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    character_id uuid NOT NULL,
    spell_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    ready_to_use boolean DEFAULT false NOT NULL,
    prepared_by smallint NOT NULL
);


--
-- Name: dnd5_characters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dnd5_characters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    level smallint DEFAULT 1 NOT NULL,
    race smallint NOT NULL,
    subrace smallint,
    alignment smallint NOT NULL,
    classes jsonb DEFAULT '{}'::jsonb NOT NULL,
    subclasses jsonb DEFAULT '{}'::jsonb NOT NULL,
    abilities jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    energy jsonb DEFAULT '{}'::jsonb NOT NULL,
    health jsonb DEFAULT '{}'::jsonb NOT NULL,
    speed smallint NOT NULL,
    selected_skills character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    languages character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    armor_proficiency character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    coins jsonb DEFAULT '{}'::jsonb NOT NULL,
    weapon_core_skills character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    weapon_skills character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    class_features character varying[] DEFAULT '{}'::character varying[] NOT NULL,
    main_class smallint NOT NULL,
    spent_spell_slots jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: TABLE dnd5_characters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.dnd5_characters IS 'Персонажи для D&D 5';


--
-- Name: COLUMN dnd5_characters.level; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.level IS 'Уровень персонажа';


--
-- Name: COLUMN dnd5_characters.race; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.race IS 'Основная раса';


--
-- Name: COLUMN dnd5_characters.subrace; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.subrace IS 'Подраса';


--
-- Name: COLUMN dnd5_characters.alignment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.alignment IS 'Мировоззрение';


--
-- Name: COLUMN dnd5_characters.classes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.classes IS 'Список классов и уровней/подклассов персонажа';


--
-- Name: COLUMN dnd5_characters.subclasses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.subclasses IS 'Список подклассов персонажа';


--
-- Name: COLUMN dnd5_characters.abilities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.abilities IS 'Основные характеристики';


--
-- Name: COLUMN dnd5_characters.energy; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.energy IS 'Заряды энергии';


--
-- Name: COLUMN dnd5_characters.health; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.health IS 'Данные о здоровье';


--
-- Name: COLUMN dnd5_characters.speed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.speed IS 'Скорость';


--
-- Name: COLUMN dnd5_characters.selected_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.selected_skills IS 'Выбранные умения';


--
-- Name: COLUMN dnd5_characters.languages; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.languages IS 'Изученные языки';


--
-- Name: COLUMN dnd5_characters.armor_proficiency; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.armor_proficiency IS 'Владение доспехами и щитами';


--
-- Name: COLUMN dnd5_characters.coins; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.coins IS 'Данные о деньгах';


--
-- Name: COLUMN dnd5_characters.weapon_core_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.weapon_core_skills IS 'Владение группами оружия';


--
-- Name: COLUMN dnd5_characters.weapon_skills; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.weapon_skills IS 'Владение определенными видами оружия';


--
-- Name: COLUMN dnd5_characters.class_features; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.class_features IS 'Выбранные классовые умения';


--
-- Name: COLUMN dnd5_characters.main_class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.main_class IS 'Первый выбранный класс';


--
-- Name: COLUMN dnd5_characters.spent_spell_slots; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_characters.spent_spell_slots IS 'Потраченные слоты заклинаний по уровням';


--
-- Name: dnd5_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dnd5_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kind character varying NOT NULL,
    name jsonb DEFAULT '{}'::jsonb NOT NULL,
    weight integer,
    price integer,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: TABLE dnd5_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.dnd5_items IS 'Предметы для D&D 5';


--
-- Name: COLUMN dnd5_items.kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_items.kind IS 'Тип предмета';


--
-- Name: COLUMN dnd5_items.weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_items.weight IS 'Вес в фунтах';


--
-- Name: COLUMN dnd5_items.price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_items.price IS 'Цена в медных монетах';


--
-- Name: COLUMN dnd5_items.data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dnd5_items.data IS 'Свойства предмета';


--
-- Name: dnd5_spells; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dnd5_spells (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug character varying NOT NULL,
    name jsonb DEFAULT '{}'::jsonb NOT NULL,
    level smallint DEFAULT 0 NOT NULL,
    attacking boolean DEFAULT false NOT NULL,
    comment jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    available_for character varying[] DEFAULT '{}'::character varying[] NOT NULL
);


--
-- Name: TABLE dnd5_spells; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.dnd5_spells IS 'Заклинания D&D 5';


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: user_characters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_characters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    characterable_id uuid NOT NULL,
    characterable_type character varying NOT NULL,
    provider integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider integer NOT NULL,
    uid character varying NOT NULL,
    username character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    locale character varying DEFAULT 'en'::character varying NOT NULL
);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: dnd5_character_items dnd5_character_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dnd5_character_items
    ADD CONSTRAINT dnd5_character_items_pkey PRIMARY KEY (id);


--
-- Name: dnd5_character_spells dnd5_character_spells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dnd5_character_spells
    ADD CONSTRAINT dnd5_character_spells_pkey PRIMARY KEY (id);


--
-- Name: dnd5_characters dnd5_characters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dnd5_characters
    ADD CONSTRAINT dnd5_characters_pkey PRIMARY KEY (id);


--
-- Name: dnd5_items dnd5_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dnd5_items
    ADD CONSTRAINT dnd5_items_pkey PRIMARY KEY (id);


--
-- Name: dnd5_spells dnd5_spells_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dnd5_spells
    ADD CONSTRAINT dnd5_spells_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: user_characters user_characters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_characters
    ADD CONSTRAINT user_characters_pkey PRIMARY KEY (id);


--
-- Name: user_identities user_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_identities
    ADD CONSTRAINT user_identities_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_on_characterable_id_characterable_type_f442989187; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_on_characterable_id_characterable_type_f442989187 ON public.user_characters USING btree (characterable_id, characterable_type);


--
-- Name: index_dnd5_character_items_on_character_id_and_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_dnd5_character_items_on_character_id_and_item_id ON public.dnd5_character_items USING btree (character_id, item_id);


--
-- Name: index_dnd5_character_spells_on_character_id_and_spell_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_dnd5_character_spells_on_character_id_and_spell_id ON public.dnd5_character_spells USING btree (character_id, spell_id);


--
-- Name: index_user_characters_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_characters_on_user_id ON public.user_characters USING btree (user_id);


--
-- Name: index_user_identities_on_provider_and_uid; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_user_identities_on_provider_and_uid ON public.user_identities USING btree (provider, uid);


--
-- Name: index_user_identities_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_identities_on_user_id ON public.user_identities USING btree (user_id);


--
-- Name: index_user_sessions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_user_sessions_on_user_id ON public.user_sessions USING btree (user_id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20250124110858'),
('20250123125805'),
('20250122145857'),
('20250121113237'),
('20250120185611'),
('20250120184143'),
('20250120183317'),
('20250120183310'),
('20250120182638'),
('20250120154201'),
('20250120130703'),
('20250120093511'),
('20250116173157'),
('20250111132233'),
('20250110162616'),
('20250110162012'),
('20250110121151');

