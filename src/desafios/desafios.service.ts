import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { DesafioStatus } from './desafio-status.enum';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';

@Injectable()
export class DesafiosService {
  constructor(
    @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
    private readonly jogadoresService: JogadoresService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async criarDesafio(criarDesafioDto: CriarDesafioDto): Promise<Desafio> {
    const { jogadores, solicitante } = criarDesafioDto;

    const idJogadores = [];

    for (const jogador of jogadores) {
      const jogadorEncontradoNaBase =
        await this.jogadoresService.consultarJogadorPeloId(jogador._id);

      if (!jogadorEncontradoNaBase) {
        throw new NotFoundException(`Jogador ${jogador._id} não cadastrado!`);
      }

      idJogadores.push(jogador._id);
    }

    if (!idJogadores.includes(solicitante)) {
      throw new BadRequestException(`O solicitante não faz parte do desafio`);
    }

    const solicitanteRegistrado =
      await this.categoriasService.verificarJogadorCadastradoEmCategoria(
        solicitante,
      );

    if (!solicitanteRegistrado) {
      throw new BadRequestException(
        `O solicitante ${solicitante._id} não está cadastrado em nenhuma categoria!`,
      );
    }
    const newDesafio = {
      ...criarDesafioDto,
      categoria: solicitanteRegistrado.categoria,
      dataHoraSolicitado: new Date(),
      status: DesafioStatus.PENDENTE,
    };

    const desafioCriado = new this.desafioModel(newDesafio);
    return await desafioCriado.save();
  }
}
