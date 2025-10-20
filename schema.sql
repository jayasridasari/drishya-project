

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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    message text NOT NULL,
    type character varying(50),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO taskuser;


CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.refresh_tokens OWNER TO taskuser;


CREATE TABLE public.task_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    task_id uuid,
    user_id uuid,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.task_comments OWNER TO taskuser;



CREATE TABLE public.tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'Todo'::character varying,
    due_date timestamp without time zone,
    priority character varying(20) NOT NULL,
    assignee_id uuid,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    team_id uuid,
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['Todo'::character varying, 'In Progress'::character varying, 'Done'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO taskuser;


CREATE TABLE public.team_members (
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.team_members OWNER TO taskuser;

--
-- TOC entry 219 (class 1259 OID 16480)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.teams OWNER TO taskuser;

--
-- TOC entry 216 (class 1259 OID 16420)
-- Name: users; Type: TABLE; Schema: public; Owner: taskuser
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'member'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'member'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO taskuser;

--
-- TOC entry 4934 (class 0 OID 16530)
-- Dependencies: 222
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.notifications (id, user_id, message, type, is_read, created_at) FROM stdin;
b763c5ad-7a70-4a53-a016-43b942e71f08	fdede834-1754-4690-860e-7141ac60fe5e	Task "Implement user authentication" has been marked as Done	task_completed	f	2025-10-19 14:16:27.154185
01b7ff82-2439-4641-a9b2-2e73478c33ba	fdede834-1754-4690-860e-7141ac60fe5e	Task "Design homepage mockup" has been marked as Done	task_completed	f	2025-10-19 16:24:28.401804
51c58d37-fe8f-4f1f-b181-3d259fd5440f	fdede834-1754-4690-860e-7141ac60fe5e	Task "Design homepage mockup" has been marked as Done	task_completed	f	2025-10-19 21:19:34.813969
eadcb928-50d3-41a3-b869-5fd65f7bce8d	fdede834-1754-4690-860e-7141ac60fe5e	You have been assigned to task: "observaion"	task_assigned	f	2025-10-20 13:51:23.571638
8562593f-d334-4480-a6a5-db85a72ee71d	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	You have been assigned to task: "4th"	task_assigned	f	2025-10-20 16:16:09.672094
b1d153bd-0d4d-4f91-9e25-2024a2eb1dbf	39c4cb71-3270-41c5-b69f-a97c652dd3a5	You have been added to the team: example	team_added	f	2025-10-20 17:41:03.889573
51de05d8-13c1-4fe6-90dd-59e58142a1c6	0564b238-166e-456c-9c08-a0343af4aade	You have been added to the team: testing	team_added	f	2025-10-20 17:44:35.173517
dcce2c3e-9b3d-470f-a4fb-b92f0f60d0e8	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	You have been assigned to task: "poi"	task_assigned	f	2025-10-20 18:02:20.305882
e13e2374-a3c4-4e1f-9852-c8da2f389fee	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	New team task assigned: "poi"	team_task_assigned	f	2025-10-20 18:02:20.310759
10de5e9b-4495-49c9-a6a1-f7a620fdd7b1	0564b238-166e-456c-9c08-a0343af4aade	New team task assigned: "poi"	team_task_assigned	f	2025-10-20 18:02:20.311731
2c14ecba-2c4b-46e8-921f-fe64e0375aa0	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	New team task assigned: "check"	team_task_assigned	f	2025-10-20 18:04:21.32731
2f7ed311-5738-471c-902f-b1f5ff9b49f5	0564b238-166e-456c-9c08-a0343af4aade	New team task assigned: "check"	team_task_assigned	f	2025-10-20 18:04:21.329034
d53c224a-d8f1-43a3-9fb2-9dca375686f1	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	New team task assigned: "sri"	team_task_assigned	f	2025-10-20 18:45:45.316448
05bbec6e-7b83-4ded-a46c-38b896c5df59	0564b238-166e-456c-9c08-a0343af4aade	New team task assigned: "sri"	team_task_assigned	f	2025-10-20 18:45:45.318016
3dd08790-a8ac-4dbf-a95b-9c3376b35486	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	Task "poi" status changed to In Progress	task_updated	f	2025-10-20 18:51:19.435257
0d8574ac-6814-43b1-8955-5c1beddceb57	39c4cb71-3270-41c5-b69f-a97c652dd3a5	Task "teamtask1" has been marked as Done	task_completed	f	2025-10-20 20:46:26.810853
1f1465bd-919a-44ac-acdf-d2bd3a20ff61	39c4cb71-3270-41c5-b69f-a97c652dd3a5	Task "demo" has been marked as Done	task_completed	f	2025-10-20 20:46:39.872071
c1cf8133-f1e2-47c4-b390-abfe7645d712	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	You have been added to the team: example	team_added	f	2025-10-20 21:53:49.033349
c8ae6fbe-91d2-4a1a-aba1-0440dde6262c	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	New team task assigned: "task1"	team_task_assigned	f	2025-10-20 21:54:19.690648
ef9c32c3-12d3-49c9-bec1-b36321c32e3b	c1d815c8-7bda-452c-aa52-a0e1e1d13284	You have been added to the team: example	team_added	f	2025-10-20 21:56:04.072044
f1bae1ba-8351-4f3e-82c2-777e038c1d01	39c4cb71-3270-41c5-b69f-a97c652dd3a5	Task "teamtask1" has been marked as Done	task_completed	f	2025-10-20 22:49:04.754922
\.


--
-- TOC entry 4930 (class 0 OID 16458)
-- Dependencies: 218
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
77317007-4158-4ef6-bd3d-77e50905965e	fdede834-1754-4690-860e-7141ac60fe5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkZWRlODM0LTE3NTQtNDY5MC04NjBlLTcxNDFhYzYwZmU1ZSIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA3Njk3MjUsImV4cCI6MTc2MTM3NDUyNX0.1lQWTSbJqNJCqs7Pcei1uhfZVQm59VIp4WFLelxsfHc	2025-10-25 12:12:05.812654	2025-10-18 12:12:05.812654
45eaaeee-1d37-4f10-98fd-9b9e0e5a0f39	fdede834-1754-4690-860e-7141ac60fe5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkZWRlODM0LTE3NTQtNDY5MC04NjBlLTcxNDFhYzYwZmU1ZSIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA3Njk4MzIsImV4cCI6MTc2MTM3NDYzMn0.LvXlnpBS-qAMogPqG1IEt4jS7ZwfcesmbsyW4Zv1iYI	2025-10-25 12:13:52.292945	2025-10-18 12:13:52.292945
de0800be-5f2b-4cc3-b32f-c7a80b1b0448	fdede834-1754-4690-860e-7141ac60fe5e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZkZWRlODM0LTE3NTQtNDY5MC04NjBlLTcxNDFhYzYwZmU1ZSIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA3NzAyNjEsImV4cCI6MTc2MTM3NTA2MX0.GFQeYyojQcxJNZuzFxqWSq33a0PrQXFHPMNrBxbI__A	2025-10-25 12:21:01.096891	2025-10-18 12:21:01.096891
743fc636-e961-4576-a437-5674441c7f12	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlhZDA1YTlkLWRhOTEtNDBiMy1iYzliLWNhMjI2YjNmOWZlNCIsImVtYWlsIjoieWFzaHVAZ21haWwuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc2MDk3NzY5OSwiZXhwIjoxNzYxNTgyNDk5fQ.Tq-ZVGyont4RQ9hBKpxr6qmnyoIoP0c796bla1tunP4	2025-10-27 21:58:19.188749	2025-10-20 21:58:19.188749
7a05fff8-97d2-4521-967e-4e3b634861b6	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwOTc5NzU5LCJleHAiOjE3NjE1ODQ1NTl9.JDzXyed3JEzC0XZLFJ3FiuwE5n8qTT8VlSLn_rXwYYY	2025-10-27 22:32:39.915514	2025-10-20 22:32:39.915514
8b3e4988-775c-4b79-a4ae-217cac4ee7af	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlhZDA1YTlkLWRhOTEtNDBiMy1iYzliLWNhMjI2YjNmOWZlNCIsImVtYWlsIjoieWFzaHVAZ21haWwuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc2MDk3OTk2NiwiZXhwIjoxNzYxNTg0NzY2fQ.HNeWvcHZhUM9lDU9u9dTSVgVT3CeY2I3D72xNqSOYlU	2025-10-27 22:36:06.550244	2025-10-20 22:36:06.550244
6ed4e4c1-0671-4e1d-a7d9-f368125bba46	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJkZWE1N2FjLTdhYjItNGIyMC05MDJhLWYxY2NlZDFlMDNiNSIsImVtYWlsIjoiYmhhbnVAZ21haWwuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc2MDc4NzgwMCwiZXhwIjoxNzYxMzkyNjAwfQ.oEuAhxwjenKJ5ykE79BYQrbHXhsB3RJUovIj8eKSLzI	2025-10-25 17:13:20.506991	2025-10-18 17:13:20.506991
2bb8c6c8-3583-4bc7-ae78-d7b3a4babbd1	5e6ee30d-701e-4e16-9bf0-6e86a98c01f1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmVlMzBkLTcwMWUtNGUxNi05YmYwLTZlODZhOThjMDFmMSIsImVtYWlsIjoiZGFybGFAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNzg3ODQxLCJleHAiOjE3NjEzOTI2NDF9.ijeiyNlU2FOVh82ksgXkS6OpKeiwDDORN0vouEKUJi0	2025-10-25 17:14:01.363606	2025-10-18 17:14:01.363606
3484e1ab-2f64-4fb4-96cb-eb79b66a8205	5e6ee30d-701e-4e16-9bf0-6e86a98c01f1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmVlMzBkLTcwMWUtNGUxNi05YmYwLTZlODZhOThjMDFmMSIsImVtYWlsIjoiZGFybGFAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNzg3ODc1LCJleHAiOjE3NjEzOTI2NzV9.u9iPJuQ6sMEGF2dbpN92lW0t72Q83BAeJQKhtYMc6gQ	2025-10-25 17:14:35.63594	2025-10-18 17:14:35.63594
ae7d67ea-a413-4b5f-9a2d-3dbdd574abc4	5e6ee30d-701e-4e16-9bf0-6e86a98c01f1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlNmVlMzBkLTcwMWUtNGUxNi05YmYwLTZlODZhOThjMDFmMSIsImVtYWlsIjoiZGFybGFAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwNzkxOTA2LCJleHAiOjE3NjEzOTY3MDZ9.gIE7r9ri1v1Fct9OSALYTgVRA2aaBUaJLTEqxIPKxeY	2025-10-25 18:21:46.982855	2025-10-18 18:21:46.982855
512131e4-befa-43d3-b2a1-c8a849a5a249	0564b238-166e-456c-9c08-a0343af4aade	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA1NjRiMjM4LTE2NmUtNDU2Yy05YzA4LWEwMzQzYWY0YWFkZSIsImVtYWlsIjoiZGFzYXJpQGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3NjA4NjEwMDEsImV4cCI6MTc2MTQ2NTgwMX0.az932oRpq9ltL1eiGmG6qZQJ2_q1XJZ9u9lmbdqe8TQ	2025-10-26 13:33:21.636961	2025-10-19 13:33:21.636961
c5e2d09a-2f51-4402-8330-e704deaa6faf	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODYzNTYwLCJleHAiOjE3NjE0NjgzNjB9.F5VBsXB5x4qzwwNbTCv1ZThjBlQfHtBEEpdcT76dnoE	2025-10-26 14:16:00.011819	2025-10-19 14:16:00.011819
d89bfc5c-6c16-4581-9eee-f4685e8c21be	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODYzOTkwLCJleHAiOjE3NjE0Njg3OTB9.zfgJxwCetlPEhoW2o5sRyzmejimdjYIYKyKUWnKbhEw	2025-10-26 14:23:10.16618	2025-10-19 14:23:10.16618
96a54770-b3d9-4912-9c6d-66cbb6f3c108	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODY2MzExLCJleHAiOjE3NjE0NzExMTF9.dhU5BbcNnKf3dqcs_TBy4W2cYdgkCnbmcDKI3mleeHs	2025-10-26 15:01:51.730491	2025-10-19 15:01:51.730491
c288e020-8621-49d9-b15c-40f108556c6f	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODY2ODk3LCJleHAiOjE3NjE0NzE2OTd9.t7nF0HLrHbvKKs6Se6J_sE5Us6s2ICOO3fyKrtfJQqo	2025-10-26 15:11:37.131597	2025-10-19 15:11:37.131597
e1b95e68-9ba2-4965-a192-75e8ca66996d	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODcxMjU3LCJleHAiOjE3NjE0NzYwNTd9.3iTavPSlwNSdKJMB-I5FYak1Zm5BPKipAVEj1hQhkMU	2025-10-26 16:24:17.233083	2025-10-19 16:24:17.233083
5d400fac-45ba-4c5a-ad6b-6f3fee3a3aca	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODc0MTI4LCJleHAiOjE3NjE0Nzg5Mjh9.iNEv3mSfgSv5CB-tp8f1tqm1V8gP4tAjddr5crcR0PQ	2025-10-26 17:12:08.730884	2025-10-19 17:12:08.730884
b271d4e3-5e3e-4899-b7a4-0e052ae6edf4	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwOTY2NDU3LCJleHAiOjE3NjE1NzEyNTd9.kaRlC9HMsr22IND5y9QXzj7vUud1rUe4LusDoXRetws	2025-10-27 18:50:57.930373	2025-10-20 18:50:57.930373
7d769e74-9884-46ce-8333-8b5ec9d9e986	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODc3OTg5LCJleHAiOjE3NjE0ODI3ODl9.muZuYCTu_2dkykNR-wKjrXHxFVGLQkPJC4ZZdTEibyA	2025-10-26 18:16:29.178849	2025-10-19 18:16:29.178849
0ddc89f8-0c00-4d7b-82a6-712561f73c2b	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODgxODQ3LCJleHAiOjE3NjE0ODY2NDd9.xJQiJYG3MD6hJ6BpyJJOkdfNdzGPU1rgBHsmdIa_WHk	2025-10-26 19:20:47.482928	2025-10-19 19:20:47.482928
72c06da9-f562-4fcd-b357-bfc1ec210acb	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwODgxOTgxLCJleHAiOjE3NjE0ODY3ODF9.NUxgTGGQqhurQIOrNjK86imkDRO7jJru3f_MKiqBQW4	2025-10-26 19:23:01.747514	2025-10-19 19:23:01.747514
28fbbdcb-76a0-4311-88cd-fb974b37c3bc	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwOTczNTk5LCJleHAiOjE3NjE1NzgzOTl9.uhis4Egok52Ze10xMewwBbISQg0jbYTrhV8P1x1ogvY	2025-10-27 20:49:59.53904	2025-10-20 20:49:59.53904
0577338b-7d7d-4f07-af62-fbee8ecaa355	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwOTMzNjE0LCJleHAiOjE3NjE1Mzg0MTR9.4W9faawd4BbpV71pdHtIEVyPSgFADRjEOrLSV9ju9tE	2025-10-27 09:43:34.676372	2025-10-20 09:43:34.676372
a84ec790-924c-4bb7-bcb3-5a73bbccba55	39c4cb71-3270-41c5-b69f-a97c652dd3a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM5YzRjYjcxLTMyNzAtNDFjNS1iNjlmLWE5N2M2NTJkZDNhNSIsImVtYWlsIjoic3JhdnNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwOTQ4MzYyLCJleHAiOjE3NjE1NTMxNjJ9.eR83ABVTkJ5anywb6KnUtubQu7wrR0eEZXQsJMZMiBc	2025-10-27 13:49:22.784334	2025-10-20 13:49:22.784334
\.


--
-- TOC entry 4933 (class 0 OID 16511)
-- Dependencies: 221
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.task_comments (id, task_id, user_id, comment, created_at) FROM stdin;
\.


--
-- TOC entry 4929 (class 0 OID 16435)
-- Dependencies: 217
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.tasks (id, title, description, status, due_date, priority, assignee_id, created_by, created_at, updated_at, team_id) FROM stdin;
8eed76d2-a722-42d0-a7f4-4fe9fd218d5f	yashu		Todo	2025-10-20 00:00:00	High	\N	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	2025-10-20 21:52:44.632382	2025-10-20 21:52:55.359347	\N
6e96fba7-7b13-4dee-9fc4-1a0420b2a8f7	yashus	dd	Todo	2025-10-29 00:00:00	High	\N	\N	2025-10-20 18:52:27.779992	2025-10-20 21:53:16.228615	\N
26d3a5e6-a4c8-480d-9bf1-4c005fa0ca28	try	efa	Todo	2025-10-31 00:00:00	Medium	\N	\N	2025-10-20 19:10:16.448981	2025-10-20 21:58:02.883373	23d7935d-6344-4ca7-9b05-13d06249bf7a
d174d140-03d0-4e5a-b0da-288b7c20c2da	task1		In Progress	2025-10-20 00:00:00	Low	\N	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-20 21:54:19.681567	2025-10-20 22:01:34.741754	23d7935d-6344-4ca7-9b05-13d06249bf7a
019eb791-4e75-409c-8eaf-a93f0240eecb	teamtask1	hhgv	Done	2025-10-28 00:00:00	High	\N	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-20 18:54:54.556719	2025-10-20 22:49:04.747395	23d7935d-6344-4ca7-9b05-13d06249bf7a
c50deac8-61f9-40fd-acb8-4d241994d3a2	poi	lkjj	In Progress	2025-11-01 00:00:00	Medium	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-20 18:02:20.301055	2025-10-20 18:51:19.428329	f698f85f-ca7e-4f16-9f34-8f982ef052c5
53955793-87e8-4235-9289-620ed8024846	check	ing	Done	2025-10-31 00:00:00	Medium	\N	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-20 18:04:21.314671	2025-10-20 20:40:03.765733	f698f85f-ca7e-4f16-9f34-8f982ef052c5
4915bff3-fa78-44cf-9810-9cc975a448e2	demo		Done	\N	Medium	\N	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-20 20:27:24.071656	2025-10-20 20:46:39.866773	23d7935d-6344-4ca7-9b05-13d06249bf7a
420af8fc-d469-4324-a954-1e52957fe0fe	sri	ff	Todo	2025-10-29 00:00:00	Low	\N	\N	2025-10-20 18:45:45.306538	2025-10-20 20:59:42.072915	f698f85f-ca7e-4f16-9f34-8f982ef052c5
\.


--
-- TOC entry 4932 (class 0 OID 16495)
-- Dependencies: 220
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: taskuser
--

COPY public.team_members (team_id, user_id, joined_at) FROM stdin;
f698f85f-ca7e-4f16-9f34-8f982ef052c5	bdea57ac-7ab2-4b20-902a-f1cced1e03b5	2025-10-18 17:22:30.291135
f698f85f-ca7e-4f16-9f34-8f982ef052c5	0564b238-166e-456c-9c08-a0343af4aade	2025-10-20 17:44:35.167134
23d7935d-6344-4ca7-9b05-13d06249bf7a	9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	2025-10-20 21:53:49.026423
23d7935d-6344-4ca7-9b05-13d06249bf7a	c1d815c8-7bda-452c-aa52-a0e1e1d13284	2025-10-20 21:56:04.064496
\.


--
-- TOC entry 4931 (class 0 OID 16480)
-- Dependencies: 219
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, description, created_by, created_at, updated_at) FROM stdin;
23d7935d-6344-4ca7-9b05-13d06249bf7a	example	example team	39c4cb71-3270-41c5-b69f-a97c652dd3a5	2025-10-19 14:24:30.26533	2025-10-19 14:24:30.26533
f698f85f-ca7e-4f16-9f34-8f982ef052c5	testing	testing team	\N	2025-10-18 17:20:54.779078	2025-10-18 17:20:54.779078
\.


--
-- TOC entry 4928 (class 0 OID 16420)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
0564b238-166e-456c-9c08-a0343af4aade	dasari	dasari@gmail.com	$2a$10$bdzmLDmA9VcLuCPnrnDCV.CYFfFmxOZuzcOn3YNo20SeRiXYR89Am	member	t	2025-10-19 13:33:21.621656	2025-10-19 13:33:21.621656
5e6ee30d-701e-4e16-9bf0-6e86a98c01f1	darla	darla@gmail.com	$2b$10$tiJW/qmhE.Jq28lapWUcSuXs35bmUatPHoY5aRW2NkWVE9nxlgo5W	member	t	2025-10-18 17:14:01.357572	2025-10-19 15:02:04.775889
8c12305c-b171-4539-9609-b3e4340e8a0a	maharaj	maharaj@gmail.com	$2a$10$ucoia/IApOSjf//0eqaTzOJZ7dUsmi1tbqXQjhYCY4m39KobWXoNe	member	t	2025-10-19 15:27:23.205075	2025-10-19 15:27:23.205075
bdea57ac-7ab2-4b20-902a-f1cced1e03b5	bhanu	bhanu@gmail.com	$2b$10$9kxe.glTtCK.isKlDx87f.MMbLvgAcAGsLCgiEClGv6K1sre7jBSa	admin	t	2025-10-18 17:13:20.498131	2025-10-19 21:09:58.330843
39c4cb71-3270-41c5-b69f-a97c652dd3a5	sravani	sravs@gmail.com	$2a$10$X0u6MHfjgCwZkASFvTvbGu8J2WpUIll83W.RC6Oo6E8VwnjNi3Cz2	admin	t	2025-10-19 14:16:00.005071	2025-10-19 21:10:22.162509
fdede834-1754-4690-860e-7141ac60fe5e	admin	admin@test.com	$2b$10$AKdjNCv2HVkjbnA05NF7SOvnalqvWI0Otfxv9ESjPyNQxvhZZBG0i	admin	t	2025-10-18 12:12:05.803979	2025-10-20 21:51:26.290732
c1d815c8-7bda-452c-aa52-a0e1e1d13284	sri	sri@gmail.com	$2a$10$tZVYcCkMlOUmfIdSgXYRNe/QgHno3xmPSOBbXTLSIc8579TPkJI96	member	t	2025-10-20 21:55:28.111841	2025-10-20 21:55:28.111841
9ad05a9d-da91-40b3-bc9b-ca226b3f9fe4	yashuu	yashu@gmail.com	$2a$10$Dr6a31px5PLzAoAyIEfsie/UvH0dl60nDYWIJj.tB96Nz1yF7Bhhe	member	t	2025-10-20 21:51:42.520706	2025-10-20 22:13:44.540456
\.


--
-- TOC entry 4774 (class 2606 OID 16539)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 16466)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 16519)
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 16447)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 16500)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id);


