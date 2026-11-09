-- 03_drop_off_coords.sql
-- Preenche latitude/longitude dos pontos de coleta já cadastrados (todos estavam sem localização),
-- para que apareçam no mapa de "Onde descartar". Coordenadas aproximadas em Caxias - MA.
-- Rodar no Supabase: SQL Editor > New query > colar > Run.

update public.drop_off_points set latitude = -4.8590, longitude = -43.3555
where id = '7f4a8ba9-7d08-4e1b-a3a5-834b77f4382e'; -- Ecoponto Centro (Rua Afonso Cunha)

update public.drop_off_points set latitude = -4.8638, longitude = -43.3532
where id = '337edb45-3b0f-4796-aea2-b4dbb41d6797'; -- Farmácia Popular (Av. General Sampaio)

update public.drop_off_points set latitude = -4.8712, longitude = -43.3478
where id = 'e376d521-c1e5-4751-a61e-75ea6b14b1bc'; -- Loja de Eletrônicos (Rua do Fio, Cangalheiro)

update public.drop_off_points set latitude = -4.8604, longitude = -43.3583
where id = '57cc25a3-7c5a-4803-bbcc-0b4ffc72b936'; -- Supermercado do Bairro (Rua Afonso Cunha, Centro)

update public.drop_off_points set latitude = -4.8665, longitude = -43.3618
where id = '01d7b31a-90e7-4609-bfdf-f93e78be3e6d'; -- "Novo" (registro de teste)

-- Conferir:
select name, address, latitude, longitude from public.drop_off_points order by created_at desc;
