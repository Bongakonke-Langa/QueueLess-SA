-- Local example only; production businesses are provisioned explicitly.
insert into public.queue_businesses(slug,name,location,average_minutes,demo)
values('ubuntu-bank','Ubuntu Bank','Church Square, Pretoria',5,true);
insert into queue_private.tickets(business,number,status,joined_at,called_at,ended_at)
select 'ubuntu-bank',n,'completed',now()-(56-n)*interval '5 minutes',
  now()-(55-n)*interval '5 minutes',now()-(54-n)*interval '5 minutes'
from generate_series(24,41) n;
insert into queue_private.tickets(business,number,status,joined_at,called_at)
values('ubuntu-bank',42,'called',now()-interval '24 minutes',now()-interval '2 minutes');
insert into queue_private.tickets(business,number,priority,joined_at)
select 'ubuntu-bank',n,case when n=43 then 'appointment' when n=45 then 'elderly' else 'standard' end,
  now()-(49-n)*interval '3 minutes' from generate_series(43,48) n;
