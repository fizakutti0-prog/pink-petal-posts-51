--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.follows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read boolean DEFAULT false
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    related_user_id uuid,
    related_post_id uuid,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reply_to uuid,
    image_url text,
    CONSTRAINT content_length CHECK ((char_length(content) <= 280))
);


--
-- Name: retweets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retweets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    post_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    display_name text NOT NULL,
    avatar_color text DEFAULT '#FF1493'::text NOT NULL,
    bio text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: follows follows_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: follows follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: likes likes_user_id_post_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_post_id_key UNIQUE (user_id, post_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: retweets retweets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retweets
    ADD CONSTRAINT retweets_pkey PRIMARY KEY (id);


--
-- Name: retweets retweets_user_id_post_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retweets
    ADD CONSTRAINT retweets_user_id_post_id_key UNIQUE (user_id, post_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_follows_follower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follows_follower ON public.follows USING btree (follower_id);


--
-- Name: idx_follows_following; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_follows_following ON public.follows USING btree (following_id);


--
-- Name: idx_likes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);


--
-- Name: idx_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_user_id ON public.likes USING btree (user_id);


--
-- Name: idx_messages_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_recipient ON public.messages USING btree (recipient_id);


--
-- Name: idx_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_posts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);


--
-- Name: idx_posts_reply_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_reply_to ON public.posts USING btree (reply_to);


--
-- Name: idx_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);


--
-- Name: idx_retweets_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_retweets_post_id ON public.retweets USING btree (post_id);


--
-- Name: idx_retweets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_retweets_user_id ON public.retweets USING btree (user_id);


--
-- Name: likes likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_reply_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: retweets retweets_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retweets
    ADD CONSTRAINT retweets_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: retweets retweets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retweets
    ADD CONSTRAINT retweets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes Anyone can create likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create likes" ON public.likes FOR INSERT WITH CHECK (true);


--
-- Name: notifications Anyone can create notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);


--
-- Name: posts Anyone can create posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create posts" ON public.posts FOR INSERT WITH CHECK (true);


--
-- Name: retweets Anyone can create retweets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create retweets" ON public.retweets FOR INSERT WITH CHECK (true);


--
-- Name: users Anyone can create users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create users" ON public.users FOR INSERT WITH CHECK (true);


--
-- Name: likes Anyone can delete their likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete their likes" ON public.likes FOR DELETE USING (true);


--
-- Name: posts Anyone can delete their posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete their posts" ON public.posts FOR DELETE USING (true);


--
-- Name: retweets Anyone can delete their retweets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete their retweets" ON public.retweets FOR DELETE USING (true);


--
-- Name: follows Anyone can view follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);


--
-- Name: likes Anyone can view likes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);


--
-- Name: posts Anyone can view posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);


--
-- Name: retweets Anyone can view retweets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view retweets" ON public.retweets FOR SELECT USING (true);


--
-- Name: users Anyone can view users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);


--
-- Name: messages Users can delete their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their messages" ON public.messages FOR DELETE USING (true);


--
-- Name: follows Users can follow others; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (true);


--
-- Name: messages Users can mark messages as read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can mark messages as read" ON public.messages FOR UPDATE USING (true);


--
-- Name: notifications Users can mark notifications as read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can mark notifications as read" ON public.notifications FOR UPDATE USING (true);


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (true);


--
-- Name: follows Users can unfollow; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (true);


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (true);


--
-- Name: notifications Users can view their notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (true);


--
-- Name: follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

--
-- Name: likes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

--
-- Name: retweets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


