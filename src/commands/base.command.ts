import type { Command } from 'commander';

export abstract class BaseCommand {
  constructor(protected readonly program: Command) {}

  public abstract register(): void;
}
