-- 003  –  Packeta (výdajné miesto / Z-BOX a doručenie na adresu)
-- Zatiaľ vypnuté s cenou 0 €. Ceny doplní majiteľka podľa zmluvy s Packetou, potom is_active = true.

insert into public.shipping_methods (code, name, carrier, kind, price, is_active, position) values
  ('packeta_pickup', 'Packeta – výdajné miesto / Z-BOX', 'packeta', 'pickup', 0.00, false, 1),
  ('packeta_home',   'Packeta – doručenie na adresu',    'packeta', 'home',   0.00, false, 2);

update public.shipping_methods set position = 3 where code = 'gls';
update public.shipping_methods set position = 4 where code = 'posta';
update public.shipping_methods set position = 5 where code = 'osobny';
