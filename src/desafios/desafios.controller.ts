import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UsePipes,
  ValidationPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { ValidacaoParametrosPipe } from 'src/common/pipes/validacao-parametros.pipe';
import { AtribuirDesafioPartidaDto } from 'src/desafios/dtos/atribuir-desafio-partida.dto';
import { DesafiosService } from './desafios.service';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
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

  @Put('/:_id')
  @UsePipes(ValidationPipe)
  async atualizarDesafio(
    @Body() atualizarDesafioDto: AtualizarDesafioDto,
    @Param('_id', ValidacaoParametrosPipe) _id: string,
  ): Promise<void> {
    await this.desafiosService.atualizarDesafio(_id, atualizarDesafioDto);
  }

  @Delete('/:_id')
  @UsePipes(ValidationPipe)
  async deletarDesafio(
    @Param('_id', ValidacaoParametrosPipe) _id: string,
  ): Promise<void> {
    await this.desafiosService.deletarDesafio(_id);
  }

  @Post('/atribuirDesafioPartida/:_id')
  @UsePipes(ValidationPipe)
  async atribuirDesafioPartida(
    @Body() atribuirDesafioPartida: AtribuirDesafioPartidaDto,
    @Param('_id', ValidacaoParametrosPipe) _id: string,
  ): Promise<void> {
    await this.desafiosService.atribuirDesafioPartida(
      _id,
      atribuirDesafioPartida,
    );
  }
}
