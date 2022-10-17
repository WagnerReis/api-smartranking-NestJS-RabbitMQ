import { IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { DesafioAtualizarStatus } from '../desafio-atualizar-status.enum';

export class AtualizarDesafioDto {
  @IsNotEmpty()
  @IsDateString()
  dataHoraDesafio: Date;

  @IsEnum(DesafioAtualizarStatus)
  status: string;
}
