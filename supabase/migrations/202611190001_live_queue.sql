begin;

create schema queue_private;
revoke all on schema queue_private from public, anon, authenticated;

-- Only this non-personal change signal is replicated to customers.
create table public.queue_businesses (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  location text not null,
  timezone text not null default 'Africa/Johannesburg',
  average_minutes integer not null default 5 check (average_minutes between 1 and 120),
  demo boolean not null default false,
  revision bigint not null default 0
);
alter table public.queue_businesses enable row level security;
revoke all on public.queue_businesses from public, anon, authenticated;
grant select on public.queue_businesses to anon, authenticated;
create policy read_business on public.queue_businesses for select using (true);
alter publication supabase_realtime add table public.queue_businesses;

create table queue_private.merchants (
  business text references public.queue_businesses on delete cascade,
  account uuid references auth.users on delete cascade,
  primary key (business, account)
);
create table queue_private.tickets (
  business text not null references public.queue_businesses on delete cascade,
  number integer not null,
  owner_id uuid references auth.users on delete set null,
  joined_at timestamptz not null default now(),
  called_at timestamptz,
  ended_at timestamptz,
  status text not null default 'waiting' check (status in ('waiting','called','completed','no_show')),
  priority text not null default 'standard' check (priority in ('standard','elderly','emergency','appointment')),
  primary key (business, number)
);
create unique index one_active_ticket on queue_private.tickets(business, owner_id) where status in ('waiting','called');
create unique index one_at_counter on queue_private.tickets(business) where status = 'called';
create index ticket_owner on queue_private.tickets(business, owner_id, number desc);
create index queue_order on queue_private.tickets(business, (priority = 'standard'), number) where status = 'waiting';

create function public.queue_join(b text) returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'Guest session required'; end if;
  perform 1 from public.queue_businesses where slug = b for update;
  if not found then raise exception 'Business not found'; end if;
  select number into n from queue_private.tickets where business=b and owner_id=auth.uid() and status in ('waiting','called');
  if found then return n; end if;
  select coalesce(max(number),0)+1 into n from queue_private.tickets where business=b;
  insert into queue_private.tickets(business,number,owner_id) values(b,n,auth.uid());
  update public.queue_businesses set revision=revision+1 where slug=b;
  return n;
end $$;

create function public.queue_snapshot(b text, desk boolean default false) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  biz public.queue_businesses;
  mine queue_private.tickets;
  line integer[];
  serving queue_private.tickets;
  pos integer;
  remaining integer;
begin
  select * into biz from public.queue_businesses where slug=b;
  if not found then raise exception 'Business not found'; end if;
  if desk and not biz.demo and not exists (select 1 from queue_private.merchants where business=b and account=auth.uid())
    then raise exception 'Merchant access required' using errcode='42501'; end if;
  select coalesce(array_agg(number order by (priority='standard'), number),'{}') into line
    from queue_private.tickets where business=b and status='waiting';
  select * into serving from queue_private.tickets where business=b and status='called';
  remaining := case when serving.number is null then 0 else
    greatest(1, biz.average_minutes - floor(extract(epoch from (now()-serving.called_at))/60)::integer) end;
  if not desk then
    select * into mine from queue_private.tickets where business=b and owner_id=auth.uid() order by number desc limit 1;
    pos := array_position(line,mine.number);
  end if;
  return jsonb_build_object(
    'business',to_jsonb(biz),'waiting',cardinality(line),'remaining',remaining,
    'newWait',cardinality(line)*biz.average_minutes + remaining,
    'mine',case when mine.number is not null then to_jsonb(mine)-'owner_id'-'business' end,
    'position',pos,'estimate',case when pos is not null then (pos-1)*biz.average_minutes + remaining else 0 end,
    'called',case when desk and serving.number is not null then to_jsonb(serving)-'owner_id'-'business' end,
    'line',case when desk then coalesce((select jsonb_agg(to_jsonb(t)-'owner_id'-'business' order by (t.priority='standard'),t.number)
      from queue_private.tickets t where t.business=b and t.status='waiting'),'[]'::jsonb) end,
    'completed',case when desk then (select count(*) from queue_private.tickets where business=b and status='completed' and
      (ended_at at time zone biz.timezone)::date = (now() at time zone biz.timezone)::date) end,
    'history',case when desk then coalesce((select jsonb_agg(to_jsonb(h)-'owner_id'-'business' order by h.ended_at desc) from
      (select * from queue_private.tickets where business=b and ended_at is not null order by ended_at desc limit 50) h),'[]'::jsonb) end);
end $$;

create function public.queue_manage(b text, action text, ticket integer default null, category text default null, minutes integer default null)
returns void language plpgsql security definer set search_path = '' as $$
declare next_ticket integer;
begin
  if not exists (select 1 from public.queue_businesses where slug=b and demo) and not exists (select 1 from queue_private.merchants where business=b and account=auth.uid())
    then raise exception 'Merchant access required' using errcode='42501'; end if;
  perform 1 from public.queue_businesses where slug=b for update;
  case action
    when 'call' then
      if exists (select 1 from queue_private.tickets where business=b and status='called') then
        raise exception 'Finish the current ticket first'; end if;
      select number into next_ticket from queue_private.tickets where business=b and status='waiting'
        order by (priority='standard'), number limit 1;
      if next_ticket is null or ticket is distinct from next_ticket then raise exception 'The queue has changed. Try again.'; end if;
      update queue_private.tickets set status='called',called_at=now() where business=b and number=ticket;
    when 'completed','no_show' then
      update queue_private.tickets set status=action,ended_at=now() where business=b and number=ticket and status='called';
      if not found then raise exception 'This ticket is not at the counter'; end if;
    when 'priority' then
      if category is null or category not in ('standard','elderly','emergency','appointment') then raise exception 'Invalid priority'; end if;
      update queue_private.tickets set priority=category where business=b and number=ticket and status='waiting';
      if not found then raise exception 'This ticket is no longer waiting'; end if;
    when 'average' then
      if minutes is null or minutes not between 1 and 120 then raise exception 'Use 1 to 120 minutes'; end if;
      update public.queue_businesses set average_minutes=minutes where slug=b;
    else raise exception 'Unknown queue action';
  end case;
  update public.queue_businesses set revision=revision+1 where slug=b;
end $$;

revoke all on function public.queue_snapshot(text,boolean),public.queue_join(text),public.queue_manage(text,text,integer,text,integer) from public, anon, authenticated;
grant execute on function public.queue_snapshot(text,boolean) to anon, authenticated;
grant execute on function public.queue_join(text),public.queue_manage(text,text,integer,text,integer) to authenticated;
commit;
