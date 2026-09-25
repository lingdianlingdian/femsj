# Producer 数据表说明

- `producers_seed_public.csv`：历史研究采集表，允许同一 producer_id 多行，因为每行可能代表一个不同产出证据。
- `producers_master_public.csv`：生产器主表；producer_id 唯一。
- `producer_outputs_public.csv`：Producer→Output 证据表；一台 Producer 可有多条输出记录。

后续程序、Schema 和 Balance Simulator 应优先消费 master + outputs 两张表；seed 表保留用于研究追溯。
