import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DesafiosService } from './desafios.service';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';

@Controller('api/v1/desafios')
export class DesafiosController {
  constructor(private readonly desafiosService: DesafiosService) {}

  @Post()
  @UsePipes(ValidationPipe)
  async criarDesafio(
    @Body() criarDesafioDto: CriarDesafioDto,
  ): Promise<Desafio> {
    return await this.desafiosService.criarDesafio(criarDesafioDto);
  }

  @Get()
  async consultarTodosDesafios(): Promise<Desafio[] | Desafio> {
    return await this.desafiosService.consultarTodosDesafios();
  }

  @Get('/:idJogador')
  async consultarDesafioPorJogador(
    @Param() params: string[],
  ): Promise<Desafio[] | Desafio> {
    return await this.desafiosService.consultarDesafiosDeUmJogador(params);
  }
}
