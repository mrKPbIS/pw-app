import { DataSource, Repository, DataSourceOptions } from 'typeorm';

export class AppDataSource {
  private dataSource: DataSource;
  private entities: string[];
  private repositories: Map<string, Repository<any>>;

  constructor(dataSourceConfig: DataSourceOptions, entities: string[]) {
    this.entities = entities;
    this.dataSource = new DataSource(dataSourceConfig);
    this.repositories = new Map();
  }

  async init() {
    try {
      await this.dataSource.initialize();
      console.log('Data source initialized');
      for(const entity of this.entities) {
        this.repositories.set(entity, await this.dataSource.getRepository(entity));
      }
    }
    catch(err) {
      console.log('Error during initializing Data Source');
      throw err;
    }
  }

  getRepository(entity: string): Repository<any> | null {
    if (!this.dataSource.isInitialized) {
      return null;
    }
    return this.repositories.get(entity);
  }
}