--
-- TOC entry 4763 (class 2606 OID 16489)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4748 (class 2606 OID 16434)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4750 (class 2606 OID 16432)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4771 (class 1259 OID 16549)
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- TOC entry 4772 (class 1259 OID 16548)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 4758 (class 1259 OID 16479)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 4759 (class 1259 OID 16478)
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 4768 (class 1259 OID 16547)
-- Name: idx_task_comments_task; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_task_comments_task ON public.task_comments USING btree (task_id);


--
-- TOC entry 4751 (class 1259 OID 16475)
-- Name: idx_tasks_assignee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (assignee_id);


--
-- TOC entry 4752 (class 1259 OID 16477)
-- Name: idx_tasks_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_created_by ON public.tasks USING btree (created_by);


--
-- TOC entry 4753 (class 1259 OID 16476)
-- Name: idx_tasks_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_priority ON public.tasks USING btree (priority);


--
-- TOC entry 4754 (class 1259 OID 16474)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 4755 (class 1259 OID 16555)
-- Name: idx_tasks_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_team_id ON public.tasks USING btree (team_id);


--
-- TOC entry 4764 (class 1259 OID 16545)
-- Name: idx_team_members_team; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_team ON public.team_members USING btree (team_id);


--
-- TOC entry 4765 (class 1259 OID 16546)
-- Name: idx_team_members_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_user ON public.team_members USING btree (user_id);


--
-- TOC entry 4745 (class 1259 OID 16472)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4746 (class 1259 OID 16473)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 4784 (class 2606 OID 16540)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4778 (class 2606 OID 16467)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4782 (class 2606 OID 16520)
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 4783 (class 2606 OID 16525)
-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4775 (class 2606 OID 16560)
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4776 (class 2606 OID 16565)
-- Name: tasks tasks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4777 (class 2606 OID 16550)
-- Name: tasks tasks_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL;


--
-- TOC entry 4780 (class 2606 OID 16501)
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4781 (class 2606 OID 16506)
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4779 (class 2606 OID 16490)
-- Name: teams teams_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2025-10-21 01:27:09

--
-- PostgreSQL database dump complete
--

